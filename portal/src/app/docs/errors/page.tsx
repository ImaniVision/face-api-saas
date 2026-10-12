const errors = [
  { code: "400", message: "User already exists", when: "Registering an email that is already enrolled." },
  { code: "400", message: "Image file is required", when: "Calling an image endpoint without the image part." },
  { code: "400", message: "Failed to process image with ML service", when: "The image could not be vectorized. Retry with a clear, front-facing photo." },
  { code: "401", message: "Invalid credentials", when: "Wrong email or password at sign-in." },
  { code: "401", message: "No biometric data found", when: "The user exists but never enrolled a face." },
  { code: "401", message: "Biometric verification failed", when: "The face did not match. No token is issued." },
  { code: "401", message: "Missing API key", when: "No x-api-key header or Bearer key was sent." },
  { code: "401", message: "Invalid or revoked API key", when: "The key is wrong or was revoked in the dashboard." },
];

export default function ErrorsDocsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-h1 font-semibold tracking-tight text-ink">
          Errors
        </h1>
        <p className="mt-3 text-body leading-relaxed text-ink/60">
          Every error below is one the API returns today.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-border bg-mist/60 text-left">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-ink/50">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-ink/50">Message</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-ink/50">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {errors.map((e, i) => (
              <tr key={i}>
                <td className="px-6 py-4 font-mono text-sm font-semibold text-ink">{e.code}</td>
                <td className="px-6 py-4 font-mono text-[13px] text-ink/80">{e.message}</td>
                <td className="px-6 py-4 text-sm text-ink/65">{e.when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-h2 font-semibold text-ink">Rate limits</h2>
        <p className="text-sm leading-relaxed text-ink/65">
          No rate limits are enforced yet. Limits will be announced here before
          they take effect — nothing will start failing silently.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-h2 font-semibold text-ink">Versioning</h2>
        <p className="text-sm leading-relaxed text-ink/65">
          The API is currently unversioned. When versioned endpoints ship,
          breaking changes will only ever land in new major versions.
        </p>
      </section>
    </div>
  );
}
