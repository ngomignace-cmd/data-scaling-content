import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, extractMessages, verifySubscription } from "@/lib/instagram/webhooks";
import { createServerClient } from "@/lib/supabase/server";
import { findOrCreateLead, incrementPostLeadCount } from "@/lib/crm/lead-manager";
import { generateSetterReply } from "@/lib/ai/setter-agent";
import { sendDirectMessage } from "@/lib/instagram/client";
import type { IGWebhookPayload } from "@/types/instagram";

/**
 * GET : Vérification du webhook lors de l'enregistrement (challenge)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const result = verifySubscription(mode, token, challenge);

  if (result) {
    return new NextResponse(result, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * POST : Réception des événements webhook (DMs, mentions, etc.)
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  // Vérifier la signature
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload: IGWebhookPayload = JSON.parse(rawBody);
  const messages = extractMessages(payload);

  const supabase = createServerClient();

  for (const event of messages) {
    try {
      const senderIgId = event.sender.id;
      const messageText = event.message!.text;

      // Trouver ou créer le lead
      const lead = await findOrCreateLead({
        ig_username: senderIgId, // Sera résolu en username via l'API plus tard
        ig_user_id: senderIgId,
        source_dm_text: messageText,
      });

      // Sauvegarder le message entrant
      await supabase.from("conversations").insert({
        lead_id: lead.id,
        role: "user",
        content: messageText,
        ig_message_id: event.message!.mid,
        sent_at: new Date(event.timestamp).toISOString(),
      });

      // Si c'est un nouveau lead, incrémenter le compteur du post source
      if (lead.source_post_id) {
        await incrementPostLeadCount(lead.source_post_id);
      }

      // Générer la réponse du Setter IA
      const { reply, intent_detected, action_taken } =
        await generateSetterReply(lead.id, messageText);

      // Sauvegarder la réponse IA
      await supabase.from("conversations").insert({
        lead_id: lead.id,
        role: "assistant",
        content: reply,
        intent_detected,
        action_taken,
        sent_at: new Date().toISOString(),
      });

      // Envoyer le DM de réponse via Instagram
      await sendDirectMessage(senderIgId, reply);
    } catch (error) {
      console.error("Error processing webhook message:", error);
    }
  }

  // Instagram exige un 200 rapide
  return NextResponse.json({ status: "ok" });
}
