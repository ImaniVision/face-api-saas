"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Loader2, Shield } from "lucide-react";
import { UsageChart, type DailyUsage } from "@/components/usage-chart";

interface UsageSummary {
  windowDays: number;
  totalCalls: number;
  succeededCalls: number;
  byDay: DailyUsage[];
  byKey: {
    apiKeyId: string | null;
    name: string | null;
    lastFour: string | null;
    calls: number;
  }[];
  rateLimit: { capacity: number; refillPerSec: number };
}

export default function UsagePage() {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then(async (res) => {
        if (!res.ok) throw new Error();
        setUsage(await res.json());
      })
      .catch(() => setError("Couldn't load usage. Is the gateway running?"));
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-destructive sm:px-6 lg:px-8">
        {error}
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const successRate =
    usage.totalCalls ?
      `${((usage.succeededCalls / usage.totalCalls) * 100).toFixed(1)}%`
    : "—";
  const perMinute = Math.round(usage.rateLimit.refillPerSec * 60);

  const stats = [
    {
      icon: Activity,
      label: `Calls (${usage.windowDays} days)`,
      value: usage.totalCalls.toLocaleString(),
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
    },
    {
      icon: CheckCircle2,
      label: "Success rate",
      value: successRate,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      icon: Shield,
      label: "Rate limit (per key)",
      value: `${perMinute}/min, burst ${usage.rateLimit.capacity}`,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Usage
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Metered API calls for your account.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`flex items-center gap-3 rounded-xl border p-4 ${stat.borderColor} ${stat.bgColor}`}
          >
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-sm font-semibold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <UsageChart
        byDay={usage.byDay}
        windowDays={usage.windowDays}
        totalCalls={usage.totalCalls}
      />

      <div className="mt-6 rounded-xl border border-border/40 bg-card/50 p-6 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-foreground">Calls by key</h3>
        {usage.byKey.length === 0 ?
          <p className="mt-2 text-xs text-muted-foreground">
            No calls yet. Create an API key and call /v1, or try the Live Test.
          </p>
        : <ul className="mt-3 divide-y divide-border/40">
            {usage.byKey.map((k) => (
              <li
                key={k.apiKeyId ?? "session"}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-foreground">
                  {k.apiKeyId ?
                    `${k.name ?? "Deleted key"} (…${k.lastFour ?? "????"})`
                  : "Dashboard Live Test"}
                </span>
                <span className="font-mono text-muted-foreground">
                  {k.calls.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        }
      </div>
    </div>
  );
}
