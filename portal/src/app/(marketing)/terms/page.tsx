import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-h1 font-semibold tracking-tight text-ink">
          Terms of Service
        </h1>
        <p className="mt-3 rounded-xl border border-amber/40 bg-amber/10 p-4 text-sm leading-relaxed text-ink">
          Short version while the full terms are in review with counsel. The
          rules below apply from today.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink/70">
          <section>
            <h2 className="font-display text-h3 font-semibold text-ink">The service</h2>
            <p className="mt-3">
              Imani Vision provides face verification through an API: login
              verification, transaction step-up, and liveness checks. We work
              to keep it available and accurate, and we publish limits and
              changes in the docs and changelog before they affect you.
            </p>
          </section>

          <section>
            <h2 className="font-display text-h3 font-semibold text-ink">Your responsibilities</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Collect faces only with the person&apos;s consent, as your local law requires.</li>
              <li>Keep API keys secret. Do not expose them in client-side code.</li>
              <li>Do not use the service to identify strangers without consent or to break the law.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-h3 font-semibold text-ink">Billing</h2>
            <p className="mt-3">
              Usage is priced per check, as described on the{" "}
              <Link href="/pricing" className="font-medium text-signal underline">
                pricing page
              </Link>
              . Nothing is billed before you agree a plan with us.
            </p>
          </section>
        </div>

        <div className="mt-10">
          <Link href="/contact">
            <Button className="bg-signal text-white hover:bg-signal/90">
              Questions? Talk to us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
