import Link from "next/link";
import { ArrowRight, ChevronRight, ShieldCheck, Target, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAQ } from "@/components/marketing/faq";
import { ParticlesBg } from "@/components/marketing/particles-bg";

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

const { match } = await res.json();`;

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Full-screen fixed particle background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticlesBg />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-32 pb-24 mx-auto w-full max-w-7xl min-h-[calc(100vh-5rem)] md:px-6 md:pt-40 md:pb-32 lg:pt-48">
        <div className="flex flex-col items-center text-center w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs sm:text-sm border rounded-full text-muted-foreground border-border bg-background/50 backdrop-blur-md shadow-sm">
            <span className="flex w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_2px_rgba(255,255,255,0.4)] dark:shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]"></span>
            Beta: free while we test it
          </div>
          <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tighter text-foreground leading-[1.1] sm:leading-[1.1] md:leading-[1.05]">
            Face verification that stores no face
          </h1>
          <p className="max-w-2xl mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
            Enroll a person from five photos. Later, send one new photo and get
            back a yes or no. We keep a hash and a random rotation per person,
            so a stolen database gives an attacker no face to rebuild.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 sm:mt-10 w-full sm:w-auto px-4 sm:px-0">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full h-12 px-8 text-base shadow-sm"
              >
                Get an API key
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 px-8 text-base shadow-sm bg-background/50 backdrop-blur-sm"
              >
                See how it works <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature & Code Section */}
      <section
        id="features"
        className="relative z-10 py-16 sm:py-24 border-t border-border bg-background/80 backdrop-blur-md"
      >
        <div className="px-4 sm:px-6 mx-auto w-full max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-8 items-center">
            {/* Text description */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight md:text-5xl">
                Three HTTP calls.
              </h2>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground">
                Enroll, verify, delete. There is no SDK to install: anything
                that can send a multipart request can use it.
              </p>

              <div className="mt-10 space-y-8">
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-10 h-10 border rounded-lg shrink-0 bg-background border-border">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      Protected templates
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Each person is stored as a SHA-256 hash and a random
                      512×512 rotation (IronMask). Recovering the face
                      embedding from a stolen record takes about 2^91 guesses.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-10 h-10 border rounded-lg shrink-0 bg-background border-border">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Measured accuracy</h3>
                    <p className="mt-2 text-muted-foreground">
                      On the LFW benchmark, 2.1% of genuine attempts were
                      rejected and none of 155,000 impostor attempts got
                      through. Every check is one photo against one enrolled
                      person, never a search.
                    </p>
                  </div>
                </div>
              </div>
            </div>

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
            Try it on your own face.
          </h2>
          <p className="max-w-2xl mx-auto mb-8 sm:mb-10 text-base sm:text-lg md:text-xl text-muted-foreground px-4">
            Sign up, open Live Test in the dashboard, enroll from five webcam
            photos, then verify a new selfie. You can delete the template with
            one click when you&apos;re done.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full h-12 px-8 text-base shadow-sm"
              >
                Start Building
              </Button>
            </Link>
            <Link href="/docs" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 px-8 text-base gap-2 bg-background/50 backdrop-blur-sm shadow-sm"
              >
                Read the Docs <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-16 sm:py-24 border-t border-border bg-background/95 backdrop-blur-xl">
        <div className="px-4 sm:px-6 mx-auto w-full max-w-3xl text-center">
          <h2 className="mb-4 text-3xl sm:text-4xl font-bold tracking-tight md:text-5xl">
            Free during the beta
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Every API key gets 60 calls a minute, with bursts of up to 20.
            Calls are counted per key so paid plans can follow, but billing
            isn&apos;t built yet.
          </p>
          <Link href="/pricing" className="inline-block mt-8">
            <Button variant="outline" size="lg" className="h-12 px-8 text-base gap-2">
              What&apos;s included <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 border-t border-border bg-background">
        <FAQ />
      </section>
    </div>
  );
}
