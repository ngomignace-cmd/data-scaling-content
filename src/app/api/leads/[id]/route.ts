import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { updateLead, transitionLeadStatus } from "@/lib/crm/lead-manager";
import type { Lead, UpdateLeadInput, LeadStatus } from "@/types/lead";

/**
 * GET : Détail d'un lead avec son historique de conversation
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  const [leadResult, conversationsResult] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).single(),
    supabase
      .from("conversations")
      .select("*")
      .eq("lead_id", id)
      .order("sent_at", { ascending: true }),
  ]);

  if (leadResult.error) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({
    lead: leadResult.data as Lead,
    conversations: conversationsResult.data ?? [],
  });
}

/**
 * PATCH : Met à jour un lead
 * Body: UpdateLeadInput ou { action: "transition", status: LeadStatus }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  try {
    let lead: Lead;

    if (body.action === "transition" && body.status) {
      lead = await transitionLeadStatus(id, body.status as LeadStatus);
    } else {
      const updates: UpdateLeadInput = body;
      lead = await updateLead(id, updates);
    }

    return NextResponse.json(lead);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE : Supprime un lead
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  const { error } = await supabase.from("leads").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
