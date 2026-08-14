import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq, getTableColumns } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { getSection } from "@/lib/sections";
import { reindexRow, reindexTable } from "@/lib/rag";
import { deleteByUrl } from "@/lib/cloudinary";

export const runtime = "nodejs";

// PATCH  /api/admin/:section/:id  → update a row (create-or-update for singletons)
// DELETE /api/admin/:section/:id  → delete a row (list sections only)

function idColumn(table: PgTable) {
  return (getTableColumns(table) as Record<string, never>).id;
}

/**
 * 行が抱えている Cloudinary の URL を全て拾う。
 *
 * 列名を決め打ちにせず値の形で判断する。事例の画像・ギャラリー、
 * お問い合わせの添付と保存先が散っており、列を増やすたびにここを直す
 * のは漏れやすいため。
 */
function collectCloudinaryUrls(row: Record<string, unknown> | undefined) {
  if (!row) return [];
  const urls = new Set<string>();
  const isCloudinary = (v: unknown): v is string =>
    typeof v === "string" && v.includes("res.cloudinary.com");

  for (const value of Object.values(row)) {
    if (isCloudinary(value)) {
      urls.add(value);
      continue;
    }
    // ギャラリーのような [{label, value}] の配列。
    if (Array.isArray(value)) {
      for (const item of value) {
        if (isCloudinary(item)) urls.add(item);
        else if (item && typeof item === "object") {
          for (const inner of Object.values(item as Record<string, unknown>)) {
            if (isCloudinary(inner)) urls.add(inner);
          }
        }
      }
    }
  }
  return [...urls];
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/[section]/[id]">,
) {
  const { section, id } = await ctx.params;
  const def = getSection(section);
  if (!def)
    return NextResponse.json(
      { error: "不明なセクションです。" },
      { status: 404 },
    );

  const numId = Number(id);
  if (!Number.isInteger(numId)) {
    return NextResponse.json({ error: "IDが不正です。" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = def.schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
      },
      { status: 400 },
    );
  }

  const values = {
    ...(parsed.data as Record<string, unknown>),
    updatedAt: new Date(),
  };

  // Singletons are upserted by id so the row always exists after save.
  let row: { id: number } | undefined;
  if (def.singleton) {
    const existing = (await db
      .select()
      .from(def.table)
      .where(eq(idColumn(def.table), numId))
      .limit(1)) as Array<{ id: number }>;
    if (existing.length === 0) {
      const inserted = (await db
        .insert(def.table)
        .values({ id: numId, ...values })
        .returning()) as Array<{ id: number }>;
      row = inserted[0];
    } else {
      const updated = (await db
        .update(def.table)
        .set(values)
        .where(eq(idColumn(def.table), numId))
        .returning()) as Array<{ id: number }>;
      row = updated[0];
    }
  } else {
    const updated = (await db
      .update(def.table)
      .set(values)
      .where(eq(idColumn(def.table), numId))
      .returning()) as Array<{ id: number }>;
    row = updated[0];
    if (!row)
      return NextResponse.json(
        { error: "対象が見つかりません。" },
        { status: 404 },
      );
  }

  if (def.indexed && row?.id != null) {
    await reindexRow(def.tableName, row.id);
  }

  // 公開サイトのキャッシュを捨てる。次のアクセスで新しい内容が出る。
  revalidatePath("/", "layout");

  return NextResponse.json({ row });
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/admin/[section]/[id]">,
) {
  const { section, id } = await ctx.params;
  const def = getSection(section);
  if (!def)
    return NextResponse.json(
      { error: "不明なセクションです。" },
      { status: 404 },
    );
  if (def.singleton) {
    return NextResponse.json(
      { error: "このセクションは削除できません。" },
      { status: 400 },
    );
  }

  const numId = Number(id);
  if (!Number.isInteger(numId)) {
    return NextResponse.json({ error: "IDが不正です。" }, { status: 400 });
  }

  // 消す前に、その行が抱えている Cloudinary の URL を控える。行を消して
  // からでは辿れず、使われないファイルが溜まり続けるため。
  const [before] = await db
    .select()
    .from(def.table)
    .where(eq(idColumn(def.table), numId))
    .limit(1);

  await db.delete(def.table).where(eq(idColumn(def.table), numId));

  // 実体の削除は行の削除に付随する後始末。失敗しても 200 を返す
  // （DB からは既に消えており、呼び出し側にできることがない）。
  for (const url of collectCloudinaryUrls(before)) {
    await deleteByUrl(url);
  }

  // A delete can shift the index; rebuild just this table's chunks.
  if (def.indexed) {
    await reindexTable(def.tableName);
  }

  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true });
}
