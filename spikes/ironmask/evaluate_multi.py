"""
Does multi-image enrolment rescue IronMask accuracy? THROWAWAY SPIKE CODE.

Controlled comparison: same identities (>= MAX_K + 1 photos), same probes (photos MAX_K onward),
same impostors. Only the enrolment changes: the mean of the first k embeddings, re-normalised.
"""

import json

import numpy as np

from ironmask import protect, random_orthogonal, verify_many

DATA = "/spike/data"
TAU = 0.6  # app/matching.py MATCH_THRESHOLD
KS = [1, 3, 5]
MAX_K = max(KS)
ALPHAS = [8, 12, 16, 20, 24]
IMPOSTORS_PER_ID = 500

d = np.load(f"{DATA}/embeddings.npz")
labels, emb = d["labels"], d["emb_bgr"].astype(np.float64)
rng = np.random.default_rng(42)

ids = [i for i in np.unique(labels) if (labels == i).sum() > MAX_K]
plan = []  # (enrol_pool, genuine_probes, impostors)
for i in ids:
    mine = np.flatnonzero(labels == i)
    plan.append((mine[:MAX_K], mine[MAX_K:], rng.choice(np.flatnonzero(labels != i), IMPOSTORS_PER_ID, replace=False)))
n_gen = sum(len(g) for _, g, _ in plan)
n_imp = sum(len(m) for _, _, m in plan)
print(f"{len(ids)} identities with >{MAX_K} photos, {n_gen} genuine / {n_imp} impostor comparisons", flush=True)


def template(pool: np.ndarray, k: int) -> np.ndarray:
    t = emb[pool[:k]].mean(axis=0)
    return t / np.linalg.norm(t)


def tar_at_far(gen: np.ndarray, imp: np.ndarray, far: float) -> float:
    t = np.max(imp) if far == 0 else np.quantile(imp, 1 - far)
    return float((gen > t).mean())


qs = [random_orthogonal(rng) for _ in plan]  # same rotation per identity for every k and alpha
results = {"n_identities": len(ids), "n_genuine": n_gen, "n_impostor": n_imp, "by_k": {}}
for k in KS:
    tmpls = [template(pool, k) for pool, _, _ in plan]
    gen = np.concatenate([emb[g] @ t for t, (_, g, _) in zip(tmpls, plan)])
    imp = np.concatenate([emb[m] @ t for t, (_, _, m) in zip(tmpls, plan)])
    row = {
        "unprotected": {
            "frr_at_tau": float((gen < TAU).mean()), "far_at_tau": float((imp >= TAU).mean()),
            "tar@far=1e-4": tar_at_far(gen, imp, 1e-4),
            "genuine_mean_cos": float(gen.mean()), "impostor_max_cos": float(imp.max()),
        },
        "protected": [],
    }
    print(f"k={k}", json.dumps(row["unprotected"]), flush=True)
    for alpha in ALPHAS:
        acc_gen = acc_imp = 0
        for t, (_, g, m), q in zip(tmpls, plan, qs):
            tmpl = protect(t, alpha, rng, q)
            acc_gen += verify_many(emb[g], tmpl, alpha).sum()
            acc_imp += verify_many(emb[m], tmpl, alpha).sum()
        far, tar = acc_imp / n_imp, acc_gen / n_gen
        p = {"alpha": alpha, "tar": tar, "frr": 1 - tar, "far": far, "false_accepts": int(acc_imp),
             "unprotected_tar_at_same_far": tar_at_far(gen, imp, far)}
        row["protected"].append(p)
        print(f"k={k}", p, flush=True)
    results["by_k"][k] = row

with open(f"{DATA}/results_multi.json", "w") as f:
    json.dump(results, f, indent=1, default=float)
