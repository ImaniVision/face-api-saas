"""Tests for cancelable templates: the match decision, tamper resistance and the enrolment gate.

Run: python -m unittest app.test_protection   (needs only numpy)
"""

import unittest

import numpy as np

from app.protection import (
    DIM,
    ENROLMENT_PHOTOS,
    FP32,
    HELPER_BYTES,
    INT8,
    ProtectedTemplate,
    decode_helper,
    enrolment_template,
    protect,
    verify,
)

rng = np.random.default_rng(0)


def unit(v: np.ndarray) -> np.ndarray:
    return v / np.linalg.norm(v)


def random_face() -> np.ndarray:
    return unit(rng.standard_normal(DIM))


def nearby(t: np.ndarray, noise: float) -> np.ndarray:
    return unit(t + noise * rng.standard_normal(DIM))


class MatchDecisionFP32(unittest.TestCase):
    VERSION = FP32

    def setUp(self):
        self.face = random_face()
        self.template = protect(self.face, self.VERSION)

    def test_enrolled_face_matches(self):
        self.assertTrue(verify(self.face, self.template))

    def test_slightly_different_capture_matches(self):
        self.assertTrue(verify(nearby(self.face, 0.005), self.template))

    def test_different_person_rejects(self):
        for _ in range(20):
            self.assertFalse(verify(random_face(), self.template))

    def test_scale_invariant(self):
        self.assertTrue(verify(self.face * 9.0, self.template))

    def test_tampered_digest_rejects(self):
        flipped = bytes([self.template.digest[0] ^ 1]) + self.template.digest[1:]
        self.assertFalse(verify(self.face, ProtectedTemplate(flipped, self.template.helper, self.VERSION)))

    def test_someone_elses_helper_rejects(self):
        other = protect(random_face(), self.VERSION)
        self.assertFalse(verify(self.face, ProtectedTemplate(self.template.digest, other.helper, self.VERSION)))

    def test_malformed_template_raises(self):
        with self.assertRaises(ValueError):
            verify(self.face, ProtectedTemplate(self.template.digest, self.template.helper[:-4], self.VERSION))
        with self.assertRaises(ValueError):
            verify(self.face, ProtectedTemplate(self.template.digest[:16], self.template.helper, self.VERSION))

    def test_unknown_version_raises(self):
        with self.assertRaises(ValueError):
            verify(self.face, ProtectedTemplate(self.template.digest, self.template.helper, 99))


class MatchDecisionINT8(MatchDecisionFP32):
    VERSION = INT8


class StoredTemplate(unittest.TestCase):
    def test_fp32_helper_is_orthogonal_and_1_mib(self):
        tmpl = protect(random_face(), FP32)
        self.assertEqual(len(tmpl.helper), HELPER_BYTES[FP32])
        p = decode_helper(tmpl.helper, FP32)
        self.assertTrue(np.allclose(p @ p.T, np.eye(DIM), atol=1e-4))

    def test_int8_helper_is_257_kib_and_close_to_orthogonal(self):
        tmpl = protect(random_face(), INT8)
        self.assertEqual(len(tmpl.helper), 263_168)
        p = decode_helper(tmpl.helper, INT8)
        self.assertTrue(np.allclose(p @ p.T, np.eye(DIM), atol=0.02))

    def test_versions_are_not_interchangeable(self):
        tmpl = protect(random_face(), INT8)
        with self.assertRaises(ValueError):
            verify(random_face(), ProtectedTemplate(tmpl.digest, tmpl.helper, FP32))

    def test_default_version_is_fp32(self):
        self.assertEqual(protect(random_face()).version, FP32)

    def test_same_face_protects_differently_each_time(self):
        """Cancelable: re-enrolling issues an unlinkable template."""
        face = random_face()
        a, b = protect(face), protect(face)
        self.assertNotEqual(a.digest, b.digest)
        self.assertNotEqual(a.helper, b.helper)
        self.assertTrue(verify(face, a) and verify(face, b))


class EnrolmentGate(unittest.TestCase):
    def test_average_is_closer_to_the_face_than_any_single_capture(self):
        face = random_face()
        captures = [nearby(face, 0.02) for _ in range(ENROLMENT_PHOTOS)]
        template = enrolment_template(captures)
        self.assertGreater(float(template @ face), max(float(c @ face) for c in captures))
        self.assertAlmostEqual(float(np.linalg.norm(template)), 1.0)

    def test_wrong_photo_count_raises(self):
        face = random_face()
        for n in (1, ENROLMENT_PHOTOS - 1, ENROLMENT_PHOTOS + 1):
            with self.assertRaises(ValueError):
                enrolment_template([nearby(face, 0.02) for _ in range(n)])

    def test_mixed_people_raises(self):
        face = random_face()
        photos = [nearby(face, 0.02) for _ in range(ENROLMENT_PHOTOS - 1)] + [random_face()]
        with self.assertRaisesRegex(ValueError, f"Photo {ENROLMENT_PHOTOS}"):
            enrolment_template(photos)


if __name__ == "__main__":
    unittest.main()
