import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { getCompany, getSiteSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "会社案内",
  description: "WEB-XR.STUDIOの会社概要。所在地、連絡先、沿革、企業理念をご案内します。",
};

export default async function CompanyPage() {
  const [company, settings] = await Promise.all([getCompany(), getSiteSettings()]);

  // A formal 会社概要 table, assembled from whichever fields are populated —
  // blank rows are dropped rather than rendered empty.
  const rows: { label: string; value: string }[] = [
    { label: "会社名", value: company?.name ?? "" },
    { label: "所在地", value: settings?.address ?? "" },
    { label: "電話番号", value: settings?.phone ?? "" },
    { label: "メール", value: settings?.contactEmail ?? "" },
    ...(company?.stats ?? []),
  ].filter((r) => r.value.trim() !== "");

  return (
    <>
      <PageHero
        en="COMPANY"
        title="会社案内"
        description="会社概要と沿革、私たちが大切にしている考え方をご紹介します。"
      />

      <Section id="profile" align="center" eyebrow="Profile" title="会社概要">
        {rows.length > 0 ? (
          <dl className="mx-auto max-w-3xl divide-y divide-line border-y border-line">
            {rows.map((r) => (
              <div
                key={r.label}
                className="grid gap-1 py-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6 sm:py-5"
              >
                <dt className="text-sm font-semibold text-ink">{r.label}</dt>
                <dd className="text-base leading-relaxed text-ink-soft">{r.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mx-auto max-w-3xl text-center text-sm text-muted">
            会社情報は管理画面から登録できます。
          </p>
        )}
      </Section>

      {company?.history && (
        <Section id="history" tone="muted" align="center" eyebrow="History" title="沿革">
          <p className="mx-auto max-w-3xl whitespace-pre-line text-base leading-relaxed text-ink-soft">
            {company.history}
          </p>
        </Section>
      )}

      {company?.mission && (
        <Section id="mission" align="center" eyebrow="Mission" title="企業理念">
          <p className="mx-auto max-w-3xl whitespace-pre-line text-base leading-relaxed text-ink-soft">
            {company.mission}
          </p>
        </Section>
      )}
    </>
  );
}
