import { NextResponse } from "next/server";
import { syncAllInsights } from "@/lib/instagram/insights";

/**
 * POST : Synchronisation manuelle des insights Instagram
 */
export async function POST() {
  try {
    const result = await syncAllInsights();

    return NextResponse.json({
      success: true,
      synced: result.synced,
      errors: result.errors,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
