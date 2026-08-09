"use client";

import Link from "next/link";
import { CardCarousel } from "@/components/ui/CardCarousel";
import type { Domain } from "@/components/sections/ServiceDetail";
import { cn } from "@/lib/utils";

/**
 * 4つのサービス領域を1枚ずつ見せるカルーセル。
 *
 * トップページ専用。カードの中身は /service の詳細カードから「対応サービス」
 * だけを引き継ぎ、「対応プロジェクト」（業界別の例）は載せない。全量は
 * /service に置き、ここでは概要を掴んでもらうことに絞る。
 */

/** チェックマーク。/service の詳細カードと同じもの。 */
function Tick() {
  return (
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
  );
}

export function ServiceCarousel({ domains }: { domains: Domain[] }) {
  return (
    <CardCarousel
      items={domains}
      label="サービス"
      getKey={(d) => d.en}
      getLabel={(d) => d.title}
      renderCard={(d, isCenter) => (
        <>
          {/* ヘッダー帯。/service の詳細カードと同じ青とテクスチャ。 */}
          <div className="relative isolate bg-chrome p-6 text-center sm:p-8">
            <div
              aria-hidden
              style={{ backgroundImage: `url(${d.image})` }}
              className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-25 mix-blend-luminosity"
            />
            <p className="text-sm font-bold tracking-[0.18em] text-white/90">
              {d.en}
            </p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {d.title}
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white sm:text-lg">
              {d.lead}
            </p>

            {/* 相談が主、詳細が従。白地の塗りと白枠線で主従を分けている。
                狭い画面では縦積みにして、どちらも押しやすい幅を確保する。

                左右の退色カードには出さない。幅が足りずボタンが縦に潰れるうえ、
                読ませる対象でもないため。 */}
            <div
              className={cn(
                "mt-6 flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center",
                isCenter ? "flex" : "hidden",
              )}
            >
              <Link
                href={`/contact?service=${encodeURIComponent(d.formService)}#service`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold tracking-tight text-chrome shadow-lg transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 sm:text-base"
              >
                このサービスを相談する
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

              {/* /service の該当カードへ。業界別の対応プロジェクトはあちらに
                  載せているため、ここからは直接飛ばす。 */}
              <Link
                href={`/service#${d.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/80 px-6 py-3 text-sm font-bold tracking-tight text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 sm:text-base"
              >
                対応プロジェクトを見る
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

          {/* 対応サービスのみ。対応プロジェクトは /service に置く。 */}
          <div className="p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              対応サービス
            </p>
            <ul className="mt-4 grid gap-x-6 gap-y-2 text-left sm:grid-cols-2">
              {d.services.map((s) => (
                <li
                  key={s}
                  className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft"
                >
                  <Tick />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    />
  );
}
