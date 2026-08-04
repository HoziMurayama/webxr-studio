import { NextResponse } from "next/server";
import { reindexAll } from "@/lib/rag";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/admin/reindex → rebuild the entire RAG index from current content.
// Individual edits reindex their own rows automatically; this is a manual
// "rebuild everything" button for the dashboard.
export async function POST() {
  try {
    const count = await reindexAll();
    return NextResponse.json({ ok: true, chunks: count });
  } catch (err) {
    console.error("reindex failed", err);
    return NextResponse.json(
      { error: "インデックスの再構築に失敗しました。" },
      { status: 500 },
    );
  }
}
