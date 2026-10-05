"""
FIDO-style confidence bounds for the passing settings. THROWAWAY SPIKE CODE.

FIDO judges FRR by the upper bound of an 80% confidence interval, bootstrapped over subjects
(photos of one person are correlated). FAR upper bound: Clopper-Pearson, one-sided.
Same protocol as evaluate_multi.py; codewords are re-drawn, so point estimates differ slightly.
"""

import json

import numpy as np
from scipy.stats import beta

from ironmask import protect, random_orthogonal, verify_many

DATA = "/spike/data"
SETTINGS = [(3, 12), (5, 12), (5, 16)]  # (photos at enrolment, alpha)
MAX_K = 5
IMPOSTORS_PER_ID = 500
BOOT = 10_000

d = np.load(f"{DATA}/embeddings.npz")
labels, emb = d["labels"], d["emb_bgr"].astype(np.float64)
rng = np.random.default_rng(7)

ids = [i for i in np.unique(labels) if (labels == i).sum() > MAX_K]
plan = []
for i in ids:
    mine = np.flatnonzero(labels == i)
    plan.append((mine[:MAX_K], mine[MAX_K:], rng.choice(np.flatnonzero(labels != i), IMPOSTORS_PER_ID, replace=False)))

out = []
for k, alpha in SETTINGS:
    rejected, attempts, false_accepts, n_imp = [], [], 0, 0
    for pool, g, m in plan:
        t = emb[pool[:k]].mean(axis=0)
        tmpl = protect(t / np.linalg.norm(t), alpha, rng, random_orthogonal(rng))
        acc = verify_many(emb[g], tmpl, alpha)
        rejected.append(len(g) - acc.sum())
        attempts.append(len(g))
        false_accepts += verify_many(emb[m], tmpl, alpha).sum()
        n_imp += len(m)
    rejected, attempts = np.array(rejected), np.array(attempts)
    picks = rng.integers(0, len(ids), size=(BOOT, len(ids)))
    boot_frr = rejected[picks].sum(axis=1) / attempts[picks].sum(axis=1)
    row = {
        "photos": k, "alpha": alpha,
        "frr": float(rejected.sum() / attempts.sum()),
        "frr_80ci": [float(np.percentile(boot_frr, 10)), float(np.percentile(boot_frr, 90))],
        "false_accepts": int(false_accepts), "impostor_attempts": n_imp,
        "far_upper_80": float(beta.ppf(0.90, false_accepts + 1, n_imp - false_accepts)),
    }
    out.append(row)
    print(row, flush=True)

with open(f"{DATA}/bootstrap_ci.json", "w") as f:
    json.dump(out, f, indent=1)
