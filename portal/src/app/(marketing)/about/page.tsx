import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:py-24">
          <p className="max-w-3xl font-display text-display font-semibold leading-[1.05] tracking-tight">
            Built to make face verification safe to store.
          </p>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/60">
            Imani means trust. We build the layer that lets fintechs verify
            people continuously without holding a face they could lose.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] space-y-14 px-4 py-16 sm:px-6">
        <section className="max-w-3xl">
          <h2 className="font-display text-h2 font-semibold text-ink">Why Imani.</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/65">
            <p>
              Imani is Swahili for faith and trust. We named the company after
              the product: trust between a fintech and its users, earned at
              every login and every transaction.
            </p>
            <p>
              A database breach should not expose a usable face. That single
              idea decides everything we build — verify continuously, store
              nothing recoverable.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-h2 font-semibold text-ink">What we build.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { name: "Login verification", body: "Passwordless entry for returning users, matched against a protected template." },
              { name: "Transaction step-up", body: "One call that asks for a face when risk signals say the action needs it." },
              { name: "Liveness check", body: "Routine proof of a live person, with deepfake and replay detection built in." },
            ].map((p) => (
              <div key={p.name} className="rounded-xl border border-border p-6">
                <h3 className="font-display text-h3 font-semibold text-ink">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-mist p-6 sm:p-10">
          <h2 className="font-display text-h2 font-semibold text-ink">Roadmap.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-white p-6">
              <p className="font-mono text-caption text-signal">Now</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                Login verification, transaction step-up, and liveness checks on
                non-reversible templates.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6">
              <p className="font-mono text-caption text-ink/40">Later</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                Onboarding identity checks. Logins and transactions come first.
              </p>
            </div>
          </div>
        </section>

        <section className="text-center">
          <Link href="/contact">
            <Button size="lg" className="h-12 bg-signal px-8 text-white hover:bg-signal/90">
              Contact the team <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
