"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useRealtime(
  table: string,
  onInsert?: (payload: Record<string, unknown>) => void,
  onUpdate?: (payload: Record<string, unknown>) => void
) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table },
        (payload) => onInsert?.(payload.new as Record<string, unknown>)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table },
        (payload) => onUpdate?.(payload.new as Record<string, unknown>)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, onInsert, onUpdate]);
}
