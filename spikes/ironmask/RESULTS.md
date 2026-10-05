# M2 spike: IronMask cancelable templates, results

**Question:** does IronMask template protection keep enough of ArcFace's geometry for 1:1 verification, and what does it cost in accuracy, latency and storage?

**Answer (on LFW):** yes, with multi-photo enrolment. IronMask at **α=12 with 3–5 enrolment photos** meets the FIDO accuracy bar (≤5% false rejects at ≤1 in 10,000 false accepts, judged on the upper 80% confidence bound) with a template that takes ~2⁹¹ guesses to invert. Single-photo enrolment fails at every secure α, and the paper's α=16 fails even with 5 photos. See "Multi-photo enrolment" and "Verdict" below.

## Setup

- **Model:** production `buffalo_l` (ArcFace, 512-d), run from the production ML image.
- **Data:** LFW (funneled), identities with ≥2 photos. 9,164 photos, 1,680 people; 9,129 embedded (no face found in 35).
- **Protocol (1:1 only, per CLAUDE.md §2.1):** each person enrols their first photo. Genuine = every other photo of that person (7,449 comparisons). Impostor = 100 random photos of other people per enrolled person (167,200 comparisons). Protected and unprotected matching see exactly the same pairs.
- **IronMask:** enrol stores `sha256(c)` and a 512×512 orthogonal `P` with `P·t = c`, where `c` is a random codeword with α entries of ±1/√α. Verify accepts iff `sha256(decode(P·t′)) == sha256(c)`. α replaces τ.

## Unprotected baseline

| | Correct input (BGR) | Production input (RGB) |
|---|---|---|
| Equal error rate | 0.17% (at cosine 0.19) | 0.18% (at cosine 0.20) |
| False accepts at τ=0.6 | 1 in 167,200 | 1 in 167,200 |
| False rejects at τ=0.6 | 17.5% | 27.4% |
| Genuine accepted at FAR 10⁻³ | 99.83% | 99.81% |
| Genuine accepted at FAR 10⁻⁴ | 99.79% | 99.72% |

## Protected (IronMask) vs unprotected

| α | Genuine accepted | False accepts | Unprotected at same FAR | Cost | Brute-force security |
|---|---|---|---|---|---|
| 4 | 99.61% | 3 / 167,200 | 99.70% | −0.1 pts | 2³⁵ (breakable) |
| 8 | 94.95% | 1 / 167,200 | 99.66% | −4.7 pts | 2⁶⁵ |
| **12** | **81.03%** | 1 / 167,200 | 99.66% | −18.6 pts | **2⁹¹** |
| 16 | 60.21% | 1 / 167,200 | 99.66% | −39.4 pts | 2¹¹⁵ |
| 24 | 25.18% | 1 / 167,200 | 99.66% | −74.5 pts | 2¹⁶⁰ |
| 32 | 8.86% | 0 | n/a | n/a | 2²⁰¹ |
| 48 | 1.29% | 0 | n/a | n/a | 2²⁷⁴ |
| 64 | 0.32% | 0 | n/a | n/a | 2³³⁸ |

"Unprotected at same FAR" uses the best possible cosine threshold, so "Cost" is the strict comparison. Against production's actual τ=0.6 (82.5% accepted with correct input), α=12 costs only 1.5 points. Security = log₂ of the codebook size, C(512, α)·2^α: the guesses needed to recover `c`, and hence `t`, from a stolen `(hash, P)`.

## Multi-photo enrolment

Template = mean of the first k embeddings, re-normalised. Controlled comparison: the same 309 people (those with ≥6 photos), the same held-out probes (photo 6 onward, 3,851 genuine comparisons) and the same 154,500 impostor comparisons for every k. Only the enrolment changes. Zero false accepts in every IronMask cell below.

**Genuine accepted:**

