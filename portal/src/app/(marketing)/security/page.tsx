import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const attacks = [
  {
    name: "Template inversion",
    body: "Rebuilding a face from a stolen template. Mitigated with IronMask (SHA-256 hash + random 512×512 8-bit rotation); brute-force recovery is estimated at ~2^91 guesses.",
    status: "implemented (IronMask)",
  },
  {
    name: "Presentation attacks",
    body: "Printed photos or screens held up to the camera. Not blocked yet — a good printed photo could pass. Liveness detection is planned future work.",
    status: "planned (not built yet)",
  },
  {
    name: "Deepfakes",
    body: "AI-swapped faces and synthetic video. Not detected yet — planned future work after core verification.",
    status: "planned (not built yet)",
  },
];

export default function SecurityPage() {
  return (
    <div className="bg-white">
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:py-24">
          <p className="max-w-3xl font-display text-display font-semibold leading-[1.05] tracking-tight">
            We can&apos;t leak what we never store.{" "}
            <span className="text-white/55">
              Face data is scrambled with a one-way transform before it is
              saved, so a stolen database contains nothing an attacker can turn
              back into a face.
            </span>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] space-y-14 px-4 py-16 sm:px-6">
        {/* Cancelable biometrics, plain language */}
        <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-h2 font-semibold text-ink">
              A template you can cancel.
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/65">
              <p>
                When you enroll, your face is run through a one-way transform.
                What we keep is a protected template: a string of numbers that
                matches your face but cannot be turned back into it.
              </p>
              <p>
                If a template is ever exposed, we revoke it and issue a new one
                from a fresh capture — the way you would rotate a password,
                except the attacker never held anything usable.
              </p>
            </div>
          </div>

          {/* Diagram: reversible path crossed out */}
          <div className="rounded-xl bg-mist p-6" role="img" aria-label="Diagram: a raw face becomes a protected template stored in the database. The path back from template to face is crossed out.">
            <div className="flex items-center justify-between gap-2 font-mono text-xs">
              <span className="rounded-md bg-white px-3 py-2 text-ink/70">raw face</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-ink/40" />
              <span className="rounded-md bg-navy px-3 py-2 text-white">protected template</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-ink/40" />
              <span className="rounded-md bg-white px-3 py-2 text-ink/70">database</span>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-white px-4 py-3">
              <XCircle className="h-4 w-4 shrink-0 text-destructive" />
              <p className="font-mono text-xs text-ink/60 line-through">
                template → face (not possible)
              </p>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-white px-4 py-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-verified" />
              <p className="font-mono text-xs text-ink/60">
                template → revoke and reissue (one action)
              </p>
            </div>
          </div>
        </section>

        {/* Threat coverage — honest about what is built vs planned */}
        <section>
          <h2 className="font-display text-h2 font-semibold text-ink">
            What is protected today — and what is not yet.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/60">
            Template protection is implemented now. Presentation-attack and
            deepfake defences are not built yet, so use the API alongside your
            own controls where spoofing is a risk.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {attacks.map((a) => (
              <div key={a.name} className="rounded-xl border border-border p-6">
                <h3 className="font-display text-h3 font-semibold text-ink">{a.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{a.body}</p>
                <p className="mt-4 inline-block rounded-md bg-amber/15 px-2.5 py-1 font-mono text-[11px] font-medium text-ink">
                  {a.status}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Data handling */}
        <section className="rounded-xl bg-mist p-6 sm:p-10">
          <h2 className="font-display text-h2 font-semibold text-ink">What we keep, what we drop.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-white p-6">
              <h3 className="text-sm font-semibold text-ink">Stored</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                The protected template and the minimum metadata needed to match
                it to your account. Nothing else.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6">
              <h3 className="text-sm font-semibold text-ink">Discarded</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                Raw images and video frames are discarded once the template is
                made. They are never written to disk.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-ink/60">
            Retention schedules follow your data-retention policy. Details are in
            the compliance memo.
          </p>
        </section>

        <section className="text-center">
          <Link href="/compliance">
            <Button size="lg" className="h-12 bg-signal px-8 text-white hover:bg-signal/90">
              Read the compliance mapping <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
