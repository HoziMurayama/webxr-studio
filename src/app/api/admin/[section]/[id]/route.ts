import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq, getTableColumns } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { getSection } from "@/lib/sections";
import { reindexRow, reindexTable } from "@/lib/rag";
import { publishContentChange } from "@/lib/realtime";

export const runtime = "nodejs";

// PATCH  /api/admin/:section/:id  → update a row (create-or-update for singletons)
// DELETE /api/admin/:section/:id  → delete a row (list sections only)

function idColumn(table: PgTable) {
  return (getTableColumns(table) as Record<string, never>).id;
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

  // Drop the cached render of the public site, then tell open pages to refetch.
  revalidatePath("/", "layout");
  publishContentChange({ section: def.slug, action: "update", id: row?.id });

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

  await db.delete(def.table).where(eq(idColumn(def.table), numId));

  // A delete can shift the index; rebuild just this table's chunks.
  if (def.indexed) {
    await reindexTable(def.tableName);
  }

  revalidatePath("/", "layout");
  publishContentChange({ section: def.slug, action: "delete", id: numId });

  return NextResponse.json({ ok: true });
}
