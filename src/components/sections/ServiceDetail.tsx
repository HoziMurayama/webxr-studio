import Link from "next/link";
import { Section } from "@/components/ui/Section";

/**
 * SERVICE — the four development domains in depth.
 *
 * Editorial copy rather than DB-driven, so it lives here as a typed constant;
 * move it to a table if it ever needs to be admin-editable. The DB-backed
 * `Services` section still drives the short summary on the top page.
 */

type Domain = {
  en: string;
  /** Short verb-phrase headline, e.g.「Webで「届ける」」. */
  title: string;
  lead: string;
  /** Flat list of offerings. */
  services: string[];
  /** Industry-specific project examples. */
  industries: { name: string; items: string[] }[];
  /** Decorative banner behind the blue header band. */
  image: string;
  /**
   * お問い合わせフォームの「対応サービス」に渡す値。
   * `Contact` の SERVICES と文字列が一致している必要がある。
   */
  formService: string;
};

const DOMAINS: Domain[] = [
  {
    en: "WEB DEVELOPMENT",
    image: "/team/web.svg",
    formService: "Web制作",
    title: "Webで「届ける」",
    lead: "企業やサービスの魅力を伝え、集客・販売・採用・顧客との接点を生み出すWebサービスを開発します。",
    services: [
      "コーポレートサイト",
      "サービスサイト",
      "採用サイト",
      "ランディングページ（LP）",
      "ECサイト",
      "ポータルサイト",
      "予約・問い合わせサイト",
      "会員サイト・マイページ",
      "WordPress・CMS構築",
      "Shopify・EC-CUBE・WooCommerce",
      "SEO・アクセス解析",
      "Web広告・マーケティング",
      "CRM・外部サービス連携",
      "AIチャットボット導入",
    ],
    industries: [
      {
        name: "医療・ヘルスケア",
        items: [
          "クリニック・医院サイト",
          "医療サービスLP",
          "診療・予約サイト",
          "医療機関向けSEOサイト",
        ],
      },
      {
        name: "建築・建設",
        items: [
          "建設会社・工務店サイト",
          "施工事例サイト",
          "住宅・建築商品LP",
          "3D・VRビジュアライゼーション",
        ],
      },
      {
        name: "不動産",
        items: [
          "不動産会社サイト",
          "物件検索ポータル",
          "物件販売LP",
          "内見予約サイト",
        ],
      },
      {
        name: "教育",
        items: [
          "学校・スクールサイト",
          "オンライン講座サイト",
          "LMS・会員サイト",
          "教育サービスLP",
        ],
      },
      {
        name: "人材・採用",
        items: ["採用サイト", "求人サイト", "採用LP", "応募・エントリーサイト"],
      },
      {
        name: "小売・EC",
        items: [
          "Shopify",
          "EC-CUBE",
          "WooCommerce",
          "ブランドEC・キャンペーンサイト",
        ],
      },
      {
        name: "ホテル・旅行",
        items: [
          "ホテル公式サイト",
          "宿泊予約サイト",
          "観光情報サイト",
          "多言語Webサイト",
        ],
      },
    ],
  },
  {
    en: "SYSTEM DEVELOPMENT",
    image: "/team/system.svg",
    formService: "システム開発",
    title: "システムで「支える」",
    lead: "企業の業務を効率化し、顧客・商品・データ・業務プロセスをつなぐ業務システムを開発します。",
    services: [
      "CRM・顧客管理システム",
      "ERP・基幹システム",
      "業務管理システム",
      "予約・受付システム",
      "会員管理システム",
      "在庫・商品管理システム",
      "生産管理システム",
      "受発注管理システム",
      "ワークフロー・申請システム",
      "管理画面・ダッシュボード",
      "API開発・外部サービス連携",
      "データベース設計・開発",
      "BI・データ分析",
      "業務自動化",
    ],
    industries: [
      {
        name: "医療・ヘルスケア",
        items: ["患者・顧客管理", "予約管理", "医療機関向けCRM", "問い合わせ管理"],
      },
      {
        name: "建築・建設",
        items: ["建築・施工管理", "顧客管理CRM", "見積・案件管理", "工程・進捗管理"],
      },
      {
        name: "不動産",
        items: ["物件管理システム", "顧客管理CRM", "内見予約管理", "契約・営業管理"],
      },
      {
        name: "教育",
        items: ["LMS", "生徒・受講者管理", "講座・教材管理", "出席・成績管理"],
      },
      {
        name: "人材・採用",
        items: ["ATS・採用管理", "求職者管理", "求人管理", "AIマッチングシステム"],
      },
      {
        name: "製造業",
        items: ["ERP", "生産管理", "在庫管理", "品質管理", "BIダッシュボード"],
      },
      {
        name: "物流・運輸",
        items: ["配送管理", "車両・フリート管理", "荷物追跡", "物流ダッシュボード"],
      },
    ],
  },
  {
    en: "APP DEVELOPMENT",
    image: "/team/app.svg",
    formService: "アプリ開発",
    title: "アプリで「つなぐ」",
    lead: "ユーザーとサービス、企業と顧客、現場と管理者をつなぐスマートフォン・モバイルアプリを開発します。",
    services: [
      "iOSアプリ",
      "Androidアプリ",
      "クロスプラットフォームアプリ",
      "業務用モバイルアプリ",
      "会員アプリ",
      "EC・ショッピングアプリ",
      "予約・Bookingアプリ",
      "マッチングアプリ",
      "SNS・コミュニティアプリ",
      "GPS・位置情報アプリ",
      "Push通知",
      "決済・会員システム連携",
      "Web・API・CRM連携",
    ],
    industries: [
      {
        name: "医療・ヘルスケア",
        items: [
          "健康管理アプリ",
          "予約アプリ",
          "患者向けアプリ",
          "医療スタッフ向け業務アプリ",
        ],
      },
      {
        name: "不動産",
        items: [
          "物件検索アプリ",
          "内見予約アプリ",
          "入居者向けアプリ",
          "不動産営業支援アプリ",
        ],
      },
      {
        name: "教育",
        items: [
          "学習アプリ",
          "オンライン授業アプリ",
          "学生・講師向けアプリ",
          "AI学習アプリ",
        ],
      },
      {
        name: "人材・採用",
        items: [
          "求人検索アプリ",
          "求職者向けアプリ",
          "採用管理アプリ",
          "AI求人マッチングアプリ",
        ],
      },
      {
        name: "小売・EC",
        items: [
          "ECアプリ",
          "会員・ポイントアプリ",
          "ショッピングアプリ",
          "店舗連携アプリ",
        ],
      },
      {
        name: "フィットネス・スポーツ",
        items: [
          "フィットネスアプリ",
          "トレーニング管理アプリ",
          "会員アプリ",
          "スポーツチーム管理アプリ",
        ],
      },
      {
        name: "ホテル・旅行",
        items: [
          "ホテル予約アプリ",
          "旅行予約アプリ",
          "観光ガイドアプリ",
          "デジタルチェックインアプリ",
        ],
      },
      {
        name: "物流・運輸",
        items: [
          "配送管理アプリ",
          "ドライバーアプリ",
          "荷物追跡アプリ",
          "車両管理アプリ",
        ],
      },
    ],
  },
  {
    en: "AI DEVELOPMENT",
    image: "/team/ai.svg",
    formService: "AI開発",
    title: "AIで「進化させる」",
    lead: "生成AI・機械学習・データ分析・AI自動化を既存のWeb・システム・アプリに組み込み、企業の業務とサービスをさらに進化させます。",
    services: [
      "AIチャットボット",
      "AIアシスタント",
      "AIエージェント",
      "生成AIシステム",
      "RAG・社内ナレッジ検索",
      "AIレコメンド",
      "AIマッチング",
      "AI画像認識・画像解析",
      "OCR・文書解析",
      "AIデータ分析",
      "需要予測・予測分析",
      "AI業務自動化",
      "AI × CRM / ERP",
      "AI × Web / App",
    ],
    industries: [
      {
        name: "医療・ヘルスケア",
        items: [
          "AI問い合わせ対応",
          "医療・健康相談AI",
          "医療文書の要約",
          "FAQ・ナレッジ検索AI",
        ],
      },
      {
        name: "不動産",
        items: [
          "AI物件検索",
          "物件レコメンド",
          "AI顧客マッチング",
          "物件情報自動生成",
        ],
      },
      {
        name: "教育",
        items: ["AIチューター", "AI講師", "教材生成AI", "個別最適化学習"],
      },
      {
        name: "人材・採用",
        items: [
          "AI求人マッチング",
          "履歴書・職務経歴書解析",
          "AI採用アシスタント",
          "求人文章生成AI",
        ],
      },
      {
        name: "小売・EC",
        items: [
          "AI商品レコメンド",
          "AI接客チャット",
          "商品説明自動生成",
          "需要予測・購買分析",
        ],
      },
      {
        name: "製造業",
        items: ["AI品質検査", "画像認識", "設備異常検知", "生産・需要予測"],
      },
      {
        name: "物流・運輸",
        items: [
          "配送ルート最適化",
          "需要予測",
          "物流データ分析",
          "AI業務自動化",
        ],
      },
    ],
  },
];

