"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FunnelStep {
  label: string;
  value: number;
  color: string;
}

interface ConversionFunnelProps {
  steps: FunnelStep[];
}

export function ConversionFunnel({ steps }: ConversionFunnelProps) {
  const maxValue = steps[0]?.value || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Funnel de Conversion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, index) => {
          const widthPercent = Math.max(
            (step.value / maxValue) * 100,
            8
          );
          return (
            <div key={step.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{step.label}</span>
                <span className="font-medium">{step.value}</span>
              </div>
              <div className="h-8 w-full rounded bg-muted overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-500"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: step.color,
                    opacity: 1 - index * 0.15,
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
