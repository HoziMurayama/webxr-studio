"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "ダッシュボード", exact: true },
  { href: "/admin/company", label: "会社概要" },
  { href: "/admin/services", label: "サービス内容" },
  { href: "/admin/portfolio", label: "制作実績" },
  { href: "/admin/reviews", label: "クライアントの声" },
  { href: "/admin/team", label: "チーム紹介" },
  { href: "/admin/faqs", label: "よくある質問" },
  { href: "/admin/site_settings", label: "サイト設定" },
  { href: "/admin/contacts", label: "お問い合わせ" },
  { href: "/admin/ai", label: "AIインデックス" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const sidebar = (
    <nav className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo href="/admin" showName />
      </div>
      <ul className="flex-1 space-y-1 px-3">
        {NAV.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive(item)
                  ? "bg-ink text-white"
                  : "text-ink-soft hover:bg-surface",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="space-y-1 border-t border-line p-3">
        <Link
          href="/"
          target="_blank"
          className="block rounded-lg px-3 py-2.5 text-sm text-ink-soft hover:bg-surface"
        >
          サイトを表示 ↗
        </Link>
        <button
          onClick={logout}
          className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
        >
          ログアウト
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
        <Logo href="/admin" showName={false} />
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="メニュー"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      <div className="mx-auto flex max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-line bg-white lg:block">
          {sidebar}
        </aside>

        {/* Mobile drawer */}
        {open && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/30 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-line bg-white lg:hidden">
              {sidebar}
            </aside>
          </>
        )}

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
