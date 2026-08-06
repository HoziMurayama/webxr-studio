/**
 * Banner for the standalone tab pages. Mirrors the top page's blue field so the
 * fixed header (which is white-on-transparent while over `.hero-bg`) stays
 * legible, and gives each page a bilingual title in the site's nav idiom.
 */
export function PageHero({
  en,
  title,
  description,
  image,
}: {
  en: string;
  title: string;
  description?: string;
  /** Optional photo behind the blue field. Kept dark enough for white text. */
  image?: string;
}) {
  return (
    // `hero-bg` is the shared blue field. The header keys its white-text state
    // off this class, so every inner page must carry it.
    //
    // The top padding clears the fixed header (h-24 = 96px) and the bottom
    // padding matches it, so `items-center` centres the text in the *visible*
    // band rather than in the full box — otherwise the header's dead space
    // would push the title low.
    <section className="hero-bg relative isolate flex min-h-[24rem] items-center px-5 pb-12 pt-36 sm:min-h-[28rem] sm:pb-20 sm:pt-44 xl:min-h-[30rem]">
      {image && (
        <>
          {/* Photo, then a blue veil over it: the images are bright, and white
              text on them unveiled measures well under AA. */}
          <div
            aria-hidden
            style={{ backgroundImage: `url(${image})` }}
            className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-hero-from/92"
          />
        </>
      )}
      <div className="mx-auto w-full max-w-6xl text-center">
        <p className="text-base font-bold tracking-[0.18em] text-white/90 sm:text-lg xl:text-xl">
          {en}
        </p>
        <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl xl:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
