import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { TranscriptionSegment, GoldenMoment } from "@/types/content";

function getModel() {
  return new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0.2,
    maxTokens: 1000,
  });
}

/**
 * Identifie les "Golden Moments" (segments à haut potentiel viral)
 * à partir de la transcription d'une vidéo longue
 */
export async function extractGoldenMoments(
  segments: TranscriptionSegment[],
  minScore = 0.7
): Promise<GoldenMoment[]> {
  const transcript = segments
    .map((s) => `[${formatTime(s.start)}-${formatTime(s.end)}] ${s.text}`)
    .join("\n");

  const response = await getModel().invoke([
    new SystemMessage(`Tu es un expert en montage vidéo pour les réseaux sociaux.

Analyse cette transcription et identifie les segments qui feraient les meilleurs clips courts (15-60s) pour Instagram Reels.

Critères d'un Golden Moment :
- Accroche forte (question, stat surprenante, affirmation provocante)
- Valeur autonome (compréhensible sans le reste de la vidéo)
- Fort potentiel de partage/save
- Émotion ou insight puissant

Réponds en JSON : un tableau d'objets avec :
- "start": timestamp début (secondes)
- "end": timestamp fin (secondes)
- "score": score viral de 0 à 1
- "reason": pourquoi ce segment est viral (1 phrase)

Maximum 5 moments. JSON uniquement, sans markdown.`),
    new HumanMessage(transcript),
  ]);

  const content = typeof response.content === "string"
    ? response.content
    : String(response.content);

  try {
    const moments = JSON.parse(content) as GoldenMoment[];
    return moments.filter((m) => m.score >= minScore);
  } catch {
    return [];
  }
}

function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
