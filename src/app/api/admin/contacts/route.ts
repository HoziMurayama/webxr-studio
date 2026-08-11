import { NextResponse } from "next/server";
import { desc, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { deleteByUrl } from "@/lib/cloudinary";

export const runtime = "nodejs";
// 全件削除では添付の数だけ Cloudinary を呼ぶ。既定の時間では
// 足りないことがあるので伸ばしておく。
export const maxDuration = 60;

// GET /api/admin/contacts → list submissions, newest first.
export async function GET() {
  const rows = await db
    .select()
    .from(contacts)
    .orderBy(desc(contacts.createdAt));
  return NextResponse.json({ rows });
}

/**
 * まとめて削除する指定。
 *
 * `all` は「いま入っているものすべて」。件数を数えて id を並べ直すと、
 * その間に届いた分を取りこぼすか、逆に巻き込むかが決まらないため、
 * 意図をそのまま受け取って条件なしで消す。
 */
const deleteSchema = z.union([
  z.object({ ids: z.array(z.number().int()).min(1).max(500) }),
  z.object({ all: z.literal(true) }),
]);

// DELETE /api/admin/contacts → 複数、または全件を消す
export async function DELETE(request: Request) {
  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "削除する対象が指定されていません。" },
      { status: 400 },
    );
  }
  // 添付の実体も消す。行だけ消すと Cloudinary に使われないファイルが
  // 残り続けるため、URL は行を消す前に控えておく。
  const columns = { id: contacts.id, attachmentUrl: contacts.attachmentUrl };
  const targets =
    "all" in parsed.data
      ? await db.select(columns).from(contacts)
      : await db
          .select(columns)
          .from(contacts)
          .where(inArray(contacts.id, parsed.data.ids));

  if (targets.length === 0) {
    return NextResponse.json({ ok: true, deleted: 0 });
  }

  // 実際に在った行だけを消す。存在しない id を混ぜられても、
  // 消える範囲は必ずこの一覧に収まる。
  const ids = targets.map((t) => t.id);
  await db.delete(contacts).where(inArray(contacts.id, ids));

  // 添付は行を消した後にまとめて片付ける。ここで失敗しても一覧からは
  // 消えているので、削除そのものは成功として返す。
  const urls = targets.map((t) => t.attachmentUrl).filter(Boolean) as string[];
  const results = await Promise.allSettled(urls.map((u) => deleteByUrl(u)));
  const failed = results.filter((r) => r.status === "rejected").length;
  if (failed > 0) {
    console.error(`attachment delete failed for ${failed}/${urls.length} rows`);
  }

  return NextResponse.json({ ok: true, deleted: ids.length });
}
