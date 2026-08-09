"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * ページ先頭へ戻るボタン。周囲の円がページ全体のスクロール率を表す。
 *
 * AI アシスタント（ChatWidget）の左隣に並べる。あちらが右下 `right-5` で
 * 56px 幅なので、こちらは重ならないよう `right-24` に置く。
 *
 * 少しスクロールしただけで出ると邪魔になるため、1画面ぶん下がってから現れる。
 */

/** リングの半径。ボタン 56px の縁に沿わせる（56/2 - 線幅ぶん）。 */
const R = 26;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  // 進捗は毎フレーム変わるので、React の再描画を挟まず ref から直接
  // DOM を書き換える。state にするとスクロール中ずっと再描画が走る。
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      // スクロールできる総量。ページが画面に収まるときは 0 になるので、
      // 0 除算を避けて満了扱いにする。
      const max = doc.scrollHeight - window.innerHeight;
      const ratio =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;

      const el = ringRef.current;
      if (el) {
        // 残りぶんを破線の穴として空ける。ratio=1 で穴が 0 になり円が閉じる。
        el.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - ratio));
      }
      setVisible(window.scrollY > window.innerHeight);
    };

    // スクロールのたびに描画すると重いので、フレームに 1 回へ間引く。
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    // 画面サイズやコンテンツ量が変わると総量も変わるため、追随させる。
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({
          top: 0,
          // 「動きを減らす」設定のときは一気に戻す。
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
        })
      }
      aria-label="ページの先頭へ戻る"
      // 隠すときも DOM には残し、不透明度と pointer-events で出し入れする。
      // 表示・非表示を切り替えるとレイアウトが跳ねるため。
      aria-hidden={!visible}
      inert={!visible}
      className={cn(
        "fixed bottom-5 right-24 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-card text-ink shadow-lg transition-all hover:bg-surface hover:text-accent-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 active:scale-95",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      {/* 進捗リング。ボタンの縁に重ねる。12時の位置から時計回りに伸びるよう
          -90度回した状態で描く。装飾なので読み上げ対象から外す。 */}
      <svg
        viewBox="0 0 56 56"
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
      >
        <circle
          cx="28"
          cy="28"
          r={R}
          fill="none"
          strokeWidth="2"
          className="stroke-line"
        />
        <circle
          ref={ringRef}
          cx="28"
          cy="28"
          r={R}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          // 初期値は 0%。マウント直後に useEffect が実際の値へ更新する。
          strokeDashoffset={CIRCUMFERENCE}
          className="stroke-accent"
        />
      </svg>

      <svg
        viewBox="0 0 20 20"
        aria-hidden
        className="relative h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 16V5M5 10l5-5 5 5" />
      </svg>
    </button>
  );
}
