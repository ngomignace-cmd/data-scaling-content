export type LeadStatus =
  | "new"
  | "qualifying"
  | "qualified"
  | "booked"
  | "show"
  | "no_show"
  | "closed_won"
  | "closed_lost";

export interface Lead {
  id: string;
  ig_username: string;
  ig_user_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  source_post_id: string | null;
  source_dm_text: string | null;
  status: LeadStatus;
  qualification_score: number | null;
  budget_range: string | null;
  need_summary: string | null;
  urgency: string | null;
  calendly_event_id: string | null;
  call_scheduled_at: string | null;
  call_completed_at: string | null;
  conversion_value: number;
  closed_at: string | null;
  notes: string | null;
  ai_conversation_summary: string | null;
  first_contact_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadInput {
  ig_username: string;
  ig_user_id?: string;
  source_post_id?: string;
  source_dm_text?: string;
}

export interface UpdateLeadInput {
  status?: LeadStatus;
  qualification_score?: number;
  budget_range?: string;
  need_summary?: string;
  urgency?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  calendly_event_id?: string;
  call_scheduled_at?: string;
  call_completed_at?: string;
  conversion_value?: number;
  closed_at?: string;
  notes?: string;
  ai_conversation_summary?: string;
}
