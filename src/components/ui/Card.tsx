import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  return (
    <As
      className={cn(
        "rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-[0_8px_30px_rgb(13,16,23,0.06)]",
        className,
      )}
    >
      {children}
    </As>
  );
}
