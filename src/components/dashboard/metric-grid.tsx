"use client";

import { Eye, Users, TrendingUp, DollarSign } from "lucide-react";
import { MetricCard } from "@/components/layout/metric-card";
import type { DashboardMetrics } from "@/types/analytics";

interface MetricGridProps {
  metrics: DashboardMetrics | null;
}

export function MetricGrid({ metrics }: MetricGridProps) {
  if (!metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl border bg-card animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Views"
        value={metrics.total_views}
        change="+12% vs semaine dernière"
        changeType="positive"
        icon={<Eye className="h-4 w-4" />}
      />
      <MetricCard
        title="Leads Générés"
        value={metrics.leads_generated}
        change="+8% vs semaine dernière"
        changeType="positive"
        icon={<Users className="h-4 w-4" />}
      />
      <MetricCard
        title="Taux de Closing"
        value={`${(metrics.closing_rate * 100).toFixed(1)}%`}
        change="+2.1 pts"
        changeType="positive"
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <MetricCard
        title="CA Total"
        value={`${metrics.total_revenue.toLocaleString("fr-FR")} €`}
        change="+15% vs mois dernier"
        changeType="positive"
        icon={<DollarSign className="h-4 w-4" />}
      />
    </div>
  );
}
