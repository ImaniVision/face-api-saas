import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Controls column stays pending until the signed compliance memo lands (§5.5).
const rows = [
  { law: "Ghana Data Protection Act, 2012 (Act 843)", governs: "Collection, use, and storage of personal data in Ghana." },
  { law: "Nigeria NDPA, 2023", governs: "Processing of personal data of data subjects in Nigeria." },
  { law: "EU GDPR", governs: "Processing of personal data of people in the EU." },
  { law: "EU AI Act", governs: "Risk classification and duties for biometric identification systems." },
  { law: "Illinois BIPA", governs: "Collection of biometric identifiers in Illinois, including consent and retention." },
];

export default function CompliancePage() {
  return (
    <div className="bg-white">
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:py-24">
          <p className="max-w-3xl font-display text-display font-semibold leading-[1.05] tracking-tight">
            Built for Ghana&apos;s Act 843 and beyond.{" "}
            <span className="text-white/55">
              One mapping your legal team can forward unchanged.
            </span>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-mist/60 text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-ink/50">Regulation</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-ink/50">What it governs</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-ink/50">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((r) => (
                <tr key={r.law}>
                  <td className="px-6 py-4 text-sm font-semibold text-ink">{r.law}</td>
                  <td className="px-6 py-4 text-sm text-ink/65">{r.governs}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block rounded-md bg-amber/15 px-2.5 py-1 font-mono text-[11px] font-medium text-ink">
                      pending signed memo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-ink/60">
          The controls column is filled from the signed compliance memo. It stays
          blank until the memo is signed off.
        </p>

        <section className="mt-10 rounded-xl bg-navy p-6 text-center sm:p-10">
          <p className="mx-auto max-w-xl font-display text-h2 font-semibold text-white">
            Get the full mapping.{" "}
            <span className="text-white/55">Request the compliance memo.</span>
          </p>
          <Link href="/contact" className="mt-6 inline-block">
            <Button size="lg" className="h-12 bg-signal px-8 text-white hover:bg-signal/90">
              Request the memo <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
