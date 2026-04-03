import { ChatOpenAI } from "@langchain/openai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { createServerClient } from "@/lib/supabase/server";
import { SETTER_SYSTEM_PROMPT, buildSetterContext } from "./prompts/setter-system";
import { getBookingLink } from "@/lib/crm/calendly";

interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  intent_detected?: string | null;
}

interface SetterResponse {
  reply: string;
  intent_detected: string | null;
  action_taken: string | null;
  phase: "accroche" | "qualification" | "transition" | "suivi";
}

interface SetterOptions {
  sourcePostTitle?: string;
  sourcePostFormat?: string;
  leadName?: string;
  qualificationScore?: number;
}

function getModel() {
  return new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0.7,
    maxTokens: 300,
  });
}

/**
 * Détermine la phase de conversation actuelle
 */
function detectPhase(
  messageCount: number,
  qualificationScore?: number
): SetterResponse["phase"] {
  if (messageCount <= 2) return "accroche";
  if (messageCount <= 6) return "qualification";
  if ((qualificationScore ?? 0) >= 70) return "transition";
  return "qualification";
}

/**
 * Détecte l'intent du message entrant (côté prospect)
 */
function detectIncomingIntent(message: string): string {
  const lower = message.toLowerCase();

  if (/combien|prix|tarif|co[uû]t/.test(lower)) return "price_question";
  if (/rdv|rendez.?vous|appel|call|dispo/.test(lower)) return "booking_intent";
  if (/pas le temps|occup[ée]|plus tard|réfléchir/.test(lower)) return "objection";
  if (/trop cher|budget|moyens/.test(lower)) return "objection";
  if (/super|génial|intéress|parfait|grave|trop bien/.test(lower)) return "positive_signal";
  if (/non|pas vraiment|bof|mouais/.test(lower)) return "cold";
  if (/merci|salut|hello|hey|bonjour/.test(lower) && lower.length < 30) return "initial_contact";
  return "asking_info";
}

/**
 * Détecte l'action prise par le Setter dans sa réponse
 */
function detectActionTaken(reply: string, phase: string): string | null {
  const lower = reply.toLowerCase();

  if (lower.includes("calendly") || lower.includes("lien")) return "sent_calendly_link";
  if (/quand|dispo|cr[eé]neau|semaine/.test(lower) && phase === "transition") return "asked_availability";
  if (lower.includes("?")) {
    if (phase === "accroche") return "asked_opening_question";
    if (phase === "qualification") return "asked_qualifying_question";
  }
  return null;
}

/**
 * Injecte le lien Calendly dans la réponse si nécessaire
 */
function injectCalendlyLink(reply: string): string {
  if (reply.includes("[CALENDLY_LINK]")) {
    try {
      const link = getBookingLink();
      return reply.replace("[CALENDLY_LINK]", link);
    } catch {
      return reply.replace("[CALENDLY_LINK]", "(lien sera envoyé séparément)");
    }
  }
  return reply;
}

/**
 * Génère la réponse du Setter IA pour un DM entrant.
 *
 * Pipeline :
 * 1. Récupère l'historique de conversation
 * 2. Construit le contexte dynamique (phase, score, source)
 * 3. Invoque GPT-4o avec le prompt système + contexte + historique
 * 4. Détecte intent, action, et injecte le lien Calendly si besoin
 */
export async function generateSetterReply(
  leadId: string,
  incomingMessage: string,
  options: SetterOptions = {}
): Promise<SetterResponse> {
  const supabase = createServerClient();

  // 1. Récupérer l'historique de conversation
  const { data: history } = await supabase
    .from("conversations")
    .select("role, content, intent_detected")
    .eq("lead_id", leadId)
    .order("sent_at", { ascending: true })
    .limit(20);

  const conversationHistory: ConversationMessage[] = (history ?? []).map(
    (msg) => ({
      role: msg.role as ConversationMessage["role"],
      content: msg.content,
      intent_detected: msg.intent_detected,
    })
  );

  // 2. Déterminer la phase et construire le contexte
  const totalMessages = conversationHistory.length + 1; // +1 pour le message entrant
  const lastIntent = conversationHistory
    .filter((m) => m.intent_detected)
    .pop()?.intent_detected;

  const phase = detectPhase(totalMessages, options.qualificationScore);
  const incomingIntent = detectIncomingIntent(incomingMessage);

  const context = buildSetterContext({
    leadName: options.leadName,
    sourcePostTitle: options.sourcePostTitle,
    sourcePostFormat: options.sourcePostFormat,
    qualificationScore: options.qualificationScore,
    conversationCount: totalMessages,
    lastIntent: lastIntent ?? incomingIntent,
    calendlyLink: phase === "transition" ? (() => { try { return getBookingLink(); } catch { return undefined; } })() : undefined,
  });

  // 3. Construire les messages LangChain
  const messages: BaseMessage[] = [
    new SystemMessage(SETTER_SYSTEM_PROMPT),
    new SystemMessage(context),
  ];

  for (const msg of conversationHistory) {
    if (msg.role === "user") {
      messages.push(new HumanMessage(msg.content));
    } else if (msg.role === "assistant") {
      messages.push(new AIMessage(msg.content));
    }
  }

  messages.push(new HumanMessage(incomingMessage));

  // 4. Invoquer le modèle
  const response = await getModel().invoke(messages);
  let reply = typeof response.content === "string"
    ? response.content
    : String(response.content);

  // 5. Post-processing
  reply = injectCalendlyLink(reply);
  const action_taken = detectActionTaken(reply, phase);

  return {
    reply,
    intent_detected: incomingIntent,
    action_taken,
    phase,
  };
}
