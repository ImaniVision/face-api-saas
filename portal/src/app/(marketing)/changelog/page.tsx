import { Badge } from "@/components/ui/badge";

const changelogEntries = [
  {
    date: "February 10, 2026",
    title: "Passive Liveness Detection v2",
    description:
      "Major upgrade to our passive liveness detection engine. New texture analysis algorithms reduce false acceptance rates by 40% while maintaining sub-200ms response times. Now detects screen replays, printed photos, and 3D masks with 99.2% accuracy.",
    tag: "Feature",
  },
  {
    date: "February 3, 2026",
    title: "Real-Time Analytics Dashboard",
    description:
      "Introducing a completely redesigned analytics dashboard with real-time data streaming. Monitor verification volume, success rates, latency percentiles, and geographic distribution. Includes customizable date ranges, CSV export, and anomaly alerts.",
    tag: "Feature",
  },
  {
    date: "January 27, 2026",
    title: "SDK v3.0 — Python & Node.js",
    description:
      "Shipped major version bumps for our Python and Node.js SDKs. Includes async/await support, automatic retry with exponential backoff, streaming responses for batch verifications, and comprehensive TypeScript type definitions.",
    tag: "SDK",
  },
  {
    date: "January 20, 2026",
    title: "Webhook Events & Delivery Dashboard",
    description:
      "Subscribe to verification lifecycle events in real-time. Configure webhook endpoints for verification.completed, verification.failed, liveness.challenge_passed, and more. Includes a delivery dashboard with retry controls and payload inspection.",
    tag: "Feature",
  },
  {
    date: "January 13, 2026",
    title: "ISO 27001 Certification",
    description:
      "FaceAuth has achieved ISO 27001 certification for our information security management system. This complements our existing SOC 2 Type II compliance and demonstrates our commitment to enterprise-grade security practices.",
    tag: "Security",
  },
  {
    date: "January 6, 2026",
    title: "Improved API Response Times",
    description:
      "Optimized our face vector computation pipeline to reduce average verification latency from 280ms to 180ms. Deployed new inference infrastructure across 3 additional regions (ap-southeast, eu-central, sa-east) for lower latency globally.",
    tag: "Performance",
  },
];

function getTagStyles(tag: string) {
  switch (tag) {
    case "Feature":
      return "border-foreground/20 text-foreground";
    case "SDK":
      return "border-blue-500/30 text-blue-400 bg-blue-500/10";
    case "Security":
      return "border-green-500/30 text-green-400 bg-green-500/10";
    case "Performance":
      return "border-amber-500/30 text-amber-400 bg-amber-500/10";
    default:
      return "border-border/40 text-muted-foreground";
  }
}

export default function ChangelogPage() {
  return (
    <div>
      {/* Header */}
      <section className="pt-24 pb-12 border-b border-border/40">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
          <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4">
            Changelog
          </h1>
          <p className="text-xl text-muted-foreground">What are we shipping?</p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
          <div className="space-y-0">
            {changelogEntries.map((entry, index) => (
              <div
                key={entry.title}
                className="relative flex gap-8 pb-16 last:pb-0"
              >
                {/* Timeline line */}
                {index < changelogEntries.length - 1 && (
                  <div className="absolute left-[7px] top-[24px] bottom-0 w-px bg-border/40" />
                )}

                {/* Timeline dot */}
                <div className="relative shrink-0 mt-[8px]">
                  <div className="h-[15px] w-[15px] rounded-full border-2 border-foreground/30 bg-background" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4 mb-3 flex-wrap">
                    <time className="text-base text-muted-foreground">
                      {entry.date}
                    </time>
                    <Badge
                      variant="outline"
                      className={`text-[12px] px-2 py-0.5 ${getTagStyles(entry.tag)}`}
                    >
                      {entry.tag}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    {entry.title}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                    {entry.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
