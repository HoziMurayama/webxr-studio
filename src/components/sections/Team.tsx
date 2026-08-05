import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import type { TeamMember } from "@/db/schema";

function initials(name: string) {
  return name.trim().slice(0, 2);
}

export function Team({ members }: { members: TeamMember[] }) {
  if (members.length === 0) return null;

  return (
    <Section
      id="team"
      align="center"
      eyebrow="Team"
      title="チーム紹介"
      description="少数精鋭で、企画から運用までを担うメンバーです。"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <Card key={m.id} as="article" className="flex flex-col items-start">
            <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-lg font-bold text-ink-soft">
              {m.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.avatarUrl} alt={m.name} className="h-full w-full object-cover" />
              ) : (
                initials(m.name)
              )}
            </div>
            <h3 className="text-base font-bold text-ink">{m.name}</h3>
            {m.role && <p className="text-sm text-accent-ink">{m.role}</p>}
            {m.bio && <p className="mt-3 text-sm leading-relaxed text-muted">{m.bio}</p>}
            {(m.socials ?? []).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {(m.socials ?? []).map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-muted hover:text-ink"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </Section>
  );
}
