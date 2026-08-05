"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

// Bilingual nav: an uppercase English label above its Japanese reading, the
// convention used across Japanese corporate sites.
//
// COMPANY has no section of its own yet and shares #about with ABOUT US; give
// it a dedicated section and this entry just needs a new href.
const NAV = [
  { href: "#about", en: "ABOUT US", label: "私たちについて" },
  { href: "#about", en: "COMPANY", label: "会社案内" },
  { href: "#services", en: "SERVICE", label: "サービス" },
  { href: "#portfolio", en: "CASE STUDY", label: "お客様事例" },
  { href: "#team", en: "TEAM", label: "チーム" },
  { href: "#faq", en: "FAQ", label: "よくある質問" },
  { href: "#contact", en: "INQUIRY", label: "お問い合わせ" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Hysteresis: shrink past 80px, only expand again below 40px. A single
    // threshold makes the header flip back and forth when the user hovers
    // right at the boundary or uses momentum scrolling.
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled((prev) => (prev ? y > 40 : y > 80));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300",
        // Solid white in both states; only the border and blur change once the
        // header is scrolled over page content rather than the hero.
        scrolled
          ? "border-line bg-card/90 backdrop-blur-md"
          : "border-transparent bg-card",
      )}
    >
      <div
        className={cn(
          // `items-stretch` lets the nav tabs fill the full header height so
          // their hover underline sits on the header's bottom edge.
          "flex w-full items-stretch justify-between px-6 lg:px-10",
          "transition-[height] duration-300 ease-out",
          scrolled ? "h-16" : "h-24",
        )}
      >
        <Logo
          className="self-center"
          markClassName={scrolled ? "h-8 w-8" : "h-12 w-12"}
          nameClassName={scrolled ? "text-sm" : "text-lg"}
        />

        {/* Bilingual nav with hairline separators, as in the reference. */}
        <nav className="hidden items-stretch lg:flex">
          {NAV.map((item) => (
            <a
              key={item.en}
              href={item.href}
              className={cn(
                "group relative flex flex-col items-center justify-center self-stretch px-3 text-center xl:px-5",
                "border-l border-line/70 last:border-r",
              )}
            >
              <span
                className={cn(
                  "font-bold tracking-wide text-ink transition-all duration-300",
                  scrolled ? "text-sm" : "text-base",
                )}
              >
                {item.en}
              </span>
              <span
                className={cn(
                  "mt-0.5 text-muted transition-all duration-300",
                  scrolled ? "text-xs" : "text-sm",
                )}
              >
                {item.label}
              </span>
              {/* Underline wipe: grows from the left on hover, then retracts to
                  the right on leave. The origin flips with the hover state so
                  each phase runs from the correct edge. Written as inline
                  custom properties because Tailwind's `scale-x-0` and
                  `group-hover:scale-x-100` utilities have equal specificity —
                  whichever ships later in the sheet wins, and the hover variant
                  loses. */}
              <span
                aria-hidden
                className="nav-underline pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-accent"
              />
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 self-center items-center justify-center rounded-lg text-ink lg:hidden"
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">メニュー</span>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-card lg:hidden">
          <nav className="flex w-full flex-col px-6 py-2">
            {NAV.map((item) => (
              <a
                key={item.en}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-3 border-b border-line/70 py-3.5 last:border-b-0 hover:bg-surface"
              >
                <span className="text-sm font-bold tracking-wide text-ink">{item.en}</span>
                <span className="text-xs text-muted">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
