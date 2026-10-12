export default function DocsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-h1 font-semibold tracking-tight text-ink">
          Start verifying in minutes.
        </h1>
        <p className="mt-3 text-body leading-relaxed text-ink/60">
          Every request below runs against the API today. Copy, paste, replace
          the placeholders, and go.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-h2 font-semibold text-ink">Base URL</h2>
        <pre className="overflow-x-auto rounded-xl bg-navy p-4 font-mono text-[13px] text-white">
          http://localhost:3000
        </pre>
        <p className="text-sm leading-relaxed text-ink/60">
          That is the local gateway. Your production base URL is confirmed
          during onboarding — the client reads it from{" "}
          <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_API_URL</code>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-h2 font-semibold text-ink">1. Create an account</h2>
        <pre className="overflow-x-auto rounded-xl bg-navy p-4 font-mono text-[13px] leading-relaxed text-white">
{`curl -X POST http://localhost:3000/auth/email-register \\
  -H "Content-Type: application/json" \\
  -d '{"email": "you@company.com", "password": "choose-a-strong-password"}'

→ 201 Created
{ "access_token": "<jwt, valid 24h>" }`}
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-h2 font-semibold text-ink">2. Sign in</h2>
        <pre className="overflow-x-auto rounded-xl bg-navy p-4 font-mono text-[13px] leading-relaxed text-white">
{`curl -X POST http://localhost:3000/auth/email-login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "you@company.com", "password": "choose-a-strong-password"}'

→ 201 Created
{ "access_token": "<jwt>", "user": { "id": "<uuid>", "email": "you@company.com" } }`}
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-h2 font-semibold text-ink">3. Enroll a face</h2>
        <pre className="overflow-x-auto rounded-xl bg-navy p-4 font-mono text-[13px] leading-relaxed text-white">
{`curl -X POST http://localhost:3000/auth/register \\
  -F "email=user@company.com" \\
  -F "image=@photo.jpg"

→ 201 Created
{ "access_token": "<jwt>" }`}
        </pre>
        <p className="text-sm leading-relaxed text-ink/60">
          The image is vectorized once. Only the protected template is stored.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-h2 font-semibold text-ink">4. Verify a face with an API key</h2>
        <pre className="overflow-x-auto rounded-xl bg-navy p-4 font-mono text-[13px] leading-relaxed text-white">
{`curl -X POST http://localhost:3000/auth/verify-face \\
  -H "x-api-key: sk_live_..." \\
  -F "email=user@company.com" \\
  -F "image=@selfie.jpg"

→ 201 Created
{ "access_token": "<jwt>" }`}
        </pre>
        <p className="text-sm leading-relaxed text-ink/60">
          Create keys in the{" "}
          <a href="/dashboard/api-keys" className="font-medium text-signal underline">
            dashboard
          </a>
          . A failed match returns <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">401 Biometric verification failed</code> — never a token.
        </p>
      </section>

      <section className="rounded-xl bg-mist p-6">
        <h2 className="font-display text-h3 font-semibold text-ink">Planned product endpoints</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/65">
          Versioned calls for login verification, transaction step-up, and
          liveness checks are in development. The shapes shown on the{" "}
          <a href="/platform" className="font-medium text-signal underline">platform page</a>{" "}
          are illustrative until the API is final.
        </p>
      </section>
    </div>
  );
}
