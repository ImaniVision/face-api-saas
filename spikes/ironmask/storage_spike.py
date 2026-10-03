"""
M2 storage spike: can the ~1 MiB protected template get smaller without losing accuracy or security?
THROWAWAY SPIKE CODE. Production (app/protection.py) is not changed; it supplies the baseline.

Protocol = verify_production.py (309 LFW people with >= 6 photos, 5 enrol through the production
consistency gate, the rest probe, 500 impostor photos each), so every variant sees the same pairs.

Variants:
  fp32        the production template (baseline)
  fp16/int8/int4   P quantised after protect(). A function of P can reveal nothing P doesn't, so the
                   codebook brute-force cost (the 2^91 estimate) is unchanged; only accuracy can move.
  d=256/128   embedding projected to d dims (fixed public orthonormal projection) before IronMask.
              P shrinks quadratically but the codebook shrinks too, so alpha must rise to keep security.
Lossless compression (zlib, lzma) of the stored bytes is measured for size only.

Run from the repo root (mounted at /repo) with PYTHONPATH=/repo.
"""

import hashlib
import json
import lzma
import os
import time
import zlib
from math import comb, log2

import numpy as np
from scipy.stats import beta

from app import protection as prod

DATA = "/repo/spikes/ironmask/data"
EMBEDDINGS_FILE = os.environ.get("EMBEDDINGS", "embeddings.npz")
IMPOSTORS_PER_ID = 500
BOOT = 10_000
LATENCY_SAMPLES = 2000
rng = np.random.default_rng(23)


def bits(d: int, alpha: int) -> float:
    return log2(comb(d, alpha)) + alpha


# ---- generic IronMask for any dimension (production code is fixed at 512) ----------------------

def random_orthogonal(n: int) -> np.ndarray:
    q, r = np.linalg.qr(rng.standard_normal((n, n)))
    return q * np.sign(np.diag(r))


def codeword(n: int, alpha: int) -> np.ndarray:
    c = np.zeros(n)
    idx = rng.choice(n, alpha, replace=False)
    c[idx] = rng.choice([-1.0, 1.0], alpha)
    return c / np.sqrt(alpha)


