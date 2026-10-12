"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageChart } from "@/components/usage-chart";

export default function UsagePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-h2 font-semibold tracking-tight text-ink">
          Usage
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Monitor your verification volume and manage your plan.
        </p>
      </div>

      <UsageChart />

      <div className="mt-6 rounded-xl border border-border bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-ink">Pay per check, not per seat</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink/60">
              One price for each check type. Talk to us about volume before you scale.
            </p>
          </div>
          <Link href="/pricing" className="shrink-0">
            <Button size="sm" className="gap-1.5 bg-navy text-white hover:bg-navy/90">
              See pricing <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
