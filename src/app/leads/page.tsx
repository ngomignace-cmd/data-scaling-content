"use client";

import { Header } from "@/components/layout/header";
import { KanbanBoard } from "@/components/leads/kanban-board";
import { useLeads } from "@/hooks/use-leads";

export default function LeadsPage() {
  const { leadsByStatus, loading } = useLeads(true);

  return (
    <>
      <Header
        title="Pipeline Leads"
        description="Suivez vos prospects du DM au closing"
      />
      {loading ? (
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-72 h-64 rounded-xl bg-muted animate-pulse shrink-0"
            />
          ))}
        </div>
      ) : (
        <KanbanBoard leadsByStatus={leadsByStatus} />
      )}
    </>
  );
}
