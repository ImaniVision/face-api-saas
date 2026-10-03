import { Badge } from "@/components/ui/badge";

const changelogEntries = [
  {
    date: "October 3, 2026",
    tag: "Security",
    title: "Protected face templates",
    description:
      "We no longer store face embeddings. Each person is now kept as a SHA-256 hash and a random 512x512 rotation (IronMask, with 12-of-512 codewords), and recovering the embedding from a stolen record takes about 2^91 guesses. Enrollment now takes 5 different photos, averaged into one template: on the LFW benchmark that cut genuine rejections from 15.9% with one photo to 2.2%, with 0 of 154,000 impostor attempts accepted. Verify responses now return only match, with no similarity score. People enrolled before this change get a 409 asking them to re-enroll.",
  },
  {
    date: "October 3, 2026",
    tag: "Performance",
    title: "Fixed the colour order sent to the face model",
    description:
      "The face model expects images in BGR order and was being sent RGB. At the old threshold that rejected 27.4% of genuine attempts on LFW instead of 17.5%. The ML service now loads only the two models it uses and runs face detection at 320x320, checked against the same accuracy bar first. A verify call went from 482 ms to 250 ms at the median (318 ms at the 95th percentile) on a laptop CPU.",
  },
  {
    date: "September 29, 2026",
    tag: "Feature",
    title: "Consent, deletion, rate limits and real usage numbers",
    description:
      "Enrollment fails unless you send consent=true, and the consent is stored with a timestamp. DELETE /v1/subjects/{id} removes a person, their template and their consent records. API keys are limited to 60 calls a minute with bursts of 20, and the dashboard shows real call counts per day and per key. API keys only work after you verify your email.",
  },
  {
    date: "September 29, 2026",
    tag: "Security",
    title: "One match threshold, in one place",
    description:
      "Face matching used to happen in two services with two thresholds that could drift apart. It now happens only in the ML service, with tests at, just above and just below the threshold.",
  },
  {
    date: "September 29, 2026",
    tag: "Security",
    title: "Closed the database and ML service to the network",
    description:
      "Secrets moved out of the repository into environment variables. The database and ML service no longer publish ports, and the ML service refuses any call without the gateway's key. The gateway now sends standard security headers and only accepts browser requests from the portal.",
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
          <p className="text-xl text-muted-foreground">What we have shipped, newest first.</p>
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
