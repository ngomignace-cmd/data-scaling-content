"use client";

import { Calendar, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Lead } from "@/types/lead";

interface LeadCardProps {
  lead: Lead;
  onClick?: (lead: Lead) => void;
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => onClick?.(lead)}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">@{lead.ig_username}</span>
          {lead.qualification_score !== null && (
            <Badge
              variant={lead.qualification_score >= 70 ? "default" : "secondary"}
              className="text-xs"
            >
              {lead.qualification_score}%
            </Badge>
          )}
        </div>

        {lead.need_summary && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {lead.need_summary}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {lead.call_scheduled_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(lead.call_scheduled_at).toLocaleDateString("fr-FR")}
            </div>
          )}
          {lead.budget_range && (
            <span className="text-emerald-500">{lead.budget_range}</span>
          )}
        </div>

        {lead.conversion_value > 0 && (
          <div className="text-sm font-bold text-emerald-500">
            {lead.conversion_value.toLocaleString("fr-FR")} €
          </div>
        )}
      </CardContent>
    </Card>
  );
}
