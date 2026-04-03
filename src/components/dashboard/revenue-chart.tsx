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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsSnapshot } from "@/types/analytics";

interface RevenueChartProps {
  snapshots: AnalyticsSnapshot[];
}

export function RevenueChart({ snapshots }: RevenueChartProps) {
  const chartData = snapshots.map((s) => ({
    date: new Date(s.period_start).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    }),
    revenue: Number(s.total_revenue),
    leads: s.new_leads,
    views: s.total_views,
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Revenus & Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              fill="url(#colorRevenue)"
              name="Revenus (€)"
            />
            <Area
              type="monotone"
              dataKey="leads"
              stroke="hsl(var(--chart-2))"
              fill="url(#colorLeads)"
              name="Leads"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