| α (security) | 1 photo | 3 photos | 5 photos |
|---|---|---|---|
| 8 (2⁶⁵) | 96.6% | 99.4% | 99.5% |
| **12 (2⁹¹)** | 84.1% | **96.1%** | **97.6%** |
| 16 (2¹¹⁵) | 64.5% | 89.2% | 93.1% |
| 20 (2¹³⁶) | 43.6% | 76.3% | 84.7% |
| 24 (2¹⁶⁰) | 24.6% | 61.5% | 72.3% |
| Unprotected, τ=0.6 | 85.4% | 97.3% | 98.4% |

Averaging lifts genuine similarity (mean cosine 0.68 → 0.76 → 0.78) while the highest impostor similarity barely moves (0.37 → 0.37 → 0.40). Most of the gain comes from going 1 → 3 photos.

**Against the FIDO bar.** The project has no numeric accuracy requirement, so the reference is the FIDO Alliance Biometrics Requirements v4.0 (May 2024): lab-tested FAR ≤ 0.01% and FRR ≤ 5% at BioLevel 1+/2+, judged on the upper bound of an 80% confidence interval. FRR bounds are bootstrapped over people (10,000 resamples). FAR bound is one-sided Clopper-Pearson. Codewords were re-drawn for this run, so point estimates differ slightly from the table above.

| Setting | False rejects | 80% CI | FAR upper bound | Meets bar? |
|---|---|---|---|---|
| 3 photos, α=12 | 3.7% | 2.9%–**4.7%** | 1.5×10⁻⁵ | **Yes, narrowly** |
| 5 photos, α=12 | 2.0% | 1.6%–**2.6%** | 1.5×10⁻⁵ | **Yes, with margin** |
| 5 photos, α=16 | 6.6% | 5.4%–8.1% | 1.5×10⁻⁵ | No |

## Verdict

- **Meets the usability bar on this benchmark:** α=12 with 5 enrolment photos (comfortably) or 3 photos (narrowly). Security 2⁹¹, above the 2⁸⁰ floor.
- **Does not meet it:** single-photo enrolment at any α ≥ 12, and α ≥ 16 at any photo count tested. The paper's α=16 setting is not usable on LFW-like data.
- **What this is not:** FIDO certification. FIDO tests live captures in an accredited lab, and also requires presentation-attack (liveness) testing, which is deferred future work for this project. This is an offline benchmark result measured against FIDO's accuracy thresholds.

## Integration (production code)

Decision: **α=12, 5 enrolment photos**, templates stored as `bytea` in Postgres. Implemented in `app/protection.py` (the one place α lives).

| Decision | Why |
|---|---|
| 5 photos, averaged, then protected | Passes the FIDO bar with margin. 3 photos passes only narrowly (CI upper 4.7%). |
| α=12 | The only α that passes at ≥ 2⁸⁰ security. α=16 fails even with 5 photos. |
| Enrolment consistency gate: each photo must match the mean under τ | Stops one template mixing several people. Reuses the existing τ, so no second threshold. |
| `/vectorize` + `/verify_user` replaced by `/enroll` + `/verify` | Raw embeddings never leave the ML service. The gateway only holds `(digest, P)`. |
| Verify returns `{match}` only, no `confidence` | A protected template has no score. Also removes score hill-climbing. |
| Codeword from `secrets`; rotation seeded with 256 bits from `secrets` | If the rotation were predictable, P would leak the plane containing the face embedding. |
| Pre-M2 templates deleted, subjects kept, verify returns 409 | One stored embedding can't become a 5-photo template, and fails the bar anyway. `db/m2-protected-templates.sql`. |
| Duplicate-photo rejection at the gateway | Five copies of one photo average to that photo and silently lose the accuracy gain. |

**Production path re-measured** (`verify_production.py`: same 309-person LFW protocol, run through `app/protection.py` with its own randomness, hashing and gate):

| Metric | Result | FIDO bar |
|---|---|---|
| False rejects | 2.2% (80% CI 1.8%–2.9%) | ≤ 5% |
| False accepts | 0 / 154,000 (upper bound 1.5×10⁻⁵) | ≤ 10⁻⁴ |
| Failure to enrol (consistency gate) | 1 / 309 (0.3%) | n/a |
| Protect (per enrolment) | 110 ms p50 / 1.05 s p95 | n/a |
| Verify compute (excluding face embedding) | 0.4 ms p50 / 5.5 ms p95 | n/a |

