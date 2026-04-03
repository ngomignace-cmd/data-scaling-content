"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentToRevenue } from "@/types/analytics";

interface CorrelationChartProps {
  data: ContentToRevenue[];
}

export function CorrelationChart({ data }: CorrelationChartProps) {
  const chartData = data.map((d) => ({
    engagement: Number((d.engagement_rate * 100).toFixed(2)),
    leads: d.total_leads,
    revenue: Number(d.revenue),
    title: d.title,
    format: d.format,
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-base">
          Corrélation Engagement vs Leads
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="engagement"
              name="Engagement %"
              className="text-xs"
              label={{ value: "Engagement (%)", position: "bottom", offset: 0 }}
            />
            <YAxis
              dataKey="leads"
              name="Leads"
              className="text-xs"
              label={{ value: "Leads", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value, name) => [String(value), String(name)]}
            />
            <Scatter
              data={chartData}
              fill="hsl(var(--primary))"
              fillOpacity={0.6}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
