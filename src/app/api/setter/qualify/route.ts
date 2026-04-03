import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createServerClient } from "@/lib/supabase/server";
import { updateLead } from "@/lib/crm/lead-manager";
import { QUALIFIER_PROMPT } from "@/lib/ai/prompts/setter-system";

function getModel() {
  return new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0.1,
    maxTokens: 500,
  });
}

/**
 * POST : Qualifie un lead à partir de son historique de conversation
 * Body: { lead_id: string }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { lead_id } = body;

  if (!lead_id) {
    return NextResponse.json(
      { error: "lead_id is required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Récupérer l'historique
  const { data: conversations } = await supabase
    .from("conversations")
    .select("role, content, sent_at")
    .eq("lead_id", lead_id)
    .order("sent_at", { ascending: true });

  if (!conversations || conversations.length === 0) {
    return NextResponse.json(
      { error: "No conversation history found" },
      { status: 404 }
    );
  }

  const conversationText = conversations
    .map((c) => `[${c.role}] ${c.content}`)
    .join("\n");

  // Analyser avec GPT-4o
  const response = await getModel().invoke([
    new SystemMessage(QUALIFIER_PROMPT),
    new HumanMessage(conversationText),
  ]);

  const content = typeof response.content === "string"
    ? response.content
    : String(response.content);

  try {
    const qualification = JSON.parse(content);

    // Mettre à jour le lead
    const updatedLead = await updateLead(lead_id, {
      qualification_score: qualification.qualification_score,
      need_summary: qualification.need_summary,
      budget_range: qualification.budget_range,
      urgency: qualification.urgency,
      status:
        qualification.recommended_action === "send_calendly"
          ? "qualified"
          : qualification.recommended_action === "disqualify"
            ? "closed_lost"
            : "qualifying",
    });

    return NextResponse.json({
      lead: updatedLead,
      qualification,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse qualification response", raw: content },
      { status: 500 }
    );
  }
}
