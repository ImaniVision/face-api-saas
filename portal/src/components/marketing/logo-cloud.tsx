"use client";

const companies = [
  "TechCorp",
  "FinSecure",
  "MedVerify",
  "CloudBank",
  "DataShield",
  "SecureID",
  "VerifyMe",
  "TrustLayer",
  "AuthStack",
  "BioGate",
];

export function LogoCloud() {
  return (
    <section className="border-y border-border/40 bg-muted/30 py-8 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center text-sm text-muted-foreground mb-6">
          Join <span className="font-semibold text-foreground">500+</span>{" "}
          companies already growing
        </p>
        <div className="relative">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />

          {/* Scrolling logos */}
          <div className="flex animate-scroll gap-12">
            {[...companies, ...companies].map((company, i) => (
              <div
                key={`${company}-${i}`}
                className="flex shrink-0 items-center gap-2 text-muted-foreground/60"
              >
                <div className="h-6 w-6 rounded bg-muted-foreground/10" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {company}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
