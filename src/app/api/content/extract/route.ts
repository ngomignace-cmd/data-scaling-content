import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { extractGoldenMoments } from "@/lib/video/golden-moments";
import type { TranscriptionSegment } from "@/types/content";

/**
 * POST : Extrait les Golden Moments d'une transcription
 * Body: { segments: TranscriptionSegment[], min_score?: number, source_post_id?: string }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { segments, min_score = 0.7, source_post_id } = body;

  if (!segments || !Array.isArray(segments)) {
    return NextResponse.json(
      { error: "segments array is required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Créer le job
  const { data: job, error: jobError } = await supabase
    .from("content_jobs")
    .insert({
      type: "golden_moments",
      status: "processing",
      source_post_id: source_post_id ?? null,
      priority: 0,
      input_data: { segments, min_score },
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
    const moments = await extractGoldenMoments(
      segments as TranscriptionSegment[],
      min_score
    );

    await supabase
      .from("content_jobs")
      .update({
        status: "completed",
        output_data: { moments },
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return NextResponse.json({
      job_id: job.id,
      status: "completed",
      moments,
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
