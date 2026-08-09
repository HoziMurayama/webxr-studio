import { Section } from "@/components/ui/Section";
import { getSiteSettings } from "@/lib/content";
import { SectionLink } from "@/components/ui/SectionLink";

/**
 * 会社概要の表。トップページと /company が共有する。
 *
 * 登記事項に絞った内容で、メールアドレスと実績年数（company.stats）は出さない
 * — 前者はフッターと問い合わせページ、後者は他セクションがそれぞれ担っており、
 * 登記情報の表に混在させない。
 */

// 国税庁 法人番号公表サイトの登記情報。DB に対応する項目がなく、変更も
// 登記の変更時のみなので、定数として保持する。
const REGISTRY = {
  corporateNumber: "5020001137850",
  tradeName: "株式会社ＷＥＢ－ＸＲ．ｓｔｕｄｉｏ",
  tradeNameKana: "ウェブエックスアールスタジオ",
  // 令和2年9月25日 = 西暦2020年9月25日
  founded: "2020年9月25日",
};

/** 新しいタブで開くことを示すアイコン。説明は隣の sr-only テキストが担う。 */
function ExternalIcon() {
  return (
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
  );
}

export async function CompanyProfile({
  /** トップページでは地図を出さず、表だけを見せる。 */
  showMap = true,
  /** セクション見出し。トップページはサイト共通の「COMPANY / 会社案内」。 */
  eyebrow = "Profile",
  title = "会社概要",
  description,
  tone = "default",
  /** /company への導線。トップページでのみ出す（あちらでは自分自身）。 */
  showPageLink = false,
}: {
  showMap?: boolean;
  eyebrow?: string;
  title?: string;
  description?: string;
  tone?: "default" | "muted";
  showPageLink?: boolean;
} = {}) {
  const settings = await getSiteSettings();

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
    { label: "所在地", value: settings?.address ?? "", map: showMap },
    { label: "電話番号", value: settings?.phone ?? "" },
    { label: "設立", value: REGISTRY.founded },
  ].filter((r) => r.value.trim() !== "");

  return (
    <Section
      id="profile"
      align="center"
      tone={tone}
      eyebrow={eyebrow}
      title={title}
      description={description}
    >
      {rows.length > 0 ? (
        <dl className="mx-auto max-w-3xl divide-y divide-line border-y border-line">
          {rows.map((r) => (
            <div
              key={r.label}
              // ラベル列は最長「社名（フリガナ）」(8文字 ≈ 112px) に合わせた幅。
              className="grid gap-1 py-4 text-left sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6 sm:py-5"
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
                      <ExternalIcon />
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
                    <ExternalIcon />
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

      {showPageLink && (
        <SectionLink href="/company">会社案内を詳しく見る</SectionLink>
      )}
    </Section>
  );
}
