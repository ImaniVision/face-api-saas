"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export interface DailyUsage {
  day: string; // YYYY-MM-DD
  calls: number;
}

interface UsageChartProps {
  byDay: DailyUsage[];
  windowDays: number;
  totalCalls: number;
}

// Days with no calls are absent from the API; show them as zero.
function fillDays(byDay: DailyUsage[], windowDays: number) {
  const calls = new Map(byDay.map((d) => [d.day, d.calls]));
  return Array.from({ length: windowDays }, (_, i) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (windowDays - 1 - i));
    const key = date.toISOString().slice(0, 10);
    return {
      day: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      calls: calls.get(key) ?? 0,
    };
  });
}

export function UsageChart({ byDay, windowDays, totalCalls }: UsageChartProps) {
  const data = fillDays(byDay, windowDays);

  return (
    <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              API Calls, Last {windowDays} Days
            </CardTitle>
            <CardDescription className="mt-1">
              Every metered /v1 request, including failed ones
            </CardDescription>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {totalCalls.toLocaleString()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(263, 70%, 55%)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(263, 70%, 55%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(0, 0%, 20%)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke="hsl(0, 0%, 45%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                stroke="hsl(0, 0%, 45%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 12%)",
                  border: "1px solid hsl(0, 0%, 20%)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "hsl(0, 0%, 90%)",
                }}
                labelStyle={{ color: "hsl(0, 0%, 60%)" }}
              />
              <Area
                type="monotone"
                dataKey="calls"
                stroke="hsl(263, 70%, 55%)"
                strokeWidth={2.5}
                fill="url(#colorCalls)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
