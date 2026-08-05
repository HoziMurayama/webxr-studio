import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Faq } from "@/components/sections/Faq";
import { getFaqs } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "よくある質問",
  description: "お問い合わせの前に、よくいただくご質問をまとめました。",
};

export default async function FaqPage() {
  const faqs = await getFaqs();
  return (
    <>
      <PageHero
        en="FAQ"
        title="よくある質問"
        description="お問い合わせの前に、よくいただくご質問をまとめました。"
      />
      <Faq faqs={faqs} />
    </>
  );
}
