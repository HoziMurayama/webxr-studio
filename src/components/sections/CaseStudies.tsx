import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import type { Portfolio } from "@/db/schema";

/**
 * お客様事例の一覧。カードをクリックすると個別ページ（/case-study/[id]）へ遷移する。
 *
 * カード表面: お客様画像 / お客様の声（抜粋）/ 企業名・お名前 / 業界 / 技術スタック
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

export function CaseStudies({ items }: { items: Portfolio[] }) {
  if (items.length === 0) return null;

  return (
    <Section id="case-study" align="center">
      <ul className="grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/case-study/${item.id}`}
              className="group flex h-full w-full flex-col border border-line bg-card text-left transition-shadow hover:shadow-[0_12px_40px_rgb(13,16,23,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              {/* 一覧のサムネイルはお客様のお写真。無ければサムネイル指定、
                  それも無ければ制作物画像を使う。 */}
              {item.imageUrl || item.thumbnailUrl || item.workImageUrl ? (
                <Image
                  src={item.imageUrl || item.thumbnailUrl || item.workImageUrl}
                  alt=""
                  aria-hidden
                  width={800}
                  height={600}
                  sizes="(min-width: 1024px) 22rem, (min-width: 640px) 50vw, 100vw"
                  className="aspect-[4/3] w-full object-cover object-top"
                />
              ) : (
                <div
                  aria-hidden
                  className="flex aspect-[4/3] w-full items-center justify-center bg-surface text-sm text-muted"
                >
                  No Image
                </div>
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
                  <Stack tags={item.tags ?? []} />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
