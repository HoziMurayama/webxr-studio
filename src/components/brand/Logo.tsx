import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The WEB-XR.studio mark: a bold "XR" wrapped by two rotation arrows
 * (top-right + bottom-left), drawn inline from the brand asset geometry so it
 * scales crisply and inherits the ink color. Optionally followed by the name.
 */
export function Logo({
  className,
  href = "/",
  showName = true,
  markClassName = "h-8 w-8",
  nameClassName = "text-sm",
}: {
  className?: string;
  href?: string | null;
  showName?: boolean;
  /** Size utilities for the mark; callers animate this to resize the logo. */
  markClassName?: string;
  /** Size utilities for the wordmark, kept in step with `markClassName`. */
  nameClassName?: string;
}) {
  const mark = (
    <span className="inline-flex items-center gap-2.5">
      <svg
        viewBox="0 0 200 200"
        className={cn(
          "shrink-0 transition-[width,height] duration-300 ease-out",
          markClassName,
        )}
        role="img"
        aria-label={showName ? undefined : "WEB-XR.studio"}
        aria-hidden={showName ? true : undefined}
      >
        {/* Top-right arrow */}
        <path
          fill="currentColor"
          d="M 93 18 C 112 19 130 25 145 36 C 165 50 178 72 182 96 L 168 96 C 163 72 149 53 129 43 L 121 50 Z"
        />
        {/* Bottom-left arrow (180° rotation) */}
        <path
          fill="currentColor"
          transform="rotate(180 100 100)"
          d="M 93 18 C 112 19 130 25 145 36 C 165 50 178 72 182 96 L 168 96 C 163 72 149 53 129 43 L 121 50 Z"
        />
        {/* XR wordmark */}
        <text
          x="100"
          y="123"
          textAnchor="middle"
          fill="currentColor"
          fontFamily='"Arial Black", Arial, Helvetica, sans-serif'
          fontSize="72"
          fontWeight="900"
          letterSpacing="-2"
        >
          XR
        </text>
      </svg>
      {showName && (
        <span
          className={cn(
            "font-semibold tracking-tight transition-[font-size] duration-300 ease-out",
            nameClassName,
          )}
        >
          WEB-XR.studio
        </span>
      )}
    </span>
  );

  // Both the mark and the wordmark inherit `currentColor`, so a caller on a
  // dark background can recolor the whole logo with a single text utility.
  const content = (
    <span className={cn("inline-flex items-center text-ink", className)}>
      {mark}
    </span>
  );

  if (href === null) return content;
  return (
    <Link
      href={href}
      className="inline-flex items-center"
      aria-label="WEB-XR.studio ホーム"
    >
      {content}
    </Link>
  );
}
