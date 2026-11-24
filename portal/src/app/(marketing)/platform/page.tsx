import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function EndpointBlock({
  method,
  path,
  when,
  example,
}: {
  method: string;
  path: string;
  when: string;
  example: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="border-b border-border bg-mist/60 px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-md bg-signal px-2 py-1 font-mono text-xs font-semibold text-white">
            {method}
          </span>
          <code className="font-mono text-sm font-semibold text-ink">{path}</code>
        </div>
        <p className="mt-2 text-sm text-ink/60">{when}</p>
      </div>
      <pre className="overflow-x-auto bg-navy p-6 font-mono text-[13px] leading-relaxed text-white">
        {example}
      </pre>
    </div>
  );
}

export default function PlatformPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:py-24">
          <p className="max-w-3xl font-display text-display font-semibold leading-[1.05] tracking-tight">
            Four calls. One API.{" "}
            <span className="text-white/55">
              Enroll from five photos, verify 1:1, gate risky payments, and
              delete on request.
            </span>
          </p>
          <p className="mt-4 font-mono text-xs text-white/40">
            All endpoints below run on the local stack. Delete any subject with DELETE /v1/subjects/:externalId.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-16 sm:px-6">
        <EndpointBlock
          method="PUT"
          path="/v1/subjects/:externalId"
          when="Enroll a person from 5 different photos under your own ID. Requires consent=true and stores only a protected IronMask template."
          example={`curl -X PUT http://localhost:3000/v1/subjects/customer-42 \\
  -H "x-api-key: sk_live_..." \\
  -F "consent=true" \\
  -F "images=@1.jpg" -F "images=@2.jpg" -F "images=@3.jpg" \\
  -F "images=@4.jpg" -F "images=@5.jpg"

→ 200 OK
{
  "enrolled": true,
  "consentGrantedAt": "2026-10-05T12:00:00.000Z"
}`}
        />

        <EndpointBlock
          method="POST"
          path="/v1/subjects/:externalId/verify"
          when="1:1 check that a new photo shows the enrolled person. Returns only a boolean match — never searches across other users."
          example={`curl -X POST http://localhost:3000/v1/subjects/customer-42/verify \\
  -H "x-api-key: sk_live_..." \\
  -F "image=@new.jpg"

→ 200 OK
{
  "match": true
}`}
        />

        <EndpointBlock
          method="POST"
          path="/v1/subjects/:externalId/transactions"
          when="Evaluate a payment against fixed risk rules (amount, new payee, new device). Low-risk payments approve immediately; risky ones return face_required until resent with a selfie."
          example={`curl -X POST http://localhost:3000/v1/subjects/customer-42/transactions \\
  -H "x-api-key: sk_live_..." \\
  -F "amount=150000" \\
  -F "payee=acct-889" \\
  -F "device_id=phone-1"

→ 200 OK
{
  "status": "face_required",
  "reasons": ["amount_over_limit"]
}`}
        />

        {/* Architecture */}
        <section className="rounded-xl bg-mist p-6 sm:p-10">
          <h2 className="font-display text-h2 font-semibold text-ink">
            Built in parts that scale apart.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/60">
            Each service has one job: the gateway enforces auth and risk rules,
            and the private ML service owns embedding and matching.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { name: "Gateway", body: "Terminates requests, enforces auth, consent, rate limits, and payment risk rules." },
              { name: "ML service", body: "Private to the gateway. Runs face detection, embedding, and IronMask matching. Liveness is planned future work." },
              { name: "Postgres", body: "Holds protected IronMask templates (SHA-256 hash + 8-bit rotation), consent records, and usage. Nothing reversible." },
            ].map((s) => (
              <div key={s.name} className="rounded-xl bg-white p-6">
                <p className="font-mono text-caption text-signal">{s.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Live test CTA */}
        <section className="rounded-xl bg-navy p-6 text-center sm:p-10">
          <p className="mx-auto max-w-xl font-display text-h2 font-semibold text-white">
            Try it in the Live Test console.{" "}
            <span className="text-white/55">Run the local stack or read the quickstart.</span>
          </p>
          <Link href="/docs" className="mt-6 inline-block">
            <Button size="lg" className="h-12 bg-signal px-8 text-white hover:bg-signal/90">
              Open the quickstart <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
