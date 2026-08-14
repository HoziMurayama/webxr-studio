import { NextResponse } from "next/server";
import { sql as raw } from "drizzle-orm";
import { db } from "@/db";
import { contacts } from "@/db/schema";

// GET /api/admin/contacts/check → 新着の有無だけを返す。
// 認証は proxy.ts が /api/admin/* 全体に掛けている。
//
// 接続を保つ SSE をやめ、管理画面を見ている間だけ呼ぶ形にした。
// 常時接続は待っている間もサーバーの実行時間として課金され、
// 何も起きていない時間帯の分がそのまま積み上がるため。
//
// 返すのは最大 id と件数の 2 つだけ。一覧そのものは、変化が
// あったときにブラウザ側が改めて取りに行く。

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [row] = await db
    .select({
      maxId: raw<number>`coalesce(max(${contacts.id}), 0)::int`,
      total: raw<number>`count(*)::int`,
    })
    .from(contacts);

  return NextResponse.json(
    { maxId: row?.maxId ?? 0, total: row?.total ?? 0 },
    // 経路上のどこにも残さない。古い値を掴むと新着に気づけない。
    { headers: { "Cache-Control": "no-store" } },
  );
}
