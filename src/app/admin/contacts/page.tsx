import { desc } from "drizzle-orm";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContactsTable } from "@/components/admin/ContactsTable";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage() {
  const rows = await db
    .select()
    .from(contacts)
    .orderBy(desc(contacts.createdAt));
  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">お問い合わせ</h1>
        <p className="mt-1 text-sm text-muted">
          サイトから届いたお問い合わせの一覧です。対応済みのマークや削除ができます。
        </p>
      </div>
      <ContactsTable initialRows={rows} />
    </AdminShell>
  );
}
