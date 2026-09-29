"use client";

import { UsageChart } from "@/components/usage-chart";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, Shield } from "lucide-react";

export default function UsagePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Usage
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor your API usage and manage your plan.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Activity,
            label: "API Status",
            value: "Operational",
            color: "text-green-400",
            bgColor: "bg-green-500/10",
            borderColor: "border-green-500/20",
          },
          {
            icon: Zap,
            label: "Current Plan",
            value: "Pro",
            color: "text-violet-400",
            bgColor: "bg-violet-500/10",
            borderColor: "border-violet-500/20",
          },
          {
            icon: Shield,
            label: "Rate Limit",
            value: "10K/min",
            color: "text-indigo-400",
            bgColor: "bg-indigo-500/10",
            borderColor: "border-indigo-500/20",
          },
        ].map((stat) => (
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

      <UsageChart />

      {/* Credits Section */}
      <div className="mt-6 rounded-xl border border-border/40 bg-card/50 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Credit Balance
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Credits are consumed per API call based on your plan.
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">$24.50</p>
            <Badge
              variant="outline"
              className="border-green-500/30 bg-green-500/10 text-green-400"
            >
              Active
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
