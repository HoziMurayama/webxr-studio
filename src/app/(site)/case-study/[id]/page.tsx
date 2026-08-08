import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { clientLabel, Stack } from "@/components/sections/CaseStudies";
import { getPortfolioItem } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getPortfolioItem(Number(id));
  if (!item) return { title: "お客様事例" };
  return {
    title: item.title,
    description: item.description || item.review || undefined,
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  // 数値でない ID（/case-study/abc など）もここで 404 にする。
  if (!Number.isInteger(numId)) notFound();

  const item = await getPortfolioItem(numId);
  if (!item) notFound();

  return (
    <>
      {/* 第1セクションは一覧ページと同じ文言のまま。案件名や業界など事例ごとの
          情報はすべて下の第2セクションに置く。 */}
      <PageHero
        en="CASE STUDY"
        title="お客様事例"
        description="2026年に手がけたプロジェクトの一部と、お客様の声をご紹介します。"
        image="/about/fv-faq.webp"
      />

      <Section align="center">
        <div className="mx-auto max-w-3xl space-y-10 text-left">
          {/* 案件名と業界。第1セクションから移してきた見出し。 */}
          <div>
            {item.industry && (
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-accent-ink">
                {item.industry}
              </p>
            )}
            <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl xl:text-4xl">
              {item.title}
            </h2>
          </div>

          {/* お客様のお写真とお名前を最上部に。制作物より先に人が見えるようにする。 */}
          {(item.imageUrl || clientLabel(item)) && (
            <div className="flex flex-col items-center gap-5 border border-line bg-surface p-6 text-center sm:flex-row sm:items-center sm:gap-8 sm:p-8 sm:text-left">
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={clientLabel(item) || "お客様"}
                  width={900}
                  height={1207}
                  sizes="(min-width: 640px) 12rem, 10rem"
                  priority
                  className="h-40 w-40 shrink-0 rounded-full object-cover object-top sm:h-48 sm:w-48"
                />
              )}
              {clientLabel(item) && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    お客様
                  </p>
                  <p className="mt-2 text-lg font-bold tracking-tight text-ink sm:text-xl">
                    {clientLabel(item)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 制作物のスクリーンショット。縦長のページ全体が入ることが多いので
              高さは制限せず、そのまま流す。 */}
          {item.workImageUrl && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                制作物
              </p>
              <Image
                src={item.workImageUrl}
                alt=""
                aria-hidden
                width={1000}
                height={7182}
                sizes="(min-width: 768px) 48rem, 100vw"
                className="mt-3 h-auto w-full border border-line"
              />
            </div>
          )}

          {item.description && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                プロジェクト概要
              </p>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-ink-soft sm:text-lg">
                {item.description}
              </p>
            </div>
          )}

          {item.review && (
            <div className="border-l-2 border-accent bg-surface p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                お客様の声
              </p>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-ink-soft sm:text-lg">
                「{item.review}」
              </p>
            </div>
          )}

          {(item.tags ?? []).length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                技術スタック
              </p>
              <div className="mt-3">
                <Stack tags={item.tags ?? []} />
              </div>
            </div>
          )}

          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-base font-semibold text-accent-ink underline-offset-4 hover:underline"
            >
              サイトを見る
              <svg
                viewBox="0 0 20 20"
                aria-hidden
                className="h-4 w-4 shrink-0"
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
          )}

          <div className="border-t border-line pt-8">
            <Link
              href="/case-study"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent-ink underline-offset-4 hover:underline"
            >
              <svg
                viewBox="0 0 20 20"
                aria-hidden
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 10H5M9 5l-5 5 5 5" />
              </svg>
              お客様事例の一覧へ
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
