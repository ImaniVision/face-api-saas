"""
τ: the cosine threshold on raw embeddings. THE one place it lives — the gateway never compares
embeddings. Since M2, login decisions are made on protected templates (α in app.protection);
τ gates enrolment, requiring every enrolment photo to match the averaged template.
Kept free of model imports so it can be tested without loading the ML models.
"""

from typing import Sequence

import numpy as np

# Cosine similarity at or above this counts as the same person. A false accept is unrecoverable
# (you cannot reset a face), so raise it rather than lower it when in doubt.
MATCH_THRESHOLD = 0.6


def cosine_similarity(a: Sequence[float], b: Sequence[float]) -> float:
    """Cosine similarity clamped to [0, 1] (negative similarity is simply 'no match')."""
    va = np.asarray(a, dtype=np.float64)
    vb = np.asarray(b, dtype=np.float64)
    denom = np.linalg.norm(va) * np.linalg.norm(vb)
    if denom == 0:
        raise ValueError("Cannot compare a zero-length embedding")
    return max(0.0, min(1.0, float(np.dot(va, vb) / denom)))


def is_match(similarity: float) -> bool:
    return similarity >= MATCH_THRESHOLD
