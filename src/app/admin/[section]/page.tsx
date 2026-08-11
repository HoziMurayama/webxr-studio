import { notFound } from "next/navigation";
import { asc, getTableColumns } from "drizzle-orm";
import { db } from "@/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { getSection } from "@/lib/sections";

export const dynamic = "force-dynamic";

// Reserved slugs handled by their own dedicated routes, not this generic editor.
const RESERVED = new Set(["login", "contacts", "ai"]);

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (RESERVED.has(section)) notFound();

  const def = getSection(section);
  if (!def) notFound();

  // Load rows in display order. `order`/`id` columns exist on all our tables.
  const cols = getTableColumns(def.table) as Record<string, never>;
  const orderBy = [];
  if (!def.singleton && cols.order) orderBy.push(asc(cols.order));
  if (cols.id) orderBy.push(asc(cols.id));

  const rows = (await db
    .select()
    .from(def.table)
    .orderBy(...orderBy)) as Array<Record<string, unknown> & { id?: number }>;

  return (
    <AdminShell>
      <SectionEditor
        slug={def.slug}
        label={def.label}
        fields={def.fields}
        singleton={def.singleton}
        initialRows={rows}
      />
    </AdminShell>
  );
}
