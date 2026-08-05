import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Contact } from "@/components/sections/Contact";
import { getSiteSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "ご相談・お見積もりは無料です。お気軽にご連絡ください。",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHero
        en="INQUIRY"
        title="お問い合わせ"
        description="ご相談・お見積もりは無料です。お気軽にご連絡ください。"
      />
      <Contact contactEmail={settings?.contactEmail || undefined} />
    </>
  );
}
