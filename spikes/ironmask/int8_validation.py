"""
int8 vs fp32 template validation, paired, through the production code (app/protection.py).
THROWAWAY SPIKE CODE. Does not change what production writes.

Paired design: for every person and every seed, ONE secret codeword and ONE random rotation P are
drawn (production internals), then P is stored both ways. fp32 and int8 therefore see the same
codeword, the same P and the same probes; any decision that differs is caused by int8 alone.

  people     310 LFW identities with >= 6 photos that pass the production consistency gate (320 det)
  genuine    every remaining photo of that person
  impostor   EVERY photo of every other person (~2.8M comparisons per seed, vs 155k before)
  seeds      SEEDS independent draws of codeword + rotation per person

Security checks under the real int8 bytes: the codebook (and so the ~2^91 brute-force cost) is the
production one; and a random-probe attack plus a scale side-channel probe find nothing.
Run from the repo root (mounted at /repo) with PYTHONPATH=/repo.
"""

import hashlib
import json
import os
import time
from math import comb, log2

import numpy as np
from scipy.stats import beta, binomtest

from app import protection as prod

DATA = "/repo/spikes/ironmask/data"
EMBEDDINGS_FILE = os.environ.get("EMBEDDINGS", "embeddings_det320.npz")
SEEDS = int(os.environ.get("SEEDS", "5"))
BOOT = 10_000
CHUNK = 4096
rng = np.random.default_rng(31)

d = np.load(f"{DATA}/{EMBEDDINGS_FILE}")
labels, emb = d["labels"], d["emb_bgr"].astype(np.float64)
emb = emb / np.linalg.norm(emb, axis=1, keepdims=True)

people = []  # (label, template, genuine_idx)
for i in np.unique(labels):
    mine = np.flatnonzero(labels == i)
    if len(mine) <= prod.ENROLMENT_PHOTOS:
        continue
    try:
        people.append((i, prod.enrolment_template(emb[mine[: prod.ENROLMENT_PHOTOS]]), mine[prod.ENROLMENT_PHOTOS :]))
    except ValueError:
        pass
print(f"{len(people)} people, {SEEDS} seeds, {len(labels)} photos", flush=True)


def digests(projected: np.ndarray) -> list:
    """Production decode + digest, vectorised: alpha largest |x|, sorted indices, signed, int16, sha256."""
    idx = np.argpartition(-np.abs(projected), prod.ALPHA - 1, axis=1)[:, : prod.ALPHA]
    idx.sort(axis=1)
    signs = np.sign(np.take_along_axis(projected, idx, axis=1))
    signed = ((idx + 1) * signs).astype("<i2")
    return [hashlib.sha256(row.tobytes()).digest() for row in signed]


def accepted(p: np.ndarray, target: bytes, probe_idx: np.ndarray) -> np.ndarray:
    out = np.empty(len(probe_idx), dtype=bool)
    for s in range(0, len(probe_idx), CHUNK):
        part = probe_idx[s : s + CHUNK]
        out[s : s + len(part)] = [h == target for h in digests(emb[part] @ p.T)]
    return out


# sanity: the vectorised path agrees with production verify()
t0, _, g0 = people[0][1], None, people[0][2]
tmpl = prod.protect(t0, prod.INT8)
p0 = prod.decode_helper(tmpl.helper, prod.INT8)
assert list(accepted(p0, tmpl.digest, g0)) == [prod.verify(emb[j], tmpl) for j in g0], "vectorised != production"

counts = {f: {"gen_acc": 0, "gen_n": 0, "imp_acc": 0, "imp_n": 0} for f in ("fp32", "int8")}
per_person_rej = {f: np.zeros((SEEDS, len(people))) for f in ("fp32", "int8")}
per_person_n = np.zeros(len(people))
paired = {"genuine": [0, 0], "impostor": [0, 0]}  # [fp32-only accepts, int8-only accepts]
scale_auc = []
start = time.time()

