import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { getCompany, getSiteSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

// ミッションは company.mission（管理画面で編集可）にあるが、ビジョンに対応する
// 項目はスキーマにないため、ここで定数として保持する。
const VISION =
  "テクノロジーの力で、企業と社会の可能性を最大化し、日本を代表するIT企業へ。";

export const metadata: Metadata = {
  title: "会社案内",
  description: "WEB-XR.studioの会社概要。所在地、連絡先、沿革、企業理念をご案内します。",
};

export default async function CompanyPage() {
  const [company, settings] = await Promise.all([getCompany(), getSiteSettings()]);

  // 国税庁 法人番号公表サイトの登記情報。DB に対応する項目がなく、変更も
  // 登記の変更時のみなので、ここで定数として保持する。
  const REGISTRY = {
    corporateNumber: "5020001137850",
    tradeName: "株式会社ＷＥＢ－ＸＲ．ｓｔｕｄｉｏ",
    tradeNameKana: "ウェブエックスアールスタジオ",
    // 令和2年9月25日 = 西暦2020年9月25日
    founded: "2020年9月25日",
  };

  // 登記事項に絞った会社概要。メールアドレスと実績年数（company.stats）は
  // ここには出さない — 前者はフッターと問い合わせページ、後者は他セクションが
  // それぞれ担っており、登記情報の表に混在させない。
  // `href` がある行は外部リンクとして描画する。値が空の行は落とす。
  // `map: true` の行は住所の下に地図も併せて描画する。並び順はこの配列が
  // そのまま表の順序になるので、行の入れ替えはここだけを直せばよい。
  const rows: {
    label: string;
    value: string;
    href?: string;
    map?: boolean;
  }[] = [
    { label: "社名", value: REGISTRY.tradeName },
    { label: "社名（フリガナ）", value: REGISTRY.tradeNameKana },
    {
      label: "法人番号",
      value: REGISTRY.corporateNumber,
      // 国税庁 法人番号公表サイトの変更履歴ページ
      href: `https://www.houjin-bangou.nta.go.jp/henkorireki-johoto.html?selHouzinNo=${REGISTRY.corporateNumber}`,
    },
    { label: "所在地", value: settings?.address ?? "", map: true },
    { label: "電話番号", value: settings?.phone ?? "" },
    { label: "設立", value: REGISTRY.founded },
  ].filter((r) => r.value.trim() !== "");

  return (
    <>
      <PageHero
        en="COMPANY"
        title="会社案内"
        description="会社概要と沿革、私たちが大切にしている考え方をご紹介します。"
        image="/about/fv-company.webp"
      />

      <Section id="profile" align="center" eyebrow="Profile" title="会社概要">
        {rows.length > 0 ? (
          <dl className="mx-auto max-w-3xl divide-y divide-line border-y border-line">
            {rows.map((r) => (
              <div
                key={r.label}
                // ラベル列は最長「社名（フリガナ）」(8文字 ≈ 112px) に合わせた幅。
                className="grid gap-1 py-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6 sm:py-5"
              >
                <dt className="text-sm font-semibold text-ink">{r.label}</dt>
                <dd className="text-base leading-relaxed text-ink-soft">
                  {r.map ? (
                    <>
                      {/* 住所テキストの下に地図を置く。住所は DB の値をそのまま
                          クエリに使うので、管理画面で住所を変えれば地図も追随
                          する。API キー不要の埋め込み。 */}
                      <p>{r.value}</p>
                      <div className="mt-4 aspect-[16/9] w-full overflow-hidden border border-line">
                        <iframe
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(
                            r.value,
                          )}&output=embed&hl=ja&z=17`}
                          title="本店所在地の地図"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="h-full w-full border-0"
                        />
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          r.value,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink underline-offset-4 hover:underline"
                      >
                        Google マップで開く
                        <svg
                          viewBox="0 0 20 20"
                          aria-hidden
                          className="h-3.5 w-3.5 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M7 4h9v9M16 4L5 15" />
                        </svg>
                        <span className="sr-only">（新しいタブで開きます）</span>
                      </a>
                    </>
                  ) : r.href ? (
                    <a
                      href={r.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-accent-ink underline-offset-4 hover:underline"
                    >
                      {r.value}
                      {/* 新しいタブで開くことを示すアイコン。読み上げ用の説明は
                          隣の sr-only テキストが担う。 */}
                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden
                        className="h-3.5 w-3.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 4h9v9M16 4L5 15" />
                      </svg>
                      <span className="sr-only">
                        （国税庁 法人番号公表サイト・新しいタブで開きます）
                      </span>
                    </a>
                  ) : (
                    r.value
                  )}
                </dd>
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

      {/* ビジョンとミッションを対で見せる。ミッションは DB（管理画面で編集可）、
          ビジョンは対応する項目がないためこのページの定数。 */}
      <Section id="philosophy" align="center" eyebrow="Philosophy" title="企業理念">
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
