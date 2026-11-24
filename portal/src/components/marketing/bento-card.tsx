"use client";

import Link from "next/link";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  title: string;
  body: string;
  learnHref: string;
  children: React.ReactNode;
  className?: string;
  /** Gradient arrangement 1-6. Only 3 is dark. Colours from theme tokens only. */
  variant?: 1 | 2 | 3 | 4 | 5 | 6;
}

function GlowLayer({ variant }: { variant: number }) {
  const drift = "card-glow-drift";
  switch (variant) {
    case 2: // pale blue wash from the bottom, strongest behind the mockup
      return (
        <>
          <div
            className={cn("card-glow", drift, "-bottom-24 left-1/2 h-[24rem] w-[30rem] -translate-x-1/2")}
            style={{
              background:
                "radial-gradient(ellipse, rgb(var(--glow-blue) / 0.45) 0%, rgb(var(--glow-blue) / 0.22) 38%, transparent 68%)",
            }}
          />
          <div
            className={cn("card-glow", drift, "-bottom-12 -right-20 h-[14rem] w-[14rem]")}
            style={{
              background:
                "radial-gradient(circle, rgb(var(--glow-ice) / 0.5) 0%, rgb(var(--glow-ice) / 0.2) 40%, transparent 68%)",
              animationDuration: "30s",
              animationDirection: "alternate-reverse",
            }}
          />
        </>
      );
    case 3: // dark navy, hero-like: blue glow behind the mockup
      return (
        <>
          <div
            className={cn("card-glow", drift, "bottom-[-10rem] left-1/2 h-[26rem] w-[30rem] -translate-x-1/2")}
            style={{
              background:
                "radial-gradient(ellipse, rgb(var(--glow-blue) / 0.45) 0%, transparent 65%)",
              animationDuration: "24s",
            }}
          />
          <div
            className={cn("card-glow", drift, "-right-20 -top-20 h-[15rem] w-[15rem]")}
            style={{
              background:
                "radial-gradient(circle, rgb(var(--glow-ice) / 0.20) 0%, transparent 65%)",
              animationDuration: "30s",
              animationDirection: "alternate-reverse",
            }}
          />
          <div
            className="absolute -bottom-24 left-1/4 h-[20rem] w-[9rem] rotate-[18deg] blur-[70px]"
            style={{
              background: "linear-gradient(rgb(var(--glow-blue) / 0.25), transparent)",
            }}
          />
        </>
      );
    case 4: // soft blue glow from the bottom-right corner
      return (
        <>
          <div
            className={cn("card-glow", drift, "-bottom-20 -right-20 h-[24rem] w-[24rem]")}
            style={{
              background:
                "radial-gradient(circle, rgb(var(--glow-blue) / 0.48) 0%, rgb(var(--glow-blue) / 0.22) 40%, transparent 68%)",
              animationDuration: "28s",
            }}
          />
          <div
            className={cn("card-glow", drift, "-left-20 -top-20 h-[13rem] w-[13rem]")}
            style={{
              background:
                "radial-gradient(circle, rgb(var(--glow-ice) / 0.4) 0%, rgb(var(--glow-ice) / 0.15) 40%, transparent 68%)",
              animationDuration: "22s",
              animationDirection: "alternate-reverse",
            }}
          />
        </>
      );
    case 5: // strongest blue, bottom edge up to ~60% height
      return (
        <>
          <div
            className={cn("card-glow", drift, "-bottom-12 left-1/2 h-[28rem] w-[34rem] -translate-x-1/2")}
            style={{
              background:
                "radial-gradient(ellipse, rgb(var(--glow-blue) / 0.6) 0%, rgb(var(--glow-blue) / 0.3) 42%, transparent 68%)",
              animationDuration: "24s",
            }}
          />
          <div
            className="absolute -bottom-12 left-[10%] h-[18rem] w-[9rem] rotate-[-20deg] blur-[60px]"
            style={{
              background: "linear-gradient(rgb(var(--glow-blue) / 0.35), transparent)",
            }}
          />
        </>
      );
    case 6: // light blue wash with a small amber hint
      return (
        <>
          <div
            className={cn("card-glow", drift, "-bottom-24 left-[10%] h-[22rem] w-[28rem]")}
            style={{
              background:
                "radial-gradient(ellipse, rgb(var(--glow-blue) / 0.4) 0%, rgb(var(--glow-blue) / 0.18) 40%, transparent 68%)",
              animationDuration: "28s",
            }}
          />
          <div
            className={cn("card-glow", drift, "-right-14 -top-14 h-[11rem] w-[11rem]")}
            style={{
              background:
                "radial-gradient(circle, rgb(var(--glow-amber) / 0.4) 0%, rgb(var(--glow-amber) / 0.15) 40%, transparent 65%)",
              animationDuration: "22s",
              animationDirection: "alternate-reverse",
            }}
          />
        </>
      );
    case 1:
    default: // blue bottom-left, faint amber top-right, diagonal sweep
      return (
        <>
          <div
            className={cn("card-glow", drift, "-bottom-16 -left-20 h-[28rem] w-[28rem]")}
            style={{
              background:
                "radial-gradient(circle, rgb(var(--glow-blue) / 0.55) 0%, rgb(var(--glow-blue) / 0.26) 38%, transparent 68%)",
            }}
          />
          <div
            className={cn("card-glow", drift, "-right-16 -top-16 h-[16rem] w-[16rem]")}
            style={{
              background:
                "radial-gradient(circle, rgb(var(--glow-amber) / 0.38) 0%, rgb(var(--glow-amber) / 0.14) 42%, transparent 65%)",
              animationDuration: "30s",
            }}
          />
          <div
            className="absolute -bottom-24 -right-16 h-[24rem] w-[11rem] rotate-[24deg] blur-[60px]"
            style={{
              background: "linear-gradient(rgb(var(--glow-blue) / 0.32), transparent)",
            }}
          />
        </>
      );
  }
}

