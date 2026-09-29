import Link from "next/link";
import { ArrowRight, ChevronRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAQ } from "@/components/marketing/faq";
import { ParticlesBg } from "@/components/marketing/particles-bg";

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
            1,254 happy customers
          </div>
          <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tighter text-foreground leading-[1.1] sm:leading-[1.1] md:leading-[1.05]">
            Facial Recognition Infrastructure for Modern Apps
          </h1>
          <p className="max-w-2xl mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
            FaceAuth is the developer-first facial verification API. Integrate
            face matching, liveness detection, and identity analytics into your
            application in minutes — not months.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 sm:mt-10 w-full sm:w-auto px-4 sm:px-0">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full h-12 px-8 text-base shadow-sm"
              >
                Get Started for Free
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 px-8 text-base shadow-sm bg-background/50 backdrop-blur-sm"
              >
                Request Demo <ArrowRight className="w-4 h-4 ml-2" />
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
                Integrate in minutes.
              </h2>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground">
                Powerful APIs and client SDKs that seamlessly integrate into
                your existing authentication flows. Drop in our widget or build
                entirely from scratch.
              </p>

              <div className="mt-10 space-y-8">
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-10 h-10 border rounded-lg shrink-0 bg-background border-border">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      Liveness Detection
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Prevent spoofing attacks with active and passive liveness
                      checks certified to iBeta Level 2 standards.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-10 h-10 border rounded-lg shrink-0 bg-background border-border">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Face Matching</h3>
                    <p className="mt-2 text-muted-foreground">
                      Compare faces in milliseconds with 99.98% accuracy. Scales
                      instantly to millions of identity records.
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
                    verify.ts
                  </span>
                </div>
              </div>
              <div className="p-6 text-sm font-mono text-zinc-300 overflow-x-auto">
                <pre>
                  <code>
                    <span className="text-zinc-500">
                      // Initialize the FaceAuth client
                    </span>
                    <span className="text-purple-400">import</span> {"{"}{" "}
                    FaceAuth {"}"} <span className="text-purple-400">from</span>{" "}
                    <span className="text-emerald-400">'@faceauth/node'</span>;
                    <span className="text-purple-400">const</span> client ={" "}
                    <span className="text-purple-400">new</span>{" "}
                    FaceAuth(process.env.FACEAUTH_KEY);
                    <span className="text-zinc-500">
                      // Verify a user's identity
                    </span>
                    <span className="text-purple-400">const</span> verification
                    = <span className="text-purple-400">await</span>{" "}
                    client.verify({"{"}
                    <span className="text-sky-300">userId:</span>{" "}
                    <span className="text-emerald-400">'user_123'</span>,
                    <span className="text-sky-300">imageBuffer:</span>{" "}
                    req.file.buffer,
                    <span className="text-sky-300">requireLiveness:</span>{" "}
                    <span className="text-orange-300">true</span>
                    {"}"});
                    <span className="text-purple-400">if</span>{" "}
                    (verification.success) {"{"}
                    console.log(
                    <span className="text-emerald-400">
                      'Identity verified successfully!'
                    </span>
                    );
                    <span className="text-purple-400">return</span> res.json(
                    {"{"} <span className="text-sky-300">token:</span>{" "}
                    verification.token {"}"});
                    {"}"}
                  </code>
                </pre>
              </div>
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
            quickly. Everything is controlled via simple, typed SDKs.
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
        <div className="px-4 sm:px-6 mx-auto w-full max-w-7xl">
          <div className="mb-12 sm:mb-16 text-center">
            <h2 className="mb-4 text-3xl sm:text-4xl font-bold tracking-tight md:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Start for free, scale when you need to.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3 max-w-5xl mx-auto align-top">
            {/* Free */}
            <div className="flex flex-col p-8 border rounded-2xl bg-background border-border">
              <h3 className="text-xl font-semibold">Free</h3>
              <p className="mt-2 text-muted-foreground">
                For side projects and prototyping.
              </p>
              <div className="my-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="flex-1 space-y-4 text-sm text-foreground/80 mb-8">
                <li className="flex gap-3">
                  <span className="text-foreground">✓</span> 100
                  verifications/month
                </li>
                <li className="flex gap-3">
                  <span className="text-foreground">✓</span> Basic face matching
                  API
                </li>
                <li className="flex gap-3">
                  <span className="text-foreground">✓</span> Community Support
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Get Started
              </Button>
            </div>

            {/* Pro - visually elevated */}
            <div className="flex flex-col p-8 border-2 rounded-2xl bg-background border-foreground shadow-xl relative -mt-4 mb-4 md:-mt-4 md:mb-0">
              <div className="absolute top-0 right-8 transform -translate-y-1/2">
                <span className="bg-foreground text-background text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-semibold">Pro</h3>
              <p className="mt-2 text-muted-foreground">
                For scaling production applications.
              </p>
              <div className="my-6">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="flex-1 space-y-4 text-sm text-foreground/80 mb-8">
                <li className="flex gap-3">
                  <span className="text-foreground">✓</span> 10,000
                  verifications/month
                </li>
                <li className="flex gap-3 text-foreground font-medium">
                  <span className="text-foreground">✓</span> Liveness detection
                  included
                </li>
                <li className="flex gap-3">
                  <span className="text-foreground">✓</span> Priority email
                  support
                </li>
                <li className="flex gap-3">
                  <span className="text-foreground">✓</span> Advanced analytics
                  dashboard
                </li>
              </ul>
              <Button className="w-full text-primary-foreground bg-primary">
                Start Free Trial
              </Button>
            </div>

            {/* Enterprise */}
            <div className="flex flex-col p-8 border rounded-2xl bg-background border-border">
              <h3 className="text-xl font-semibold">Enterprise</h3>
              <p className="mt-2 text-muted-foreground">
                For mission-critical workloads.
              </p>
              <div className="my-6">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <ul className="flex-1 space-y-4 text-sm text-foreground/80 mb-8">
                <li className="flex gap-3">
                  <span className="text-foreground">✓</span> Unlimited
                  verifications
                </li>
                <li className="flex gap-3">
                  <span className="text-foreground">✓</span> Dedicated
                  infrastructure
                </li>
                <li className="flex gap-3">
                  <span className="text-foreground">✓</span> 24/7 SLA with
                  account manager
                </li>
                <li className="flex gap-3">
                  <span className="text-foreground">✓</span> Custom deployment
                  options
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 border-t border-border bg-background">
        <FAQ />
      </section>
    </div>
  );
}
