import { Fragment } from "react";
import Image from "next/image";
import { XrMark } from "@/components/brand/XrMark";
import { ProjectMatch } from "@/components/sections/ProjectMatch";
import type { Company } from "@/db/schema";

/**
 * Renders the tagline with every literal "XR" replaced by the brand mark.
 * Falls through untouched when the tagline contains no "XR", so an edit in the
 * admin panel can never break the heading.
 */
function taglineWithMark(text: string) {
  const parts = text.split("XR");
  if (parts.length === 1) return text;
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && <XrMark />}
    </Fragment>
  ));
}

export function Hero({ company }: { company: Company | null }) {
  const tagline =
    company?.tagline || "Web・アプリ・AIで、事業の次の一手をつくる。";

  return (
    // The header is `fixed` and transparent at rest, so the blue field runs up
    // behind it — no top margin. `pt-24` instead keeps the copy clear of the
    // header's resting height (h-24) while the background fills to the top.
    // The CTO card overlaps this section's bottom edge by 96/128px, so the
    // bottom padding is deep enough that the card only ever covers background,
    // never the copy or the map.
    <section className="hero-bg reveal relative isolate flex min-h-[34rem] items-center overflow-hidden px-5 pb-32 pt-36 sm:min-h-[40rem] sm:pb-40 sm:pt-40">
      {/* Heading left, map right. The map takes the larger share now that it is
          rendered big; below `lg` the two stack and the map sits underneath. */}
      {/* Heading left, map right. The map takes the larger share now that it is
          rendered big; below `lg` the two stack and the map sits underneath. */}
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[auto_minmax(0,1fr)]">
        <div className="min-w-0">
          {/* `aria-label` carries the plain string so screen readers announce the
              tagline as text, not as prose interrupted by an image. */}
          <h1
            aria-label={tagline}
            // `whitespace-nowrap` keeps "WEB-XR.studio" on one line — the inline
            // mark is ~1.6x wider than the letters it replaces, so the name would
            // otherwise wrap after the mark in the narrower heading column.
            // `text-[7.5vw]` below `sm` keeps the un-wrappable name inside even a
            // 320px viewport; from `sm` up the fixed sizes always fit.
            // 見出しの文字列は列の幅いっぱいには届かないので、そのままだと
            // 下の説明文の右端との間に余りが出て、左に寄って見える。列の
            // 中央に置いて、下のかたまりと中心を合わせる。
            className="whitespace-nowrap text-center text-[7.5vw] font-black leading-[1.1] tracking-tight text-white sm:text-5xl xl:text-6xl"
          >
            {taglineWithMark(tagline)}
          </h1>
          {/* 上限は見出しの実寸に合わせてある（`lg` で 448px、`xl` で 576px）。
              二段組になる `lg` 以上では、これで説明文の右端が見出しと揃う。
              上限を外すと列そのものが伸びて右の地図が消えるため、外せない。
              一段になる `lg` 未満では見出しが幅いっぱいに広がるので、
              上限を掛けず同じ幅に流す。 */}
          <p className="mt-5 text-lg leading-relaxed text-white sm:mt-6 sm:text-xl lg:max-w-md xl:max-w-xl xl:text-2xl">
            株式会社WEB-XR.studioは、お客様のビジネス成長を加速させるITパートナーです。豊富なWeb制作実績を強みに、システム構築からアプリ開発、AI実装までワンストップで最適なソリューションをご提供いたします。
          </p>
          {/* 相談の入口。1つ目はその場で担当チームを判定するモーダルを開き、
              2つ目は問い合わせページへ送る。説明文との間は ProjectMatch 側で
              罫線を引いて区切っている。 */}
          <ProjectMatch />
        </div>
        {/*拠点マップ. Decorative — the locations are conveyed by the
            surrounding copy, so the alt text stays descriptive but brief. */}
        <Image
          src="/japan-map.png"
          alt="日本地図。全国の拠点にWEB-XR.studioのロゴを表示。"
          width={900}
          height={801}
          priority
          sizes="(min-width: 1280px) 40rem, (min-width: 1024px) 34rem, (min-width: 640px) 28rem, 20rem"
          className="mx-auto h-auto w-[20rem] max-w-full sm:w-[28rem] lg:w-[34rem] xl:w-[40rem]"
        />
      </div>
    </section>
  );
}
