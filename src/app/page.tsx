"use client";

import { Header } from "@/components/layout/header";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ConversionFunnel } from "@/components/dashboard/conversion-funnel";
import { useAnalytics } from "@/hooks/use-analytics";

export default function DashboardPage() {
  const { metrics, snapshots } = useAnalytics();

  const funnelSteps = [
    { label: "Views", value: metrics?.total_views ?? 0, color: "hsl(var(--primary))" },
    { label: "Leads", value: metrics?.leads_generated ?? 0, color: "hsl(var(--chart-2))" },
    { label: "Calls Bookés", value: 0, color: "hsl(var(--chart-3))" },
    { label: "Shows", value: 0, color: "hsl(var(--chart-4))" },
    { label: "Closés", value: 0, color: "hsl(var(--chart-5))" },
  ];

  return (
    <>
      <Header
        title="Dashboard"
        description="Vue d'ensemble de votre performance organique"
      />

      <div className="space-y-6">
        <MetricGrid metrics={metrics} />

        <div className="grid gap-6 lg:grid-cols-3">
          <RevenueChart snapshots={snapshots} />
          <ConversionFunnel steps={funnelSteps} />
        </div>
      </div>
    </>
  );
}