The IronMask maths adds well under a millisecond to a verification. End-to-end latency is dominated by face detection and embedding.

**End to end through the real gateway** (`e2e_gateway.mjs`: sign-up, email verification via Mailpit, API key, then the `/v1` API with real LFW photos):

| Check | Result |
|---|---|
| 4 photos / a duplicate photo / no consent / a different person's photo among the 5 | All rejected with 400 and a message naming the problem |
| Enrol with 5 photos | 200. Stored row is a 32-byte digest + 1 MiB helper, no embedding column |
| 30 genuine verifications | 30/30 match. Response has no `confidence` field |
| Impostor photos | 0 accepted (5 no-match, 1 rejected for a background face) |
| Pre-M2 subject (template removed) | 409 "must re-enroll with 5 photos", then re-enrolment works |
| Delete subject, then verify | 204, then 404. Test account deleted |
| **Verify latency, client side** | **FAIL: p50 482 ms, p95 615 ms (target < 300 ms)** |

Latency root cause (profiled inside the ML service): IronMask verify is 6 ms. InsightFace is 474 ms p50, because `FaceAnalysis` ran all five `buffalo_l` models per face, three of which (two landmark models, gender/age) don't affect the embedding. Loading only detection + recognition gives identical embeddings and cuts it to 308 ms p50 / 334 ms p95. That is still too slow on this laptop, and detection at 640x640 is 189 ms of it.

**320x320 detection, validated before adoption.** Detection at 320x320 takes 45 ms instead of 189 ms, but it shifts embeddings slightly (cosine 0.984 to 0.994 against the 640 versions), so the whole LFW set was re-embedded at 320 and run through the production path before switching:

| Production check, α=12, 5 photos | 640 (validated) | 320 |
|---|---|---|
| False rejects (80% CI) | 2.2% (1.8%–2.9%) | 2.1% (1.7%–2.6%) |
| False accepts | 0 / 154,000 | 0 / 155,000 |
| Failure to enrol | 1 / 309 | 1 / 311 |
| Photos where no face was found | 35 / 9,164 | 0 / 9,164 |
| Security | 2⁹¹ | 2⁹¹ (protection unchanged) |

320 meets the same bar, so it was adopted. **Final end-to-end verify latency** (same e2e suite, 18/19 checks pass, 30/30 genuine matches, 0 impostors accepted): **250 ms median, 318 ms p95**, down from 482 / 615 ms. The median meets the 300 ms target. p95 misses it by 18 ms on this laptop CPU, where face embedding alone varies by tens of milliseconds between runs and the ML service's own `/verify` measures 271 ms p50 / 304 ms p95. The remaining levers are a smaller template to move per request (a separate storage spike, deliberately not mixed into production) or a faster recognition model or GPU. Accuracy was not traded for latency.

## Storage spike: can the 1 MiB template shrink?

**Superseded:** int8 was later validated and adopted (see "int8 validation" and "M2 baseline"). At the time of this spike, production was fp32, 1 MiB. Baseline = production as it runs now (320x320 detection, α=12, 5 photos). Same LFW protocol for every variant (310 people through the production consistency gate, 3,846 genuine and 155,000 impostor attempts). Scripts: `storage_spike.py`, `storage_db_latency.py`.

