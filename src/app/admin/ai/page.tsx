import { sql } from "drizzle-orm";
import { db } from "@/db";
import { embeddings } from "@/db/schema";
import { AdminShell } from "@/components/admin/AdminShell";
import { ReindexPanel } from "@/components/admin/ReindexPanel";

export const dynamic = "force-dynamic";

export default async function AdminAiPage() {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(embeddings);
  const chunks = row?.n ?? 0;

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">AIインデックス</h1>
        <p className="mt-1 text-sm text-muted">
          AIアシスタントは、サイトのコンテンツから作られた知識インデックス（RAG）をもとに回答します。
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">現在のインデックス</p>
            <p className="mt-1 text-3xl font-bold text-ink">{chunks} チャンク</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          コンテンツを編集・追加・削除すると、該当箇所のインデックスは自動的に更新されます。
          全体を作り直したい場合は、下のボタンから再構築できます。
        </p>
        <div className="mt-5">
          <ReindexPanel />
        </div>
      </div>
    </AdminShell>
  );
}
