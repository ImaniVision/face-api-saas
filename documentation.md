# Imani Vision — Project Documentation

This is the **one place** for how to set up, run, and understand the project. The READMEs only point here.

- **New to the project?** Read [Part A](#part-a--getting-started) and follow it top to bottom.
- **What are we building and in what order?** See `IMANI_BUILD_PLAN.md` (milestones).
- **How does it work / what's missing?** See [Part B](#part-b--how-the-system-works) and [Part C](#part-c--status-gaps--security).

**Contents**

- Part A — Getting started
  - A1. What you need installed
  - A2. First-time setup (secrets)
  - A3. Running it
  - A4. Everyday commands
  - A5. Checking it works
  - A6. Troubleshooting
- Part B — How the system works
  - 1. Project goal · 2. Architecture · 3. Directory structure · 4. Service deep dives · 5. Infrastructure
- Part C — Status, gaps & security
  - 6. What we have vs. what the system requires · 7. What needs to be built next · 8. Security issues & fix plan

---

# Part A — Getting started

## A1. What you need installed

| Tool | Why | Check it's installed |
|------|-----|----------------------|
| **Docker Desktop** (running) | Runs the face ML service, the database and (optionally) the gateway | `docker --version` |
| **Node.js 20+** | Runs the gateway (`api-gateway/`) and portal (`portal/`) | `node --version` |
| **Git** | Getting the code and sharing changes | `git --version` |

You do **not** need Python installed. The ML service runs inside Docker. (Running it without Docker is possible but painful on Windows — see A6.)

## A2. First-time setup (secrets)

The project needs a few passwords and keys. **None of them ever go into git.** Each service reads them from its own git-ignored file:

| File | Used by | Template |
|------|---------|----------|
| `.env` (repo root) | Docker (ML service, database, gateway container) | `.env.example` |
| `api-gateway/.env` | The gateway when you run it on your own machine | table below |
| `portal/.env.local` | The portal | table below |

### Step 1 — Generate random values

Most secrets are not "fetched" from anywhere — **you invent them**. They're passwords our own services use to recognise each other. Generate one per secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

(`base64url` avoids `/` and `+`, which would break the database address.)

### Step 2 — Root `.env`

Copy the template, don't rename it (teammates need `.env.example` to stay in the repo):

```bash
cp .env.example .env
```

| Variable | What it is | Value |
|----------|-----------|-------|
| `POSTGRES_USER` | Database username | You choose, e.g. `imani` |
| `POSTGRES_PASSWORD` | Database password | Random value |
| `POSTGRES_DB` | Database name | `imani` |
| `DATABASE_URL` | The three above as one address, for the gateway **inside Docker** | `postgresql://USER:PASSWORD@db:5432/imani` |
| `JWT_SECRET` | Signs login tokens | Random value |
| `ML_SERVICE_API_KEY` | Secret handshake: only the gateway may call the ML service | Random value |
| `ML_SERVICE_URL` | ML service address **inside Docker** | `http://ml:8000` |
| `PORTAL_ORIGIN` | The only website allowed to call the gateway from a browser | `http://localhost:3001` |

> ⚠️ Inside Docker, services find each other by **name** (`db`, `ml`), not `localhost`.
>
> ⚠️ Postgres only reads `POSTGRES_USER` / `POSTGRES_PASSWORD` the **first time** its data volume is created. If you change them later, run `npm run stack:down` then `docker volume rm facial-recognition-saas_postgres_data` (**deletes all database data**) and start again.

### Step 3 — `api-gateway/.env` (only if you'll run the gateway yourself)

Same values as the root `.env`, but using `localhost` because the gateway runs **outside** Docker:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://USER:PASSWORD@localhost:5432/imani` (same user/password as root) |
| `ML_SERVICE_URL` | `http://localhost:8000` |
| `ML_SERVICE_API_KEY` | **Exactly the same** as in the root `.env` |
| `JWT_SECRET` | Same as root `.env` |
| `PORTAL_ORIGIN` | `http://localhost:3001` |

The gateway refuses to start if `ML_SERVICE_API_KEY` or `PORTAL_ORIGIN` is missing — that's deliberate.

### Step 4 — `portal/.env.local`

| Variable | What it is | Where to get it |
|----------|-----------|-----------------|
| `NEXT_PUBLIC_API_URL` | Gateway address | `http://localhost:3000` |
| `NEXTAUTH_URL` | Portal address | `http://localhost:3001` |
| `NEXTAUTH_SECRET` | Signs portal sessions | Random value |
| `GITHUB_ID` / `GITHUB_SECRET` | "Sign in with GitHub" | GitHub → Settings → Developer settings → OAuth Apps → New. Callback URL: `http://localhost:3001/api/auth/callback/github` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | "Sign in with Google" | Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID (Web). Redirect URI: `http://localhost:3001/api/auth/callback/google` |

GitHub/Google are optional — email/password sign-in works without them.

### Step 5 — Install packages

```bash
cd api-gateway && npm install
cd ../portal && npm install
```

## A3. Running it

There are two ways. Both keep the ML service and database **off the network** — only the gateway is reachable.

### Option 1 — Developers (hot reload)

Docker runs only the ML service and database, opened to **your computer only** (`127.0.0.1`). You run the gateway and portal yourself so code changes reload instantly.

```bash
# Terminal 1 — repo root
npm run dev:infra

# Terminal 2 — first time, and after changing src/db/schema.ts
cd api-gateway
npx drizzle-kit push        # creates/updates the database tables
npm run start:dev           # gateway on http://localhost:3000

# Terminal 3
cd portal
npm run dev                 # portal on http://localhost:3001
```

### Option 2 — Everyone else / demos

Everything except the portal runs in Docker. The gateway creates the database tables itself on start.

```bash
# repo root
npm run stack

# then
cd portal
npm run dev                 # portal on http://localhost:3001
```

> The first start downloads the face model (~280 MB) and can take a few minutes. The ML service shows `(healthy)` in `docker ps` when ready.

## A4. Everyday commands

**Repo root**

| Command | What it does |
|---------|--------------|
| `npm run dev:infra` | Start ML service + database for development |
| `npm run dev:infra:down` | Stop them |
| `npm run stack` | Start the full stack (ML + database + gateway) |
| `npm run stack:down` | Stop it |
| `docker ps` | See what's running and whether it's healthy |
| `docker logs face-gateway` / `face-api` / `face-db` | See a service's log |

**`api-gateway/`**

| Command | What it does |
|---------|--------------|
| `npm run start:dev` | Run the gateway with hot reload |
| `npx drizzle-kit push` | Apply `src/db/schema.ts` to the database |
| `npm run build` | Compile |
| `npm run lint` | Lint (and auto-fix) |
| `npm test` | Unit tests (`npm test -- api-keys.service` for one file) |
| `npm run test:e2e` | End-to-end tests (needs a running server) |

**`portal/`**

| Command | What it does |
|---------|--------------|
| `npm run dev` | Run the portal on port 3001 |
| `npm run build` | Production build |
| `npm run lint` | Lint |

## A5. Checking it works

```bash
docker ps                               # face-api should say (healthy)
curl http://localhost:3000/             # gateway → "Hello World!"
```

Try the face flow with your own photo (**this stores a face embedding in your local database**):

```bash
# Register
curl -X POST http://localhost:3000/auth/register -F "email=you@example.com" -F "image=@path/to/photo.jpg"
# Log in with a second photo of the same person
curl -X POST http://localhost:3000/auth/login -F "email=you@example.com" -F "image=@path/to/photo2.jpg"
```

On Windows PowerShell, write `curl.exe` instead of `curl`.

In **Option 2**, `http://localhost:8000` and `localhost:5432` are deliberately **not** reachable from your machine — that's the security fix, not a bug.

## A6. Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| `required variable X is missing a value` | Root `.env` is missing `X`. Compare with `.env.example`. |
| `Conflict. The container name "/face-api" is already in use` | Old containers from before a change. `docker rm -f face-api face-db face-gateway`, then start again. |
| Gateway log: `password authentication failed` | Database was created with a different username/password — see the volume note in A2, step 2. |
| Gateway: `PORTAL_ORIGIN` / `ML_SERVICE_API_KEY` "does not exist" | Missing from `api-gateway/.env`. |
| Gateway gets `Failed to process image with ML service` for every image | `ML_SERVICE_API_KEY` differs between root `.env` and `api-gateway/.env`, or the image has no face / more than one face. `docker logs face-api` shows `401` for a key problem, `400` for a face problem. |
| `face-api` stays `(health: starting)` for minutes | Still downloading the face model on first start. `docker logs face-api` to watch. |
| `Error: DATABASE_URL is not set` from `drizzle-kit` | Add `DATABASE_URL` to `api-gateway/.env`. |
| Running the ML service **without Docker** on Windows fails installing `insightface` | It needs C++ build tools. Easiest: use Docker. Otherwise install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) ("Desktop development with C++"), then `pip install -r requirements.txt`, set `ML_SERVICE_API_KEY` in your shell, and `uvicorn app.main:app --reload --port 8000`. |

