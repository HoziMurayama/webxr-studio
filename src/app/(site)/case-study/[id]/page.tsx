import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { clientLabel, Stack } from "@/components/sections/CaseStudies";
import { WorkGallery } from "@/components/sections/WorkGallery";
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
      {/* 第1セクションは一覧ページと同じ、事例に依らない紹介文。案件名や業界など
          事例ごとの情報はすべて下の第2セクションに置く。 */}
      <PageHero
        en="CASE STUDY"
        title="お客様事例"
        description="課題の整理からデザイン、開発、その後の運用まで。お客様と伴走して形にしたプロジェクトと、いただいた声をご紹介します。"
        image="/about/fv-faq.webp"
      />

      <Section align="center">
        <div className="mx-auto max-w-3xl space-y-10 text-left">
          {/* 掲載が実績の一部である旨は、一覧と同じく第2セクションでも伝える。 */}
          <p className="text-base leading-relaxed text-muted">
            こちらでご紹介しているのは、2026年に当社が制作した実績の一部です。
          </p>

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

          {/* お客様のお写真を全幅のバナーとして最上部に。制作物より先に人が
              見えるようにする。写真は縦長なので `object-contain` で全体を収め、
              お名前などは画像の下に置く。 */}
          {(item.imageUrl || clientLabel(item)) && (
            <div className="border border-line bg-surface">
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={clientLabel(item) || "お客様"}
                  width={900}
                  height={1207}
                  sizes="(min-width: 768px) 48rem, 100vw"
                  priority
                  className="h-[22rem] w-full bg-surface-2 object-contain sm:h-[28rem]"
                />
              )}
              {(clientLabel(item) || item.review) && (
                <div className="border-t border-line p-6 sm:p-8">
                  {clientLabel(item) && (
                    <>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                        お客様
                      </p>
                      <p className="mt-2 text-lg font-bold tracking-tight text-ink sm:text-xl">
                        {clientLabel(item)}
                      </p>
                      {item.industry && (
                        <p className="mt-1 text-sm text-muted">{item.industry}</p>
                      )}
                    </>
                  )}

                  {/* お客様の声はお名前のすぐ下に。誰の言葉かが分かるようにする。 */}
                  {item.review && (
                    <div
                      className={clientLabel(item) ? "mt-6 border-t border-line pt-6" : ""}
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                        お客様の声
                      </p>
                      <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-ink-soft sm:text-lg">
                        「{item.review}」
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 制作物。ギャラリーがあれば切り替え表示、無ければ単一画像。 */}
          {(item.gallery ?? []).length > 0 ? (
            <WorkGallery items={item.gallery} />
          ) : (
            item.workImageUrl && (
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
            )
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
