"use client";

import { KanbanColumn } from "./kanban-column";
import { KANBAN_COLUMNS } from "@/lib/utils/constants";
import type { Lead } from "@/types/lead";

interface KanbanBoardProps {
  leadsByStatus: Record<string, Lead[]>;
  onLeadClick?: (lead: Lead) => void;
}

export function KanbanBoard({ leadsByStatus, onLeadClick }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          leads={leadsByStatus[status] ?? []}
          onLeadClick={onLeadClick}
        />
      ))}
    </div>
  );
}
