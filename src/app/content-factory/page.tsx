"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { UploadZone } from "@/components/content-factory/upload-zone";
import { TranscriptionView } from "@/components/content-factory/transcription-view";
import { StorySequence } from "@/components/content-factory/story-sequence";
import type { TranscriptionSegment, GoldenMoment } from "@/types/content";
import type { StorySequence as StorySequenceType } from "@/lib/ai/script-generator";

export default function ContentFactoryPage() {
  const [transcription, setTranscription] = useState<{
    text: string;
    segments: TranscriptionSegment[];
  } | null>(null);
  const [goldenMoments, setGoldenMoments] = useState<GoldenMoment[]>([]);
  const [storySequence, setStorySequence] = useState<StorySequenceType | null>(null);
  const [step, setStep] = useState<"upload" | "transcribed" | "extracted">("upload");

  const handleTranscribe = async (videoUrl: string) => {
    const res = await fetch("/api/content/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_url: videoUrl }),
    });

    if (res.ok) {
      const data = await res.json();
      setTranscription(data.transcription);
      setStep("transcribed");

      // Auto-extract golden moments
      const extractRes = await fetch("/api/content/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments: data.transcription.segments }),
      });
      if (extractRes.ok) {
        const extractData = await extractRes.json();
        setGoldenMoments(extractData.moments ?? []);
        setStep("extracted");
      }
    }
  };

  const handleGenerateStories = async () => {
    if (!transcription) return;

    const res = await fetch("/api/content/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ script: transcription.text }),
    });

    if (res.ok) {
      const data = await res.json();
      setStorySequence(data.sequence);
    }
  };

  return (
    <>
      <Header
        title="Content Factory"
        description="Transformez vos vidéos longues en contenu viral"
      />

      <div className="space-y-6">
        <UploadZone onTranscribe={handleTranscribe} />

        {transcription && (
          <TranscriptionView
            text={transcription.text}
            segments={transcription.segments}
            goldenMoments={goldenMoments}
          />
        )}

        {step === "extracted" && goldenMoments.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={handleGenerateStories}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Générer 3 Stories
            </button>
          </div>
        )}

        <StorySequence sequence={storySequence} />
      </div>
    </>
  );
}
