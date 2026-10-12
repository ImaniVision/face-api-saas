export default function VerificationDocsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-h1 font-semibold tracking-tight text-ink">
          Verify
        </h1>
        <p className="mt-3 text-body leading-relaxed text-ink/60">
          Compare a fresh capture against an enrolled template. A match returns
          a token; anything else returns an error.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="border-b border-border bg-mist/60 px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-signal px-2 py-1 font-mono text-xs font-semibold text-white">
              POST
            </span>
            <code className="font-mono text-sm font-semibold text-ink">/auth/verify-face</code>
          </div>
          <p className="mt-2 text-sm text-ink/60">
            The developer call. Authenticates with an API key, takes an email
            plus image, returns a token only on match.
          </p>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-ink">Headers and fields</h3>
            <ul className="mt-3 space-y-3 text-sm">
              <li>
                <code className="font-mono font-semibold text-ink">x-api-key</code>{" "}
                <span className="text-ink/50">header, required</span>
                <p className="mt-1 text-xs text-ink/55">
                  Or <code className="font-mono">Authorization: Bearer sk_live_...</code>
                </p>
              </li>
              <li>
                <code className="font-mono font-semibold text-ink">email</code>{" "}
                <span className="text-ink/50">field, required</span>
              </li>
              <li>
                <code className="font-mono font-semibold text-ink">image</code>{" "}
                <span className="text-ink/50">file, required</span>
              </li>
            </ul>
          </div>
          <pre className="h-fit overflow-x-auto rounded-xl bg-navy p-4 font-mono text-[13px] leading-relaxed text-white">
{`curl -X POST http://localhost:3000/auth/verify-face \\
  -H "x-api-key: sk_live_..." \\
  -F "email=user@company.com" \\
  -F "image=@selfie.jpg"

→ 201 Created, on match
{ "access_token": "<jwt>" }

→ 401, on mismatch
{ "message": "Biometric verification failed" }`}
          </pre>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="border-b border-border bg-mist/60 px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-signal px-2 py-1 font-mono text-xs font-semibold text-white">
              POST
            </span>
            <code className="font-mono text-sm font-semibold text-ink">/auth/login</code>
          </div>
          <p className="mt-2 text-sm text-ink/60">
            Same face comparison without an API key, for first-party apps.
          </p>
        </div>
        <div className="p-6">
          <pre className="overflow-x-auto rounded-xl bg-navy p-4 font-mono text-[13px] leading-relaxed text-white">
{`curl -X POST http://localhost:3000/auth/login \\
  -F "email=user@company.com" \\
  -F "image=@selfie.jpg"`}
          </pre>
        </div>
      </div>
    </div>
  );
}
