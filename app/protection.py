"""
Cancelable face templates (IronMask, Kim et al. CVPR 2021). THE one place α lives.

Enrol:  average ENROLMENT_PHOTOS embeddings into one template t, pick a secret random
        codeword c (ALPHA entries of ±1/√ALPHA), build a random orthogonal P with P·t = c,
        store only (sha256(c), P). Neither reveals t without c.
Verify: c' = decode(P·t'); match iff sha256(c') == stored digest.

α=12 with 5 photos was chosen by the M2 spike (spikes/ironmask/RESULTS.md): on LFW it meets the
FIDO accuracy bar (FRR ≤ 5% at FAR ≤ 1e-4, 80% CI upper bound 2.6%) and recovering t from a
stolen (digest, P) takes ~2^91 guesses. Raising α buys security but loses accuracy fast.

P is stored in a versioned format so formats can coexist during a migration:
  version 1 (FP32): float32, 1 MiB. Written before int8 was adopted; still read.
  version 2 (INT8): per-row fp16 scale + int8, 257 KiB. The production format (RESULTS.md: same
                    decisions as fp32 on 14.2M impostor attempts, 4x smaller, ~21 ms faster p50).
Both are functions of P alone, so neither weakens the 2^91 estimate; only accuracy can differ.
"""

import hashlib
import hmac
import secrets
from dataclasses import dataclass
from typing import Sequence

import numpy as np

from app.matching import is_match, cosine_similarity

DIM = 512
ALPHA = 12
ENROLMENT_PHOTOS = 5
DIGEST_BYTES = 32
FP32 = 1
INT8 = 2
HELPER_BYTES = {FP32: DIM * DIM * 4, INT8: DIM * 2 + DIM * DIM}


@dataclass(frozen=True)
class ProtectedTemplate:
    digest: bytes
    helper: bytes  # P, row-major little-endian, in the layout `version` names
    version: int


def _unit(v: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(v)
    if norm == 0:
        raise ValueError("Cannot protect a zero-length embedding")
    return v / norm


def enrolment_template(embeddings: Sequence[Sequence[float]]) -> np.ndarray:
    """Mean of the enrolment embeddings, re-normalised. Every photo must match the mean under τ,
    so one template can't be built from several people's photos."""
    if len(embeddings) != ENROLMENT_PHOTOS:
        raise ValueError(f"Enrolment needs exactly {ENROLMENT_PHOTOS} photos, got {len(embeddings)}")
    vectors = np.array([_unit(np.asarray(e, dtype=np.float64)) for e in embeddings])
    if vectors.shape[1] != DIM:
        raise ValueError(f"Embeddings must have {DIM} dimensions")
    template = _unit(vectors.mean(axis=0))
    for i, v in enumerate(vectors, start=1):
        if not is_match(cosine_similarity(template, v)):
            raise ValueError(f"Photo {i} does not look like the same person as the others")
    return template


def _codeword(alpha: int = ALPHA) -> np.ndarray:
    rng = secrets.SystemRandom()
    c = np.zeros(DIM)
    for i in rng.sample(range(DIM), alpha):
        c[i] = rng.choice((-1.0, 1.0))
    return c / np.sqrt(alpha)


def _random_orthogonal() -> np.ndarray:
    # Must be unpredictable: knowing Q would expose the rotation plane span(Q·t, c) inside P.
    rng = np.random.default_rng(secrets.randbits(256))
    q, r = np.linalg.qr(rng.standard_normal((DIM, DIM)))
    return q * np.sign(np.diag(r))


def _rotation_to(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Rotation taking unit vector a to unit vector b, identity off span(a, b)."""
    cos = float(np.clip(a @ b, -1.0, 1.0))
    w = b - cos * a
    sin = float(np.linalg.norm(w))
    if sin < 1e-12:
        return np.eye(DIM)
    w /= sin
    return np.eye(DIM) + sin * (np.outer(w, a) - np.outer(a, w)) + (cos - 1.0) * (np.outer(a, a) + np.outer(w, w))


def _decode(x: np.ndarray, alpha: int = ALPHA) -> np.ndarray:
    """Nearest codeword: keep the alpha largest-magnitude coordinates, take their signs."""
    idx = np.argpartition(-np.abs(x), alpha - 1)[:alpha]
    c = np.zeros(DIM)
    c[idx] = np.sign(x[idx])
    return c / np.sqrt(alpha)


def _digest(c: np.ndarray) -> bytes:
    # Canonical integer form (±(index+1), sorted) so float rounding can never change the hash.
    idx = np.flatnonzero(c)
    signed = ((idx + 1) * np.sign(c[idx])).astype("<i2")
    return hashlib.sha256(signed.tobytes()).digest()


def encode_helper(p: np.ndarray, version: int) -> bytes:
    if version == FP32:
        return p.astype("<f4").tobytes()
    if version == INT8:
        # Per-row scale, stored as fp16 and used at that precision so decode matches encode.
        scale = np.abs(p).max(axis=1).astype("<f2")
        q = np.rint(p / scale.astype(np.float64)[:, None] * 127)
        return scale.tobytes() + np.clip(q, -127, 127).astype(np.int8).tobytes()
    raise ValueError(f"Unknown template version {version}")


def decode_helper(helper: bytes, version: int) -> np.ndarray:
    if version not in HELPER_BYTES or len(helper) != HELPER_BYTES[version]:
        raise ValueError("Malformed protected template")
    if version == FP32:
        return np.frombuffer(helper, dtype="<f4").reshape(DIM, DIM).astype(np.float64)
    scale = np.frombuffer(helper[: DIM * 2], dtype="<f2").astype(np.float64)
    q = np.frombuffer(helper[DIM * 2 :], dtype=np.int8).reshape(DIM, DIM)
    return q * (scale / 127)[:, None]


def protect(template: np.ndarray, version: int = FP32) -> ProtectedTemplate:
    if version not in HELPER_BYTES:
        raise ValueError(f"Unknown template version {version}")
    t = _unit(np.asarray(template, dtype=np.float64))
    c = _codeword()
    q = _random_orthogonal()
    p = _rotation_to(q @ t, c) @ q
    return ProtectedTemplate(_digest(c), encode_helper(p, version), version)


def verify(probe: Sequence[float], template: ProtectedTemplate) -> bool:
    if len(template.digest) != DIGEST_BYTES:
        raise ValueError("Malformed protected template")
    p = decode_helper(template.helper, template.version)
    candidate = _digest(_decode(p @ _unit(np.asarray(probe, dtype=np.float64))))
    return hmac.compare_digest(candidate, template.digest)
