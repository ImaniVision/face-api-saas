"use client";

const testimonials = [
  {
    quote:
      "FaceAuth cut our identity verification time from 30 seconds to under 2. Our onboarding conversion rate jumped 40%.",
    name: "Sarah Chen",
    role: "CTO",
    company: "FinSecure",
  },
  {
    quote:
      "The liveness detection is incredibly accurate. We've virtually eliminated spoofing attempts since integrating FaceAuth.",
    name: "Marcus Rodriguez",
    role: "Head of Security",
    company: "CloudBank",
  },
  {
    quote:
      "Integration took less than a day. The SDK documentation is outstanding and the API is beautifully designed.",
    name: "Priya Patel",
    role: "Lead Engineer",
    company: "MedVerify",
  },
  {
    quote:
      "We process over 100K verifications daily with 99.9% uptime. FaceAuth scales effortlessly with our growth.",
    name: "James Kim",
    role: "VP Engineering",
    company: "TrustLayer",
  },
  {
    quote:
      "The real-time analytics dashboard gives us visibility into every verification. It's helped us optimize our flows dramatically.",
    name: "Elena Vasquez",
    role: "Product Manager",
    company: "SecureID",
  },
  {
    quote:
      "Moving from our in-house solution to FaceAuth reduced our infra costs by 60% while improving accuracy.",
    name: "David Park",
    role: "Engineering Manager",
    company: "AuthStack",
  },
];

export function Testimonials() {
  return (
    <section className="py-32 overflow-hidden border-y border-border/40 bg-muted/20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 mb-16">
        <p className="text-base font-medium text-muted-foreground mb-3">
          Testimonials
        </p>
        <h2 className="text-4xl font-bold tracking-tight text-foreground">
          What our customers say
        </h2>
      </div>

      {/* Scrolling testimonials */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-40 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-40 bg-gradient-to-l from-background to-transparent" />

        <div className="flex animate-scroll-slow gap-8 px-4">
          {[...testimonials, ...testimonials].map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className="w-[450px] shrink-0 rounded-3xl border border-border/60 bg-card p-10 shadow-sm"
            >
              <p className="text-lg text-foreground font-medium leading-relaxed mb-8">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground ring-2 ring-background">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-base font-semibold text-foreground">
                    {t.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t.role}, {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
