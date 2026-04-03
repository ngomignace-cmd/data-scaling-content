"use client";

import { useState, useEffect, useCallback } from "react";
import type { DashboardMetrics, AnalyticsSnapshot, ContentToRevenue } from "@/types/analytics";

export function useAnalytics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [snapshots, setSnapshots] = useState<AnalyticsSnapshot[]>([]);
  const [contentRevenue, setContentRevenue] = useState<ContentToRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics/patterns");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics ?? null);
        setSnapshots(data.snapshots ?? []);
        setContentRevenue(data.content_revenue ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, snapshots, contentRevenue, loading, refresh: fetchMetrics };
}
