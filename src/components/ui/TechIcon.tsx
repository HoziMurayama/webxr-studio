import * as simpleIcons from "simple-icons";
import { cn } from "@/lib/utils";

/**
 * Brand logo for a technology name, drawn from `simple-icons`.
 *
 * Names in the content don't always match the icon set's titles (e.g. "SCSS"
 * ships as "Sass", "AWS" has no icon at all because Amazon restricts its mark),
 * so `TITLE_OVERRIDES` maps our wording onto theirs and anything unresolved
 * renders as a plain text chip instead.
 */

type SimpleIcon = simpleIcons.SimpleIcon;

const ALL = Object.values(simpleIcons).filter(
  (i): i is SimpleIcon =>
    typeof i === "object" && i !== null && "path" in i && "title" in i,
);

const BY_TITLE = new Map(ALL.map((i) => [i.title.toLowerCase(), i]));

// Our label -> the icon set's title. Only needed where the two differ.
const TITLE_OVERRIDES: Record<string, string> = {
  scss: "Sass",
  css3: "CSS",
  "vue.js": "Vue.js",
  "nuxt.js": "Nuxt",
  "react native": "React",
  "spring boot": "Spring Boot",
  "ruby on rails": "Ruby on Rails",
  "google cloud": "Google Cloud",
  gemini: "Google Gemini",
  langgraph: "LangChain",
  llamaindex: "LlamaIndex",
  "hugging face": "Hugging Face",
  "rest api": "OpenAPI Initiative",
  "azure ai": "Microsoft",
  "vertex ai": "Google Cloud",
  ".net": "dotnet",
  "c#": "C Sharp",
};

/** Resolve a display name to an icon, or null when the brand has none. */
function resolve(name: string): SimpleIcon | null {
  const key = name.trim().toLowerCase();
  const mapped = TITLE_OVERRIDES[key];
  if (mapped) {
    const hit = BY_TITLE.get(mapped.toLowerCase());
    if (hit) return hit;
  }
  return BY_TITLE.get(key) ?? null;
}

export function TechIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const icon = resolve(name);
  if (!icon) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-4 w-4 shrink-0", className)}
      // The brand's own colour, so the chips read as a logo wall.
      fill={`#${icon.hex}`}
      aria-hidden="true"
    >
      <path d={icon.path} />
    </svg>
  );
}

/** A tech chip: logo (when one exists) plus the name. */
export function TechChip({ name }: { name: string }) {
  return (
    <li className="inline-flex items-center gap-2 border border-line bg-card px-3 py-1.5 text-sm text-ink-soft">
      <TechIcon name={name} />
      {name}
    </li>
  );
}
