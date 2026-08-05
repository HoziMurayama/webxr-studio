import type { Company } from "@/db/schema";

export function Hero({ company }: { company: Company | null }) {
  const tagline = company?.tagline || "Web・アプリ・AIで、事業の次の一手をつくる。";

  return (
    // The header is `fixed`, so it sits outside the flow and would otherwise
    // cover the top of this section. `mt-24` (its resting height) pushes the
    // hero clear, letting the illustration start immediately below the nav.
    //
    // `aspect-[1376/768]` is the artwork's own ratio, so the full-width
    // background renders at exactly the section's height and the whole
    // illustration is visible on load. Keep it in step with the real
    // dimensions of public/hero-bg.png.
    <section className="hero-bg reveal relative isolate mt-16 aspect-[1376/768] min-h-[22rem] overflow-hidden px-5 sm:mt-24">
      {/* The heading is pinned to a fixed offset from the top rather than
          vertically centred: the section's height is driven by the aspect
          ratio, so centring made the title drift up and down as the viewport
          width changed. */}
      <div className="mx-auto w-full max-w-6xl pt-[12%]">
        <h1 className="max-w-2xl text-4xl font-black leading-[1.1] tracking-tight text-ink sm:text-5xl lg:max-w-xl xl:max-w-2xl xl:text-6xl">
          {tagline}
        </h1>
      </div>
    </section>
  );
}
