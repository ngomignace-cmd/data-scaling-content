import { createServerClient } from "@/lib/supabase/server";
import type { Lead, CreateLeadInput, UpdateLeadInput, LeadStatus } from "@/types/lead";

/**
 * Crée un nouveau lead ou retourne le lead existant (par ig_username)
 */
export async function findOrCreateLead(
  input: CreateLeadInput
): Promise<Lead> {
  const supabase = createServerClient();

  // Vérifier si le lead existe déjà
  const { data: existing } = await supabase
    .from("leads")
    .select("*")
    .eq("ig_username", input.ig_username)
    .single();

  if (existing) return existing as Lead;

  // Créer un nouveau lead
  const { data, error } = await supabase
    .from("leads")
    .insert({
      ig_username: input.ig_username,
      ig_user_id: input.ig_user_id ?? null,
      source_post_id: input.source_post_id ?? null,
      source_dm_text: input.source_dm_text ?? null,
      status: "new",
      qualification_score: null,
      budget_range: null,
      need_summary: null,
      urgency: null,
      full_name: null,
      email: null,
      phone: null,
      calendly_event_id: null,
      call_scheduled_at: null,
      call_completed_at: null,
      conversion_value: 0,
      closed_at: null,
      notes: null,
      ai_conversation_summary: null,
      first_contact_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create lead: ${error.message}`);
  return data as Lead;
}

/**
 * Met à jour un lead
 */
export async function updateLead(
  leadId: string,
  updates: UpdateLeadInput
): Promise<Lead> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", leadId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update lead: ${error.message}`);
  return data as Lead;
}

/**
 * Transition de statut d'un lead
 */
export async function transitionLeadStatus(
  leadId: string,
  newStatus: LeadStatus
): Promise<Lead> {
  const updates: UpdateLeadInput = { status: newStatus };

  if (newStatus === "closed_won" || newStatus === "closed_lost") {
    updates.closed_at = new Date().toISOString();
  }

  return updateLead(leadId, updates);
}

/**
 * Récupère tous les leads groupés par statut (pour le Kanban)
 */
export async function getLeadsByStatus(): Promise<Record<string, Lead[]>> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch leads: ${error.message}`);

  const grouped: Record<string, Lead[]> = {};
  for (const lead of data as Lead[]) {
    if (!grouped[lead.status]) grouped[lead.status] = [];
    grouped[lead.status].push(lead);
  }

  return grouped;
}

/**
 * Incrémente le compteur de leads générés sur un post
 */
export async function incrementPostLeadCount(
  postId: string
): Promise<void> {
  const supabase = createServerClient();

  await supabase.rpc("increment_leads_generated", { post_id: postId });
}