---

# Part B — How the system works

## 1. Project Goal

**Imani Vision** is a facial verification API targeted at developers. Developers integrate our API into their own applications, and we handle the biometric complexity — face detection, embedding generation, and verification — behind a clean REST interface.

Think of it as "Stripe for facial authentication." Developers sign up, generate API keys from the portal, and call endpoints that tell them whether two faces match. It is not a consumer product: our users are developers, and their customers are the people whose faces are verified.

### Core capabilities (as designed)
- **Face Verification (1:1):** "Is this the same person as the one enrolled under this identity?" Returns a match result and a confidence score. Identity is claimed first (email), then the face is checked against that one stored template — never a 1:N "search the database for this face", because false matches multiply with every enrolled user.
- **Face Detection:** Identify and return bounding box coordinates of faces within an image.
- **Developer Portal:** Dashboard for sign-up, API key management, usage monitoring, and documentation.
- **API Key–based access control:** Developers authenticate via `sk_live_` secret keys.

---

## 2. System Architecture

Three services plus a frontend portal.

```
┌─────────────────────────────────────────────────────────────────┐
│  Developer / End-User                                           │
└───────────────┬─────────────────────────────────────────────────┘
                │ HTTP (image upload, API key)
                ▼
┌─────────────────────────────┐
│  Portal (Next.js 16)        │  Port 3001
│  Developer Dashboard        │  Sign-up, API keys, usage, docs
└────────────────┬────────────┘
                 │ REST (server-side, session → access token)
                 ▼
┌─────────────────────────────┐
│  API Gateway (NestJS)       │  Port 3000  ← the ONLY public entry point
│  Auth, Routing, Key Guard   │
└──────┬──────────────────────┘
       │ multipart/form-data + X-ML-Service-Key header
       ▼
┌─────────────────────────────┐
│  ML Service (FastAPI)       │  8000, internal only
│  Face Detection + Embedding │
└─────────────────────────────┘
┌─────────────────────────────┐
│  PostgreSQL + pgvector      │  5432, internal only
│  Users, Biometrics, API Keys│
└─────────────────────────────┘
```

