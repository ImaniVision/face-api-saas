import { CheckCircle2, ChevronRight, ShieldCheck } from "lucide-react";

/* Animated product mocks — each loops a user operating the product,
   Stripe-style. Pure CSS, motion-safe throughout. Reduced motion shows
   the resting (first-frame) state. */

export function TransactionMock() {
  return (
    <div>
      <p className="text-[14px] font-medium text-ink">New payee · 250,000 naira</p>
      <div className="relative mt-2 h-9">
        <p className="absolute inset-x-0 top-0 inline-flex w-fit items-center gap-1.5 rounded-md bg-amber/15 px-2.5 py-1.5 text-[13px] font-semibold text-ink motion-safe:animate-[tx-a_8s_ease-in-out_infinite]">
          <ShieldCheck className="h-3.5 w-3.5 text-amber" /> Face check required
        </p>
        <p className="absolute inset-x-0 top-0 inline-flex w-fit items-center gap-1.5 rounded-md bg-verified/10 px-2.5 py-1.5 text-[13px] font-semibold text-verified motion-safe:animate-[tx-b_8s_ease-in-out_infinite]">
          <CheckCircle2 className="h-3.5 w-3.5" /> Approved — face matched
        </p>
      </div>
    </div>
  );
}

export function LivenessMock() {
  return (
    <div>
      <div className="relative rounded-lg border border-ink/10 px-3 pb-2 pt-3">
        <span aria-hidden className="absolute -left-px -top-px h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-signal" />
        <span aria-hidden className="absolute -right-px -top-px h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-signal" />
        <span aria-hidden className="absolute -bottom-px -left-px h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-signal" />
        <span aria-hidden className="absolute -bottom-px -right-px h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-signal" />
        <svg viewBox="0 0 220 48" className="h-12 w-full" aria-hidden="true">
          <polyline
            points="0,24 30,24 40,24 46,8 52,40 58,24 90,24 96,16 102,32 108,24 220,24"
            fill="none"
            stroke="#1FAA76"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={640}
            strokeDashoffset={640}
            className="motion-safe:animate-[wave-draw_8s_linear_infinite]"
          />
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-between text-[13px]">
        <span className="inline-flex items-center gap-1.5 font-medium text-verified">
          <span className="h-1.5 w-1.5 rounded-full bg-verified motion-safe:animate-pulse" />
          Live person detected
        </span>
        <span className="text-ink/50">Synthetic artefacts: none</span>
      </div>
    </div>
  );
}

export function TemplateMock() {
  return (
    <div className="relative h-[124px]">
      {/* Stored state */}
      <div className="absolute inset-0 motion-safe:animate-[drill-a_10s_ease-in-out_infinite]">
        <div className="flex items-center gap-2 font-mono text-[12px]">
          <span className="rounded-md bg-white px-2 py-1.5 text-ink/70">face</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-ink/40" />
          <span className="rounded-md bg-navy px-2 py-1.5 text-white">protected template</span>
        </div>
        <p className="mt-2 font-mono text-[12px] text-ink/50">tpl_9f2c…a81e · stored</p>
      </div>
      {/* Breach drill state */}
      <div className="absolute inset-0 motion-safe:animate-[drill-b_10s_ease-in-out_infinite]">
        <p className="font-mono text-[12px] font-semibold text-destructive">
          leaked database (drill)
        </p>
        <div className="mt-1.5 space-y-1 font-mono text-[12px] text-ink/55">
          <p>tpl_9f2c…a81e</p>
          <p>tpl_41bd…77f0</p>
          <p>tpl_c708…3e55</p>
        </div>
        <p className="mt-1.5 text-[13px] font-semibold text-verified">
          faces recovered: 0
        </p>
      </div>
    </div>
  );
}

const ONBOARD_STEPS = [
  { n: "1", label: "details", delay: "0s" },
  { n: "2", label: "face check", delay: "1.4s" },
  { n: "3", label: "done", delay: "2.8s" },
];

export function OnboardingMock() {
  return (
    <div>
      <div className="flex items-start">
        {ONBOARD_STEPS.map((s, i) => (
          <div key={s.n} className={i === 0 ? "shrink-0" : "flex flex-1 items-start"}>
            {i > 0 && <div className="mx-1 mt-4 h-px min-w-4 flex-1 bg-ink/10" />}
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold motion-safe:animate-[step-on_8s_ease-in-out_infinite] motion-safe:[animation-delay:var(--d)]"
                style={{ ["--d" as string]: s.delay }}
              >
                {s.n}
              </span>
              <span className="font-mono text-[13px] text-ink/55">{s.label}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2.5 font-mono text-[12px] text-ink/40">miss → retry, never lockout</p>
    </div>
  );
}

const PRICE_ROWS = ["login verification", "transaction step-up", "liveness check"];

export function PriceMock() {
  return (
    <div className="space-y-1.5">
      {PRICE_ROWS.map((r) => (
        <div
          key={r}
          className="flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-[13px]"
        >
          <span className="font-medium text-ink">{r}</span>
          <span className="rounded bg-mist px-2 py-0.5 font-mono text-[12px] font-medium text-ink/60">
            per check
          </span>
        </div>
      ))}
    </div>
  );
}

export function CodeMock() {
  return (
    <div>
      <pre className="overflow-x-auto rounded-lg bg-navy p-3 font-mono text-[12px] leading-relaxed text-white">
{`curl -X POST .../auth/verify-face \\
  -H "x-api-key: sk_live_..." \\
  -F "email=user@company.com" \\
  -F "image=@selfie.jpg"`}
      </pre>
      <p className="mt-2 font-mono text-[12px] text-ink/40">every example runs</p>
    </div>
  );
}
