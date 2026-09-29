"use client";

import { DemoWidget } from "@/components/demo-widget";

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Live Test
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Take a selfie and test face verification in real-time using your API.
        </p>
      </div>

      <DemoWidget />
    </div>
  );
}
