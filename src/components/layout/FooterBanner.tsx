"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Full-width call-to-action band sitting directly above the footer.
 *
 * Only the button navigates — the band itself is not a link, so selecting the
 * copy or clicking the photo does nothing.
 *
 * Hidden on /contact itself, where it would link to the page you are already
 * on. Needs to be a client component only for that path check.
 */
export function FooterBanner() {
  const pathname = usePathname();
  if (pathname === "/contact") return null;

  return (
    <section aria-labelledby="footer-cta-heading" className="bg-surface">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-5 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-14 lg:py-16">
        <div>
          <p className="text-sm font-bold tracking-[0.18em] text-accent-ink">
            CONTACT
          </p>
          <h2
            id="footer-cta-heading"
            className="mt-3 text-2xl font-black leading-tight tracking-tight text-ink sm:text-3xl xl:text-4xl"
          >
            まずはお気軽に
            <br className="hidden sm:block" />
            ご相談ください
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
            Web制作・システム開発・アプリ開発・AI開発まで、
            専門チームがお客様の課題に最適な形をご提案します。
            ご相談・お見積もりは無料です。
          </p>

          {/* リンクはこのボタンのみ。帯全体をリンクにすると、テキストの選択や
              画像のクリックでも遷移してしまうため。 */}
          <Link
            href="/contact"
            className="group mt-7 inline-flex items-center gap-2 bg-accent px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2"
          >
            お問い合わせはこちら
            <svg
              viewBox="0 0 20 20"
              aria-hidden
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 10h11M11 5l5 5-5 5" />
            </svg>
          </Link>
        </div>

        <Image
          src="/about/footer-cta.webp"
          alt=""
          aria-hidden
          width={760}
          height={803}
          sizes="(min-width: 1024px) 26rem, 100vw"
          className="mx-auto h-auto w-full max-w-sm lg:max-w-none"
        />
      </div>
    </section>
  );
}
