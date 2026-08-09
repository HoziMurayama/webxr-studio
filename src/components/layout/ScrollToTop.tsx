"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * ページ先頭へ戻るボタン。
 *
 * AI アシスタント（ChatWidget）の左隣に並べる。あちらが右下 `right-5` で
 * 56px 幅なので、こちらは重ならないよう `right-24` に置く。
 *
 * 少しスクロールしただけで出ると邪魔になるため、1画面ぶん下がってから現れる。
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
        "fixed bottom-5 right-24 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-card text-ink shadow-lg transition-all hover:bg-surface hover:text-accent-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 active:scale-95",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
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
        <path d="M10 16V5M5 10l5-5 5 5" />
      </svg>
    </button>
  );
}
