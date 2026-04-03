import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generateSetterReply } from "@/lib/ai/setter-agent";
import { sendDirectMessage } from "@/lib/instagram/client";

/**
 * POST : Traite un DM entrant manuellement (hors webhook)
 * Body: { lead_id: string, message: string, send_reply?: boolean }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { lead_id, message, send_reply = false } = body;

  if (!lead_id || !message) {
    return NextResponse.json(
      { error: "lead_id and message are required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Vérifier que le lead existe
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", lead_id)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // Sauvegarder le message entrant
  await supabase.from("conversations").insert({
    lead_id,
    role: "user",
    content: message,
    sent_at: new Date().toISOString(),
  });

  // Générer la réponse IA
  const { reply, intent_detected, action_taken } =
    await generateSetterReply(lead_id, message);

  // Sauvegarder la réponse
  await supabase.from("conversations").insert({
    lead_id,
    role: "assistant",
    content: reply,
    intent_detected,
    action_taken,
    sent_at: new Date().toISOString(),
  });

  // Envoyer via Instagram si demandé
  if (send_reply && lead.ig_user_id) {
    await sendDirectMessage(lead.ig_user_id, reply);
  }

  return NextResponse.json({
    reply,
    intent_detected,
    action_taken,
    sent_via_instagram: send_reply && !!lead.ig_user_id,
  });
}
