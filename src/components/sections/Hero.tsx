import type { Company } from "@/db/schema";

export function Hero({ company }: { company: Company | null }) {
  const tagline = company?.tagline || "Web・アプリ・AIで、事業の次の一手をつくる。";

  return (
    // The header is `fixed`, so it sits outside the flow and would otherwise
    // cover the top of this section. `mt-24` (its resting height) pushes the
    // hero clear, letting the illustration start immediately below the nav.
    //
    // `mt-24` matches the header's resting height (h-24) at every width — that
    // height is driven by scroll position, not by a breakpoint, so the offset
    // must not shrink on mobile. The section is sized by its own height now
    // that no artwork dictates an aspect ratio.
    <section className="hero-bg reveal relative isolate mt-24 flex min-h-[24rem] items-center overflow-hidden px-5 py-20 sm:min-h-[28rem] sm:py-28">
      {/* Safe to centre again: the section's height no longer follows an image
          aspect ratio, so the heading stays put as the viewport width changes. */}
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="max-w-2xl text-4xl font-black leading-[1.1] tracking-tight text-ink sm:text-5xl lg:max-w-xl xl:max-w-2xl xl:text-6xl">
          {tagline}
        </h1>
      </div>
    </section>
  );
}
