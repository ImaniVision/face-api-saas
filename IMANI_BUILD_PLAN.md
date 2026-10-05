# Imani Vision — Build Plan

> The working checklist the coding agent executes against. Read `CLAUDE.md` first for the
> guardrails. Work milestones **in order**, top to bottom. Do not jump ahead.
>
> **Fill these in before starting** (they set the schedule and ownership):
> - **Submission deadline:** `___________`  (report + live demo + presentation?)
> - **Team size / who owns what:** `___________`
> - **Confirm centerpiece = cancelable biometrics (M2)?** `___________`

Legend: `[ ]` todo · `[~]` in progress · `[x]` done · ⭐ = project centerpiece · 🔒 = touches auth/matching (tests required to be "done")

---

## M0 — Stabilize & share  *(do first, this week)*

**Goal:** the whole team can build on the same, safe codebase, and the demo actually works.

> **Order matters here:** strip secrets → THEN commit. If you commit first and remove secrets
> later, the secret is in git history forever (and must be rotated).

- [x] Create `.env` from `.env.example`; move ALL secrets out of `docker-compose.yml` and any source into env vars.
- [x] Add `.env` (and `*.env`) to `.gitignore`. Commit `.env.example` with **placeholder** values only.
- [x] If `JWT_SECRET`, DB creds, or any key was **ever committed before**, rotate them now.
- [x] Initialize/normalize git, commit current work, push to shared remote (GitHub). Protect `main`; enable PR-based workflow.
- [x] Close network exposure in `docker-compose.yml`: remove the `8000:8000` (ML service) and `5432:5432` (Postgres) host port mappings so they're only reachable inside the Docker network.
- [x] Lock CORS on the gateway to the portal's origin (no wildcard). Add `helmet`.
- [x] Fix the broken demo: the Live Test page posts to `/api/proxy/verify`, which doesn't exist (`portal/src/components/demo-widget.tsx:68`). Add the proxy route or point it at the real endpoint.
- [x] Write down the 2 open security issues + their fix plan in `documentation.md`.

**Done when:** repo is shared and secret-free · every teammate can pull & run it · ML service and DB are not internet-reachable · the demo verifies a face end-to-end.

---

## M1 — Honest v1 (the shared foundation)  🔒

**Goal:** turn the prototype into a small, real, safe product. Only build the gaps needed by BOTH the modest API and the future product.

- [x] 🔒 Route all matching through the ML service (`/verify_user`); **delete the TypeScript cosine comparison.** One τ, one place.
- [x] 🔒 Tests: `ApiKeyAuthGuard` (valid / revoked / malformed key).
- [x] 🔒 Tests: face-match decision at, just-above, and just-below τ.
- [x] Consent at enrollment — mandatory, logged, timestamped. No embedding stored without it.
- [x] Data-deletion endpoint ("delete my data" / right to be forgotten).
- [x] Rate limiting on the gateway (Redis token bucket).
- [x] Real usage tracking (replace the fake dashboard numbers; store per-key call counts).
- [x] Image validation on upload (file type + size limits).
- [x] Email verification before keys are usable.

**Done when:** a developer can *sign up → verify email → give consent → get a key → be rate-limited → verify faces → delete their data*, and the auth/matching path has passing tests.

> Note: **Stripe billing is deferred** (future work). Build usage *metering* now so billing can read it later; don't wire payments.

---

## M2 — ⭐ Cancelable biometrics (the centerpiece)  🔒

**Goal:** the thesis-worthy contribution — stored templates that can't be reversed into a face.

- [x] **SPIKE FIRST (throwaway):** → results in `spikes/ironmask/RESULTS.md`. apply IronMask to embeddings, store protected templates in pgvector, and measure:
  - equal-error-rate (EER) degradation vs. unprotected matching, and
  - retrieval accuracy + query latency at increasing template counts.
  - **This spike decides the architecture. Report the numbers either way — a negative result is a valid thesis finding.**
