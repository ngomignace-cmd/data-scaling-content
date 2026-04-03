import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generateStorySequence } from "@/lib/ai/script-generator";

/**
 * POST : Génère une séquence de 3 Stories à partir d'un script
 * Body: { script: string, context?: string, source_post_id?: string }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { script, context, source_post_id } = body;

  if (!script) {
    return NextResponse.json(
      { error: "script is required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Créer le job
  const { data: job, error: jobError } = await supabase
    .from("content_jobs")
    .insert({
      type: "render_stories",
      status: "processing",
      source_post_id: source_post_id ?? null,
      priority: 0,
      input_data: { script, context },
      output_data: null,
      error_message: null,
      attempts: 1,
      max_attempts: 3,
      shotstack_render_id: null,
      started_at: new Date().toISOString(),
      completed_at: null,
    })
    .select()
    .single();

  if (jobError) {
    return NextResponse.json(
      { error: "Failed to create job", details: jobError.message },
      { status: 500 }
    );
  }

  try {
    const sequence = await generateStorySequence(script, context);

    await supabase
      .from("content_jobs")
      .update({
        status: "completed",
        output_data: { sequence },
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return NextResponse.json({
      job_id: job.id,
      status: "completed",
      sequence,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    await supabase
      .from("content_jobs")
      .update({ status: "failed", error_message: message })
      .eq("id", job.id);

    return NextResponse.json(
      { job_id: job.id, status: "failed", error: message },
      { status: 500 }
    );
  }
}
