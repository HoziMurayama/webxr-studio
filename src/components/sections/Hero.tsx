import { ButtonLink } from "@/components/ui/Button";
import type { Company } from "@/db/schema";

export function Hero({ company }: { company: Company | null }) {
  const tagline = company?.tagline || "Web・アプリ・AIで、事業の次の一手をつくる。";
  const stats = company?.stats ?? [];

  return (
    // The illustration is a CSS background rather than an <img>: it is purely
    // decorative, and `background-position: right center` keeps its subject
    // (which sits on the right half) intact while the copy uses the open space
    // on the left. `hero-bg` also paints the readability wash — see globals.css.
    // `pt-24` clears the fixed header, which the hero now sits beneath.
    <section className="hero-bg reveal relative isolate flex min-h-[36rem] items-center overflow-hidden px-5 pb-16 pt-40 sm:min-h-[40rem] sm:pb-24 sm:pt-44">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="max-w-2xl text-4xl font-black leading-[1.1] tracking-tight text-ink sm:text-5xl lg:max-w-xl xl:max-w-2xl xl:text-6xl">
          {tagline}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft lg:max-w-md xl:max-w-lg">
          私たちWEB-XR.STUDIOは、単なる制作会社ではなくお客様のITパートナーです。
          企画から開発、そして公開後の運用・改善まで一気通貫で伴走します。
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="#contact" size="lg">
            無料で相談する
          </ButtonLink>
          <ButtonLink href="#services" size="lg" variant="secondary">
            サービスを見る
          </ButtonLink>
        </div>

        {stats.length > 0 && (
          // Sits over the busiest part of the artwork, so it carries its own
          // translucent surface instead of relying on the section-wide wash.
          <dl className="mt-16 grid max-w-3xl grid-cols-2 gap-6 rounded-2xl border border-line/70 bg-card/75 p-6 backdrop-blur-md sm:grid-cols-4 lg:max-w-2xl xl:max-w-3xl">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-sm text-ink-soft">{s.label}</dt>
                <dd className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
