import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { TechChip } from "@/components/ui/TechIcon";
import { cn } from "@/lib/utils";

/**
 * ABOUT US — an intro statement, the four specialist teams, and a closing
 * summary. The team content is editorial copy rather than DB-driven, so it
 * lives here as a typed constant; move it to a table if it ever needs to be
 * admin-editable.
 */

type Team = {
  no: string;
  en: string;
  ja: string;
  /** One-line statement of purpose. */
  mission: string;
  /** Team introduction paragraph. */
  intro: string;
  /** Industries the team works across. */
  industries: string[];
  /** Concrete services offered. */
  services: string[];
  /** Technologies, rendered as chips with brand logos where available. */
  stack: string[];
  /** Decorative background for the card's header band. */
  image: string;
};

const TEAMS: Team[] = [
  {
    no: "01",
    en: "Web Production Team",
    image: "/team/web.svg",
    ja: "Web制作チーム",
    mission: "企業の想いをカタチにし、成果につながるWebサイトを創造します。",
    intro:
      "私たちのWeb制作チームは、企業のブランド価値を最大限に引き出すWebサイトを企画・制作しています。コーポレートサイトや採用サイト、ランディングページ、ECサイトまで幅広く対応し、デザイン性・ユーザビリティ・SEOを兼ね備えた高品質なWebサイトをご提供します。",
    industries: [
      "コーポレート",
      "EC・小売",
      "医療・クリニック",
      "教育",
      "不動産",
      "飲食",
      "製造業",
      "スタートアップ",
    ],
    services: [
      "コーポレートサイト制作",
      "ブランドサイト制作",
      "ランディングページ制作",
      "ECサイト制作",
      "WordPress構築",
      "Shopify構築",
      "UI/UXデザイン",
      "SEO対策",
      "Webサイト保守・運用",
    ],
    stack: [
      "HTML5",
      "CSS3",
      "SCSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Vue.js",
      "Nuxt.js",
      "WordPress",
      "Shopify",
      "Webflow",
      "STUDIO",
      "Figma",
      "Adobe XD",
    ],
  },
  {
    no: "02",
    en: "System Development Team",
    image: "/team/system.svg",
    ja: "システム開発チーム",
    mission: "企業の業務をデジタルの力で最適化し、持続的な成長を支えます。",
    intro:
      "業務システムからクラウドサービスまで、お客様の業務課題に合わせた最適なシステムを設計・開発します。拡張性・保守性・セキュリティを重視し、長く安心してご利用いただけるシステムをご提供します。",
    industries: [
      "製造業",
      "医療",
      "建設",
      "物流",
      "教育",
      "金融",
      "小売",
      "SaaS",
    ],
    services: [
      "業務システム開発",
      "販売管理システム",
      "在庫管理システム",
      "会員管理システム",
      "CRM・ERP開発",
      "API開発",
      "クラウドシステム開発",
      "DX支援",
    ],
    stack: [
      "PHP",
      "Laravel",
      "Java",
      "Spring Boot",
      "C#",
      ".NET",
      "Python",
      "Django",
      "Ruby on Rails",
      "Node.js",
      "NestJS",
      "PostgreSQL",
      "MySQL",
      "Redis",
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
      "Google Cloud",
    ],
  },
  {
    no: "03",
    en: "App Development Team",
    image: "/team/app.svg",
    ja: "アプリ開発チーム",
    mission: "人とテクノロジーをつなぎ、快適なモバイル体験を実現します。",
    intro:
      "iOS・Androidアプリをはじめ、クロスプラットフォームアプリの開発まで幅広く対応しています。使いやすさとデザイン性を両立したアプリケーションを開発し、新しい価値を創出します。",
    industries: [
      "EC",
      "医療",
      "教育",
      "フィットネス",
      "SNS",
      "FinTech",
      "IoT",
      "エンターテインメント",
    ],
    services: [
      "iPhoneアプリ開発",
      "Androidアプリ開発",
      "Flutter開発",
      "React Native開発",
      "PWA開発",
      "サブスクリプションサービス開発",
      "決済システム開発",
    ],
    stack: [
      "Swift",
      "Kotlin",
      "Flutter",
      "React Native",
      "Dart",
      "Firebase",
      "Supabase",
      "GraphQL",
      "REST API",
    ],
  },
  {
    no: "04",
    en: "AI Development Team",
    image: "/team/ai.svg",
    ja: "AI開発チーム",
    mission: "AI技術で企業の可能性を広げ、新たな価値を創造します。",
    intro:
      "生成AIや機械学習を活用し、業務効率化からAIシステム開発まで幅広く支援しています。お客様の課題に寄り添い、実用性とビジネス成果を重視したAIソリューションをご提供します。",
    industries: [
      "カスタマーサポート",
      "EC",
      "医療",
      "教育",
      "金融",
      "製造業",
      "メディア",
      "SaaS",
    ],
    services: [
      "生成AIシステム開発",
      "AIチャットボット開発",
      "AIエージェント開発",
      "RAG構築",
      "LLM導入支援",
      "OCRシステム開発",
      "音声認識AI",
      "画像認識AI",
      "業務自動化（AI Automation）",
    ],
    stack: [
      "OpenAI",
      "Claude",
      "Gemini",
      "LangChain",
      "LangGraph",
      "LlamaIndex",
      "MCP",
      "Python",
      "FastAPI",
      "TensorFlow",
      "PyTorch",
      "Hugging Face",
      "Pinecone",
      "Weaviate",
      "ChromaDB",
      "PostgreSQL",
      "Docker",
      "AWS",
      "Azure AI",
      "Vertex AI",
    ],
  },
];

