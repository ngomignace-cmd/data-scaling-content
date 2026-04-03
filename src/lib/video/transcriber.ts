import OpenAI from "openai";
import fs from "fs";
import type { TranscriptionSegment } from "@/types/content";

function getOpenAI() {
  return new OpenAI();
}

export interface TranscriptionResult {
  text: string;
  segments: TranscriptionSegment[];
  language: string;
  duration: number;
}

/**
 * Transcrit un fichier vidéo/audio avec OpenAI Whisper
 */
export async function transcribeVideo(
  filePath: string,
  language = "fr"
): Promise<TranscriptionResult> {
  const response = await getOpenAI().audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-1",
    language,
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  const segments: TranscriptionSegment[] = (
    response.segments ?? []
  ).map((s) => ({
    start: s.start,
    end: s.end,
    text: s.text.trim(),
  }));

  return {
    text: response.text,
    segments,
    language: response.language,
    duration: response.duration ?? segments[segments.length - 1]?.end ?? 0,
  };
}

/**
 * Transcrit depuis une URL (télécharge d'abord en local)
 */
export async function transcribeFromUrl(
  url: string,
  language = "fr"
): Promise<TranscriptionResult> {
  const tmpPath = `/tmp/whisper_input_${Date.now()}.mp4`;

  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(tmpPath, buffer);

  try {
    return await transcribeVideo(tmpPath, language);
  } finally {
    fs.unlinkSync(tmpPath);
  }
}
