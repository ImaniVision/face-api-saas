import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Testimonials } from "@/components/marketing/testimonials";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "Billed annually",
    features: [
      "100 verifications/month",
      "Basic face matching API",
      "Community support",
      "Standard analytics",
      "Single API key",
    ],
    featured: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    description: "Billed annually",
    features: [
      "10,000 verifications/month",
      "Liveness detection included",
      "Priority email & chat support",
      "Advanced analytics dashboard",
      "Multiple API keys & webhooks",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "$149",
    period: "/mo",
    description: "Billed annually",
    features: [
      "Unlimited verifications",
      "Dedicated infrastructure",
      "24/7 SLA with account manager",
      "Predictive analytics & audit logs",
      "Custom SLA & on-prem deployment",
    ],
    featured: false,
  },
];

const comparisonFeatures = [
  {
    category: "Verification",
    features: [
      {
        name: "Face matching",
        free: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Document verification",
        free: false,
        pro: true,
        enterprise: true,
      },
      {
        name: "Liveness detection",
        free: false,
        pro: true,
        enterprise: true,
      },
      {
        name: "Deepfake detection",
        free: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "Limits",
    features: [
      {
        name: "Verifications/month",
        free: "100",
        pro: "10,000",
        enterprise: "Unlimited",
      },
      {
        name: "API keys",
        free: "1",
        pro: "5",
        enterprise: "Unlimited",
      },
      {
        name: "File uploads",
        free: "Up to 5 MB",
        pro: "Up to 25 MB",
        enterprise: "Unlimited",
      },
      {
        name: "Audit log retention",
        free: "7 Days",
        pro: "90 Days",
        enterprise: "Unlimited",
      },
    ],
  },
  {
    category: "Analytics",
    features: [
      {
        name: "Basic dashboard",
        free: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Advanced analytics",
        free: false,
        pro: true,
        enterprise: true,
      },
      {
        name: "Anomaly detection",
        free: false,
        pro: false,
        enterprise: true,
      },
      {
        name: "Custom reports",
        free: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "Support",
    features: [
      {
        name: "Community forum",
        free: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Email support",
        free: false,
        pro: true,
        enterprise: true,
      },
      {
        name: "Dedicated account manager",
        free: false,
        pro: false,
        enterprise: true,
      },
      {
        name: "Custom SLA",
        free: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm text-muted-foreground">{value}</span>;
  }
  return value ?
      <Check className="h-4 w-4 text-foreground" />
    : <Minus className="h-4 w-4 text-muted-foreground/40" />;
}

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
            Simple pricing for your team
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Check out our different pricing plans.
          </p>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="pb-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl border p-8 transition-all ${
                  plan.featured ?
                    "border-foreground/20 bg-card shadow-2xl"
                  : "border-border/40 bg-card/50"
                }`}
              >
                <h3 className="text-xl font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
                <div className="mt-6 mb-8">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-base text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-base text-muted-foreground"
                    >
                      <Check className="h-5 w-5 shrink-0 text-foreground/80 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className={`w-full h-12 text-base rounded-xl ${
                      plan.featured ?
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    Get started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logo cloud text */}
      <div className="border-y border-border/40 py-12 text-center">
        <p className="text-base text-muted-foreground">
          Join <span className="font-semibold text-foreground">500+</span>{" "}
          companies already growing
        </p>
      </div>

      {/* Comparison Table */}
      <section className="py-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-foreground text-center mb-16">
            Compare plans
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table header */}
              <thead>
                <tr className="border-b border-border/40">
                  <th className="py-6 px-6 text-left text-base font-normal text-muted-foreground w-[40%]"></th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="py-6 px-6 text-center">
                      <div className="text-lg font-semibold text-foreground">
                        {plan.name}
                      </div>
                      <div className="text-2xl font-bold text-foreground mt-2">
                        {plan.price}
                        <span className="text-sm text-muted-foreground font-normal">
                          {plan.period}
                        </span>
                      </div>
                      <Link href="/sign-up" className="mt-4 block">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 px-4 text-xs border-border/60"
                        >
                          Get started
                        </Button>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table body */}
              <tbody>
                {comparisonFeatures.map((category) => (
                  <>
                    <tr
                      key={category.category}
                      className="border-b border-border/40"
                    >
                      <td
                        colSpan={4}
                        className="py-6 px-6 text-lg font-semibold text-foreground bg-muted/20"
                      >
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature) => (
                      <tr
                        key={feature.name}
                        className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-4 px-6 text-base text-muted-foreground">
                          {feature.name}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center">
                            <FeatureValue value={feature.free} />
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center">
                            <FeatureValue value={feature.pro} />
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center">
                            <FeatureValue value={feature.enterprise} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <div className="border-t border-border/40">
        <Testimonials />
      </div>
    </div>
  );
}
