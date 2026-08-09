"use client";

import Image from "next/image";
import Link from "next/link";
import { CardCarousel } from "@/components/ui/CardCarousel";
import type { Portfolio } from "@/db/schema";
import { cn } from "@/lib/utils";

/**
 * お客様事例を1枚ずつ見せるカルーセル。トップページ専用。
 *
 * 件数が増えても縦に伸びないよう、全件をここで送る。技術スタックは載せず、
 * お客様の声と企業名・業界に絞る（全量は /case-study）。
 *
 * 事例カードは文量が少なく、送りが遅いと止まって見える。サービスやチームの
 * 10 秒より短く 3.5 秒にしている。
 */
const AUTOPLAY_MS = 3_500;

/** 企業名と個人名を組み立てる。企業名が空なら個人名のみ。 */
function clientLabel(item: Portfolio): string {
  const company = item.companyName?.trim() ?? "";
  const person = item.clientName?.trim() ?? "";
  if (company && person) return `${company}　${person}`;
  return company || person;
}

export function CaseStudyCarousel({ items }: { items: Portfolio[] }) {
  return (
    <CardCarousel
      items={items}
      label="お客様の事例"
      autoplayMs={AUTOPLAY_MS}
      // 既定の max-w-3xl(768px) より 100px 狭い。事例カードは画像が主で
      // 文量が少なく、広いと余白ばかりが目立つため。
      maxWidthClass="max-w-[668px]"
      getKey={(item) => String(item.id)}
      getLabel={(item) => clientLabel(item) || `事例 ${item.id}`}
      renderCard={(item, isCenter) => {
        const src = item.imageUrl || item.thumbnailUrl || item.workImageUrl;
        return (
          <>
            {src ? (
              <Image
                src={src}
                alt=""
                aria-hidden
                width={800}
                height={600}
                sizes="(min-width: 1024px) 42rem, 100vw"
                // 4:3 のままだと 668px 幅で 501px になる。縦も 100px 詰めたいので
                // 高さを直接与える。object-contain なので絵は切れない。
                className="h-[400px] w-full bg-surface-2 object-contain"
              />
            ) : (
              <div
                aria-hidden
                className="flex h-[400px] w-full items-center justify-center bg-surface text-sm text-muted"
              >
                No Image
              </div>
            )}

            <div className="flex flex-col gap-4 p-6 sm:p-8">
              {item.review && (
                <p className="text-sm leading-relaxed text-ink-soft">
                  「{item.review}」
                </p>
              )}

              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-ink">
                  {clientLabel(item)}
                </p>
                {item.industry && (
                  <p className="text-xs text-muted">{item.industry}</p>
                )}
              </div>

              {/* 左右の退色カードには出さない。読ませる対象ではないうえ、
                  幅が足りずボタンが潰れるため。 */}
              <div className={cn("mt-2", isCenter ? "block" : "hidden")}>
                <Link
                  href={`/case-study/${item.id}`}
                  className="inline-flex items-center gap-2 text-sm font-bold tracking-tight text-accent-ink underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                >
                  この事例を見る
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
                    <path d="M4 10h11M10 5l5 5-5 5" />
                  </svg>
                </Link>
              </div>
            </div>
          </>
        );
      }}
    />
  );
}
