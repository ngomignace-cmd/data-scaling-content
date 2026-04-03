"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TranscriptionSegment, GoldenMoment } from "@/types/content";

interface TranscriptionViewProps {
  text: string;
  segments: TranscriptionSegment[];
  goldenMoments?: GoldenMoment[];
}

function formatTimestamp(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function TranscriptionView({
  text,
  segments,
  goldenMoments = [],
}: TranscriptionViewProps) {
  const goldenRanges = goldenMoments.map((m) => ({
    start: m.start,
    end: m.end,
    score: m.score,
  }));

  const isGolden = (start: number) =>
    goldenRanges.some((r) => start >= r.start && start <= r.end);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Transcription
          <Badge variant="secondary" className="text-xs">
            {segments.length} segments
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 max-h-96 overflow-y-auto">
        {segments.map((segment, i) => (
          <div
            key={i}
            className={`flex gap-3 py-1.5 px-2 rounded text-sm ${
              isGolden(segment.start)
                ? "bg-amber-500/10 border-l-2 border-amber-500"
                : "hover:bg-muted/50"
            }`}
          >
            <span className="text-xs text-muted-foreground font-mono shrink-0 pt-0.5">
              {formatTimestamp(segment.start)}
            </span>
            <span>{segment.text}</span>
            {isGolden(segment.start) && (
              <Badge
                variant="outline"
                className="text-xs shrink-0 border-amber-500 text-amber-500"
              >
                Golden
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
