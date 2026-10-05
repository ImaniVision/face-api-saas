"""
IronMask (Kim et al., CVPR 2021) over unit-norm face embeddings. THROWAWAY SPIKE CODE.

Enrol:  pick a random codeword c (alpha entries of +-1/sqrt(alpha), rest 0), build an
        orthogonal P with P @ t = c, store (sha256(c), P). Neither reveals t without c.
Verify: c' = decode(P @ t'); accept iff sha256(c') == stored hash.

alpha replaces tau: larger alpha is stricter (lower FAR, higher FRR) and enlarges the codebook,
so a stolen (hash, P) takes more guesses to brute-force back to c and hence t.
"""

import hashlib
from dataclasses import dataclass

import numpy as np

DIM = 512


@dataclass(frozen=True)
class Protected:
    digest: bytes
    helper: np.ndarray  # P, DIM x DIM float32. ~1 MB per template.


def random_orthogonal(rng: np.random.Generator, n: int = DIM) -> np.ndarray:
    """Haar-uniform orthogonal matrix (QR of a Gaussian with the sign fix)."""
    q, r = np.linalg.qr(rng.standard_normal((n, n)))
    return q * np.sign(np.diag(r))


def random_codeword(rng: np.random.Generator, alpha: int, n: int = DIM) -> np.ndarray:
    c = np.zeros(n)
    idx = rng.choice(n, size=alpha, replace=False)
    c[idx] = rng.choice([-1.0, 1.0], size=alpha)
    return c / np.sqrt(alpha)


def decode(x: np.ndarray, alpha: int) -> np.ndarray:
    """Nearest codeword: keep the alpha largest-magnitude coordinates, take their signs.
    Works on a single vector or a batch (last axis)."""
    idx = np.argpartition(-np.abs(x), alpha - 1, axis=-1)[..., :alpha]
    c = np.zeros_like(x)
    np.put_along_axis(c, idx, np.sign(np.take_along_axis(x, idx, axis=-1)), axis=-1)
    return c / np.sqrt(alpha)


def digest(c: np.ndarray) -> bytes:
    # Canonical form: the signed integer pattern, so float noise can't change the hash.
    return hashlib.sha256(np.rint(c * 1e6).astype(np.int64).tobytes()).digest()


def rotation_to(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Rotation taking unit vector a to unit vector b, identity on span(a, b)'s complement."""
    cos = float(np.clip(a @ b, -1.0, 1.0))
    w = b - cos * a
    sin = float(np.linalg.norm(w))
    n = len(a)
    if sin < 1e-12:
        return np.eye(n)  # a == b; a == -b has probability zero for random c
    w /= sin
    return (
        np.eye(n)
        + sin * (np.outer(w, a) - np.outer(a, w))
        + (cos - 1.0) * (np.outer(a, a) + np.outer(w, w))
    )


def protect(t: np.ndarray, alpha: int, rng: np.random.Generator, q: np.ndarray | None = None) -> Protected:
    """q: pass a precomputed random orthogonal to save the QR (evaluation sweeps only)."""
    t = t / np.linalg.norm(t)
    c = random_codeword(rng, alpha, len(t))
    if q is None:
        q = random_orthogonal(rng, len(t))
    p = rotation_to(q @ t, c) @ q
    return Protected(digest(c), p.astype(np.float32))


def verify(probe: np.ndarray, template: Protected, alpha: int) -> bool:
    return digest(decode(template.helper @ probe, alpha)) == template.digest


def verify_many(probes: np.ndarray, template: Protected, alpha: int) -> np.ndarray:
    """probes: (k, DIM). One matmul for all probes against one template."""
    decoded = decode(probes @ template.helper.T, alpha)
    return np.array([digest(c) == template.digest for c in decoded])


if __name__ == "__main__":
    rng = np.random.default_rng(0)
    t = rng.standard_normal(DIM)
    t /= np.linalg.norm(t)
    tmpl = protect(t, 16, rng)
    p = tmpl.helper.astype(np.float64)
    assert np.allclose(p @ p.T, np.eye(DIM), atol=1e-5), "P must be orthogonal"
    assert verify(t, tmpl, 16), "the enrolled vector must verify"

    near = t + 0.01 * rng.standard_normal(DIM)
    assert verify(near / np.linalg.norm(near), tmpl, 16), "small noise must still verify"

    other = rng.standard_normal(DIM)
    assert not verify(other / np.linalg.norm(other), tmpl, 16), "a random vector must not verify"

    batch = np.stack([t, other / np.linalg.norm(other)])
    assert verify_many(batch, tmpl, 16).tolist() == [True, False]
    print("ironmask self-check ok")