| Variant | Bytes / template | False rejects (80% CI) | False accepts | Security | Verify compute p50 / p95 | DB fetch p50 / p95 | TB per 1M users |
|---|---|---|---|---|---|---|---|
| **fp32, 512 dims (baseline)** | 1,048,576 | 2.05% (1.6–2.7%) | 0 / 155k | 2⁹¹ | 1.2 / 8.7 ms | 10.8 / 15.6 ms | 1.09 |
| fp16, 512 | 524,288 | 2.18% (1.7–2.8%) | 0 / 155k | 2⁹¹ | 3.7 / 9.6 ms | 5.7 / 7.2 ms | 0.55 |
| **int8 per-row scale, 512** | 263,168 | 2.11% (1.6–2.7%) | 0 / 155k | 2⁹¹ | 2.4 / 7.0 ms | 2.6 / 3.7 ms | 0.27 |
| int4 per-row scale, 512 | 132,096 | 2.31% (1.8–2.9%) | 0 / 155k | 2⁹¹ | 4.2 / 11.7 ms | ~1.4 / 2.0 ms* | 0.14 |
| fp32, 256 dims, α=12 | 262,144 | 17.2% | 0 / 155k | 2⁷⁸·⁸ | 0.6 / 8.2 ms | ~2.6 / 3.7 ms* | 0.27 |
| fp32, 256 dims, α=16 | 262,144 | 39.1% | 0 / 155k | 2⁹⁹·¹ | 1.1 / 9.9 ms | | |
| fp32, 256 dims, α=20 | 262,144 | 61.5% | 0 / 155k | 2¹¹⁷·⁸ | 0.3 / 5.8 ms | | |
| fp16, 256 dims, α=12 / 16 | 131,072 | 17.1% / 38.4% | 0 / 155k | 2⁷⁸·⁸ / 2⁹⁹·¹ | ~1.3 / 7 ms | 1.4 / 2.0 ms | 0.14 |
| fp16, 128 dims, α=12 / 16 / 20 | 32,768 | 58.2% / 82.6% / 93.8% | 0 / 155k | 2⁶⁶·⁴ / 2⁸²·³ / 2⁹⁶·⁷ | ~0.3 / 5 ms | 0.7 / 0.9 ms | 0.03 |

\* Same byte size as a measured row; DB fetch time depends only on size.

**Findings:**

1. **Lossless compression does not help.** zlib and lzma shrink the fp32 template by 7.3–7.7%. P is a random orthogonal matrix, so its float bits are close to incompressible. (Packed int4 does compress about 18% further, because the quantised values cluster near zero. That combination is unvalidated.)
2. **Quantising P is safe for security by construction.** fp16/int8/int4 are deterministic functions of P, so they can reveal nothing P doesn't. The 2⁹¹ estimate is the cost of finding the codeword from its hash, which doesn't involve P's precision at all. Only accuracy could move, and the table measures that.
3. **int8 is the best candidate: 4x smaller with no measurable accuracy change.** False rejects 2.11% vs 2.05%, with overlapping intervals and zero false accepts. DB fetch is 4x faster (2.6 vs 10.8 ms p50), and Postgres storage falls from 1.09 to 0.27 TB per million users. fp16 (2x) is the conservative fallback. int4 (8x) shows the first upward drift (2.31%). It's still inside the bar, but it needs more data before trusting.
4. **Shrinking the embedding before IronMask fails.** At the same bytes as int8, 256 dims gives 17.2% false rejects at only 2⁷⁸·⁸. Raising α to restore security makes accuracy collapse (39–62%). 128 dims is worse on both axes. Quantising P keeps all 512 dimensions of facial information; projecting throws it away.
5. **A seed-based P is a different security model, not a smaller template.** P can't be stored factored: the rotation part exposes the plane containing the face embedding. Deriving the random rotation from a server-side key would cut the stored part to about 4 KB. But then a stolen database plus that key gives up the embedding without any 2⁹¹ search, so security becomes "keep the key secret". That isn't a drop-in replacement. Encrypting templates at rest with a managed key is still worth adding *on top of* IronMask as defence in depth, since it doesn't weaken the 2⁹¹.
6. **Separate template storage: not yet, but plan for it.** Templates already sit in their own table. At int8 sizes, 100k users is about 27 GB, which is fine in the main Postgres. Past that, move templates to a dedicated store (a separate database, or object storage keyed by subject UUID with envelope encryption), with its own backups and retention. That limits what one breach or one backup exposes, and keeps them out of application backups. The cost is a cross-store delete: the right to be forgotten must remove both the pointer and the blob (delete the pointer first, then sweep orphans). Object-store fetch latency wasn't measured here.

