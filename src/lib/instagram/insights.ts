import { createServerClient } from "@/lib/supabase/server";
import { getUserMedia, getMediaInsights } from "./client";
import { calculateEngagementRate } from "@/lib/utils/metrics";

/**
 * Synchronise les métriques Instagram pour tous les posts publiés.
 * Appelé toutes les 6h par le cron /api/analytics/harvest.
 */
export async function syncAllInsights(): Promise<{
  synced: number;
  errors: string[];
}> {
  const supabase = createServerClient();
  let synced = 0;
  const errors: string[] = [];

  // Récupérer les médias depuis Instagram
  const media = await getUserMedia(50);

  for (const item of media) {
    try {
      const insights = await getMediaInsights(item.id);

      const engagementRate = calculateEngagementRate(
        insights.likes,
        insights.comments,
        insights.shares,
        insights.saved,
        insights.reach
      );

      // Upsert dans la table posts
      const { error } = await supabase
        .from("posts")
        .upsert(
          {
            ig_media_id: item.id,
            ig_permalink: item.permalink,
            title: item.caption?.substring(0, 100) ?? "Sans titre",
            format: item.media_type === "VIDEO" ? "reel" : "static",
            status: "published",
            views: insights.video_views,
            reach: insights.reach,
            likes: insights.likes,
            comments: insights.comments,
            shares: insights.shares,
            saves: insights.saved,
            engagement_rate: engagementRate,
            published_at: item.timestamp,
            thumbnail_url: item.thumbnail_url ?? null,
          },
          { onConflict: "ig_media_id" }
        );

      if (error) {
        errors.push(`Post ${item.id}: ${error.message}`);
      } else {
        synced++;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`Post ${item.id}: ${message}`);
    }
  }

  return { synced, errors };
}
