import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import type { SiteSettings } from "@/db/schema";

// Mirrors the header nav, plus 会社案内 which the sitemap also lists.
const NAV = [
  { href: "/about", label: "私たちについて" },
  { href: "/company", label: "会社案内" },
  { href: "/service", label: "サービス" },
  { href: "/case-study", label: "お客様事例" },
  { href: "/faq", label: "よくある質問" },
  { href: "/contact", label: "お問い合わせ" },
];

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-chrome-line bg-chrome">
      <div className="mx-auto w-full max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between md:gap-16">
          <div className="max-w-sm">
            <Logo href={null} className="text-white" />
            <p className="mt-4 text-sm leading-relaxed text-white">
              Web制作・システム開発・アプリ開発・AIソリューションを一気通貫で。
              作って終わりではなく、育て続けるITパートナーです。
            </p>
            {/* メールアドレスはフッターに出さない。問い合わせはフォームへ
                誘導する（設定値そのものは残してあり、他の用途では使える）。 */}
            {settings?.phone && (
              <a
                href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                className="mt-1 block text-sm font-semibold text-white underline-offset-4 hover:underline"
              >
                {settings.phone}
              </a>
            )}
          </div>

          {/* サイトマップは横並び。縦に積むとフッターが背丈のぶんだけ
              伸びるので、折り返しながら1〜2行に収める。 */}
          <div className="text-sm">
            <p className="mb-3 font-semibold text-white">サイトマップ</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-chrome-line pt-6 text-xs text-white sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} WEB-XR.studio. All rights reserved.</p>
          {settings?.address && <p>{settings.address}</p>}
        </div>
      </div>
    </footer>
  );
}
