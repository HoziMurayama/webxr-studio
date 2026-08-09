import { Section } from "@/components/ui/Section";
import type { Faq as FaqItem } from "@/db/schema";

export function Faq({
  faqs,
  /** /faq では PageHero が同じ見出しを出すため抑制する。 */
  showHeader = true,
}: {
  faqs: FaqItem[];
  showHeader?: boolean;
}) {
  if (faqs.length === 0) return null;

  return (
    <Section
      id="faq"
      align="center"
      tone="muted"
      eyebrow={showHeader ? "FAQ" : undefined}
      title={showHeader ? "よくある質問" : undefined}
      description={
        showHeader ? "お問い合わせの前に、よくいただくご質問をまとめました。" : undefined
      }
    >
      <div className="mx-auto max-w-3xl divide-y divide-line rounded-2xl border border-line bg-card">
        {faqs.map((f) => (
          <details key={f.id} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink">
              {f.question}
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                className="shrink-0 text-muted transition-transform group-open:rotate-45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{f.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
