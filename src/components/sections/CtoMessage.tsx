import Image from "next/image";
import Link from "next/link";

/**
 * CTO message card: banner image on the left, copy on the right, sitting in a
 * white card that overlaps the hero's lower edge — the layout used by the
 * reference site's post-hero band.
 *
 * The whole card is a single link to the inquiry section, so it carries no
 * button of its own.
 */
export function CtoMessage() {
  return (
    // `relative z-10` lifts the whole section above the hero so the card is
    // painted on top of the blue field rather than behind it.
    <section
      id="cto"
      aria-labelledby="cto-heading"
      className="relative z-10 scroll-mt-20 px-5 pb-16 pt-0"
    >
      {/* Pulled up so the card's top sits inside the hero: the blue field runs
          underneath while the card itself stays fully visible. Square corners
          by request — no `rounded-*` here.

          `max-w-7xl` (was 6xl) widens the card; the tighter padding and gap
          below take height out of it. */}
      <Link
        href="/contact"
        // The link wraps a heading and body copy; without an explicit name the
        // announced label would be the whole block read as one run-on string.
        aria-label="お気軽にお問い合わせください。お問い合わせフォームへ移動します。"
        className="mx-auto -mt-24 block w-full max-w-7xl border border-line bg-card px-5 py-4 shadow-[0_18px_60px_rgb(13,16,23,0.14)] transition-shadow hover:shadow-[0_22px_70px_rgb(13,16,23,0.20)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 sm:-mt-32 sm:px-8 sm:py-6"
      >
        {/* The image is the tallest element, so the text column takes the extra
            width the wider card provides — giving it to the image instead would
            scale the banner up and make the card taller, not shorter. */}
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:gap-10">
          <Image
            src="/cto-banner.png"
            alt="最高技術責任者 村山ほじ。お気軽にお問い合わせください。"
            width={1120}
            height={698}
            sizes="(min-width: 1024px) 30rem, 100vw"
            // Capped so the wider card does not scale the banner up: the image
            // is the tallest element, so an uncapped width would make the card
            // taller rather than shorter.
            className="mx-auto h-auto w-full lg:max-w-[30rem]"
          />

          <div>
            <p className="text-sm font-semibold tracking-wide text-accent-ink">
              最高技術責任者にご連絡いただく場合は
            </p>
            <h2
              id="cto-heading"
              className="mt-2 text-2xl font-bold leading-snug tracking-tight text-ink sm:text-3xl"
            >
              お気軽にお問い合わせください
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-soft sm:text-lg">
            Web制作・システム開発・アプリ開発・AI開発まで幅広く対応。弊社の最高技術責任者（CTO）が直接ご相談を承り、お客様に最適な技術をご提案いたします。小規模なご相談から大規模開発まで、お気軽にお問い合わせください。
            </p>

            <div className="mt-4 border-t border-line pt-4">
              <p className="text-sm text-muted">最高技術責任者</p>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-3 text-lg font-bold tracking-tight text-ink">
                村山 ほじ
                <span className="text-sm font-medium tracking-wide text-muted">
                  Hoji Murayama
                </span>
              </p>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