/** The four domains summarised for the closing one-stop block. */
const ONE_STOP = [
  { en: "Web", role: "集客・情報発信・顧客接点" },
  { en: "System", role: "業務管理・データ・業務効率化" },
  { en: "App", role: "顧客・社員・現場との接点" },
  { en: "AI", role: "自動化・分析・予測・新しい価値" },
];

/** Checkmark used before every list item. */
function Tick() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className="mt-[0.15em] h-4 w-4 shrink-0 text-accent"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

export function ServiceDetail({
  /** /service では PageHero が同じ見出しを出すため抑制する。 */
  showHeader = false,
}: {
  showHeader?: boolean;
} = {}) {
  return (
    <>
      <Section
        id="services"
        align="center"
        eyebrow={showHeader ? "SERVICE" : undefined}
        title={
          showHeader ? "サービス" : undefined
        }
      >
        <div className="mx-auto max-w-3xl space-y-5 text-left text-base leading-relaxed text-ink-soft sm:text-lg">
          <p>
            株式会社WEB-XR.studioは、Web制作・システム開発・アプリ開発・AI開発の4つの専門チームを擁しています。
          </p>
          <p>
            Webサイトの制作から業務システム、スマートフォンアプリ、AIを活用した業務効率化まで、企業の課題や事業フェーズに合わせて最適なテクノロジーを組み合わせ、企画・設計・開発・運用まで一貫してサポートします。
          </p>
        </div>

        {/* カードだけ Section の max-w-6xl を超えて広げる。青帯が縦に伸びすぎ
            ないよう、右カラムに業界カード3列ぶんの幅を確保するため。 */}
        <div className="mt-16 space-y-16 text-left xl:-mx-[7rem] 2xl:-mx-[11rem]">
          {DOMAINS.map((d) => (
            <article
              key={d.en}
              // 左に青の見出し帯、右に内容。狭い画面では縦積みに戻る。
              // `items-stretch` で青帯が右カラムの高さいっぱいまで伸びる。
              className="grid items-stretch border border-line bg-card lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)]"
            >
              {/* 見出し帯。フッターと同じ青を敷き、文字は白に反転。背景に領域ごとの
                  バナーを低い不透明度で重ねる（ABOUT US のチームカードと同じ手法）。
                  内容は上下・左右とも中央に置く。 */}
              <header className="relative isolate flex flex-col items-center justify-center bg-chrome p-8 text-center sm:p-10">
                <div
                  aria-hidden
                  style={{ backgroundImage: `url(${d.image})` }}
                  className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-25 mix-blend-luminosity"
                />
                <p className="text-base font-bold tracking-[0.18em] text-white/90 sm:text-lg">
                  {d.en}
                </p>
                <h3 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {d.title}
                </h3>
                <p className="mt-5 text-lg leading-relaxed text-white sm:text-xl">
                  {d.lead}
                </p>

                {/* 青帯の中に置くので、白地に青文字で最大の対比をとる。
                    遷移先で対応サービスが選択済みになる。 */}
                <Link
                  href={`/contact?service=${encodeURIComponent(d.formService)}#service`}
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold tracking-tight text-chrome shadow-lg transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 sm:w-auto sm:text-lg"
                >
                  このサービスを相談する
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden
                    className="h-5 w-5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 10h11M10 5l5 5-5 5" />
                  </svg>
                </Link>
              </header>

              <div className="space-y-10 p-6 sm:p-8">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    対応サービス
                  </h4>
                  <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
                    {d.services.map((s) => (
                      <li
                        key={s}
                        className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft"
                      >
                        <Tick />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    対応プロジェクト
                  </h4>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {d.industries.map((ind) => (
                      <div key={ind.name} className="border border-line bg-surface p-5">
                        <p className="text-sm font-bold tracking-tight text-accent-ink">
                          {ind.name}
                        </p>
                        <ul className="mt-3 space-y-1.5">
                          {ind.items.map((it) => (
                            <li
                              key={it}
                              className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft"
                            >
                              <Tick />
                              {it}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="one-stop"
        tone="muted"
        align="center"
        eyebrow="ONE-STOP DEVELOPMENT"
        title="Web × System × App × AI"
      >
        <div className="mx-auto max-w-3xl space-y-5 text-left text-base leading-relaxed text-ink-soft sm:text-lg">
          <p>私たちは、4つのサービスを個別に提供するだけではありません。</p>
          <p>
            Webサイトを入口として、業務システム、スマートフォンアプリ、AIまでを一つのプロジェクトとして設計・開発できます。
          </p>
        </div>

        <div className="mt-12 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          {ONE_STOP.map((o) => (
            <div key={o.en} className="border border-line bg-card p-6">
              <p className="text-xl font-black tracking-tight text-accent-ink">
                {o.en}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                → {o.role}
              </p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-3xl text-left text-base leading-relaxed text-ink-soft sm:text-lg">
          企業の「やりたいこと」を起点に、必要な技術を組み合わせ、最適なデジタルソリューションを提供します。
        </p>
      </Section>
    </>
  );
}
