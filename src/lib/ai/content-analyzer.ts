import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ANALYZER_PROMPT } from "./prompts/setter-system";
import type { PatternInsight } from "@/types/analytics";
import type { Post } from "@/types/content";

function getClaude() {
  return new ChatAnthropic({
    modelName: "claude-sonnet-4-20250514",
    temperature: 0.3,
    maxTokens: 1500,
  });
}

export interface EnrichedPatternInsight extends PatternInsight {
  recommendation?: string;
}

/**
 * Analyse les patterns de performance de contenu avec Claude.
 * Utilise le ANALYZER_PROMPT pour une analyse orientée conversion (pas juste engagement).
 */
export async function analyzeContentPatterns(
  posts: Post[]
): Promise<EnrichedPatternInsight[]> {
  if (posts.length === 0) return [];

  const postSummaries = posts.map((p) => ({
    title: p.title,
    format: p.format,
    views: p.views,
    reach: p.reach,
    engagement_rate: p.engagement_rate,
    leads_generated: p.leads_generated,
    saves: p.saves,
    shares: p.shares,
    tags: p.tags,
    published_at: p.published_at,
  }));

  const response = await getClaude().invoke([
    new SystemMessage(ANALYZER_PROMPT),
    new HumanMessage(JSON.stringify(postSummaries)),
  ]);

  const content = typeof response.content === "string"
    ? response.content
    : String(response.content);

  try {
    return JSON.parse(content) as EnrichedPatternInsight[];
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
