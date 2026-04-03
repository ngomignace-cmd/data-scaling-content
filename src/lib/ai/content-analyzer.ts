import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { PatternInsight } from "@/types/analytics";
import type { Post } from "@/types/content";

function getClaude() {
  return new ChatAnthropic({
    modelName: "claude-sonnet-4-20250514",
    temperature: 0.3,
    maxTokens: 1500,
  });
}

/**
 * Analyse les patterns de performance de contenu
 */
export async function analyzeContentPatterns(
  posts: Post[]
): Promise<PatternInsight[]> {
  if (posts.length === 0) return [];

  const postSummaries = posts.map((p) => ({
    title: p.title,
    format: p.format,
    views: p.views,
    reach: p.reach,
    engagement_rate: p.engagement_rate,
    leads_generated: p.leads_generated,
    tags: p.tags,
  }));

  const response = await getClaude().invoke([
    new SystemMessage(`Tu es un analyste marketing expert en contenu Instagram.
Analyse les données de performance des posts et identifie des patterns actionnables.

Réponds en JSON valide : un tableau d'objets avec :
- "type": catégorie du pattern (format_impact, timing_impact, topic_impact, engagement_pattern)
- "insight": description claire et actionnable en français (1 phrase)
- "confidence": score de confiance entre 0 et 1

Maximum 5 patterns. Ne retourne QUE le JSON, sans markdown.`),
    new HumanMessage(JSON.stringify(postSummaries)),
  ]);

  const content = typeof response.content === "string"
    ? response.content
    : String(response.content);

  try {
    return JSON.parse(content) as PatternInsight[];
  } catch {
    return [
      {
        type: "error",
        insight: "Impossible d'analyser les patterns — données insuffisantes",
        confidence: 0,
      },
    ];
  }
}