def rotation_to(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    cos = float(np.clip(a @ b, -1, 1))
    w = b - cos * a
    sin = float(np.linalg.norm(w))
    w /= sin
    n = len(a)
    return np.eye(n) + sin * (np.outer(w, a) - np.outer(a, w)) + (cos - 1) * (np.outer(a, a) + np.outer(w, w))


def decode_batch(x: np.ndarray, alpha: int) -> np.ndarray:
    idx = np.argpartition(-np.abs(x), alpha - 1, axis=-1)[..., :alpha]
    c = np.zeros_like(x)
    np.put_along_axis(c, idx, np.sign(np.take_along_axis(x, idx, axis=-1)), axis=-1)
    return c


def digest(signs: np.ndarray) -> bytes:
    idx = np.flatnonzero(signs)
    return hashlib.sha256(((idx + 1) * np.sign(signs[idx])).astype("<i2").tobytes()).digest()


def unit_rows(x: np.ndarray) -> np.ndarray:
    return x / np.linalg.norm(x, axis=-1, keepdims=True)


# ---- quantisation of a stored P ------------------------------------------------------------------

def encode(p: np.ndarray, fmt: str) -> bytes:
    if fmt == "fp32":
        return p.astype("<f4").tobytes()
    if fmt == "fp16":
        return p.astype("<f2").tobytes()
    scale = np.abs(p).max(axis=1, keepdims=True)  # per-row scale, stored as fp16
    levels = 127 if fmt == "int8" else 7
    q = np.clip(np.rint(p / scale * levels), -levels, levels).astype(np.int8)
    if fmt == "int4":  # pack two signed nibbles per byte
        u = (q + 8).astype(np.uint8).reshape(-1, 2)
        packed = (u[:, 0] << 4 | u[:, 1]).astype(np.uint8)
        return scale.astype("<f2").tobytes() + packed.tobytes()
    return scale.astype("<f2").tobytes() + q.tobytes()


def decode_p(blob: bytes, fmt: str, n: int) -> np.ndarray:
    if fmt == "fp32":
        return np.frombuffer(blob, "<f4").reshape(n, n).astype(np.float64)
    if fmt == "fp16":
        return np.frombuffer(blob, "<f2").reshape(n, n).astype(np.float64)
    scale = np.frombuffer(blob[: n * 2], "<f2").astype(np.float64).reshape(n, 1)
    body = np.frombuffer(blob[n * 2 :], np.uint8 if fmt == "int4" else np.int8)
    if fmt == "int4":
        q = np.stack([(body >> 4).astype(np.int16) - 8, (body & 0xF).astype(np.int16) - 8], axis=1).reshape(n, n)
        return q * scale / 7
    return body.reshape(n, n).astype(np.float64) * scale / 127


# ---- benchmark -------------------------------------------------------------------------------------

d = np.load(f"{DATA}/{EMBEDDINGS_FILE}")
labels, emb = d["labels"], d["emb_bgr"].astype(np.float64)
ids = [i for i in np.unique(labels) if (labels == i).sum() > prod.ENROLMENT_PHOTOS]

people = []  # (template_512, genuine_idx, impostor_idx) for those who pass the production gate
for i in ids:
    mine = np.flatnonzero(labels == i)
    try:
        t = prod.enrolment_template(emb[mine[: prod.ENROLMENT_PHOTOS]])
    except ValueError:
        continue
    imp = rng.choice(np.flatnonzero(labels != i), IMPOSTORS_PER_ID, replace=False)
    people.append((t, mine[prod.ENROLMENT_PHOTOS :], imp))
print(f"{len(people)} people enrolled through the production gate", flush=True)

projections = {n: np.linalg.qr(rng.standard_normal((512, n)))[0].T for n in (256, 128)}  # n x 512, public

VARIANTS = (
    [(512, prod.ALPHA, fmt) for fmt in ("fp32", "fp16", "int8", "int4")]
    + [(256, a, "fp32") for a in (12, 16, 20)]
    + [(256, a, "fp16") for a in (12, 16)]
    + [(128, a, "fp16") for a in (12, 16, 20)]
)


def run(n: int, alpha: int, fmt: str) -> dict:
    proj = projections.get(n)
    rejected, attempts, false_accepts, n_imp, sizes, lat = [], [], 0, 0, [], []
    for t, gen, imp in people:
        tt = t if proj is None else unit_rows(proj @ t)
        if n == 512 and alpha == prod.ALPHA:
            stored = prod.protect(tt)  # the real production template
            p = np.frombuffer(stored.helper, "<f4").reshape(512, 512).astype(np.float64)
            target = stored.digest
        else:
            c = codeword(n, alpha)
            q = random_orthogonal(n)
            p = rotation_to(q @ tt, c) @ q
            target = digest(c)
        blob = encode(p, fmt)
        sizes.append(len(blob))
        p_used = decode_p(blob, fmt, n)

        probes = emb[np.concatenate([gen, imp])]
        probes = unit_rows(probes if proj is None else probes @ proj.T)
        decoded = decode_batch(probes @ p_used.T, alpha)
        hits = np.array([digest(row) == target for row in decoded])
        rejected.append(int((~hits[: len(gen)]).sum()))
        attempts.append(len(gen))
        false_accepts += int(hits[len(gen) :].sum())
        n_imp += len(imp)

        if len(lat) < LATENCY_SAMPLES:  # one full verify as production would do it: bytes -> decision
            for pr in probes[: min(len(gen), 8)]:
                s = time.perf_counter()
                digest(decode_batch(decode_p(blob, fmt, n) @ pr, alpha)) == target
                lat.append(time.perf_counter() - s)

    rejected, attempts = np.array(rejected), np.array(attempts)
    picks = rng.integers(0, len(rejected), size=(BOOT, len(rejected)))
    boot = rejected[picks].sum(axis=1) / attempts[picks].sum(axis=1)
    sample = encode(p, fmt)
    lat_ms = np.array(lat) * 1000
    return {
        "dim": n, "alpha": alpha, "format": fmt, "bytes": int(np.median(sizes)),
        "zlib_bytes": len(zlib.compress(sample, 9)), "lzma_bytes": len(lzma.compress(sample)),
        "security_bits": round(bits(n, alpha), 1),
        "frr": float(rejected.sum() / attempts.sum()),
        "frr_80ci": [float(np.percentile(boot, 10)), float(np.percentile(boot, 90))],
        "false_accepts": false_accepts, "impostor_attempts": n_imp,
        "far_upper_80": float(beta.ppf(0.90, false_accepts + 1, n_imp - false_accepts)),
        "verify_compute_ms": {"p50": float(np.percentile(lat_ms, 50)), "p95": float(np.percentile(lat_ms, 95))},
    }


results = []
for n, alpha, fmt in VARIANTS:
    r = run(n, alpha, fmt)
    results.append(r)
    print(json.dumps(r), flush=True)

with open(f"{DATA}/storage_spike.json", "w") as f:
    json.dump({"embeddings": EMBEDDINGS_FILE, "people": len(people), "variants": results}, f, indent=1)