**Before adopting int8 in production:** re-run with more random seeds and a larger impostor set (the false-accept resolution here is ~6x10⁻⁶), store a template format/version column so fp32 and int8 rows can coexist during migration, and re-measure end-to-end latency. Moving 256 KB instead of 1 MiB per verify should also cut the gateway-to-ML transfer, which may close the 18 ms p95 gap. That is a hypothesis, unmeasured.

## int8 validation (paired against fp32)

Templates are versioned (`biometrics.template_version`: 1 = fp32, 2 = int8). The ML service reads both and writes `ENROL_TEMPLATE_VERSION` (default 1). Script: `int8_validation.py`.

**Design.** For each of the 310 people (320x320 production pipeline) and each of **5 seeds**, one secret codeword and one random rotation P are drawn with the production code, and P is stored **both ways**. fp32 and int8 therefore see the same codeword, the same P and the same probes, so any decision that differs is caused by int8 alone. Impostors are **every photo of every other person**: 14,177,225 attempts, 90x the earlier set.

| 310 people x 5 seeds | fp32 (baseline) | int8 |
|---|---|---|
| Bytes per template | 1,048,576 | 263,168 |
| Genuine attempts | 19,225 | 19,225 |
| False rejects (80% CI, people bootstrap) | 2.00% (1.58%–2.52%) | 2.00% (1.59%–2.54%) |
| False rejects per seed | 2.11 / 1.77 / 2.08 / 1.98 / 2.08% | 2.05 / 1.77 / 2.05 / 2.00 / 2.11% |
| False accepts (raw) | 10 / 14,177,225 | 10 / 14,177,225 (the same pairs) |
| Verify compute p50 / p95 | 1.2 / 10.7 ms | 4.1 / 11.3 ms |

**Paired disagreement.** On all 14,177,225 impostor attempts, fp32 and int8 made identical decisions (0 disagreements). On genuine attempts they differed 7 times out of 19,225: fp32 accepted and int8 rejected 3, the reverse 4 (McNemar p = 1.0). int8 is indistinguishable from fp32 at this sample size.

**The 10 raw false accepts are two dataset artefacts, each hit once per seed in both formats.** (1) A template of Abdullah Gül accepts `Recep_Tayyip_Erdogan_0004.jpg`, a photo with **2 faces**; the benchmark takes the central face, while production rejects any photo with more than one face. (2) A template of Rubens Barrichello accepts `Michael_Schumacher_0008.jpg`, which appears to show the same man as Barrichello's own photos, consistent with LFW's known labelling errors. Their unprotected cosine scores (0.81 and 0.75) sit at the genuine median (0.78), and every other impostor scores ≤ 0.47. Excluding them leaves 0 false accepts in 14,177,215 attempts (80% upper bound ≈ 1.6x10⁻⁷). Raw or adjusted, both formats sit far below the FIDO 10⁻⁴ limit.

**Security under the real int8 bytes.** The codebook is the production one: C(512, 12)·2¹² = 2⁹¹·⁰. The int8 helper is computed from P alone (P → per-row fp16 scale + int8), so it can't reveal anything P doesn't, and finding the codeword still means searching that codebook against its hash. Two empirical checks on real int8 templates found nothing: 100,000 random-probe attacks produced 0 digest matches, and the stored per-row scales don't distinguish the codeword's support rows from the others (mean AUC 0.49; 0.5 is chance).

**Verdict on int8: adopted as the production format** after the clean benchmark below. It meets the accuracy and security bar exactly as fp32 does (paired evidence over 5 seeds and 14.2M impostors), at a quarter of the storage (1.09 → 0.27 TB per million users), and it is faster end to end. Existing fp32 templates keep working; no migration.

## Final latency benchmark: fp32 vs int8 (clean CPU)

