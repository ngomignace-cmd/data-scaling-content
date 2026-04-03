"use client";

import { LeadCard } from "./lead-card";
import { LEAD_STATUS_LABELS } from "@/lib/utils/constants";
import type { Lead } from "@/types/lead";

interface KanbanColumnProps {
  status: string;
  leads: Lead[];
  onLeadClick?: (lead: Lead) => void;
}

export function KanbanColumn({ status, leads, onLeadClick }: KanbanColumnProps) {
  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold">
          {LEAD_STATUS_LABELS[status] ?? status}
        </h3>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {leads.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 min-h-[200px] rounded-lg bg-muted/30 p-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} />
        ))}
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
            Aucun lead
          </div>
        )}
      </div>
    </div>
  );
}
