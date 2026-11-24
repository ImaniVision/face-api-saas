import { Badge } from "@/components/ui/badge";

// Only what exists in the repo today, newest first.
const changelogEntries = [
  {
    date: "October 5, 2026",
    tag: "Performance",
    title: "Templates are 4x smaller",
    description:
      "Each protected template now stores its rotation matrix at 8-bit precision: 257 KiB per person instead of 1 MiB. On 14.2 million impostor attempts the smaller format made exactly the same decisions as before, and the security estimate is unchanged. Verification got faster too: 229 ms instead of 250 ms at the median, 273 ms instead of 297 ms at the 95th percentile. Existing templates keep working.",
  },
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
          <p className="text-body text-ink/60">What we have shipped, newest first.</p>
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
                    <time className="text-sm text-ink/50">{entry.date}</time>
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
