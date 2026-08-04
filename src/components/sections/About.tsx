import { Section } from "@/components/ui/Section";
import type { Company } from "@/db/schema";

export function About({ company }: { company: Company | null }) {
  if (!company) return null;

  return (
    <Section id="about" eyebrow="About Us" title="会社概要">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6 text-base leading-relaxed text-ink-soft">
          {company.about && <p>{company.about}</p>}
          {company.history && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">
                沿革
              </h3>
              <p>{company.history}</p>
            </div>
          )}
          {company.mission && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">
                ミッション
              </h3>
              <p>{company.mission}</p>
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-line bg-surface p-7">
          <p className="text-sm font-semibold text-ink">会社データ</p>
          <dl className="mt-5 space-y-4">
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <dt className="text-sm text-muted">会社名</dt>
              <dd className="text-sm font-medium text-ink">{company.name}</dd>
            </div>
            {(company.stats ?? []).map((s) => (
              <div
                key={s.label}
                className="flex items-baseline justify-between gap-4 border-b border-line pb-3 last:border-b-0"
              >
                <dt className="text-sm text-muted">{s.label}</dt>
                <dd className="text-sm font-medium text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </Section>
  );
}
