export type AnalyticsPeriod = "6h" | "daily" | "weekly" | "monthly";

export interface AnalyticsSnapshot {
  id: string;
  period: AnalyticsPeriod;
  period_start: string;
  period_end: string;
  total_views: number;
  total_reach: number;
  total_engagement: number;
  avg_engagement_rate: number;
  top_post_id: string | null;
  new_leads: number;
  leads_qualified: number;
  calls_booked: number;
  calls_completed: number;
  deals_closed: number;
  total_revenue: number;
  cpl: number;
  vpl: number;
  closing_rate: number;
  patterns: PatternInsight[];
  created_at: string;
}

export interface PatternInsight {
  type: string;
  insight: string;
  confidence: number;
}

export interface DashboardMetrics {
  total_views: number;
  leads_generated: number;
  closing_rate: number;
  total_revenue: number;
  cpl: number;
  vpl: number;
}

export interface ContentToRevenue {
  post_id: string;
  title: string;
  format: string;
  views: number;
  reach: number;
  engagement_rate: number;
  total_leads: number;
  booked: number;
  shows: number;
  closed: number;
  revenue: number;
  lead_rate_pct: number;
}
