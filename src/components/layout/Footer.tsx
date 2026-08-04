import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import type { SiteSettings } from "@/db/schema";

const NAV = [
  { href: "#about", label: "会社概要" },
  { href: "#services", label: "サービス" },
  { href: "#portfolio", label: "制作実績" },
  { href: "#reviews", label: "お客様の声" },
  { href: "#team", label: "チーム" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "お問い合わせ" },
];

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const year = new Date().getFullYear();
  const socials = settings?.socials ?? [];

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo href={null} />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Web制作・システム開発・アプリ開発・AIソリューションを一気通貫で。
              作って終わりではなく、育て続けるITパートナーです。
            </p>
            {settings?.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="mt-4 inline-block text-sm font-medium text-ink hover:text-accent"
              >
                {settings.contactEmail}
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm">
            <div>
              <p className="mb-3 font-semibold text-ink">サイトマップ</p>
              <ul className="space-y-2">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-muted hover:text-ink">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 font-semibold text-ink">リンク</p>
              <ul className="space-y-2">
                {socials.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-ink"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
                <li>
                  <Link href="/admin" className="text-muted hover:text-ink">
                    管理画面
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} WEB-XR.STUDIO. All rights reserved.</p>
          {settings?.address && <p>{settings.address}</p>}
        </div>
      </div>
    </footer>
  );
}
