"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * 制作物のギャラリー。左右の矢印で送り、下のサムネイルからも直接選べる。
 *
 * 既定の表示枠は高さを固定し、比率の違う画像（横長のFigma画面と縦長のLP）を
 * 同じ高さに揃える。枠をクリックするとモーダルで原寸を開き、そこでは
 * ホイールでカーソル基点の拡大縮小、ドラッグで移動、ダブルクリックで
 * 等倍と2倍の切り替えができる。
 */

const MIN_SCALE = 0.2;
const MAX_SCALE = 8;

function Viewer({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: { label: string; value: string }[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  // 表示上の倍率だけ state で持つ（ヘッダーの % 表示用）。実際の変形は
  // ref に持った値から直接 style を書き換える — ドラッグのたびに React の
  // 再描画を挟むとカクつくため。
  const [shownScale, setShownScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  // 実際に描画している値と、そこへ向かう目標値。ホイールやボタンは目標値だけ
  // 動かし、rAF で毎フレーム近づける。こうすると入力が飛び飛びでも動きが繋がる。
  const view = useRef({ scale: 1, x: 0, y: 0 });
  const target = useRef({ scale: 1, x: 0, y: 0 });
  const raf = useRef<number | null>(null);
  const dragFrom = useRef<{ x: number; y: number } | null>(null);
  // 直近のドラッグ速度(px/ms)。指を離したあとの滑りに使う。
  const velocity = useRef({ x: 0, y: 0, t: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const total = items.length;
  const current = items[index] ?? items[0];
  const src = current.value;
  const label = current.label;

  /** ref の値をそのまま DOM へ書き出す。CSS transition は使わない。 */
  const paint = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;
    const { scale, x, y } = view.current;
    el.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${scale})`;
  }, []);

  /**
   * 目標値へ毎フレーム一定割合だけ近づける。距離に比例して縮むので、
   * 動き出しは速く終わり際はゆっくりになり、指を離しても自然に減速する。
   */
  const follow = useCallback(() => {
    const v = view.current;
    const t = target.current;
    const ds = t.scale - v.scale;
    const dx = t.x - v.x;
    const dy = t.y - v.y;
    // 十分近づいたら座標を合わせてループを止める。
    if (Math.abs(ds) < 0.0005 && Math.abs(dx) < 0.15 && Math.abs(dy) < 0.15) {
      v.scale = t.scale;
      v.x = t.x;
      v.y = t.y;
      paint();
      raf.current = null;
      return;
    }
    const k = 0.22; // 1フレームで詰める割合。大きいほど機敏、小さいほど粘る。
    v.scale += ds * k;
    v.x += dx * k;
    v.y += dy * k;
    paint();
    raf.current = requestAnimationFrame(follow);
  }, [paint]);

  /** 追従ループを起こす。すでに回っていれば何もしない。 */
  const kick = useCallback(() => {
    if (raf.current === null) raf.current = requestAnimationFrame(follow);
  }, [follow]);

  /** 補間を挟まず即座に反映する。ドラッグ中のように入力が連続する場面用。 */
  const applyNow = useCallback(() => {
    if (raf.current !== null) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
    view.current = { ...target.current };
    paint();
  }, [paint]);

  useEffect(() => {
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  const setScaleAt = useCallback(
    (next: number, originX?: number, originY?: number) => {
      const t = target.current;
      const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
      if (originX !== undefined && originY !== undefined) {
        // カーソル位置を基点に拡大する。基点と画像中心の相対距離を倍率比で伸ばす。
        const k = clamped / t.scale;
        t.x = originX - (originX - t.x) * k;
        t.y = originY - (originY - t.y) * k;
      }
      t.scale = clamped;
      kick();
      setShownScale(clamped);
    },
    [kick],
  );

  const reset = useCallback(() => {
    target.current = { scale: 1, x: 0, y: 0 };
    kick();
    setShownScale(1);
  }, [kick]);

  // 画像を切り替えたら倍率と位置を初期化する。前の画像の位置を引きずらない
  // よう、ここは補間せず即座に等倍へ戻す。
  useEffect(() => {
    target.current = { scale: 1, x: 0, y: 0 };
    applyNow();
    setShownScale(1);
  }, [src, applyNow]);

  // 端で止めず循環させる。
  const go = useCallback(
    (d: number) => onIndexChange((index + d + total) % total),
    [index, total, onIndexChange],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, go]);

  // ホイールで拡大縮小。ページスクロールに流さないよう passive: false で登録する。
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      // ステージ中心を原点とした座標。ここを基点に拡大するとカーソル下の
      // 位置が動かず、狙った場所を寄って見られる。
      const ox = e.clientX - (r.left + r.width / 2);
      const oy = e.clientY - (r.top + r.height / 2);
      // deltaY の大きさに追従させ、細かいホイールでも滑らかに効くようにする。
      const factor = Math.exp(-e.deltaY * 0.0016);
      // 基準は描画中の値ではなく目標値。補間の途中で回しても倍率が鈍らない。
      setScaleAt(target.current.scale * factor, ox, oy);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setScaleAt]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${label}（拡大表示）`}
      className="fixed inset-0 z-50 flex flex-col bg-ink/90 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 text-white sm:px-6">
        <p className="truncate text-sm font-semibold">{label}</p>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-white/70 sm:inline">
            ホイールで拡大縮小 / ドラッグで移動
          </span>
          <span className="min-w-14 text-center text-xs tabular-nums text-white/80">
            {Math.round(shownScale * 100)}%
          </span>
          <button
            type="button"
            onClick={reset}
            className="border border-white/30 px-3 py-1.5 text-xs transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            リセット
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="inline-flex h-9 w-9 items-center justify-center transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        className={cn(
          "relative flex-1 overflow-hidden",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
        onPointerDown={(e) => {
          // ボタン上での押下ではドラッグを始めない。ここで setPointerCapture を
          // 呼ぶとポインタを奪ってしまい、送りボタンの click が発火しなくなる。
          if ((e.target as HTMLElement).closest("button")) return;
          // つかんだ瞬間に走行中の補間を止め、指の下へ吸い付かせる。
          applyNow();
          dragFrom.current = {
            x: e.clientX - view.current.x,
            y: e.clientY - view.current.y,
          };
          velocity.current = { x: 0, y: 0, t: e.timeStamp };
          setIsDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = dragFrom.current;
          if (!d) return;
          const nx = e.clientX - d.x;
          const ny = e.clientY - d.y;
          // 離した後の勢いに使うため、直近の移動速度を控えておく。
          const dt = e.timeStamp - velocity.current.t;
          if (dt > 0) {
            velocity.current = {
              x: (nx - view.current.x) / dt,
              y: (ny - view.current.y) / dt,
              t: e.timeStamp,
            };
          }
          // 補間も再描画も挟まず直接書き換える。これが追従の要。
          target.current.x = nx;
          target.current.y = ny;
          view.current.x = nx;
          view.current.y = ny;
          paint();
        }}
        onPointerUp={() => {
          if (!dragFrom.current) return;
          dragFrom.current = null;
          setIsDragging(false);
          // 指を離した勢いのぶんだけ目標値を先へ飛ばし、follow の減速に任せる。
          const glide = 90; // ms 相当。大きいほど長く滑る。
          target.current.x += velocity.current.x * glide;
          target.current.y += velocity.current.y * glide;
          kick();
        }}
        onPointerCancel={() => {
          dragFrom.current = null;
          setIsDragging(false);
        }}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          const r = e.currentTarget.getBoundingClientRect();
          const ox = e.clientX - (r.left + r.width / 2);
          const oy = e.clientY - (r.top + r.height / 2);
          // ダブルクリックで等倍と2倍を往復する。
          if (view.current.scale > 1.01) reset();
          else setScaleAt(2, ox, oy);
        }}
      >
        {/* 画像は中央を基準に拡大し、ドラッグ量ぶん平行移動する。
            原寸を見るための表示なので next/image の最適化は通さない。 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          // key を src に結び付けると切り替えのたびに要素が作り直され、
          // fade アニメーションが毎回頭から流れる。
          key={src}
          ref={imgRef}
          src={src}
          alt={label}
          draggable={false}
          style={{
            transform: "translate3d(-50%, -50%, 0) scale(1)",
            willChange: "transform",
            animation: "wg-fade 0.22s ease-out",
          }}
          className="absolute left-1/2 top-1/2 max-h-none max-w-none select-none"
          // 初期表示で画面に収まるよう、幅の上限だけ与える。
          width={1000}
        />

        {/* 画像送り。拡大中も常に見えるよう、ステージに固定して重ねる。 */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="前の画像"
              className="absolute left-4 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-white backdrop-blur-sm transition-colors hover:bg-ink/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                width="24"
                height="24"
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
              className="absolute right-4 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-white backdrop-blur-sm transition-colors hover:bg-ink/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <p className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-ink/60 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
              {index + 1} / {total}　{label}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export function WorkGallery({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
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

      {/* メイン表示。高さを固定し、比率の違う画像を同じ枠に収める。 */}
      <div className="relative mt-3">
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          aria-label={`${current.label}を拡大表示`}
          className="block h-[24rem] w-full cursor-zoom-in overflow-hidden border border-line bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 sm:h-[30rem]"
        >
          <Image
            key={current.value}
            src={current.value}
            alt={current.label}
            width={1000}
            height={7182}
            sizes="(min-width: 768px) 48rem, 100vw"
            className="h-full w-full object-contain"
          />
        </button>

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
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink underline-offset-4 hover:underline"
        >
          拡大して見る
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
            <circle cx="9" cy="9" r="5.5" />
            <path d="M13 13l4 4M9 7v4M7 9h4" />
          </svg>
        </button>
      </div>

      {zoomOpen && (
        <Viewer
          items={items}
          index={active}
          onIndexChange={setActive}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </div>
  );
}
