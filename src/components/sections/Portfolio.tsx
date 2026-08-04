import { Section } from "@/components/ui/Section";
import type { Portfolio as PortfolioItem } from "@/db/schema";

export function Portfolio({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) return null;

  return (
    <Section
      id="portfolio"
      eyebrow="Portfolio"
      title="制作実績"
      description="これまでに手がけたプロジェクトの一部をご紹介します。"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map((p) => {
          const inner = (
            <>
              <div className="aspect-[16/10] w-full overflow-hidden bg-surface-2">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span
                      className="font-black text-ink/10"
                      style={{ fontFamily: '"Arial Black", sans-serif', fontSize: 64 }}
                    >
                      XR
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="mb-3 flex flex-wrap gap-2">
                  {(p.tags ?? []).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-ink-soft"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-bold text-ink">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.description}</p>
              </div>
            </>
          );

          const cls =
            "group block overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-[0_10px_40px_rgb(13,16,23,0.08)]";

          return p.link ? (
            <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer" className={cls}>
              {inner}
            </a>
          ) : (
            <article key={p.id} className={cls}>
              {inner}
            </article>
          );
        })}
      </div>
    </Section>
  );
}
