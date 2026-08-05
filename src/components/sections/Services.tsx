import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { Service } from "@/db/schema";

export function Services({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <Section
      id="services"
      align="center"
      tone="muted"
      eyebrow="Services"
      title="サービス内容"
      description="Web制作からシステム・アプリ・AIまで。一社で一気通貫にご支援します。"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => (
          <Card key={s.id} as="article" className="flex flex-col">
            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white">
              <Icon name={s.icon} width={22} height={22} />
            </div>
            <h3 className="text-lg font-bold text-ink">{s.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.description}</p>
            {s.price && (
              <p className="mt-4 text-sm font-semibold text-accent-ink">{s.price}</p>
            )}
          </Card>
        ))}
      </div>
    </Section>
  );
}
