import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Portfolio } from "@/components/sections/Portfolio";
import { Reviews } from "@/components/sections/Reviews";
import { getPortfolio, getReviews } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "お客様事例",
  description: "これまでに手がけたプロジェクトと、お客様からいただいた評価をご紹介します。",
};

export default async function CaseStudyPage() {
  const [portfolio, reviews] = await Promise.all([getPortfolio(), getReviews()]);
  return (
    <>
      <PageHero
        en="CASE STUDY"
        title="お客様事例"
        description="これまでに手がけたプロジェクトの一部と、お客様の声をご紹介します。"
      />
      <Portfolio items={portfolio} />
      <Reviews reviews={reviews} />
    </>
  );
}
