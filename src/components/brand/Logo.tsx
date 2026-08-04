import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The WEB-XR.STUDIO mark: a bold "XR" wrapped by two rotation arrows
 * (top-right + bottom-left), drawn inline from the brand asset geometry so it
 * scales crisply and inherits the ink color. Optionally followed by the name.
 */
export function Logo({
  className,
  href = "/",
  showName = true,
}: {
  className?: string;
  href?: string | null;
  showName?: boolean;
}) {
  const mark = (
    <span className="inline-flex items-center gap-2.5">
      <svg
        viewBox="0 0 200 200"
        className="h-8 w-8 shrink-0 text-ink"
        role="img"
        aria-label={showName ? undefined : "WEB-XR.STUDIO"}
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
        <span className="text-sm font-semibold tracking-tight text-ink">
          WEB-XR.STUDIO
        </span>
      )}
    </span>
  );

  const content = <span className={cn("inline-flex items-center", className)}>{mark}</span>;

  if (href === null) return content;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="WEB-XR.STUDIO ホーム">
      {content}
    </Link>
  );
}
