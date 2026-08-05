import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import type { Review } from "@/db/schema";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`評価 ${rating} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          width="16"
          height="16"
          className={i < rating ? "fill-accent" : "fill-line"}
          aria-hidden
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export function Reviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  return (
    <Section
      id="reviews"
      align="center"
      tone="muted"
      eyebrow="Client Reviews"
      title="クライアントの声"
      description="ご一緒したお客様からいただいた評価の一部です。"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <Card key={r.id} as="article" className="flex flex-col">
            <Stars rating={r.rating} />
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
              「{r.body}」
            </blockquote>
            <footer className="mt-5 border-t border-line pt-4">
              <p className="text-sm font-semibold text-ink">{r.clientName}</p>
              {r.role && <p className="text-xs text-muted">{r.role}</p>}
            </footer>
          </Card>
        ))}
      </div>
    </Section>
  );
}
