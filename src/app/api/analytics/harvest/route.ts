import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { syncAllInsights } from "@/lib/instagram/insights";
import { analyzeContentPatterns } from "@/lib/ai/content-analyzer";
import {
  calculateClosingRate,
  calculateCPL,
  calculateVPL,
} from "@/lib/utils/metrics";
import type { Post } from "@/types/content";

/**
 * POST : Cron job de collecte des métriques (toutes les 6h)
 * Sécurisé par CRON_SECRET
 */
export async function POST(request: NextRequest) {
  // Vérifier le secret cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  // 1. Synchroniser les insights Instagram
  const syncResult = await syncAllInsights();

  // 2. Récupérer les données pour l'analyse
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  const { data: recentLeads } = await supabase
    .from("leads")
    .select("*")
    .gte(
      "created_at",
      new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    );

  const { data: allLeads } = await supabase
    .from("leads")
    .select("status, conversion_value");

  // 3. Calculer les métriques
  const leads = allLeads ?? [];
  const newLeads = (recentLeads ?? []).length;
  const leadsQualified = leads.filter(
    (l) => !["new", "qualifying"].includes(l.status)
  ).length;
  const callsBooked = leads.filter((l) => l.status === "booked").length;
  const callsCompleted = leads.filter((l) =>
    ["show", "closed_won", "closed_lost"].includes(l.status)
  ).length;
  const dealsClosed = leads.filter(
    (l) => l.status === "closed_won"
  ).length;
  const totalRevenue = leads
    .filter((l) => l.status === "closed_won")
    .reduce((sum, l) => sum + Number(l.conversion_value), 0);

  const totalViews = (posts as Post[] ?? []).reduce((sum, p) => sum + p.views, 0);
  const totalReach = (posts as Post[] ?? []).reduce((sum, p) => sum + p.reach, 0);
  const totalEngagement = (posts as Post[] ?? []).reduce(
    (sum, p) => sum + p.likes + p.comments + p.shares + p.saves,
    0
  );

  // 4. Analyser les patterns avec Claude
  const patterns = await analyzeContentPatterns((posts as Post[]) ?? []);

  // 5. Créer le snapshot analytics
  const now = new Date();
  const periodStart = new Date(now.getTime() - 6 * 60 * 60 * 1000);

  const totalLeads = leads.length || 1;

  const { error } = await supabase.from("analytics").insert({
    period: "6h",
    period_start: periodStart.toISOString(),
    period_end: now.toISOString(),
    total_views: totalViews,
    total_reach: totalReach,
    total_engagement: totalEngagement,
    avg_engagement_rate:
      totalReach > 0 ? totalEngagement / totalReach : 0,
    new_leads: newLeads,
    leads_qualified: leadsQualified,
    calls_booked: callsBooked,
    calls_completed: callsCompleted,
    deals_closed: dealsClosed,
    total_revenue: totalRevenue,
    cpl: calculateCPL(6, 50, newLeads || 1), // 6h au taux par défaut
    vpl: calculateVPL(totalRevenue, totalLeads),
    closing_rate: calculateClosingRate(dealsClosed, callsCompleted || 1),
    patterns,
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to save analytics", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    synced: syncResult.synced,
    sync_errors: syncResult.errors.length,
    patterns_found: patterns.length,
    snapshot: {
      total_views: totalViews,
      new_leads: newLeads,
      deals_closed: dealsClosed,
      total_revenue: totalRevenue,
    },
  });
}
