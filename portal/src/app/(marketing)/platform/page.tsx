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
            Three calls. One API.{" "}
            <span className="text-white/55">
              Add verification where your users already are, with versioned
              endpoints and a sandbox to test against.
            </span>
          </p>
          <p className="mt-4 font-mono text-xs text-white/40">
            Endpoint shapes below are illustrative — final paths land with the API.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-16 sm:px-6">
        <EndpointBlock
          method="POST"
          path="/v1/verify/login"
          when="Call it when a user returns. Use login verification instead of a password, or alongside one for high-risk accounts."
          example={`{
  "user_id": "usr_123",
  "image": "<captured-frame>"
}

→ 200 OK
{
  "match": true,
  "confidence": 0.97,
  "template_id": "tpl_abc"
}`}
        />

        <EndpointBlock
          method="POST"
          path="/v1/verify/transaction"
          when="Call it to step up a risky action. Risk signals — new payee, large amount, changed device — decide when a face check is required."
          example={`{
  "user_id": "usr_123",
  "amount": 250000,
  "currency": "NGN",
  "risk_signals": {
    "new_payee": true,
    "device_changed": false
  }
}

→ 200 OK
{
  "decision": "approved",
  "step_up": "face_check_passed"
}`}
        />

        <EndpointBlock
          method="POST"
          path="/v1/check/liveness"
          when="Run a liveness check at login, before a transaction step-up, or on a schedule. It looks for a live pulse signal and for synthetic artefacts left by deepfakes and replays."
          example={`{
  "user_id": "usr_123",
  "frames": ["<frame-1>", "<frame-2>"]
}

→ 200 OK
{
  "live": true,
  "artefacts": "none"
}`}
        />

        {/* Architecture */}
        <section className="rounded-xl bg-mist p-6 sm:p-10">
          <h2 className="font-display text-h2 font-semibold text-ink">
            Built in parts that scale apart.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/60">
            Each service scales on its own, so a spike in checks never slows
            logins.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { name: "Gateway", body: "Terminates requests, enforces auth and rate limits, routes to services." },
              { name: "ML service", body: "Runs matching and liveness. Stateless, so it scales horizontally." },
              { name: "Vector store", body: "Holds protected templates only. Nothing here can be reversed into a face." },
            ].map((s) => (
              <div key={s.name} className="rounded-xl bg-white p-6">
                <p className="font-mono text-caption text-signal">{s.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sandbox CTA — no sandbox promised until confirmed */}
        <section className="rounded-xl bg-navy p-6 text-center sm:p-10">
          <p className="mx-auto max-w-xl font-display text-h2 font-semibold text-white">
            Test against a sandbox.{" "}
            <span className="text-white/55">Talk to us about access.</span>
          </p>
          <Link href="/contact" className="mt-6 inline-block">
            <Button size="lg" className="h-12 bg-signal px-8 text-white hover:bg-signal/90">
              Talk to us <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
