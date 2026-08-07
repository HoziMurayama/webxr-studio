import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ServiceDetail } from "@/components/sections/ServiceDetail";

// 本文はコンポーネント内の定数（DB 非依存）だが、共有レイアウトが設定を読むため
// `force-dynamic` は残す。
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "サービス",
  description:
    "Web制作・システム開発・アプリ開発・AI開発の4つの専門チームで、企画から運用まで一貫してご支援します。",
};

export default function ServicePage() {
  return (
    <>
      <PageHero
        en="OUR SERVICES"
        title="4つの専門チームで、ビジネスの可能性をカタチに。"
        description="Web・システム・アプリ・AIを組み合わせ、企画から設計、開発、運用まで一貫してサポートします。"
        image="/about/fv-service.webp"
      />
      <ServiceDetail />
    </>
  );
}
