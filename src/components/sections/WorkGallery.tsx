"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * 制作物のギャラリー。上部のタブで画像を切り替える。
 *
 * LP のスクリーンショットは縦に非常に長いことが多いので、表示領域の高さを
 * 制限してスクロールさせる。全体像を見たい場合は原寸を別タブで開ける。
 */
export function WorkGallery({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  const [active, setActive] = useState(0);
  if (items.length === 0) return null;

  const current = items[active] ?? items[0];

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
        制作物
      </p>

      {/* 切り替えタブ。項目数が多いので折り返す。 */}
      <div role="tablist" aria-label="制作物の画像" className="mt-3 flex flex-wrap gap-2">
        {items.map((it, i) => (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={cn(
              "border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
              i === active
                ? "border-accent bg-accent text-white"
                : "border-line bg-card text-ink-soft hover:border-accent/40 hover:text-ink",
            )}
          >
            {it.label}
          </button>
        ))}
      </div>

      {/* 表示領域。縦長画像はここでスクロールする。 */}
      <div className="mt-4 max-h-[36rem] overflow-y-auto border border-line bg-surface">
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

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {active + 1} / {items.length}　{current.label}
        </p>
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
