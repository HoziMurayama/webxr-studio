import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { CaseStudies } from "@/components/sections/CaseStudies";
import { getPortfolio } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "お客様事例",
  description:
    "課題の整理からデザイン、開発、その後の運用まで。お客様と伴走して形にしたプロジェクトと、いただいた声をご紹介します。",
};

export default async function CaseStudyPage() {
  const portfolio = await getPortfolio();
  return (
    <>
      <PageHero
        en="CASE STUDY"
        title="お客様事例"
        description="課題の整理からデザイン、開発、その後の運用まで。お客様と伴走して形にしたプロジェクトと、いただいた声をご紹介します。"
        image="/about/fv-faq.webp"
      />
      <CaseStudies
        items={portfolio}
        description="こちらでご紹介しているのは、2026年に当社が制作した実績の一部です。"
      />
    </>
  );
}