The ML service and PostgreSQL run in Docker and publish **no ports** to the outside (the dev overlay opens them on `127.0.0.1` only). The gateway runs either in Docker (`npm run stack`) or on your machine (`npm run dev:infra` + `npm run start:dev`). The portal runs on your machine (no Dockerfile yet).

---

## 3. Directory Structure

```
facial-recognition-saas/
├── app/                        # Python ML Service (FastAPI)
├── api-gateway/                # NestJS API Gateway
├── portal/                     # Next.js 16 Developer Portal
├── examples/                   # Integration code samples
├── docker-compose.yml          # ML service + Postgres + gateway (no public ML/DB ports)
├── docker-compose.dev.yml      # Dev overlay: opens ML/DB on 127.0.0.1 only
├── package.json                # Root shortcuts: dev:infra, stack, ...
├── .env.example                # Template for the root .env (placeholders only)
├── Dockerfile                  # Docker image for the ML service
├── requirements.txt            # Python dependencies
├── IMANI_BUILD_PLAN.md         # Milestone checklist
├── ARCHITECTURE.md             # Registration/login sequence diagrams
└── documentation.md            # This file
```

---

## 4. Service Deep Dives

### 4.1 ML Service (`app/`)

The ML Service is a **stateless FastAPI application**. It performs no database reads or writes. It only accepts an image and returns a mathematical result.

```
app/
├── __init__.py
├── engine.py     # FaceEngine class — all ML logic lives here
└── main.py       # FastAPI app — HTTP endpoints, request/response models, gateway-key check
```

**`engine.py` — FaceEngine**

`FaceEngine` is a singleton class (only instantiated once per process). It loads two ML models on startup:

1. **MediaPipe Face Detection** — a fast pre-check that counts how many faces are in the image. If there are zero or more than one, the request is rejected immediately before any expensive computation runs.
2. **InsightFace ArcFace (`buffalo_l`)** — generates a **512-dimensional embedding vector** from a face: a mathematical fingerprint of the face.

