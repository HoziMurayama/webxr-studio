import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { db } from "@/db";
import { services, portfolio, reviews, team, faqs, contacts } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

export const dynamic = "force-dynamic";

async function count(table: PgTable) {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(table);
  return row?.n ?? 0;
}

export default async function AdminDashboard() {
  const [nServices, nPortfolio, nReviews, nTeam, nFaqs, nContacts, nUnhandled] =
    await Promise.all([
      count(services),
      count(portfolio),
      count(reviews),
      count(team),
      count(faqs),
      count(contacts),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(contacts)
        .where(eq(contacts.handled, false))
        .then((r) => r[0]?.n ?? 0),
    ]);

  const tiles = [
    { label: "サービス", value: nServices, href: "/admin/services" },
    { label: "制作実績", value: nPortfolio, href: "/admin/portfolio" },
    { label: "クライアントの声", value: nReviews, href: "/admin/reviews" },
    { label: "チーム", value: nTeam, href: "/admin/team" },
    { label: "FAQ", value: nFaqs, href: "/admin/faqs" },
    { label: "お問い合わせ", value: nContacts, href: "/admin/contacts", badge: nUnhandled },
  ];

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">ダッシュボード</h1>
        <p className="mt-1 text-sm text-muted">
          サイトのすべてのコンテンツをここから編集できます。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="relative rounded-2xl border border-line bg-card p-5 transition-shadow hover:shadow-md"
          >
            {!!t.badge && t.badge > 0 && (
              <span className="absolute right-4 top-4 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
                未対応 {t.badge}
              </span>
            )}
            <p className="text-sm text-muted">{t.label}</p>
            <p className="mt-2 text-3xl font-bold text-ink">{t.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-card p-6">
        <h2 className="text-base font-semibold text-ink">はじめに</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted">
          <li>左メニューから各セクションのコンテンツを追加・編集・削除できます。</li>
          <li>編集内容は公開サイトに即時反映されます。</li>
          <li>
            コンテンツを更新すると、AIアシスタントの知識（RAGインデックス）も自動で更新されます。
          </li>
        </ul>
      </div>
    </AdminShell>
  );
}