/**
 * Small caps label used above each block within a team card.
 * `tone="onDark"` switches it for the blue header band, where `text-muted`
 * would fail contrast (1.4:1).
 */
function BlockLabel({
  children,
  tone = "onLight",
}: {
  children: React.ReactNode;
  tone?: "onLight" | "onDark";
}) {
  return (
    <p
      className={cn(
        "text-xs font-bold uppercase tracking-[0.18em]",
        tone === "onDark" ? "text-white/80" : "text-muted",
      )}
    >
      {children}
    </p>
  );
}

export function About({
  /** Hide the section header on /about, where PageHero already shows it. */
  showHeader = true,
}: {
  showHeader?: boolean;
} = {}) {
  return (
    <Section
      id="about"
      align="center"
      eyebrow={showHeader ? "ABOUT US" : undefined}
      title={showHeader ? "私たちについて" : undefined}
    >
      {/* 導入文と写真を左右に。写真は透過PNGの重ね組みなので、白背景の上で
          そのまま成立する。狭い画面では写真が下に回る。

          `lg:items-start` で上端を揃える。テキストは4行程度にしかならず写真の
          高さ（約580px）には届かないため、上下中央にすると写真だけが上下には
          み出して見える。 */}
      <div className="grid items-center gap-10 text-left lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-start lg:gap-16">
        {/* `lg:pt-25`（100px）で写真の上端より下から始める。狭い画面では
            写真が下に回るため、オフセットは `lg` 以上でのみ適用する。 */}
        <div className="space-y-6 text-lg leading-relaxed text-ink-soft sm:text-xl lg:pt-25 xl:text-2xl">
          <p>
            私たちは、Web・システム・アプリ・AIを専門とするエンジニア・デザイナーで構成された開発チームです。
          </p>
          <p>
            それぞれの専門領域を持つプロフェッショナルが連携し、企画から設計、開発、運用までワンストップで提供しています。
          </p>
        </div>

        <Image
          src="/about/intro.webp"
          alt=""
          aria-hidden
          width={960}
          height={1117}
          sizes="(min-width: 1024px) 30rem, 100vw"
          className="mx-auto h-auto w-full max-w-md lg:max-w-none"
        />
      </div>

      <ol className="mt-16 space-y-10">
        {TEAMS.map((team) => (
          <li key={team.no} className="border border-line bg-card text-left">
            {/* ヘッダー帯: フッターと同じ青 (--chrome) を敷き、文字は白に反転。
                背景画像は青の上では埋もれるため、低い不透明度のテクスチャとして
                重ねている。白文字は青の上で 6.67:1 と AA を満たす。 */}
            <div className="relative isolate bg-chrome p-6 sm:p-8">
              <div
                aria-hidden
                style={{ backgroundImage: `url(${team.image})` }}
                className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-25 mix-blend-luminosity"
              />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                <p className="text-3xl font-black leading-none tracking-tight text-white/45 sm:text-4xl">
                  {team.no}
                </p>
                <div className="min-w-0">
                  <p className="text-sm font-bold tracking-wide text-white/90">
                    {team.en}
                  </p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                    {team.ja}
                  </h3>
                  <div className="mt-4">
                    <BlockLabel tone="onDark">私たちの使命</BlockLabel>
                    <p className="mt-2 text-base font-medium leading-relaxed text-white sm:text-lg">
                      {team.mission}
                    </p>
                  </div>
                  <div className="mt-5">
                    <BlockLabel tone="onDark">チーム紹介</BlockLabel>
                    <p className="mt-2 text-base leading-relaxed text-white/90">
                      {team.intro}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8 p-6 sm:p-8">
              {/* 3つのブロックを横一列に。狭い画面では縦積みに戻る。
                  `items-start` で各カラムの高さを揃えず、内容の量に応じた
                  自然な高さにしている。 */}
              <div className="grid items-start gap-8 lg:grid-cols-3">
                <div>
                  <BlockLabel>対応業界</BlockLabel>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {team.industries.map((i) => (
                      <li
                        key={i}
                        className="bg-surface px-3 py-1 text-sm text-ink-soft"
                      >
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <BlockLabel>主なサービス</BlockLabel>
                  <ul className="mt-3 space-y-1.5">
                    {team.services.map((s) => (
                      <li
                        key={s}
                        className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft"
                      >
                        {/* チェックマーク。`mt-[0.15em]` で先頭行のベースラインに
                            合わせている。装飾なので aria-hidden。 */}
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
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <BlockLabel>技術スタック</BlockLabel>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {team.stack.map((t) => (
                      <TechChip key={t} name={t} />
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* 最後に — 背景に集合写真を敷き、白の scrim で本文の可読性を確保。
          scrim なしでは text-ink-soft が AA を割る。 */}
      <div
        className="relative isolate mt-16 overflow-hidden border border-line bg-surface bg-cover bg-center p-8 text-center sm:p-10"
        style={{ backgroundImage: "url(/about/closing.webp)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-card/90"
        />
        {/* 英語を小さなラベル、日本語を主見出しに。ナビや PageHero・チーム
            カードと同じ「英語（小）→ 日本語（大）」の並びに揃えている。 */}
        <p className="text-lg font-bold tracking-[0.08em] text-accent-ink sm:text-xl">
          One Team, Multiple Expertise
        </p>
        <h3 className="mt-3 text-[1.75rem] font-black leading-tight tracking-tight text-ink sm:text-4xl xl:text-5xl">
          ひとつのチーム、多様な専門性
        </h3>
        <div className="mx-auto mt-6 max-w-3xl space-y-4 text-[1.25rem] leading-relaxed text-ink-soft sm:text-[1.375rem]">
          <p>
            私たちは4つの専門チームが連携することで、単なる制作会社ではなく、
            <strong className="font-bold text-ink">
              「ビジネス課題を技術で解決する開発パートナー」
            </strong>
            として価値を提供しています。
          </p>
          <p>
            Web制作からシステム・アプリ・AIまで、一つの窓口で一貫して対応できることがWEB-XR.studioの強みです。
          </p>
        </div>
      </div>
    </Section>
  );
}