- [x] If viable: integrate protected templates as the real storage path (replaces raw-embedding storage — this is why we didn't gold-plate that earlier).
  → Viable at α=12 with 5 enrolment photos. Built: `app/protection.py`, `/enroll` + `/verify`, `bytea` templates, 5-photo enrolment API + portal demo, 409 re-enrolment, `db/m2-protected-templates.sql`. Unit tests + production-path LFW re-check pass. E2E through the gateway: 18/19 pass. Verify latency 250 ms median (meets < 300 ms) / 318 ms p95 (misses by 18 ms on laptop CPU; accuracy not traded for it). Storage spike done (not applied): int8-quantised P is 4x smaller (263 KB, 0.27 TB per 1M users) with no measurable accuracy change and the same 2^91; embedding-dimension reduction fails. See RESULTS.md "Storage spike".
- [x] Fix the RGB/BGR channel bug in `app/engine.py` (separate PR, lands before the IronMask integration).
- [x] Produce a results table (EER cost, retrieval %, latency) for the report/slides.
- **M2 follow-ups**
  - [x] Template versioning: `biometrics.template_version` (1 = fp32, 2 = int8). Both readable; new enrolments write `ENROL_TEMPLATE_VERSION` (default 1).
  - [x] int8 storage validated and **adopted as production** (template v2): identical impostor decisions on 14.2M attempts, FRR 2.00% vs 2.00%, 2^91 holds, 4x smaller, gateway p50/p95/p99 229/273/313 ms vs fp32 250/297/382 ms.
  - [x] `examples/` rewritten for the 5-photo flow (server client + Express routes + React), strict type-checked.
  - [~] Privacy policy draft at `/privacy` + one-time UI privacy notice. Before launch: operator legal name, contact address, hosting/email providers, legal review.
  - [~] Terms of service draft at `/terms`, marked not in force. Same launch inputs as the privacy policy: legal name, contact, governing law, providers, legal review.
  - [x] Split into PRs: `fix/bgr-channel-order`, `m2/ironmask-integration`, `perf/ml-detection-speed`, `docs/m2-results-portal-legal`, `perf/int8-templates` (stacked, local).

**Done when:** enrolled faces match correctly through protected templates, AND you have a measured table of the accuracy/latency cost. *(If only the project reaches here, it's already a strong final-year project.)*

> **M2 done; baseline frozen** (git tag `m2-baseline`). Numbers: `spikes/ironmask/RESULTS.md`, section "M2 baseline".

---

## M3 — Risk engine (one cheap, real differentiator)

**Goal:** demonstrate *continuous / risk-based* verification cheaply, with no ML risk.

- [x] Rules layer in front of the (mock) transaction API deciding when to require a face check.
  → `POST /v1/subjects/:id/transactions` (`api-gateway/src/transactions/`). Pure rules in `risk.rules.ts`; the selfie is verified 1:1 in the same request as the payment, so a match can't be replayed onto another payment. Only approved payments are stored (payee/device as SHA-256), deleted with the subject.
- [x] At least one demonstrable rule (e.g. "new payee → require face", "amount over X → require face").
  → Three: amount ≥ 1,000.00, new payee, new device. Shown in the portal Live Test "3. Pay" step and docs page `/docs/payments`. Tests: 9 unit (rules at/below/above the limit, the four outcomes), 14 end-to-end checks in `spikes/ironmask/e2e_gateway.mjs` (each rule fires, impostor declined, genuine approved, history hashed and deleted).

**Done when:** a rule demonstrably triggers a verification in the demo.

---

## M4 — Presentation package

**Goal:** the demo proves the thesis's central claim on the day, no surprises.

- [ ] End-to-end demo path rehearsed and working.
- [ ] Recorded fallback video of the live demo.
- [ ] M2 results table in the slide deck.
- [ ] Thesis final draft cites real artifacts (tests, numbers, endpoints) — not plans.

**Done when:** the demo runs start-to-finish and the M2 numbers are in the deck.

---

## Future work — DOCUMENT, do not build (unless a human assigns it)

Write these up as the "roadmap to commercialization" chapter; they are the post-graduation build queue.

- Liveness / rPPG (see rPPG caution in `CLAUDE.md §3`) · Self-Blended-Images deepfake detection
- Full validation battery (IJB-C, RFW, SiW-Mv2, DFDC-preview, template-inversion attack)
- AdaFace model swap · Stripe billing · continuous re-verification during a session
- SOC 2, pen-test report, liability insurance, incident response, enterprise sales motion
- Full compliance mapping (Ghana Act 843, Nigeria NDPA, GDPR, EU AI Act, Illinois BIPA)
