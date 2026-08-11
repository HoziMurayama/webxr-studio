import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { asc, getTableColumns } from "drizzle-orm";
import { db } from "@/db";
import { getSection } from "@/lib/sections";
import { reindexRow } from "@/lib/rag";
import { publishContentChange } from "@/lib/realtime";

export const runtime = "nodejs";

// GET  /api/admin/:section        → list rows (singletons return their one row)
// POST /api/admin/:section        → create a row (list sections only)
// Auth is enforced by proxy.ts for the whole /api/admin/* tree.

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/admin/[section]">,
) {
  const { section } = await ctx.params;
  const def = getSection(section);
  if (!def)
    return NextResponse.json(
      { error: "不明なセクションです。" },
      { status: 404 },
    );

  // `order` exists only on list sections; fall back to id ordering otherwise.
  const cols = getTableColumns(def.table) as Record<string, never>;
  const orderBy = [];
  if (!def.singleton && cols.order) orderBy.push(asc(cols.order));
  if (cols.id) orderBy.push(asc(cols.id));

  const rows = await db
    .select()
    .from(def.table)
    .orderBy(...orderBy);
  return NextResponse.json({ rows });
}

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/[section]">,
) {
  const { section } = await ctx.params;
  const def = getSection(section);
  if (!def)
    return NextResponse.json(
      { error: "不明なセクションです。" },
      { status: 404 },
    );
  if (def.singleton) {
    return NextResponse.json(
      { error: "このセクションは単一レコードのため作成できません。" },
      { status: 400 },
    );
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

  const inserted = (await db
    .insert(def.table)
    .values(parsed.data as Record<string, unknown>)
    .returning()) as Array<{ id: number }>;
  const row = inserted[0];

  if (def.indexed && row?.id != null) {
    await reindexRow(def.tableName, row.id);
  }

  revalidatePath("/", "layout");
  publishContentChange({ section: def.slug, action: "create", id: row?.id });

  return NextResponse.json({ row }, { status: 201 });
}
