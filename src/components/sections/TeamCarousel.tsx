"use client";

import { CardCarousel } from "@/components/ui/CardCarousel";
import { TechChip } from "@/components/ui/TechIcon";

/**
 * 4つの専門チームを1枚ずつ見せるカルーセル。
 *
 * トップページ専用。/about では全チームを縦に並べた詳細版を出すため、
 * ここでは中央の1枚に集中してもらう見せ方にしている。
 */

export type CarouselTeam = {
  no: string;
  en: string;
  ja: string;
  mission: string;
  intro: string;
  stack: string[];
  image: string;
};

export function TeamCarousel({ teams }: { teams: CarouselTeam[] }) {
  return (
    <CardCarousel
      items={teams}
      label="専門チーム"
      getKey={(t) => t.no}
      getLabel={(t) => t.ja}
      renderCard={(team) => (
        <>
          {/* ヘッダー帯。/about の詳細カードと同じ青とテクスチャで、
              サイト内の見た目を揃えている。 */}
          <div className="relative isolate bg-chrome p-6 text-center sm:p-8">
            <div
              aria-hidden
              style={{ backgroundImage: `url(${team.image})` }}
              className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-25 mix-blend-luminosity"
            />
            <p className="text-3xl font-black leading-none tracking-tight text-white/45 sm:text-4xl">
              {team.no}
            </p>
            <p className="mt-3 text-sm font-bold tracking-wide text-white/90">
              {team.en}
            </p>
            <h3 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
              {team.ja}
            </h3>
          </div>

          <div className="space-y-6 p-6 text-center sm:p-8">
            <p className="text-base font-bold leading-relaxed text-ink sm:text-lg">
              {team.mission}
            </p>
            <p className="text-sm leading-relaxed text-ink-soft sm:text-base">
              {team.intro}
            </p>
            <ul className="flex flex-wrap justify-center gap-2">
              {/* 全部出すと縦に伸びてカードの高さが揃わないため、
                  代表的なものだけに絞る。全量は /about に載せている。 */}
              {team.stack.slice(0, 8).map((t) => (
                <TechChip key={t} name={t} />
              ))}
            </ul>
          </div>
        </>
      )}
    />
  );
}