for seed in range(SEEDS):
    for k, (lab, t, gen) in enumerate(people):
        c = prod._codeword()
        q = prod._random_orthogonal()
        p = prod._rotation_to(q @ t, c) @ q
        target = prod._digest(c)
        imp = np.flatnonzero(labels != lab)
        per_person_n[k] = len(gen)
        decisions = {}
        for fmt, version in (("fp32", prod.FP32), ("int8", prod.INT8)):
            stored = prod.decode_helper(prod.encode_helper(p, version), version)
            g, im = accepted(stored, target, gen), accepted(stored, target, imp)
            decisions[fmt] = (g, im)
            counts[fmt]["gen_acc"] += int(g.sum()); counts[fmt]["gen_n"] += len(g)
            counts[fmt]["imp_acc"] += int(im.sum()); counts[fmt]["imp_n"] += len(im)
            per_person_rej[fmt][seed, k] = len(g) - g.sum()
        for kind, j in (("genuine", 0), ("impostor", 1)):
            a, b = decisions["fp32"][j], decisions["int8"][j]
            paired[kind][0] += int((a & ~b).sum())
            paired[kind][1] += int((~a & b).sum())
        if seed == 0:  # does the stored int8 scale vector point at the codeword's support rows?
            scale = np.abs(p).max(axis=1)
            support = np.flatnonzero(c)
            others = np.setdiff1d(np.arange(prod.DIM), support)
            scale_auc.append(float((scale[support][:, None] > scale[others][None, :]).mean()))
    print(f"seed {seed + 1}/{SEEDS} done, {time.time() - start:.0f}s", flush=True)


def summary(fmt: str) -> dict:
    c = counts[fmt]
    rej = per_person_rej[fmt].sum(axis=0)  # pooled over seeds, per person
    n = per_person_n * SEEDS
    picks = rng.integers(0, len(people), size=(BOOT, len(people)))
    boot = rej[picks].sum(axis=1) / n[picks].sum(axis=1)
    per_seed = [float(per_person_rej[fmt][s].sum() / per_person_n.sum()) for s in range(SEEDS)]
    return {
        "frr": float(rej.sum() / n.sum()), "frr_80ci": [float(np.percentile(boot, 10)), float(np.percentile(boot, 90))],
        "frr_per_seed": per_seed,
        "false_accepts": c["imp_acc"], "impostor_attempts": c["imp_n"],
        "far_upper_80": float(beta.ppf(0.90, c["imp_acc"] + 1, c["imp_n"] - c["imp_acc"])),
        "genuine_attempts": c["gen_n"],
    }


# random-probe attack on real int8 templates: decode P^T-side guesses, count digest hits
attack_hits, attack_tries = 0, 0
for lab, t, _ in people[:50]:
    tmpl = prod.protect(t, prod.INT8)
    p = prod.decode_helper(tmpl.helper, prod.INT8)
    guesses = rng.standard_normal((2000, prod.DIM))
    attack_hits += sum(h == tmpl.digest for h in digests(guesses @ p.T))
    attack_tries += len(guesses)


def verify_ms(version: int) -> dict:
    tmpl = prod.protect(people[0][1], version)
    probe = emb[people[0][2][0]]
    xs = []
    for _ in range(500):
        s = time.perf_counter(); prod.verify(probe, tmpl); xs.append((time.perf_counter() - s) * 1000)
    return {"p50": float(np.percentile(xs, 50)), "p95": float(np.percentile(xs, 95))}


out = {
    "embeddings": EMBEDDINGS_FILE, "people": len(people), "seeds": SEEDS,
    "fp32": summary("fp32"), "int8": summary("int8"),
    "paired_disagreements": {
        kind: {"fp32_accepts_int8_rejects": v[0], "int8_accepts_fp32_rejects": v[1],
               "mcnemar_p": float(binomtest(min(v), sum(v), 0.5).pvalue) if sum(v) else 1.0}
        for kind, v in paired.items()},
    "security": {
        "codebook_bits": round(log2(comb(prod.DIM, prod.ALPHA)) + prod.ALPHA, 1),
        "int8_bytes": prod.HELPER_BYTES[prod.INT8],
        "random_probe_attack": {"tries": attack_tries, "digest_hits": attack_hits},
        "scale_vs_support_auc_mean": float(np.mean(scale_auc)),
    },
    "verify_compute_ms": {"fp32": verify_ms(prod.FP32), "int8": verify_ms(prod.INT8)},
}
print(json.dumps(out, indent=1), flush=True)
with open(f"{DATA}/int8_validation.json", "w") as f:
    json.dump(out, f, indent=1)
