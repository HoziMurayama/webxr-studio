import { cn } from "@/lib/utils";

/**
 * The bare XR mark — two rotation arrows around the "XR" glyphs — with no
 * wordmark or link, standing in for the letters "XR" inside a heading.
 *
 * Sizing: the inner <text> is 72 units in a 200-unit viewBox, so at a 1em box
 * those glyphs would render at 0.36em — visibly smaller than the letters beside
 * them. The box is therefore 200/72 = 2.778em, which makes the inner "XR"
 * exactly 1em and match its neighbours. The arrow ring consequently extends
 * well past the cap height, which is what gives the mark its ring.
 *
 * Shares its geometry with `Logo`; keep the two paths in step.
 */
// 200 (viewBox) / 72 (inner font-size) — the scale that makes the glyphs 1em.
const BOX_EM = 200 / 72;
// The inner baseline sits at y=123 of 200; drop the box so that lands on the
// surrounding text baseline.
const BASELINE_SHIFT_EM = (1 - 123 / 200) * BOX_EM;
// The arrow paths span x=18..182, so 18/200 of the box is empty on each side.
const SIDE_BEARING_EM = (18 / 200) * BOX_EM;

export function XrMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      style={{
        width: `${BOX_EM}em`,
        height: `${BOX_EM}em`,
        verticalAlign: `${-BASELINE_SHIFT_EM}em`,
        // The arrow ring stops at x=18/182, leaving 0.25em of empty box each
        // side. Pull that back so the mark does not visibly stretch the word.
        marginInline: `${-SIDE_BEARING_EM}em`,
      }}
      className={cn("inline-block", className)}
      // Decorative here: the surrounding heading carries an `aria-label` with
      // the full text, so announcing "XR" again would duplicate it.
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M 93 18 C 112 19 130 25 145 36 C 165 50 178 72 182 96 L 168 96 C 163 72 149 53 129 43 L 121 50 Z"
      />
      <path
        fill="currentColor"
        transform="rotate(180 100 100)"
        d="M 93 18 C 112 19 130 25 145 36 C 165 50 178 72 182 96 L 168 96 C 163 72 149 53 129 43 L 121 50 Z"
      />
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
  );
}
