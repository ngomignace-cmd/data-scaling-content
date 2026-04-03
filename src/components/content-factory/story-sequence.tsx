"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StorySequence as StorySequenceType } from "@/lib/ai/script-generator";

interface StorySequenceProps {
  sequence: StorySequenceType | null;
}

export function StorySequence({ sequence }: StorySequenceProps) {
  if (!sequence) return null;

  const stories = [
    { label: "Story 1 — Hook", content: sequence.hook, color: "border-red-500" },
    { label: "Story 2 — Value", content: sequence.value, color: "border-blue-500" },
    { label: "Story 3 — CTA", content: sequence.cta, color: "border-emerald-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Séquence Stories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {stories.map((story) => (
            <div
              key={story.label}
              className={`border-l-4 ${story.color} rounded-lg bg-muted/30 p-4`}
            >
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                {story.label}
              </p>
              <p className="text-sm">{story.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
