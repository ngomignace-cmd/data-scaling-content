"use client";

import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PatternInsight } from "@/types/analytics";

interface PatternCardProps {
  pattern: PatternInsight;
}

export function PatternCard({ pattern }: PatternCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium">{pattern.insight}</p>
            <div className="flex items-center gap-2">
              <Progress
                value={pattern.confidence * 100}
                className="h-1.5 flex-1"
              />
              <span className="text-xs text-muted-foreground">
                {(pattern.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <span className="text-xs text-muted-foreground capitalize">
              {pattern.type.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
