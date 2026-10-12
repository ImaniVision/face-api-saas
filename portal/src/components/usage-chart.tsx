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
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

// Sample usage data
const usageData = [
  { day: "Feb 1", calls: 120 },
  { day: "Feb 3", calls: 235 },
  { day: "Feb 5", calls: 189 },
  { day: "Feb 7", calls: 310 },
  { day: "Feb 9", calls: 275 },
  { day: "Feb 11", calls: 420 },
  { day: "Feb 13", calls: 380 },
  { day: "Feb 15", calls: 510 },
  { day: "Feb 17", calls: 468 },
  { day: "Feb 19", calls: 590 },
  { day: "Feb 21", calls: 620 },
  { day: "Feb 23", calls: 710 },
  { day: "Feb 25", calls: 680 },
  { day: "Feb 27", calls: 755 },
  { day: "Feb 28", calls: 820 },
];

export function UsageChart() {
  const totalCalls = usageData.reduce((sum, d) => sum + d.calls, 0);

  return (
    <Card className="border-border bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-ink">
              <BarChart3 className="h-5 w-5 text-signal" />
              API Calls This Month
            </CardTitle>
            <CardDescription className="mt-1">
              Your verification request volume over time
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-semibold text-ink">
              {totalCalls.toLocaleString()}
            </div>
            <Badge
              variant="outline"
              className="border-amber/40 bg-amber/10 font-mono text-[11px] text-ink"
            >
              sample data
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={usageData}
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
              />
              <YAxis
                stroke="#8A94A8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
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
