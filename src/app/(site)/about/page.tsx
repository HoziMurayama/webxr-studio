import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { About } from "@/components/sections/About";
import { getCompany } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "私たちについて",
  description:
    "WEB-XR.STUDIOの理念と歩み。Web制作・システム開発・アプリ開発・AIソリューションを一気通貫でご提供します。",
};

export default async function AboutPage() {
  const company = await getCompany();
  return (
    <>
      <PageHero
        en="ABOUT US"
        title="私たちについて"
        description="お客様のITパートナーとして、企画から開発、運用・改善までご一緒します。"
      />
      <About company={company} />
    </>
  );
}
