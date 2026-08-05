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
  align = "left",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted";
  /** Header alignment. "center" also centers the header block itself. */
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <section
      id={id}
      className={cn(
        // scroll-mt clears the fixed header when an anchor link lands here.
        "scroll-mt-20 px-5 py-20 sm:py-28",
        tone === "muted" && "bg-surface",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">
        {(eyebrow || title || description) && (
          <header
            className={cn("mb-12 max-w-2xl", centered && "mx-auto text-center")}
          >
            {eyebrow && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-ink">
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
