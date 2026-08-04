import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A full-width page section with a constrained inner container and an eyebrow. */
export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  tone = "default",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted";
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 px-5 py-20 sm:py-28",
        tone === "muted" && "bg-surface",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">
        {(eyebrow || title || description) && (
          <header className="mb-12 max-w-2xl">
            {eyebrow && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-4 text-base leading-relaxed text-muted">{description}</p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
