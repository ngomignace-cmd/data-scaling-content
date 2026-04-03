"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { CorrelationChart } from "@/components/insights/correlation-chart";
import { PatternCard } from "@/components/insights/pattern-card";
import type { PatternInsight, ContentToRevenue } from "@/types/analytics";

export default function InsightsPage() {
  const [patterns, setPatterns] = useState<PatternInsight[]>([]);
  const [contentData, setContentData] = useState<ContentToRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch("/api/analytics/patterns");
        if (res.ok) {
          const data = await res.json();
          setPatterns(data.patterns ?? []);
          setContentData(data.content_data ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch insights:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  return (
    <>
      <Header
        title="Content Insights"
        description="Analysez la corrélation entre format de contenu et performance commerciale"
      />

      {loading ? (
        <div className="space-y-4">
          <div className="h-80 rounded-xl bg-muted animate-pulse" />
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <CorrelationChart data={contentData} />

          <div>
            <h2 className="text-lg font-semibold mb-3">Patterns Détectés</h2>
            {patterns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Pas encore assez de données pour détecter des patterns.
                Publiez du contenu et attendez la prochaine synchronisation.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {patterns.map((pattern, i) => (
                  <PatternCard key={i} pattern={pattern} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
