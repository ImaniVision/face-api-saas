export default function FacesDocsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-h1 font-semibold tracking-tight text-ink">
          Enroll
        </h1>
        <p className="mt-3 text-body leading-relaxed text-ink/60">
          Register a face once. Everything after that is a comparison against
          the stored template.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="border-b border-border bg-mist/60 px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-signal px-2 py-1 font-mono text-xs font-semibold text-white">
              POST
            </span>
            <code className="font-mono text-sm font-semibold text-ink">/auth/register</code>
          </div>
          <p className="mt-2 text-sm text-ink/60">
            Enroll an email with a face image. The image is vectorized once;
            only the protected template is stored.
          </p>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-ink">Multipart fields</h3>
            <ul className="mt-3 space-y-3 text-sm">
              <li>
                <code className="font-mono font-semibold text-ink">email</code>{" "}
                <span className="text-ink/50">string, required</span>
                <p className="mt-1 text-xs text-ink/55">Must not already be enrolled.</p>
              </li>
              <li>
                <code className="font-mono font-semibold text-ink">image</code>{" "}
                <span className="text-ink/50">file, required</span>
                <p className="mt-1 text-xs text-ink/55">A clear, front-facing photo.</p>
              </li>
            </ul>
          </div>
          <pre className="h-fit overflow-x-auto rounded-xl bg-navy p-4 font-mono text-[13px] leading-relaxed text-white">
{`curl -X POST http://localhost:3000/auth/register \\
  -F "email=user@company.com" \\
  -F "image=@photo.jpg"

→ 201 Created
{ "access_token": "<jwt, valid 24h>" }`}
          </pre>
        </div>
      </div>
    </div>
  );
}
