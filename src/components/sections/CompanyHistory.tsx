import Image from "next/image";
import { Section } from "@/components/ui/Section";

/**
 * COMPANY HISTORY — a dated timeline of how the studio grew.
 *
 * Editorial copy rather than DB-driven, so it lives here as a typed constant;
 * move it to a table if it ever needs to be admin-editable.
 */

type Era = {
  /** Year or range shown in the left rail. */
  period: string;
  title: string;
  /** Paragraphs of body copy, rendered in order. */
  body: string[];
  /** Optional list rendered as chips after the body. */
  items?: string[];
  /** Optional label above the chip list. */
  itemsLabel?: string;
  /** Banner image for the era. */
  image: string;
};

const ERAS: Era[] = [
  {
    period: "2004 — 2013",
    image: "/history/2004-2013.webp",
    title: "ゲーム・コンテンツ開発から始まった経験",
    body: [
      "CEOは2004年から2013年までゲーム会社に在籍し、プロデューサー・ディレクターとしてゲームシナリオやイベント制作など、コンテンツ開発の企画・ディレクションに携わりました。",
      "ゲーム・アニメ・おもちゃなどのエンターテインメント領域で、ユーザー体験を意識した企画力、クリエイティブ、プロジェクトマネジメントの経験を積み重ねました。",
      "この時代に培われた「人を惹きつける体験をつくる」という考え方は、現在のWeb制作やXR開発にも受け継がれています。",
    ],
  },
  {
    period: "2016",
    image: "/history/2016.webp",
    title: "フリーランスとしてWeb・XR開発へ",
    body: [
      "2016年からはフリーランスとして活動を開始。",
      "ゲーム業界で培ったデザインやコンテンツ制作の経験をWeb領域へ展開し、Webサイト制作をはじめ、Three.jsなどの技術を活用した3D・XRコンテンツの開発にも取り組み始めました。",
      "「Webで何ができるのか」という可能性を追求しながら、デザインとテクノロジーを組み合わせた開発を進めました。",
    ],
    itemsLabel: "この時期の対応領域",
    items: ["Web制作", "3D・XRコンテンツ開発"],
  },
  {
    period: "2018",
    image: "/history/2018.webp",
    title: "Web・システム開発チームの形成",
    body: [
      "2018年、現在のCTOが開発に加わり、ReactやNode.jsなどのモダンな技術を活用したシステム開発を本格的に開始しました。",
      "当時はまだ会社という形ではなく、CEOとCTOを中心とした小規模な開発チームとして活動。",
      "Web制作だけでなく、業務システムやWebアプリケーションなど、企業の業務やサービスを支えるシステム開発へと領域を広げていきました。",
    ],
    itemsLabel: "この時期の対応領域",
    items: ["Web制作", "システム開発"],
  },
  {
    period: "2020",
    image: "/history/2020.webp",
    title: "WEB-XR.studioの設立",
    body: [
      "2020年、スマートフォンを中心としたモバイル技術の進化を背景に、モバイルアプリ開発にも本格的に取り組み始めました。",
      "Web制作、システム開発に加えてアプリ開発まで対応領域が広がり、開発チームもさらに拡大。",
      "このタイミングで正式に会社を設立し、現在のWEB-XR.studioにつながる本格的な組織づくりが始まりました。",
    ],
    itemsLabel: "この時期の対応領域",
    items: ["Web制作", "システム開発", "アプリ開発"],
  },
  {
    period: "2023",
    image: "/history/2023.webp",
    title: "AI開発への挑戦",
    body: [
      "2023年、ChatGPTやClaudeをはじめとする生成AIが急速に進化。",
      "私たちはAIが単なる新しい技術ではなく、これからの企業活動やソフトウェア開発そのものを大きく変える存在になると考え、AI技術の研究・開発を本格的に開始しました。",
      "既存のWeb・システム・アプリ開発の知見とAI技術を組み合わせ、AIを活用したシステム、業務効率化、サービス開発など、新しい領域への挑戦を進めています。",
    ],
    itemsLabel: "この時期の対応領域",
    items: ["Web制作", "システム開発", "アプリ開発", "AI開発"],
  },
  {
    period: "2026",
    image: "/history/2026.webp",
    title: "4つの専門領域へ",
    body: [
      "現在のWEB-XR.studioは、Web制作 × システム開発 × アプリ開発 × AI開発の4つの開発領域を持つ組織へと成長しました。",
      "会社設立から6年。しかし、私たちの開発経験は会社設立年数だけでは測れません。",
    ],
    itemsLabel: "各領域の経験年数",
    items: [
      "Web制作：10年以上",
      "システム開発：8年以上",
      "アプリ開発：6年以上",
      "AI開発：3年以上",
    ],
  },
];

