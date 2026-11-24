"""Tests for the face-match decision at, just above and just below τ.

Run: python -m unittest app.test_matching   (needs only numpy)
"""

import math
import unittest

from app.matching import MATCH_THRESHOLD, cosine_similarity, is_match

EPS = 1e-6


def vector_at(similarity: float) -> list:
    """A unit vector whose cosine similarity with [1, 0, ...] is exactly `similarity`."""
    return [similarity, math.sqrt(1 - similarity**2)] + [0.0] * 510


REFERENCE = [1.0] + [0.0] * 511


class DecisionAtThreshold(unittest.TestCase):
    def test_exactly_tau_matches(self):
        self.assertTrue(is_match(MATCH_THRESHOLD))

    def test_just_above_tau_matches(self):
        self.assertTrue(is_match(MATCH_THRESHOLD + EPS))

    def test_just_below_tau_rejects(self):
        self.assertFalse(is_match(MATCH_THRESHOLD - EPS))


def decide(saved: list, current: list) -> tuple:
    similarity = cosine_similarity(saved, current)
    return is_match(similarity), similarity


class DecisionFromEmbeddings(unittest.TestCase):
    def test_just_above_tau_matches(self):
        match, similarity = decide(REFERENCE, vector_at(MATCH_THRESHOLD + 1e-4))
        self.assertTrue(match)
        self.assertAlmostEqual(similarity, MATCH_THRESHOLD + 1e-4, places=9)

    def test_just_below_tau_rejects(self):
        match, similarity = decide(REFERENCE, vector_at(MATCH_THRESHOLD - 1e-4))
        self.assertFalse(match)
        self.assertAlmostEqual(similarity, MATCH_THRESHOLD - 1e-4, places=9)

    def test_identical_matches(self):
        self.assertEqual(decide(REFERENCE, REFERENCE), (True, 1.0))

    def test_opposite_clamps_to_zero_and_rejects(self):
        self.assertEqual(decide(REFERENCE, [-1.0] + [0.0] * 511), (False, 0.0))

    def test_unnormalized_input_is_scale_invariant(self):
        scaled = [x * 7.5 for x in vector_at(MATCH_THRESHOLD + 1e-4)]
        self.assertTrue(decide(REFERENCE, scaled)[0])

    def test_zero_vector_raises(self):
        with self.assertRaises(ValueError):
            cosine_similarity(REFERENCE, [0.0] * 512)


if __name__ == "__main__":
    unittest.main()
