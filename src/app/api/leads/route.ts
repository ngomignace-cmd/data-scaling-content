import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { findOrCreateLead, getLeadsByStatus } from "@/lib/crm/lead-manager";
import type { Lead } from "@/types/lead";

/**
 * GET : Liste tous les leads (optionnellement groupés par statut)
 * Query: ?grouped=true pour le Kanban
 */
export async function GET(request: NextRequest) {
  const grouped = request.nextUrl.searchParams.get("grouped") === "true";

  if (grouped) {
    const leadsByStatus = await getLeadsByStatus();
    return NextResponse.json(leadsByStatus);
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data as Lead[]);
}

/**
 * POST : Créer un nouveau lead
 * Body: { ig_username: string, ig_user_id?: string, source_post_id?: string, source_dm_text?: string }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { ig_username, ig_user_id, source_post_id, source_dm_text } = body;

  if (!ig_username) {
    return NextResponse.json(
      { error: "ig_username is required" },
      { status: 400 }
    );
  }

  const lead = await findOrCreateLead({
    ig_username,
    ig_user_id,
    source_post_id,
    source_dm_text,
  });

  return NextResponse.json(lead, { status: 201 });
}