/** Closing paragraphs after the timeline. */
const CLOSING = [
  "それぞれの領域で積み重ねてきた経験と知識を、現在の開発チームへと継承しています。",
  "これまで培ってきたクリエイティブ、技術、企画、開発の経験を組み合わせ、単に「作る」だけではなく、企業の課題を理解し、その先にある成果まで考えた開発を目指しています。",
  "そしてこれからも、テクノロジーの進化を柔軟に取り入れながら、Web、システム、アプリ、AIの可能性を広げ、企業と社会の新しい価値を創造していきます。",
];

export function CompanyHistory() {
  return (
    <Section
      id="history"
      tone="muted"
      align="center"
      eyebrow="COMPANY HISTORY"
      title="経験から生まれた、WEB-XR.studioの歩み"
    >
      <div className="mx-auto max-w-3xl space-y-5 text-left text-base leading-relaxed text-ink-soft sm:text-lg">
        <p>
          WEB-XR.studioは、Web制作、システム開発、アプリ開発、AI開発を通じて、企業の課題解決と新しい価値の創出に取り組んできました。
        </p>
        <p>その歩みは、会社設立から始まったものではありません。</p>
        <p>
          ゲーム・アニメ業界で培われた企画・演出・デザインの経験と、長年にわたるWeb・システム開発の経験をもとに、小さな開発チームからスタートしました。
        </p>
        <p>
          技術の進化とともに開発領域を広げ、現在ではWeb、システム、アプリ、AIの4つの領域を専門チームでカバーしています。
        </p>
      </div>

      {/* 年表。左に年、右に本文。狭い画面では年が上に回る。 */}
      <ol className="mx-auto mt-16 max-w-4xl space-y-10 text-left">
        {ERAS.map((era) => (
          <li
            key={era.period}
            className="grid gap-4 border-t border-line pt-8 lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-10"
          >
            <p className="text-lg font-black tracking-tight text-accent-ink sm:text-xl">
              {era.period}
            </p>

            <div>
              {/* 各年のバナー。装飾なので alt は空にし、見出しと本文が内容を
                  伝える。年表の最初の1枚以外は遅延読み込みにする。 */}
              <Image
                src={era.image}
                alt=""
                aria-hidden
                width={1280}
                height={853}
                sizes="(min-width: 1024px) 46rem, 100vw"
                className="mb-6 h-auto w-full border border-line"
              />
              <h3 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                {era.title}
              </h3>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-ink-soft">
                {era.body.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>

              {era.items && (
                <div className="mt-5">
                  {era.itemsLabel && (
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                      {era.itemsLabel}
                    </p>
                  )}
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {era.items.map((it) => (
                      <li
                        key={it}
                        className="border border-line bg-card px-3 py-1.5 text-sm text-ink-soft"
                      >
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mx-auto mt-16 max-w-3xl space-y-4 text-left text-base leading-relaxed text-ink-soft sm:text-lg">
        {CLOSING.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p className="pt-4 text-lg font-bold text-ink sm:text-xl">
          WEB-XR.studioは、過去の経験を未来の技術へつなげる開発会社です。
        </p>
      </div>
    </Section>
  );
}
