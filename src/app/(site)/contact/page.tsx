import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Inquiry } from "@/components/sections/Inquiry";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "ご相談・お見積もりは無料です。お気軽にご連絡ください。",
};

// 本文はコンポーネント側で完結しており、このページ自体はデータ取得が不要。
// 共有レイアウトが設定を読むため `force-dynamic` は残す。
export default function ContactPage() {
  return (
    <>
      <PageHero
        en="INQUIRY"
        title="お問い合わせ"
        description="ご相談・お見積もりは無料です。お気軽にご連絡ください。"
        image="/about/fv-contact.webp"
      />
      <Inquiry showHeader={false} />
    </>
  );
}
