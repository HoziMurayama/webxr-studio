"use client";

import { useCallback, useRef, useState } from "react";
import { TechChip } from "@/components/ui/TechIcon";
import { cn } from "@/lib/utils";

/**
 * 4つの専門チームを1枚ずつ見せるカルーセル。
 *
 * トップページ専用。/about では全チームを縦に並べた詳細版を出すため、
 * ここでは中央の1枚に集中してもらう見せ方にしている。左右のカードは
 * 退色させて「まだ続きがある」ことだけを伝える。
 */

export type CarouselTeam = {
  no: string;
  en: string;
  ja: string;
  mission: string;
  intro: string;
  stack: string[];
  image: string;
};

/** 中央カードに対する左右カードの縮小率と不透明度。 */
const SIDE_SCALE = 0.88;
const SIDE_OPACITY = 0.35;

export function TeamCarousel({ teams }: { teams: CarouselTeam[] }) {
  const [index, setIndex] = useState(0);
  const total = teams.length;

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + total) % total),
    [total],
  );

  // 左右キーでも送れるようにする。カルーセルにフォーカスがあるときだけ拾う。
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  // スワイプ。横移動が縦より大きいときだけカルーセル操作とみなす。
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  };

  if (total === 0) return null;

  return (
    <div
      className="relative mt-16"
      role="group"
      aria-roledescription="カルーセル"
      aria-label="専門チーム"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 中央カードだけをフローに置いて高さの基準にし、左右のカードは絶対配置で
          その背後に覗かせる。こうしないと3枚ぶんの幅がコンテナを超えて、中央の
          文字が切れてしまう。はみ出しは overflow-hidden で切る。 */}
      {/* 左右の padding は矢印と、覗かせる左右カードぶんの逃げ。
          これがないと矢印が中央カードに重なる。狭い画面では矢印をカードの
          下に回すため、逃げは要らない。 */}
      <div className="overflow-hidden px-0 py-4 sm:px-16 lg:px-56">
        <div className="relative mx-auto flex max-w-3xl items-stretch justify-center">
          {teams.map((team, i) => {
            // 中央からの距離。-1 が左隣、1 が右隣。端はループさせる。
            let offset = i - index;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const isCenter = offset === 0;
            const isSide = Math.abs(offset) === 1;
            // 2枚以上離れたカードは描画しない（DOM を軽く保つ）。
            if (!isCenter && !isSide) return null;

            return (
              <article
                key={team.no}
                aria-hidden={!isCenter}
                // 左右カードは操作対象から外す。中央だけを読ませたいため。
                inert={!isCenter}
                style={
                  isCenter
                    ? undefined
                    : {
                        // 中央カードの外側へ、自身の幅の8割ぶん押し出す。
                        transform: `translateX(${offset > 0 ? "80%" : "-80%"}) scale(${SIDE_SCALE})`,
                        opacity: SIDE_OPACITY,
                      }
                }
                className={cn(
                  "border bg-card text-left transition-[transform,opacity] duration-300 ease-out",
                  isCenter
                    ? "relative z-10 w-full border-line shadow-[0_18px_50px_rgb(13,16,23,0.12)]"
                    : cn(
                        // 中央カードの端に重ねて置き、外へずらして覗かせる。
                        // 高さは中央より低くして、上下に収まるようにする。
                        "pointer-events-none absolute top-8 bottom-8 hidden w-72 overflow-hidden border-line/60 lg:block",
                        offset > 0 ? "right-0" : "left-0",
                      ),
                )}
              >
                {/* ヘッダー帯。/about の詳細カードと同じ青とテクスチャで、
                    サイト内の見た目を揃えている。 */}
                <div className="relative isolate bg-chrome p-6 text-center sm:p-8">
                  <div
                    aria-hidden
                    style={{ backgroundImage: `url(${team.image})` }}
                    className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-25 mix-blend-luminosity"
                  />
                  <p className="text-3xl font-black leading-none tracking-tight text-white/45 sm:text-4xl">
                    {team.no}
                  </p>
                  <p className="mt-3 text-sm font-bold tracking-wide text-white/90">
                    {team.en}
                  </p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                    {team.ja}
                  </h3>
                </div>

                <div className="space-y-6 p-6 text-center sm:p-8">
                  <p className="text-base font-bold leading-relaxed text-ink sm:text-lg">
                    {team.mission}
                  </p>
                  <p className="text-sm leading-relaxed text-ink-soft sm:text-base">
                    {team.intro}
                  </p>
                  <ul className="flex flex-wrap justify-center gap-2">
                    {/* 全部出すと縦に伸びてカードの高さが揃わないため、
                        代表的なものだけに絞る。全量は /about に載せている。 */}
                    {team.stack.slice(0, 8).map((t) => (
                      <TechChip key={t} name={t} />
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* 送りボタンとドットを1行に。sm 以上では矢印だけをカードの左右端へ
          絶対配置で逃がし、狭い画面ではドットと横並びのまま下に置く。 */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="前のチーム"
          className="z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 sm:absolute sm:left-0 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2"
        >
          <Chevron dir="left" />
        </button>

        {/* 現在位置。点は押して直接移動もできる。 */}
        <ul className="flex justify-center gap-2.5">
          {teams.map((team, i) => (
            <li key={team.no}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${team.ja}を表示`}
                aria-current={i === index}
                className={cn(
                  "h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2",
                  i === index
                    ? "w-8 bg-accent"
                    : "w-2.5 bg-line hover:bg-muted",
                )}
              />
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="次のチーム"
          className="z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 sm:absolute sm:right-0 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2"
        >
          <Chevron dir="right" />
        </button>
      </div>

      {/* 読み上げ用。矢印で送ったことが音声でも伝わるようにする。 */}
      <p aria-live="polite" className="sr-only">
        {`${index + 1} / ${total}　${teams[index].ja}`}
      </p>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={dir === "left" ? "M12 5l-5 5 5 5" : "M8 5l5 5-5 5"} />
    </svg>
  );
}
