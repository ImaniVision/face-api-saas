export default function AuthenticationDocsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-h1 font-semibold tracking-tight text-ink">
          Authentication
        </h1>
        <p className="mt-3 text-body leading-relaxed text-ink/60">
          Two credentials, two jobs. User tokens sign people in. API keys let
          servers call verification.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-h2 font-semibold text-ink">User tokens</h2>
        <p className="text-sm leading-relaxed text-ink/65">
          Returned by <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">/auth/email-register</code>,{" "}
          <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">/auth/email-login</code>,{" "}
          <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">/auth/register</code>, and{" "}
          <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">/auth/login</code> as{" "}
          <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">access_token</code>.
          Tokens are JWTs valid for <strong>24 hours</strong>. Send them as:
        </p>
        <pre className="overflow-x-auto rounded-xl bg-navy p-4 font-mono text-[13px] text-white">
          Authorization: Bearer &lt;jwt&gt;
        </pre>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-h2 font-semibold text-ink">API keys</h2>
        <p className="text-sm leading-relaxed text-ink/65">
          Used by the verification endpoints. Provide the key either way:
        </p>
        <pre className="overflow-x-auto rounded-xl bg-navy p-4 font-mono text-[13px] leading-relaxed text-white">
{`x-api-key: sk_live_...
# or
Authorization: Bearer sk_live_...`}
        </pre>
        <p className="text-sm leading-relaxed text-ink/65">
          Create and revoke keys in the{" "}
          <a href="/dashboard/api-keys" className="font-medium text-signal underline">
            dashboard
          </a>
          . A key is shown once at creation — lose it and you generate a new
          one. Revoked keys return <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs">401 Invalid or revoked API key</code>.
        </p>
      </section>
    </div>
  );
}
