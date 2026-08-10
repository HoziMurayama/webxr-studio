import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionLink } from "@/components/ui/SectionLink";
import { CaseStudyCarousel } from "@/components/sections/CaseStudyCarousel";
import { AvatarFallback } from "@/components/ui/AvatarFallback";
import type { Portfolio } from "@/db/schema";
import { cn } from "@/lib/utils";

/**
 * お客様事例の一覧。カードをクリックすると個別ページ（/case-study/[id]）へ遷移する。
 *
 * カード表面: お客様画像 / お客様の声（抜粋）/ 企業名・お名前 / 業界
 * 技術スタックは /case-study のみ（トップページは概要に絞る）。
 */

/** 企業名と個人名を組み立てる。企業名が空なら個人名のみ。 */
export function clientLabel(item: Portfolio): string {
  const company = item.companyName?.trim() ?? "";
  const person = item.clientName?.trim() ?? "";
  if (company && person) return `${company}　${person}`;
  return company || person;
}

export function Stack({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <li
          key={t}
          className="border border-line bg-surface px-2.5 py-1 text-xs text-ink-soft"
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

export function CaseStudies({
  items,
  /** 一覧の上に出す一文。掲載が実績の一部である旨を伝える。 */
  description,
  /** トップページではセクション見出しを出す（/case-study は PageHero が担う）。 */
  eyebrow,
  title,
  tone,
  /**
   * 表示する最大件数。トップページは 4 件に絞る。指定がなければ全件。
   * 事例が増えてもトップページの見た目が崩れないようにするための上限。
   */
  limit,
  /** 一覧の下に置く /case-study への導線。 */
  pageLink,
  /**
   * 広い画面での列数。トップページは 4 件を1行に収めるため 4、
   * /case-study は件数が増えるので既定の 3。
   */
  columns = 3,
  /**
   * カードに技術スタックを載せるか。/case-study では出し、トップページでは
   * 概要に絞るため出さない。
   */
  showStack = true,
  /**
   * 1枚ずつ送るカルーセルで見せるか。トップページは件数が増えても
   * 縦に伸びないよう true、/case-study はグリッドのまま。
   */
  carousel = false,
}: {
  items: Portfolio[];
  description?: string;
  eyebrow?: string;
  title?: string;
  tone?: "default" | "muted";
  limit?: number;
  pageLink?: boolean;
  columns?: 3 | 4;
  showStack?: boolean;
  carousel?: boolean;
}) {
  if (items.length === 0) return null;

  const shown = limit ? items.slice(0, limit) : items;

  return (
    <Section
      id="case-study"
      align="center"
      tone={tone}
      eyebrow={eyebrow}
      title={title}
      description={description}
    >
      {carousel ? (
        <CaseStudyCarousel items={shown} />
      ) : (
        // クラス名は静的に書く。Tailwind は文字列連結で組み立てたクラスを
        // 検出できず、スタイルが生成されないため。
        <ul
          className={cn(
            "grid gap-6 text-left sm:grid-cols-2",
            columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
          )}
        >
          {shown.map((item) => (
            <li key={item.id}>
              <Link
                href={`/case-study/${item.id}`}
                // ホバーで少し浮かせ、枠線を accent に寄せる。動きは控えめに
                // して、カードが並んだときに画面がざわつかないようにする。
                className="group flex h-full w-full flex-col border border-line bg-card text-left transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_16px_44px_rgb(13,16,23,0.13)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                {/* 一覧のサムネイルはお客様のお写真。無ければサムネイル指定、
                    それも無ければ制作物画像を使い、いずれも無ければ既定の
                    アバターを出す。 */}
                {item.imageUrl || item.thumbnailUrl || item.workImageUrl ? (
                  // 拡大したぶんのはみ出しをここで切る。画像自体に
                  // overflow は効かないので、外側の箱で受ける。
                  <div className="overflow-hidden bg-surface-2">
                    <Image
                      src={
                        item.imageUrl || item.thumbnailUrl || item.workImageUrl
                      }
                      alt=""
                      aria-hidden
                      width={800}
                      height={600}
                      // 実際の表示幅に合わせる。ずれると過大な画像を読み込む。
                      sizes={
                        columns === 4
                          ? "(min-width: 1024px) 17rem, (min-width: 640px) 50vw, 100vw"
                          : "(min-width: 1024px) 22rem, (min-width: 640px) 50vw, 100vw"
                      }
                      className="aspect-[4/3] w-full bg-surface-2 object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <AvatarFallback className="aspect-[4/3] w-full" />
                )}

                <div className="flex flex-1 flex-col gap-4 p-5">
                  {item.review && (
                    <p className="line-clamp-4 text-sm leading-relaxed text-ink-soft">
                      「{item.review}」
                    </p>
                  )}

                  <div className="mt-auto space-y-3">
                    {clientLabel(item) && (
                      <p className="text-sm font-bold tracking-tight text-ink">
                        {clientLabel(item)}
                      </p>
                    )}
                    {item.industry && (
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-ink">
                        {item.industry}
                      </p>
                    )}
                    {showStack && <Stack tags={item.tags ?? []} />}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {pageLink && (
        <SectionLink href="/case-study">お客様事例をすべて見る</SectionLink>
      )}
    </Section>
  );
}
