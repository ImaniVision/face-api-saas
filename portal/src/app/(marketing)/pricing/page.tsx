import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// No figures until unit economics are measured (§5.4). Prices stay unset.
const rows = [
  {
    name: "Login verification",
    body: "One passwordless check that a returning user is who they claim to be.",
  },
  {
    name: "Transaction step-up",
    body: "One face check inside a risky action, decided by risk signals.",
  },
  {
    name: "Liveness check",
    body: "One proof-of-liveness run, alone or attached to a verification.",
  },
];

const faqs = [
  {
    q: "What counts as a check?",
    a: "One API call to one endpoint: one login verification, one transaction step-up, or one liveness check. Retries caused by our errors never count.",
  },
  {
    q: "Is sandbox usage free?",
    a: "Sandbox access and pricing are confirmed when you talk to us. Nothing is billed before you agree a plan.",
  },
  {
    q: "Are there volume tiers?",
    a: "Yes. Unit pricing falls as monthly volume rises. Talk to us about your expected volume and we will agree tiers up front.",
  },
];

export default function PricingPage() {
  return (
    <div className="bg-white">
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:py-24">
          <p className="max-w-3xl font-display text-display font-semibold leading-[1.05] tracking-tight">
            Pay per check, not per seat.{" "}
            <span className="text-white/55">
              One price for each kind of check. No seats, no tiers of teammates.
            </span>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-border bg-mist/60 text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-ink/50">
                  Check
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-ink/50">
                  What it is
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-ink/50">
                  Unit price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((r) => (
                <tr key={r.name}>
                  <td className="px-6 py-5 text-sm font-semibold text-ink">{r.name}</td>
                  <td className="px-6 py-5 text-sm text-ink/65">{r.body}</td>
                  <td className="px-6 py-5 text-right">
                    <span className="inline-block rounded-md bg-amber/15 px-2.5 py-1 font-mono text-[11px] font-medium text-ink">
                      to be set
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-ink/60">
          Unit economics are still being measured, so no figures are published
          yet. Talk to us about volume and we will agree pricing before you
          integrate.
        </p>

        <div className="mt-10 text-center">
          <Link href="/contact">
            <Button size="lg" className="h-12 bg-signal px-8 text-white hover:bg-signal/90">
              Talk to us about volume <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-center font-display text-h2 font-semibold text-ink">
            Pricing questions
          </h2>
          <Accordion type="single" collapsible className="mt-6 w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="py-4 text-left text-sm font-medium text-ink hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-relaxed text-ink/65">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
}
