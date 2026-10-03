import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

const included = [
  "Enroll, verify and delete people over the REST API",
  "Protected templates: no stored record can be turned back into a face",
  "60 calls a minute per API key, bursts of up to 20",
  "As many API keys as you need, each revocable",
  "Usage dashboard: calls per day and per key, last 30 days",
  "Live Test in the dashboard to try it on your own face",
  "Consent recorded at enrollment, one call to delete a person",
];

const notYet = [
  "Liveness or spoof detection",
  "Paid plans and billing",
  "Client SDKs (use any HTTP client)",
  "Webhooks",
  "An uptime commitment or SLA",
];

export default function PricingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="pt-24 pb-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 text-center">
          <p className="text-base font-medium text-muted-foreground mb-4">
            Pricing
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-6">
            Free during the beta
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We count every call per API key, so paid plans can be added once
            billing exists. Until then there is one plan, and it costs nothing.
          </p>
        </div>
      </section>

      {/* Plan */}
      <section className="pb-24">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-foreground/20 bg-card p-8 shadow-2xl">
              <h3 className="text-xl font-semibold text-foreground">Beta</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Requires a verified email address.
              </p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-bold text-foreground">$0</span>
              </div>
              <ul className="space-y-4 mb-8">
                {included.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-base text-muted-foreground"
                  >
                    <Check className="h-5 w-5 shrink-0 text-foreground/80 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="w-full h-12 text-base rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Get an API key
                </Button>
              </Link>
            </div>

            <div className="rounded-3xl border border-border/40 bg-card/50 p-8">
              <h3 className="text-xl font-semibold text-foreground">
                Not available yet
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                On the roadmap. Don&apos;t build on any of these today.
              </p>
              <ul className="space-y-4 mt-8">
                {notYet.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-base text-muted-foreground"
                  >
                    <Minus className="h-5 w-5 shrink-0 text-muted-foreground/60 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
