"""
Re-run the M2 benchmark through the PRODUCTION code path (app/protection.py), not the spike code.
Same protocol as evaluate_multi.py / bootstrap_ci.py: 309 LFW people with >= 6 photos, the first 5
enrol, the rest probe; 500 impostor photos per person. Adds what the spike couldn't measure:
failure-to-enrol from the enrolment consistency gate, and per-call compute latency.

Run from the repo root (mounted at /repo) with PYTHONPATH=/repo.
"""

import json
import os
import time

import numpy as np
from scipy.stats import beta

from app.protection import ALPHA, ENROLMENT_PHOTOS, enrolment_template, protect, verify

DATA = "/repo/spikes/ironmask/data"
IMPOSTORS_PER_ID = 500
BOOT = 10_000

EMBEDDINGS_FILE = os.environ.get("EMBEDDINGS", "embeddings.npz")  # embeddings_det320.npz for 320
d = np.load(f"{DATA}/{EMBEDDINGS_FILE}")
labels, emb = d["labels"], d["emb_bgr"].astype(np.float64)
rng = np.random.default_rng(11)

ids = [i for i in np.unique(labels) if (labels == i).sum() > ENROLMENT_PHOTOS]
failed_to_enrol, rejected, attempts = [], [], []
false_accepts = n_imp = 0
protect_s, verify_s = [], []

for i in ids:
    mine = np.flatnonzero(labels == i)
    try:
        template = enrolment_template(emb[mine[:ENROLMENT_PHOTOS]])
    except ValueError:
        failed_to_enrol.append(int(i))
        continue
    start = time.perf_counter()
    stored = protect(template)
    protect_s.append(time.perf_counter() - start)

    rej = 0
    for p in mine[ENROLMENT_PHOTOS:]:
        start = time.perf_counter()
        rej += not verify(emb[p], stored)
        verify_s.append(time.perf_counter() - start)
    rejected.append(rej)
    attempts.append(len(mine) - ENROLMENT_PHOTOS)

    for p in rng.choice(np.flatnonzero(labels != i), IMPOSTORS_PER_ID, replace=False):
        false_accepts += verify(emb[p], stored)
        n_imp += 1

rejected, attempts = np.array(rejected), np.array(attempts)
picks = rng.integers(0, len(rejected), size=(BOOT, len(rejected)))
boot = rejected[picks].sum(axis=1) / attempts[picks].sum(axis=1)


def ms(xs):
    a = np.array(xs) * 1000
    return {"p50_ms": float(np.percentile(a, 50)), "p95_ms": float(np.percentile(a, 95))}


out = {
    "alpha": ALPHA, "enrolment_photos": ENROLMENT_PHOTOS,
    "identities": len(ids), "failed_to_enrol": len(failed_to_enrol),
    "fte_rate": len(failed_to_enrol) / len(ids),
    "genuine_attempts": int(attempts.sum()), "frr": float(rejected.sum() / attempts.sum()),
    "frr_80ci": [float(np.percentile(boot, 10)), float(np.percentile(boot, 90))],
    "impostor_attempts": n_imp, "false_accepts": int(false_accepts),
    "far_upper_80": float(beta.ppf(0.90, false_accepts + 1, n_imp - false_accepts)),
    "protect": ms(protect_s), "verify_compute": ms(verify_s),
}
out["embeddings"] = EMBEDDINGS_FILE
print(json.dumps(out, indent=1))
with open(f"{DATA}/production_check_{EMBEDDINGS_FILE.removesuffix('.npz')}.json", "w") as f:
    json.dump(out, f, indent=1)
