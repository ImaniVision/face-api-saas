"""
Accuracy cost of IronMask vs unprotected cosine matching on LFW. THROWAWAY SPIKE CODE.

Protocol (1:1, matching CLAUDE.md section 2.1): each identity enrols its first image.
  genuine  = every other image of that identity, verified against its template
  impostor = IMPOSTORS_PER_ID random images of other identities, verified against it
Unprotected and protected see exactly the same comparisons.
"""

import json

import numpy as np
from sklearn.metrics import roc_curve

from ironmask import protect, random_orthogonal, verify_many

DATA = "/spike/data"
TAU = 0.6  # app/matching.py MATCH_THRESHOLD
ALPHAS = [4, 8, 12, 16, 24, 32, 48, 64]
IMPOSTORS_PER_ID = 100
FARS = [1e-3, 1e-4]

d = np.load(f"{DATA}/embeddings.npz")
labels = d["labels"]
rng = np.random.default_rng(42)

ids = [i for i in np.unique(labels) if (labels == i).sum() >= 2]
plan = []  # (enrol_idx, genuine_idxs, impostor_idxs)
for i in ids:
    mine = np.flatnonzero(labels == i)
    others = np.flatnonzero(labels != i)
    plan.append((mine[0], mine[1:], rng.choice(others, IMPOSTORS_PER_ID, replace=False)))
n_gen = sum(len(g) for _, g, _ in plan)
n_imp = sum(len(m) for _, _, m in plan)
print(f"{len(ids)} enrolled identities, {n_gen} genuine / {n_imp} impostor comparisons")


def cosine_scores(emb):
    gen = np.concatenate([emb[g] @ emb[e] for e, g, _ in plan])
    imp = np.concatenate([emb[m] @ emb[e] for e, _, m in plan])
    return gen, imp


def eer(gen, imp):
    far, tar, ts = roc_curve(np.r_[np.ones(len(gen)), np.zeros(len(imp))], np.r_[gen, imp])
    k = np.argmin(np.abs(far - (1 - tar)))
    return float((far[k] + 1 - tar[k]) / 2), float(ts[k])


def tar_at_far(gen, imp, far):
    """TAR at the smallest threshold whose FAR <= far. far=0 means above every impostor."""
    t = np.max(imp) if far == 0 else np.quantile(imp, 1 - far)
    return float((gen > t).mean())


results = {"n_identities": len(ids), "n_genuine": n_gen, "n_impostor": n_imp, "n_images": int(d["n_total"]),
           "n_embedded": len(labels), "unprotected": {}, "protected": []}

for name in ["emb_bgr", "emb_rgb"]:
    gen, imp = cosine_scores(d[name])
    e, t_eer = eer(gen, imp)
    results["unprotected"][name] = {
        "eer": e, "eer_threshold": t_eer,
        "far_at_tau": float((imp >= TAU).mean()), "frr_at_tau": float((gen < TAU).mean()),
        **{f"tar@far={f:g}": tar_at_far(gen, imp, f) for f in FARS},
        "tar@far=0": tar_at_far(gen, imp, 0),
    }
    print(name, json.dumps(results["unprotected"][name], indent=1))

emb = d["emb_bgr"]
gen_cos, imp_cos = cosine_scores(emb)
qs = [random_orthogonal(rng) for _ in plan]  # one rotation per identity, reused across alphas
for alpha in ALPHAS:
    acc_gen = acc_imp = 0
    for (e, g, m), q in zip(plan, qs):
        tmpl = protect(emb[e].astype(np.float64), alpha, rng, q)
        acc_gen += verify_many(emb[g], tmpl, alpha).sum()
        acc_imp += verify_many(emb[m], tmpl, alpha).sum()
    far, frr = acc_imp / n_imp, 1 - acc_gen / n_gen
    row = {"alpha": alpha, "far": far, "frr": frr, "tar": 1 - frr,
           "unprotected_tar_at_same_far": tar_at_far(gen_cos, imp_cos, far)}
    results["protected"].append(row)
    print(row, flush=True)

with open(f"{DATA}/results.json", "w") as f:
    json.dump(results, f, indent=1, default=float)
