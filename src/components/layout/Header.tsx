"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

// Bilingual nav: an uppercase English label above its Japanese reading, the
// convention used across Japanese corporate sites. Each tab is a standalone
// route; the top page keeps the same content as a one-page summary.
const NAV = [
  { href: "/about", en: "ABOUT US", label: "私たちについて" },
  { href: "/company", en: "COMPANY", label: "会社案内" },
  { href: "/service", en: "SERVICE", label: "サービス" },
  { href: "/case-study", en: "CASE STUDY", label: "お客様事例" },
  { href: "/team", en: "TEAM", label: "チーム" },
  { href: "/faq", en: "FAQ", label: "よくある質問" },
  { href: "/contact", en: "INQUIRY", label: "お問い合わせ" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Whether the header is currently over the hero's blue field. Tracked
  // separately from `scrolled` because the two switch at different points: the
  // bar shrinks after 80px, but its colours must not invert until the blue
  // actually ends — otherwise a white header sits on the blue for ~560px.
  const [onHero, setOnHero] = useState(true);

  useEffect(() => {
    // Hysteresis: shrink past 80px, only expand again below 40px. A single
    // threshold makes the header flip back and forth when the user hovers
    // right at the boundary or uses momentum scrolling.
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled((prev) => (prev ? y > 40 : y > 80));

      // Invert on the hero's real bottom edge, measured from the DOM so it
      // stays correct however the hero is sized.
      const hero = document.querySelector<HTMLElement>(".hero-bg");
      const headerH = y > 80 ? 64 : 96; // h-16 / h-24
      setOnHero(hero ? hero.getBoundingClientRect().bottom > headerH : false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
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
        // Transparent over the blue hero so the field runs behind it, then
        // solid white once scrolled onto the page's white content. Nav colours
        // invert with it (see `onHero` below).
        onHero
          ? "border-white/20 bg-transparent"
          : "border-line bg-card/95 backdrop-blur-md",
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
          className={cn("self-center transition-colors duration-300", onHero ? "text-white" : "text-ink")}
          markClassName={scrolled ? "h-8 w-8" : "h-12 w-12"}
          nameClassName={scrolled ? "text-sm" : "text-lg"}
        />

        {/* Bilingual nav with hairline separators, as in the reference. */}
        <nav className="hidden items-stretch lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.en}
              href={item.href}
              className={cn(
                "group relative flex flex-col items-center justify-center self-stretch px-3 text-center xl:px-5",
                "border-l last:border-r",
                onHero ? "border-white/25" : "border-line/70",
              )}
            >
              <span
                className={cn(
                  "font-bold tracking-wide transition-all duration-300",
                  onHero ? "text-white" : "text-ink",
                  scrolled ? "text-sm" : "text-base",
                )}
              >
                {item.en}
              </span>
              <span
                className={cn(
                  "mt-0.5 transition-all duration-300",
                  onHero ? "text-white/90" : "text-muted",
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
                className={cn(
                  "nav-underline pointer-events-none absolute inset-x-0 bottom-0 h-0.5",
                  // `bg-accent` is near-invisible on the blue field (1.13:1).
                  onHero ? "bg-white" : "bg-accent",
                )}
              />
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className={cn(
            "inline-flex h-10 w-10 self-center items-center justify-center rounded-lg lg:hidden",
            onHero ? "text-white" : "text-ink",
          )}
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
              <Link
                key={item.en}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-3 border-b border-line/70 py-3.5 last:border-b-0 hover:bg-surface"
              >
                <span className="text-sm font-bold tracking-wide text-ink">{item.en}</span>
                <span className="text-xs text-muted">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
