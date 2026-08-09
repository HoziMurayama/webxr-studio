import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { CompanyHistory } from "@/components/sections/CompanyHistory";
import { CompanyProfile } from "@/components/sections/CompanyProfile";
import { getCompany } from "@/lib/content";

export const dynamic = "force-dynamic";

// ミッションは company.mission（管理画面で編集可）にあるが、ビジョンに対応する
// 項目はスキーマにないため、ここで定数として保持する。
const VISION =
  "テクノロジーの力で、企業と社会の可能性を最大化し、日本を代表するIT企業へ。";

export const metadata: Metadata = {
  title: "会社案内",
  description:
    "WEB-XR.studioの会社概要。所在地、連絡先、沿革、企業理念をご案内します。",
};

export default async function CompanyPage() {
  const company = await getCompany();

  return (
    <>
      <PageHero
        en="COMPANY"
        title="会社案内"
        description="会社概要と沿革、私たちが大切にしている考え方をご紹介します。"
        image="/about/fv-company.webp"
      />

      <CompanyProfile />

      <CompanyHistory />

      {/* ビジョンとミッションを対で見せる。ミッションは DB（管理画面で編集可）、
          ビジョンは対応する項目がないためこのページの定数。 */}
      <Section
        id="philosophy"
        align="center"
        eyebrow="Philosophy"
        title="企業理念"
      >
        <div className="mx-auto grid max-w-5xl gap-6 text-left md:grid-cols-2">
          <div className="border border-line bg-card p-8 sm:p-10">
            <p className="text-sm font-bold tracking-[0.18em] text-accent-ink">
              VISION
            </p>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-ink sm:text-2xl">
              ビジョン
            </h3>
            <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
              {VISION}
            </p>
          </div>

          {company?.mission && (
            <div className="border border-line bg-card p-8 sm:p-10">
              <p className="text-sm font-bold tracking-[0.18em] text-accent-ink">
                MISSION
              </p>
              <h3 className="mt-2 text-xl font-bold tracking-tight text-ink sm:text-2xl">
                ミッション
              </h3>
              <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-ink-soft sm:text-lg">
                {company.mission}
              </p>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
