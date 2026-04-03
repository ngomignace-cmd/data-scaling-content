import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { publishMedia } from "@/lib/instagram/client";

/**
 * POST : Publie une vidéo sur Instagram (Push to IG)
 * Body: { post_id: string }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { post_id } = body;

  if (!post_id) {
    return NextResponse.json(
      { error: "post_id is required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Récupérer le post
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", post_id)
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (!post.video_url) {
    return NextResponse.json(
      { error: "Post has no video_url" },
      { status: 400 }
    );
  }

  if (post.status === "published") {
    return NextResponse.json(
      { error: "Post is already published" },
      { status: 400 }
    );
  }

  try {
    const caption = post.description ?? post.title;
    const { ig_media_id } = await publishMedia(post.video_url, caption);

    // Mettre à jour le post
    const { data: updated, error: updateError } = await supabase
      .from("posts")
      .update({
        ig_media_id,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", post_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Published but failed to update DB", ig_media_id },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      post: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
