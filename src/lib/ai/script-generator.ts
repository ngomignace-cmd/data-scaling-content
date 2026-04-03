import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

function getClaude() {
  return new ChatAnthropic({
    modelName: "claude-sonnet-4-20250514",
    temperature: 0.7,
    maxTokens: 2000,
  });
}

export interface StorySequence {
  hook: string;
  value: string;
  cta: string;
}

/**
 * Génère un script de Reel à partir d'un sujet
 */
export async function generateReelScript(
  topic: string,
  targetAudience: string,
  duration: "15s" | "30s" | "60s" = "30s"
): Promise<string> {
  const response = await getClaude().invoke([
    new SystemMessage(`Tu es un expert en scripts vidéo viraux pour Instagram Reels.
Génère un script structuré avec :
- HOOK (3 premières secondes — captiver immédiatement)
- CORPS (valeur principale — éduquer/divertir)
- CTA (appel à l'action — DM, follow, ou save)

Le script doit être naturel, parlé, et adapté pour une durée de ${duration}.
Format: texte brut avec les sections [HOOK], [CORPS], [CTA].`),
    new HumanMessage(
      `Sujet : ${topic}\nAudience cible : ${targetAudience}`
    ),
  ]);

  return typeof response.content === "string"
    ? response.content
    : String(response.content);
}

/**
 * Génère une séquence de 3 Stories (Hook → Value → CTA)
 */
export async function generateStorySequence(
  script: string,
  context?: string
): Promise<StorySequence> {
  const response = await getClaude().invoke([
    new SystemMessage(`Tu crées des séquences de 3 Instagram Stories à partir d'un script.

Story 1 (HOOK) : Question choc ou stat surprenante — 1 phrase max
Story 2 (VALUE) : Le contenu clé — 2-3 phrases max
Story 3 (CTA) : Appel à l'action avec urgence — 1-2 phrases

Réponds en JSON : {"hook": "...", "value": "...", "cta": "..."}
JSON uniquement, sans markdown.`),
    new HumanMessage(
      `Script source :\n${script}${context ? `\n\nContexte : ${context}` : ""}`
    ),
  ]);

  const content = typeof response.content === "string"
    ? response.content
    : String(response.content);

  return JSON.parse(content) as StorySequence;
}