The first attempt was invalid: the host was at 100% CPU because of an unrelated process (later found to be malware and removed). Re-run after removal and a reboot, with the browser closed. Host load stayed at 15–22% average before and after each run (other background apps). Laptop: Intel i5-9300H (4 cores / 8 threads), Docker Desktop.

Design: one enrolment, one codeword, one P, stored as fp32 and as int8 (`bench_ml.py`, `bench_gateway.mjs`). Requests alternate formats (and which goes first) sequentially, after 20 warm-up pairs. In the gateway run each format has its own API key, so the per-key rate limit can't throttle either side. All 1,600 measured verifications returned `match: true`.

| Layer (400 requests per format) | Format | Mean | p50 | p95 | p99 | Max |
|---|---|---|---|---|---|---|
| ML service `/verify` | fp32 | 242.4 | 238.8 | 275.4 | 307.7 | 610.0 |
| ML service `/verify` | int8 | 238.6 | 236.3 | 270.3 | 283.6 | 376.0 |
| **Gateway end to end** | fp32 | 249.8 | 249.9 | 297.1 | 381.9 | 457.5 |
| **Gateway end to end** | **int8** | **226.5** | **229.2** | **273.3** | **312.5** | 381.5 |

(ms.) At the ML service int8 saves only 2–5 ms: the extra dequantisation offsets the smaller upload. End to end it saves 21 ms p50, 24 ms p95 and 69 ms p99. The difference is in the gateway path: fetching a 1 MiB `bytea` from Postgres (node-postgres decodes ~2 MB of hex text) and forwarding it to the ML service. **With int8, gateway p95 is 273 ms, inside the 300 ms target.** fp32 sits at 297 ms on a clean CPU, so the earlier 318 ms p95 "gap" came from background load, not the code. A final 19/19 e2e run with the int8 default measured 185 / 211 ms (40 samples, paced 1/s).

## M2 baseline (frozen)

This is the configuration M2 delivers and every later milestone is compared against. Git tag `m2-baseline`.

| | |
|---|---|
| Matching | 1:1 only. Identity is claimed first; one template is compared. |
| Face pipeline | MediaPipe single-face gate → InsightFace `buffalo_l` (detection + recognition only), BGR input, 320x320 detection, 512-d L2-normalised embedding |
| Enrolment | 5 different photos, averaged; every photo must match the mean at cosine ≥ τ = 0.6 |
| Protection | IronMask, α = 12 (codebook C(512,12)·2¹² = 2⁹¹); stored: SHA-256 digest (32 B) + P |
| Template format | Version 2, int8 with a per-row fp16 scale: 263,168 B per person (0.27 TB per million). Version 1 (fp32, 1 MiB) still readable |
| Accuracy (LFW, 310 people x 5 seeds, int8) | False rejects 2.00% (80% CI 1.59–2.54%); false accepts 0 real in 14,177,215 (10 raw: one 2-face photo production rejects, one mislabelled photo); failure to enrol 0.3% |
| FIDO accuracy bar (FRR ≤ 5% at FAR ≤ 10⁻⁴) | Met, on an offline benchmark (not a certification) |
| Latency (gateway end to end, laptop CPU) | p50 229 ms, p95 273 ms, p99 313 ms |
| Not covered | Liveness / spoofing, demographic fairness testing, non-LFW datasets, live-capture accuracy, server hardware, multi-request concurrency |

## Latency and storage (Postgres, 1:1 lookup by primary key, α=16)

| Rows | IronMask verify p50 / p95 | Raw verify p50 / p95 | IronMask per user | Raw per user |
|---|---|---|---|---|
| 100 | 22.3 / 37.6 ms | 0.9 / 3.9 ms | 1.09 MB | 3.9 KB |
| 1,000 | 27.1 / 42.2 ms | 0.9 / 3.8 ms | 1.09 MB | 3.0 KB |
| 2,000 | 29.4 / 51.8 ms | 1.0 / 5.0 ms | 1.09 MB | 2.9 KB |

Enrolment (random rotation + codeword mapping): p50 230 ms, p95 1.09 s, once per user.

## Findings

