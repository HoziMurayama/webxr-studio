import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { deleteByUrl } from "@/lib/cloudinary";

export const runtime = "nodejs";

const patchSchema = z.object({ handled: z.boolean() });

// PATCH /api/admin/contacts/:id  → toggle handled flag
export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/contacts/[id]">,
) {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) {
    return NextResponse.json({ error: "IDが不正です。" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "入力が不正です。" }, { status: 400 });
  }
  const [row] = await db
    .update(contacts)
    .set({ handled: parsed.data.handled })
    .where(eq(contacts.id, numId))
    .returning();
  if (!row)
    return NextResponse.json(
      { error: "対象が見つかりません。" },
      { status: 404 },
    );
  return NextResponse.json({ row });
}

// DELETE /api/admin/contacts/:id → remove a submission
export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/admin/contacts/[id]">,
) {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) {
    return NextResponse.json({ error: "IDが不正です。" }, { status: 400 });
  }
  // 添付の実体も消す。行だけ消すと Cloudinary に使われないファイルが
  // 残り続けるため。URL は行を消す前に控えておく。
  const [before] = await db
    .select({ attachmentUrl: contacts.attachmentUrl })
    .from(contacts)
    .where(eq(contacts.id, numId))
    .limit(1);

  await db.delete(contacts).where(eq(contacts.id, numId));

  if (before?.attachmentUrl) {
    await deleteByUrl(before.attachmentUrl);
  }

  return NextResponse.json({ ok: true });
}
