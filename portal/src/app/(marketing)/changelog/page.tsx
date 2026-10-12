import { Badge } from "@/components/ui/badge";

// Only what exists in the repo today. New entries get dates when they ship.
const changelogEntries = [
  {
    title: "Developer portal with API key management",
    description:
      "Auth-guarded dashboard with API key creation and revocation, a live face-test view, and a usage view. Keys are shown once at creation and authenticate verification calls.",
    tag: "Portal",
  },
  {
    title: "Gateway: enrollment, sign-in, and key-verified checks",
    description:
      "Email and face enrollment, JWT sessions valid for 24 hours, and an API-key verification endpoint for server-side calls.",
    tag: "API",
  },
  {
    title: "Imani Vision site and docs rebuild",
    description:
      "New marketing site, platform and security pages, compliance mapping, and quickstart docs where every example request runs.",
    tag: "Site",
  },
];

function getTagStyles(tag: string) {
  switch (tag) {
    case "Portal":
      return "border-signal/30 text-signal bg-signal/[0.07]";
    case "API":
      return "border-verified/30 text-verified bg-verified/10";
    default:
      return "border-border text-ink/60";
  }
}

export default function ChangelogPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1000px] px-4 pb-12 pt-24 sm:px-6">
          <h1 className="mb-4 font-display text-display font-semibold tracking-tight text-ink">
            Changelog
          </h1>
          <p className="text-body text-ink/60">What we have shipped.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
          <div className="space-y-0">
            {changelogEntries.map((entry, index) => (
              <div key={entry.title} className="relative flex gap-8 pb-16 last:pb-0">
                {index < changelogEntries.length - 1 && (
                  <div className="absolute bottom-0 left-[7px] top-[24px] w-px bg-border" />
                )}
                <div className="relative mt-[8px] shrink-0">
                  <div className="h-[15px] w-[15px] rounded-full border-2 border-signal/40 bg-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-4">
                    <Badge variant="outline" className={`px-2 py-0.5 text-[12px] ${getTagStyles(entry.tag)}`}>
                      {entry.tag}
                    </Badge>
                  </div>
                  <h2 className="mb-4 font-display text-h2 font-semibold text-ink">
                    {entry.title}
                  </h2>
                  <p className="max-w-3xl text-body leading-relaxed text-ink/60">
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
