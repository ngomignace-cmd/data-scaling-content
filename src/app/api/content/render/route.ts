import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { submitRender, checkRenderStatus } from "@/lib/video/shotstack";
import type { ShotstackClip } from "@/lib/video/shotstack";

/**
 * POST : Lance un rendu vidéo via Shotstack
 * Body: { clips: ShotstackClip[], source_post_id?: string }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { clips, source_post_id } = body;

  if (!clips || !Array.isArray(clips)) {
    return NextResponse.json(
      { error: "clips array is required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  try {
    const renderId = await submitRender(clips as ShotstackClip[]);

    const { data: job, error: jobError } = await supabase
      .from("content_jobs")
      .insert({
        type: "render_reel",
        status: "processing",
        source_post_id: source_post_id ?? null,
        priority: 0,
        input_data: { clips },
        output_data: null,
        error_message: null,
        attempts: 1,
        max_attempts: 3,
        shotstack_render_id: renderId,
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

    return NextResponse.json({
      job_id: job.id,
      render_id: renderId,
      status: "processing",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET : Vérifie le statut d'un rendu
 * Query: ?render_id=xxx
 */
export async function GET(request: NextRequest) {
  const renderId = request.nextUrl.searchParams.get("render_id");
  if (!renderId) {
    return NextResponse.json(
      { error: "render_id is required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  const result = await checkRenderStatus(renderId);

  // Si le rendu est terminé, mettre à jour le job
  if (result.status === "done" && result.url) {
    await supabase
      .from("content_jobs")
      .update({
        status: "completed",
        output_data: { video_url: result.url },
        completed_at: new Date().toISOString(),
      })
      .eq("shotstack_render_id", renderId);
  } else if (result.status === "failed") {
    await supabase
      .from("content_jobs")
      .update({
        status: "failed",
        error_message: "Shotstack render failed",
      })
      .eq("shotstack_render_id", renderId);
  }

  return NextResponse.json(result);
}
