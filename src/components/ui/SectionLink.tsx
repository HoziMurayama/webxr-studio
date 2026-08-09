import Link from "next/link";

/**
 * セクション末尾に置く、対応ページへの導線。
 *
 * トップページの各セクションは概要だけを見せ、全量はそれぞれのページに置く。
 * その橋渡しをするボタンで、サイト内で見た目を揃えるためここに集約している。
 */
export function SectionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-12 flex justify-center">
      <Link
        href={href}
        className="group inline-flex items-center gap-2 border border-accent px-7 py-3.5 text-base font-semibold text-accent-ink transition-colors hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2"
      >
        {children}
        <svg
          viewBox="0 0 20 20"
          aria-hidden
          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 10h11M11 5l5 5-5 5" />
        </svg>
      </Link>
    </div>
  );
}
