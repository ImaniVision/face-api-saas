"use client";

import { DemoWidget } from "@/components/demo-widget";

export default function LiveTestPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-h2 font-semibold tracking-tight text-ink">
          Live Test
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Capture a face and run a real verification against your enrolled templates.
        </p>
      </div>

      <DemoWidget />
    </div>
  );
}
