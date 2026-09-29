# Imani Vision

A developer-facing **face-verification API** — "Stripe, but for checking faces." A developer signs up, gets an API key, and calls an endpoint that answers *"is this the same person?"*

Final-year university project: NestJS API gateway · Python ML service (face detection + embeddings) · PostgreSQL + pgvector · Next.js developer portal.

## Where to look

| I want to… | Read |
|------------|------|
| Set up and run the project | [documentation.md → Part A](documentation.md#part-a--getting-started) |
| Understand how it works | [documentation.md → Part B](documentation.md#part-b--how-the-system-works) |
| See what's missing / security status | [documentation.md → Part C](documentation.md#part-c--status-gaps--security) |
| Know what to build next | [IMANI_BUILD_PLAN.md](IMANI_BUILD_PLAN.md) |

## Quick start (already set up?)

```bash
npm run stack          # ML service + database + gateway in Docker
cd portal && npm run dev
```

First time? Follow [documentation.md → Part A](documentation.md#part-a--getting-started) — you need a `.env` file first.