1. **Accuracy collapses as security rises.** Each step in α multiplies false rejects. The 2⁸⁰ floor sits between α=8 and α=12.
2. **Storage, not speed, is the scaling cost.** Verify stays under 60 ms at p95, well inside the sub-300 ms target. But P must be stored whole (~1 MB per user, about 280× a raw embedding), because a compact form would leak the template. A million users is ~1.1 TB.
3. **Retrieval accuracy is not applicable, by design.** Protected templates are not vectors with a meaningful distance, so pgvector nearest-neighbour search cannot run over them. 1:N search is also banned by CLAUDE.md §2.1. Templates are stored as `bytea`, not pgvector.
4. **Production bug found: `app/engine.py` feeds InsightFace RGB, but it expects BGR.** The equal error rate barely moves, but at τ=0.6 false rejects rise from 17.5% to 27.4%. The fix changes every stored template, so it needs its own PR and a re-enrolment plan.
5. **τ=0.6 is far above the equal-error point (cosine 0.19).** That's very conservative: 1 in 167k false accepts, but 17.5% false rejects on LFW.

## Caveats

- Failure-to-enrol is measured on LFW, where a person's 5 enrolment photos can be years apart. Live enrolment captures 5 photos in one sitting, so the gate should reject far less.
- LFW is unconstrained web photos taken years apart, about the hardest case for exact codeword decoding. Selfie enrolment should do better. These numbers are a pessimistic bound, not product numbers.
- The multi-photo results come from the 309 people with ≥6 photos, which is an easier subset than full LFW (single-photo α=8 accepts 96.6% there vs 95.0% overall). Full LFW can't test this, because most people in it have only 2 photos.
- With 167,200 impostor comparisons, the smallest measurable FAR is ~6×10⁻⁶. The single impostor accepted at α=8–24 (and at unprotected τ=0.6) is likely a known LFW label error (one person under two names).
- The production MediaPipe "exactly one face" gate was skipped (LFW photos contain background faces); the most central face was used instead.
- Latency was measured on a laptop Docker VM against the dev database.
- Spike code is unsalted and unhardened. Security figures assume, as the IronMask paper argues, that P reveals nothing beyond what brute-forcing the codebook gives.

## Reproduce

From the repo root, with `npm run dev:infra` up:

```
docker run --rm -v "<repo>/spikes/ironmask:/spike" -v "<repo>/spikes/ironmask/data/insightface:/home/mluser/.insightface" -w /spike facial-recognition-saas-ml python embed.py
docker run --rm -v "<repo>/spikes/ironmask:/spike" -w /spike facial-recognition-saas-ml python evaluate.py
docker run --rm -v "<repo>/spikes/ironmask:/spike" -w /spike facial-recognition-saas-ml python evaluate_multi.py
docker run --rm -v "<repo>/spikes/ironmask:/spike" -w /spike facial-recognition-saas-ml python bootstrap_ci.py
docker run --rm -e PYTHONPATH=/repo -v "<repo>:/repo" -w /repo facial-recognition-saas-ml python spikes/ironmask/verify_production.py
# 320x320 detection: DET_SIZE=320 for embed.py, then EMBEDDINGS=embeddings_det320.npz for verify_production.py / storage_spike.py
docker run --rm -e PYTHONPATH=/repo -e EMBEDDINGS=embeddings_det320.npz -v "<repo>:/repo" -w /repo facial-recognition-saas-ml python spikes/ironmask/storage_spike.py
# storage_db_latency.py needs a scratch database named storage_spike (create it, run on the compose network with --env-file .env, drop it)
docker run --rm --network facial-recognition-saas_default --env-file .env -v "<repo>/spikes/ironmask:/spike" -w /spike facial-recognition-saas-ml sh -c "pip install --user -q 'psycopg[binary]' && python latency.py"
```

LFW downloads via scikit-learn into `data/lfw_home/`. The `buffalo_l` model goes in `data/insightface/models/buffalo_l/`. Everything under `data/` is git-ignored (biometric data).
