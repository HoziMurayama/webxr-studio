import { ButtonLink } from "@/components/ui/Button";
import type { Company } from "@/db/schema";

export function Hero({ company }: { company: Company | null }) {
  const tagline = company?.tagline || "Web・アプリ・AIで、事業の次の一手をつくる。";
  const stats = company?.stats ?? [];

  return (
    <section className="reveal relative overflow-hidden px-5 pb-16 pt-16 sm:pb-24 sm:pt-24">
      {/* Soft brand backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(10,132,255,0.08),transparent_70%)]"
      />
      <div className="mx-auto w-full max-w-6xl">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-xs font-medium text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Web制作 / システム開発 / アプリ開発 / AIソリューション
        </p>
        <h1 className="max-w-4xl text-4xl font-black leading-[1.1] tracking-tight text-ink sm:text-6xl">
          {tagline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
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
          <dl className="mt-16 grid grid-cols-2 gap-6 border-t border-line pt-10 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-sm text-muted">{s.label}</dt>
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
