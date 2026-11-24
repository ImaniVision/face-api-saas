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
    <Card className="border-border bg-white">
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
                  <stop offset="0%" stopColor="#1E4FFF" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#1E4FFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E3E7F0"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke="#8A94A8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                stroke="#8A94A8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #E3E7F0",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#1A1D29",
                }}
                labelStyle={{ color: "#5B6478" }}
              />
              <Area
                type="monotone"
                dataKey="calls"
                stroke="#1E4FFF"
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
