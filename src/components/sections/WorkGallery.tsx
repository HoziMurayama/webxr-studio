"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * 制作物のギャラリー。左右の矢印で送り、下のサムネイルからも直接選べる。
 *
 * LP のスクリーンショットは縦に非常に長いことが多いので、表示領域の高さを
 * 制限して中でスクロールさせる。全体像は「原寸で開く」から確認できる。
 */
export function WorkGallery({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  const [active, setActive] = useState(0);
  if (items.length === 0) return null;

  const total = items.length;
  const current = items[active] ?? items[0];
  // 端で止めず循環させる。
  const go = (d: number) => setActive((i) => (i + d + total) % total);

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
        制作物
      </p>

      {/* メイン表示。矢印は画像の左右に重ねる。 */}
      <div className="relative mt-3">
        <div className="max-h-[36rem] overflow-y-auto border border-line bg-surface">
          <Image
            key={current.value}
            src={current.value}
            alt={current.label}
            width={1000}
            height={7182}
            sizes="(min-width: 768px) 48rem, 100vw"
            className="h-auto w-full"
          />
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="前の画像"
              className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/45 text-white backdrop-blur-sm transition-colors hover:bg-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="次の画像"
              className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/45 text-white backdrop-blur-sm transition-colors hover:bg-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* サムネイル一覧。中央にカウンタを置く。 */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <ul className="flex flex-wrap items-center justify-center gap-2">
          {items.map((it, i) => (
            <li key={it.value}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={it.label}
                aria-current={i === active}
                className={cn(
                  "block h-14 w-20 overflow-hidden border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                  i === active
                    ? "border-accent"
                    : "border-line opacity-60 hover:opacity-100",
                )}
              >
                <Image
                  src={it.value}
                  alt=""
                  aria-hidden
                  width={160}
                  height={112}
                  className="h-full w-full object-cover object-top"
                />
              </button>
            </li>
          ))}
        </ul>

        <p className="rounded-full bg-surface-2 px-3 py-1 text-sm text-ink-soft">
          {active + 1} / {total}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">{current.label}</p>
        <a
          href={current.value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink underline-offset-4 hover:underline"
        >
          原寸で開く
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
          <span className="sr-only">（新しいタブで開きます）</span>
        </a>
      </div>
    </div>
  );
}