The embedding is L2-normalized, so all vectors have a magnitude of 1 and cosine similarity equals a dot product.

**`main.py` — API Endpoints**

| Endpoint | Method | Needs `X-ML-Service-Key` | Purpose |
|----------|--------|:---:|---------|
| `/` | GET | No | Basic status |
| `/health` | GET | No | Returns `engine_initialized` (used by Docker's health check) |
| `/vectorize` | POST | **Yes** | Accepts an image file, returns 512-dim vector |
| `/verify_user` | POST | **Yes** | Accepts image + saved vector, returns `{match, confidence}` |

The service **refuses to start** without `ML_SERVICE_API_KEY`, and rejects any `/vectorize` or `/verify_user` call without the matching `X-ML-Service-Key` header (401). Both endpoints reject images with zero or more than one face.

**Important note:** `/verify_user` works, but the gateway currently **does not call it** — it calls `/vectorize` and computes cosine similarity itself in TypeScript. Matching must happen in one place (the ML service) with one threshold, so this is the first M1 task.

---

### 4.2 API Gateway (`api-gateway/`)

The NestJS application is the central orchestrator. All requests from clients and the portal pass through here.

```
api-gateway/
├── src/
│   ├── app.module.ts           # Root module — wires everything together
│   ├── main.ts                 # Bootstrap, CORS (locked to PORTAL_ORIGIN), port
│   ├── auth/
│   │   ├── auth.controller.ts  # Route handlers (register, login, verify-face)
│   │   ├── auth.service.ts     # Business logic — calls ML service (with key), issues JWTs
│   │   ├── auth.module.ts      # JWT + HttpModule configuration
│   │   ├── jwt-auth.guard.ts   # Validates Bearer JWTs (for portal users)
│   │   └── api-key.guard.ts    # Validates sk_live_ API keys (for developers)
│   ├── api-keys/
│   │   ├── api-keys.controller.ts  # CRUD routes for API key management
│   │   ├── api-keys.service.ts     # Key generation, hashing, validation logic
│   │   └── api-keys.module.ts
│   └── db/
│       ├── db.module.ts        # Drizzle ORM provider (DRIZZLE injection token)
│       └── schema.ts           # Database table definitions
├── drizzle.config.ts           # Drizzle Kit config (schema push)
├── Dockerfile                  # Builds the gateway; pushes schema on start
├── test/
│   └── app.e2e-spec.ts
└── package.json
```

**Auth Routes**

| Route | Auth | Purpose |
|-------|------|---------|
| `POST /auth/email-register` | None | Register with email + password |
| `POST /auth/email-login` | None | Login with email + password → JWT |
| `POST /auth/register` | None | Register with email + face image → JWT |
| `POST /auth/login` | None | Login with email + face image → JWT |
| `POST /auth/verify-face` | API Key | External developer endpoint — verify a face |

**API Key Routes** (all require JWT)

| Route | Purpose |
|-------|---------|
| `POST /api-keys` | Create a new key (returns plaintext once only) |
| `GET /api-keys` | List active keys for the authenticated user |
| `PATCH /api-keys/:id` | Rename a key |
| `DELETE /api-keys/:id` | Revoke a key |

**Database Schema (`db/schema.ts`)**

- **`users`** — `id`, `email`, `password` (bcrypt), `created_at`
- **`biometrics`** — `id`, `user_id` (FK), `embedding` (pgvector, 512 dims), `created_at`
- **`api_keys`** — `id`, `user_id` (FK), `name`, `prefix`, `hashed_key`, `last_four`, `scopes`, `is_revoked`, `last_used_at`, `expires_at`, `created_at`

**API Key Security Model**

Keys follow the format `sk_live_<64 hex characters>`. When created:
- The plaintext key is returned to the user **once only** and never stored
- The key is hashed with SHA-256 and only the hash is stored
- `last_four` and `prefix` are stored for display

On validation, incoming keys are SHA-256 hashed and looked up by hash. If found and not revoked, `last_used_at` is updated asynchronously (fire-and-forget).

**JWT Token**

Tokens contain `{ sub: userId, email }` and expire in 24 hours. Signed with `JWT_SECRET`.

---

### 4.3 Portal (`portal/`)

The Next.js 16 developer portal: sign-up, key management, documentation, usage.

```
portal/src/
├── app/
│   ├── layout.tsx                      # Root layout (theme provider, session)
│   ├── (marketing)/                    # Public pages (landing, pricing, changelog, sign-in, sign-up)
│   ├── (dashboard)/dashboard/          # Protected pages
│   │   ├── page.tsx                    # Main dashboard
│   │   ├── api-keys/page.tsx           # API key management UI (fully wired)
│   │   ├── usage/page.tsx              # Usage chart + plan info (static data)
│   │   └── chat/page.tsx               # "Live Test" — demo widget
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts # NextAuth handler
│   │   ├── auth/register/route.ts      # Registration proxy → gateway
│   │   └── api-keys/                   # API key proxy routes → gateway
│   └── docs/                           # Developer docs pages
├── components/
│   ├── demo-widget.tsx                 # Webcam verification demo (currently broken — see §6)
│   ├── camera-permission-modal.tsx
│   ├── usage-chart.tsx                 # Recharts usage graph (static mock data)
│   └── ui/                             # shadcn/ui components
├── lib/
│   ├── auth.ts                         # NextAuth config (credentials + GitHub + Google)
│   ├── api.ts                          # Axios instance + apiWithToken helper
│   └── utils.ts
└── proxy.ts                            # Route protection (cookie check for /dashboard)
```

**Authentication Flow**

NextAuth with three providers:
1. **Credentials** — calls `POST /auth/email-login` on the gateway, stores the returned JWT as `session.user.accessToken`
2. **GitHub OAuth**
3. **Google OAuth**

Dashboard routes are protected by `proxy.ts` (Next.js 16's replacement for middleware): no session cookie → redirect to `/sign-in`.

Portal API routes (`app/api/`) act as a **server-side** proxy: they attach the session's `accessToken` as a `Bearer` token and forward to the gateway. The browser never calls the gateway directly, which is why the gateway's CORS can be locked to the portal's origin.

---

### 4.4 Examples (`examples/`)

- **`nestjs-backend-integration.ts`** — how a NestJS backend would call our verify-face endpoint with an API key
- **`react-frontend-integration.tsx`** — how a React app would integrate face capture and verification

Illustrative only; not connected to the running application.

---

## 5. Infrastructure

**`docker-compose.yml`** — the secure baseline (used by `npm run stack`):

| Service | Container | Image | Reachable from |
|---------|-----------|-------|----------------|
| `ml` | `face-api` | Built from `./Dockerfile` | Gateway only (internal network) |
| `db` | `face-db` | `pgvector/pgvector:pg16` | Gateway only (internal network) |
| `backend` | `face-gateway` | Built from `./api-gateway` | Port 3000 |

- Every secret comes from the root `.env` via `${VAR:?...}` — Compose refuses to start if one is missing.
- The ML health check allows 40 s start time for the model download on first run.

**`docker-compose.dev.yml`** — dev overlay (used by `npm run dev:infra`): publishes `ml` and `db` on `127.0.0.1` only and switches off the gateway container (you run it yourself). **Never use it on a server.**

Environment variables are listed in [A2](#a2-first-time-setup-secrets).

---

# Part C — Status, gaps & security

## 6. What We Have vs. What the System Requires

### ✅ Implemented

| Requirement | Status |
|-------------|--------|
| Face detection (MediaPipe) | Done |
| 512-dim ArcFace embedding generation | Done |
| L2 normalization of embeddings | Done |
| Cosine similarity for 1:1 verification | Done (but duplicated in TypeScript — see gap 11) |
| Confidence score (0.0–1.0) returned | Done |
| `/health` endpoint on both services | Done |
| API key generation, revocation, listing | Done |
| API key hashed before storage (never stored plaintext) | Done |
| Bearer token + x-api-key header authentication | Done |
| JWT-based session for portal users | Done |
| Developer portal: sign-up, sign-in | Done |
| Developer portal: API key management UI | Done |
| Developer portal: documentation section | Done (basic) |
| Email/password auth as fallback path | Done |
| GitHub + Google OAuth in portal | Done |
| pgvector for embedding storage | Done |
| Dashboard route protection | Done |
| Secrets out of source (`.env` + `.env.example`) | Done (M0) |
| ML service + DB not publicly reachable | Done (M0) |
| Gateway authenticates to ML service | Done (M0) |
| Gateway CORS locked to the portal | Done (M0) |

---

### ⚠️ Gaps & Loopholes

#### Critical gaps

**1. No Redis / Rate Limiting**
No rate limiting on any endpoint — a caller can make unlimited requests per second (password guessing, flooding the ML service, running up cost). Planned: Redis token bucket returning `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`. Most critical gap before any public launch.

**2. No Stripe / Billing** — *deferred (future work)*
The usage page shows a static credit balance. Build usage *metering* now (gap 3) so billing can read it later.

**3. No API Call Logging / Metering**
No table records API calls; the usage chart is mock data.

**4. No Consent Record**
Biometric data needs recorded consent. No embedding may be stored without a logged, timestamped consent record. Entirely absent today.

**5. API Keys Hashed with SHA-256, Not bcrypt/Argon2**
SHA-256 is a fast hash; the spec asks for Argon2/bcrypt.

**6. No Image Validation (file type + size)**
Any file of any size is forwarded to the ML service.

**7. No Face Bounding Box Endpoint**
MediaPipe detects boxes in `engine.py`, but no endpoint exposes them.

**8. No JavaScript SDK**
`examples/react-frontend-integration.tsx` is a pattern, not an SDK.

**9. Live Test demo is broken**
`demo-widget.tsx` posts to `/api/proxy/verify`, which doesn't exist in the portal. Fix is an M0 task.

#### Security loopholes

**10. No Replay Attack Protection** — no timestamps/nonces on critical operations.

**11. Two matching paths**
The gateway computes cosine similarity in TypeScript instead of calling the ML service's `/verify_user`. Two implementations and two thresholds can diverge. First M1 task.

**12. Placeholder Password for Face-Auth Users**
Face-registered users get a bcrypt hash of `'placeholder-password'` because `password` is non-nullable. Needs a nullable password or an `auth_method` column.

**13. No Email Verification** — sign-up grants API keys immediately.

**14. No per-key Allowed Origins**
Global CORS is now locked to the portal (M0), but there are no "publishable keys" with per-key origin restrictions.

**15. No Right to be Forgotten** — no endpoint deletes a user's data, embeddings or logs.

**16. Usage Data in the Portal Is Hardcoded** — plan, balance and rate limit are static strings.

**17. No TLS Enforcement** — fine locally, must be addressed before deployment.

**18. No `helmet` on the gateway** — standard security headers aren't set. M0 task.

---

## 7. What Needs to Be Built Next

Follow `IMANI_BUILD_PLAN.md` milestone by milestone. At the time of writing:

**Finish M0**
1. Add `helmet` to the gateway.
2. Fix the Live Test demo route (gap 9).
3. Commit on a feature branch, push, protect `main`.

**M1 (foundation)**
1. One matching path: call `/verify_user`, delete the TypeScript cosine comparison (gap 11) — with tests at, just above and just below τ.
2. Tests for `ApiKeyAuthGuard` (valid / revoked / malformed).
3. Consent at enrollment (gap 4) · data deletion (gap 15) · rate limiting (gap 1) · real usage tracking (gaps 3, 16) · image validation (gap 6) · email verification (gap 13).

---

## 8. Security Issues & Fix Plan

From the AttackSurface review (last assessed 2026-07-08; 2 HIGH open at the time).

| # | Issue | Severity | Status | Fix |
|---|-------|----------|--------|-----|
| 1 | Gateway had no rate limiting and no `helmet`; CORS open to every site | HIGH | **Partly fixed** — CORS locked to `PORTAL_ORIGIN` (M0). Rate limiting and `helmet` still open. | `helmet` in M0; Redis token-bucket rate limiting in M1. |
| 2 | ML service didn't check who was calling, and its port (and the DB's) was published to the network | HIGH | **Fixed (M0)** — no public ports for `ml`/`db`; ML service requires `X-ML-Service-Key` and won't start without it. Verified: direct calls without the key get 401; the gateway's calls are accepted. | — |
| 3 | Hardcoded secrets in `docker-compose.yml` (JWT secret, DB `user`/`password`) | Medium | **Fixed (M0)** — all secrets from `.env`. The old values are in git history (commit `0b4cd76`): **never reuse them**. | Rotated by choosing new values. |
| 4 | Gateway Docker image included `api-gateway/.env` | Medium | **Fixed (M0)** — `api-gateway/.dockerignore`. | — |

Re-run the AttackSurface assessment after M0 is committed so the registry reflects this.