/* Bento panel: gradient blobs + grain, heading top-left, expand top-right,
   mockup layer anchored bottom and cropped by the card edge. */
export function BentoCard({
  title,
  body,
  learnHref,
  children,
  className,
  variant = 1,
}: BentoCardProps) {
  const dark = variant === 3;

  return (
    <article
      className={cn(
        "grain group relative flex min-h-[440px] flex-col overflow-hidden rounded-2xl border min-[1100px]:min-h-[500px] min-[1100px]:max-h-[540px]",
        dark ? "border-white/10 bg-navy" : "border-border bg-white",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden transition-all duration-500 motion-safe:group-hover:saturate-150 motion-safe:group-hover:brightness-105"
        aria-hidden="true"
      >
        <GlowLayer variant={variant} />
      </div>

      <h3
        className={cn(
          "relative max-w-[75%] p-7 font-display text-[clamp(20px,2vw,28px)] font-medium leading-[1.15] tracking-[-0.01em] min-[1100px]:line-clamp-2",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h3>

      <Dialog>
        <DialogTrigger asChild>
          <button
            aria-label={`More about: ${title}`}
            className={cn(
              "absolute right-7 top-7 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm transition-colors",
              dark
                ? "border-white/15 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                : "border-border bg-white/80 text-ink/60 hover:bg-white hover:text-ink",
            )}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-ink">{title}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">{body}</DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <Link href={learnHref}>
              <Button className="w-full bg-signal text-white hover:bg-signal/90">
                Learn more
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      <div className="relative mx-7 mb-[-24px] flex flex-1 items-end">
        <div className="flex min-h-[280px] w-full flex-col justify-center rounded-xl bg-white p-6 shadow-[0_24px_60px_-12px_rgba(11,31,58,0.28),0_8px_20px_-8px_rgba(11,31,58,0.18)] motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover:-translate-y-1.5 motion-safe:group-hover:shadow-[0_36px_90px_-12px_rgba(11,31,58,0.38),0_12px_28px_-8px_rgba(11,31,58,0.24)] min-[1100px]:min-h-[320px]">
          {children}
        </div>
      </div>
    </article>
  );
}
