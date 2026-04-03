import { ChatOpenAI } from "@langchain/openai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { createServerClient } from "@/lib/supabase/server";
import { SETTER_SYSTEM_PROMPT } from "./prompts/setter-system";

interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface SetterResponse {
  reply: string;
  intent_detected: string | null;
  action_taken: string | null;
}

function getModel() {
  return new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0.7,
    maxTokens: 300,
  });
}

/**
 * Génère la réponse du Setter IA pour un DM entrant
 */
export async function generateSetterReply(
  leadId: string,
  incomingMessage: string,
  sourcePostTitle?: string
): Promise<SetterResponse> {
  const supabase = createServerClient();

  // Récupérer l'historique de conversation
  const { data: history } = await supabase
    .from("conversations")
    .select("role, content")
    .eq("lead_id", leadId)
    .order("sent_at", { ascending: true })
    .limit(20);

  const conversationHistory: ConversationMessage[] = (history ?? []).map(
    (msg) => ({ role: msg.role as ConversationMessage["role"], content: msg.content })
  );

  // Construire les messages LangChain
  const messages: BaseMessage[] = [
    new SystemMessage(SETTER_SYSTEM_PROMPT),
  ];

  if (sourcePostTitle) {
    messages.push(
      new SystemMessage(
        `Le prospect a été attiré par ce contenu : "${sourcePostTitle}"`
      )
    );
  }

  for (const msg of conversationHistory) {
    if (msg.role === "user") {
      messages.push(new HumanMessage(msg.content));
    } else if (msg.role === "assistant") {
      messages.push(new AIMessage(msg.content));
    }
  }

  messages.push(new HumanMessage(incomingMessage));

  const response = await getModel().invoke(messages);
  const reply = typeof response.content === "string"
    ? response.content
    : String(response.content);

  // Détection d'intent basique
  const lowerReply = reply.toLowerCase();
  let action_taken: string | null = null;
  let intent_detected: string | null = null;

  if (lowerReply.includes("calendly") || lowerReply.includes("appel")) {
    action_taken = "sent_calendly_link";
    intent_detected = "booking_intent";
  } else if (conversationHistory.length < 3) {
    intent_detected = "initial_contact";
  } else {
    intent_detected = "qualifying";
  }

  return { reply, intent_detected, action_taken };
}
