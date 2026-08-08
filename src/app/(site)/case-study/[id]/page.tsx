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

          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt=""
              aria-hidden
              width={1200}
              height={675}
              sizes="(min-width: 768px) 48rem, 100vw"
              priority
              className="aspect-[16/9] w-full border border-line object-cover"
            />
          )}

          {clientLabel(item) && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                お客様
              </p>
              <p className="mt-2 text-lg font-bold tracking-tight text-ink">
                {clientLabel(item)}
              </p>
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
