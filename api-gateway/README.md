# Imani Vision — API Gateway

NestJS gateway: email/face/OAuth auth, API-key management, the public `verify-face` endpoint, and the only service that talks to the ML service. Runs on **http://localhost:3000**.

```bash
npm install
npx drizzle-kit push   # create/update database tables (needs `npm run dev:infra` running)
npm run start:dev      # http://localhost:3000
npm test
```

Needs `api-gateway/.env`. Setup, environment variables and troubleshooting: **[../documentation.md](../documentation.md#part-a--getting-started)**. How the gateway works: [§4.2](../documentation.md#42-api-gateway-api-gateway).
