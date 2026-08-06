import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { About } from "@/components/sections/About";

// The ABOUT US content is editorial copy held in the component, not DB-backed,
// so this page needs no data fetch — but the shared layout still reads settings,
// so `force-dynamic` stays.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "私たちについて",
  description:
    "Web・システム・アプリ・AIの4つの専門チームが連携し、企画から運用までワンストップでご提供します。",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        en="ABOUT US"
        title="私たちについて"
        description="Web・システム・アプリ・AIを専門とするエンジニア・デザイナーの開発チームです。"
        image="/about/hero.webp"
      />
      <About showHeader={false} />
    </>
  );
}
