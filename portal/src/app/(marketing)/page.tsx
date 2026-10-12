import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroBlobs } from "@/components/marketing/hero-blobs";
import { HeroCloser, WelcomeLoop } from "@/components/marketing/welcome-loop";
import { TrustStrip } from "@/components/marketing/trust-strip";
import { FaceIdScan } from "@/components/marketing/face-id-scan";
import { BentoCard } from "@/components/marketing/bento-card";
import {
  CodeMock,
  LivenessMock,
  OnboardingMock,
  PriceMock,
  TemplateMock,
  TransactionMock,
} from "@/components/marketing/animated-mocks";

const VERIFY_SNIPPET = `// 1:1 check: is this selfie the customer you enrolled?
const form = new FormData();
form.append("image", selfie);

const res = await fetch(
  \`\${process.env.IMANI_API_URL}/v1/subjects/customer_123/verify\`,
  {
    method: "POST",
    headers: { "x-api-key": process.env.IMANI_API_KEY },
    body: form,
  },
);

const { match, confidence } = await res.json();`;

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero — horizontal text, everything visible in the first viewport */}
      <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-navy text-white">
        <HeroBlobs />
        <div className="relative mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
          {/* Looping welcome line — letters from blue balls, glitter sparkles */}
          <div className="mb-8">
            <WelcomeLoop />
          </div>
          {/* Text row — headline left, continuation + CTAs right */}
          <div className="grid items-end gap-5 lg:grid-cols-2 lg:gap-10">
            <h1 className="font-display text-display font-semibold leading-[1.02] tracking-tight">
              It&rsquo;s really you.{" "}
              <span className="text-white/55">
                And we can prove it without keeping your face.
              </span>
            </h1>
            <div>
              <p className="max-w-md text-body leading-relaxed text-white/60">
                Imani Vision lets you add face-based login, transaction
                step-up, and liveness checks to your product through an API. It
                stores only templates that can&apos;t be turned back into a
                face, and it discards raw images once the template is made.
              </p>
              <div className="mt-6 flex flex-row flex-wrap gap-4">
                <Link href="/contact">
                  <Button size="lg" className="h-14 px-9 text-base font-semibold text-white shadow-lg shadow-signal/30 bg-signal hover:bg-signal/90">
                    Get started
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 border-white/25 bg-transparent px-9 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
                  >
                    Read the docs
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="relative mt-10 pb-3">
            <HeroCloser />
          </div>
        </div>
      </section>

      <TrustStrip />

            {/* Code snippet IDE mockup */}
            <div className="relative overflow-hidden border rounded-xl bg-zinc-950 border-zinc-800 shadow-2xl">
              <div className="flex items-center px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                </div>
                <div className="flex items-center justify-center flex-1">
                  <span className="text-xs text-zinc-400 font-mono">
                    verify.js
                  </span>
                </div>
              </div>
              <pre className="p-6 text-sm font-mono text-zinc-300 overflow-x-auto">
                <code>{VERIFY_SNIPPET}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Middle CTA */}
      <section className="relative z-10 py-16 sm:py-24 border-t border-border bg-background/90 backdrop-blur-md">
        <div className="px-4 sm:px-6 mx-auto text-center w-full max-w-7xl">
          <Terminal className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-6 text-muted-foreground/50" />
          <h2 className="mb-4 sm:mb-6 text-3xl sm:text-4xl font-bold tracking-tight md:text-5xl">
            Write in code, not config.
          </h2>
          <p className="max-w-2xl mx-auto mb-8 sm:mb-10 text-base sm:text-lg md:text-xl text-muted-foreground px-4">
            Our API is designed for developers who want to ship fast and iterate
            quickly. Enroll, verify and delete with three plain HTTP calls.
          </p>
          <div className="scroll-rise-stagger mt-10 grid gap-4 md:grid-cols-3">
            {[
              { step: "1", title: "Capture", body: "Collect a face at login or check time. Discard the image after the template is made." },
              { step: "2", title: "Protect", body: "Scramble the face with a one-way transform. Store only the protected template." },
              { step: "3", title: "Verify", body: "Compare each new check against the template. Revoke and reissue if it is ever exposed." },
            ].map((s) => (
              <div key={s.step} className="rounded-xl bg-white p-6">
                <p className="font-mono text-caption text-signal">0{s.step}</p>
                <h3 className="mt-2 font-display text-h3 font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For developers */}
      <section className="bg-navy text-white">
        <div className="scroll-rise mx-auto grid max-w-[1200px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-display text-h1 font-semibold leading-tight tracking-tight">
              Three calls. One API.{" "}
              <span className="text-white/55">
                Add verification where your users already are, with versioned
                endpoints and a sandbox to test against.
              </span>
            </p>
            <Link href="/docs" className="mt-6 inline-block">
              <Button size="lg" className="h-12 bg-signal px-7 text-white hover:bg-signal/90">
                Open the quickstart
              </Button>
            </Link>
          </div>
          <div className="rounded-xl bg-white/[0.06] p-5 ring-1 ring-white/10">
            <p className="font-mono text-xs text-white/50">Illustrative request — endpoint and fields are placeholders</p>
            <pre className="mt-3 overflow-x-auto font-mono text-[13px] leading-relaxed text-white">
{`POST /v1/verify/transaction
Authorization: Bearer sk_test_...

{
  "user_id": "usr_123",
  "amount": 250000,
  "currency": "NGN",
  "risk_signals": {
    "new_payee": true,
    "device_changed": false
  }
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Security band */}
      <section className="bg-white">
        <div className="scroll-rise mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
          <p className="max-w-3xl font-display text-h1 font-semibold leading-tight tracking-tight text-ink">
            We can&apos;t leak what we never store.{" "}
            <span className="text-ink/50">
              Face data is scrambled with a one-way transform before it is
              saved, so a stolen database contains nothing an attacker can turn
              back into a face.
            </span>
          </p>
          <Link href="/security" className="mt-6 inline-flex items-center gap-1 font-medium text-signal">
            Read how protection works <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-navy text-white">
        <div className="scroll-rise mx-auto max-w-[1200px] px-4 py-20 text-center sm:px-6">
          <p className="mx-auto max-w-2xl font-display text-h1 font-semibold leading-tight tracking-tight">
            Start verifying in minutes.{" "}
            <span className="text-white/55">Talk to us about your first integration.</span>
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/contact">
              <Button size="lg" className="h-12 bg-signal px-8 text-white hover:bg-signal/90">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
