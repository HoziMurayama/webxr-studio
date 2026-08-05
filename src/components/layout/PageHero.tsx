/**
 * Banner for the standalone tab pages. Mirrors the top page's blue field so the
 * fixed header (which is white-on-transparent while over `.hero-bg`) stays
 * legible, and gives each page a bilingual title in the site's nav idiom.
 */
export function PageHero({
  en,
  title,
  description,
}: {
  en: string;
  title: string;
  description?: string;
}) {
  return (
    // `hero-bg` is the shared blue field. The header keys its white-text state
    // off this class, so every inner page must carry it.
    //
    // The top padding clears the fixed header (h-24 = 96px) and the bottom
    // padding matches it, so `items-center` centres the text in the *visible*
    // band rather than in the full box — otherwise the header's dead space
    // would push the title low.
    <section className="hero-bg relative isolate flex min-h-[22rem] items-center px-5 pb-12 pt-36 sm:min-h-[26rem] sm:pb-20 sm:pt-44">
      <div className="mx-auto w-full max-w-6xl text-center">
        <p className="text-sm font-bold tracking-[0.18em] text-white/90">{en}</p>
        <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl xl:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
