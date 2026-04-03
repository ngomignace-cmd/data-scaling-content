import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { analyzeContentPatterns } from "@/lib/ai/content-analyzer";
import type { Post } from "@/types/content";

/**
 * GET : Récupère les patterns de performance actuels
 */
export async function GET() {
  const supabase = createServerClient();

  // Récupérer le dernier snapshot analytics
  const { data: latestSnapshot } = await supabase
    .from("analytics")
    .select("patterns")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (latestSnapshot?.patterns) {
    return NextResponse.json({ patterns: latestSnapshot.patterns });
  }

  // Si pas de snapshot, analyser à la volée
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(30);

  const patterns = await analyzeContentPatterns((posts as Post[]) ?? []);

  return NextResponse.json({ patterns });
}
