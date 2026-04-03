"use client";

import { useState, useEffect, useCallback } from "react";
import type { Lead, LeadStatus } from "@/types/lead";

export function useLeads(grouped = false) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsByStatus, setLeadsByStatus] = useState<Record<string, Lead[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    try {
      const url = grouped ? "/api/leads?grouped=true" : "/api/leads";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (grouped) {
          setLeadsByStatus(data);
        } else {
          setLeads(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  }, [grouped]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateLeadStatus = async (leadId: string, status: LeadStatus) => {
    const res = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "transition", status }),
    });
    if (res.ok) {
      await fetchLeads();
    }
    return res.ok;
  };

  return { leads, leadsByStatus, loading, refresh: fetchLeads, updateLeadStatus };
}
