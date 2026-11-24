# Imani Vision — Demo runbook (M4)

The live demo path, the checks to run before it, and what to do when something breaks.
Every number quoted on stage comes from `spikes/ironmask/RESULTS.md` ("M2 baseline"); don't quote anything else.

## The day before

- [ ] Laptop **on mains power** for every run. On battery the CPU throttles and verify slows from ~230 ms to ~320 ms median.
- [ ] `npm run dev:infra`, then gateway and portal as in `documentation.md` A3 (Option 1). Wait for `face-api (healthy)` in `docker ps`.
- [ ] `node spikes/ironmask/e2e_gateway.mjs` from the repo root → **30/30 checks passed**. It creates and deletes its own account.
- [ ] Create the demo account in the portal (sign up → open the email in Mailpit at http://localhost:8025 → verify). Don't enroll yet: enrolling live is part of the show.
- [ ] Rehearse the script below twice, timed, in the room's lighting if you can.
- [ ] Record the fallback video (below) and copy it onto the laptop **and** a USB stick.

## 30 minutes before

- [ ] Power cable in. Close the browser tabs, video players and IDEs you don't need.
- [ ] Stack up and healthy; run the end-to-end check once more (≈2 min).
- [ ] Sign in to the portal, open **Live Test**, grant the camera, and delete any old demo face ("Delete my enrolled demo face").
- [ ] Open, in tabs: Live Test · `/docs/payments` · the fallback video · the results slide.
- [ ] Face lit from the front, plain background. One face in frame: the API rejects photos with two.

## Script (about 6 minutes)

| # | Show | Say |
|---|---|---|
| 1 | Home page | Face verification for developers, 1:1 only: "is this the person they claim to be?", never "who is this?". |
| 2 | Live Test → **1. Enroll**: tick consent, take 5 photos, turning slightly | Enrolment needs consent and 5 photos. They are averaged, and every photo must match the average, so one template can't mix two people. |
| 3 | Terminal: `docker exec -i face-db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "select length(digest), length(helper), template_version from biometrics"'` | **The centrepiece.** No photo and no face embedding is stored: a 32-byte hash and a 257 KiB random matrix (IronMask). Recovering the face needs about 2⁹¹ guesses. |
| 4 | **2. Verify**: new selfie → Match. A teammate's face → No Match | No score is returned, only match / no match. |
| 5 | **3. Pay**: send 50.00 to Ama Mensah | First payment: the risk engine asks for a face ("new payee", "new device"). Take a selfie → approved. |
| 6 | Send the same payment again | Known payee, known device, small amount: approved with no face check. |
| 7 | Change the amount to 1500 → send | Over the limit: face required again. A teammate's selfie → declined. |
| 8 | "Delete my enrolled demo face" | Right to be forgotten: template, consent record and payment history are gone. |
| 9 | Results slide | FRR 2.00%, 0 real false accepts in 14.2M impostor attempts on LFW, verify p50 229 / p95 273 ms. Meets the FIDO accuracy bar on an offline benchmark; it is **not** a certification. |

## If something breaks

| Symptom | Do this |
|---|---|
| Camera won't start | Reload the page and grant the camera again. If it still fails, play the fallback video from that step. |
| "No face" / "more than one face" | Step closer, better light, nobody behind you. Retake. |
| Genuine selfie says No Match | Expected about 2% of the time on LFW. Retake facing the camera; say so honestly. |
| "Request failed. Is the gateway running?" | Gateway terminal: restart `npm run start:dev`. Meanwhile switch to the video. |
| `face-api` unhealthy | `docker restart face-api`, ~30 s. Switch to the video meanwhile. |
| Anything slower than a minute to fix | Fallback video. Don't debug on stage. |

## Fallback video

Record the whole script once, start to finish, with the same account and narration. Windows: **Win + Alt + R** (Xbox Game Bar) records the browser window; use Snipping Tool's screen recording to include the terminal for step 3.

## Honest limits (say them if asked)

- No liveness check: a good printed photo of the enrolled person could pass.
- Accuracy is measured on LFW web photos, not live selfies, and not split by demographic group.
- The payment API is a mock: no money moves, and the limit and rules are fixed.
- Latency is from one laptop CPU, not server hardware.
- `/privacy` and `/terms` are drafts and not in force.
