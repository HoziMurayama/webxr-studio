import { Section } from "@/components/ui/Section";
import { ServiceCarousel } from "@/components/sections/ServiceCarousel";
import { DOMAINS } from "@/components/sections/ServiceDetail";
import { SectionLink } from "@/components/ui/SectionLink";

/**
 * トップページのサービス紹介。
 *
 * /service と同じ4領域を、チーム紹介と揃えたカルーセルで見せる。カードには
 * 「対応サービス」だけを載せ、「対応プロジェクト」は /service に置く。
 */
export function Services() {
  return (
    <Section
      id="services"
      align="center"
      eyebrow="SERVICE"
      title="サービス"
      description="Web・システム・アプリ・AIを組み合わせ、企画から設計、開発、運用まで一貫してサポートします。"
    >
      <ServiceCarousel domains={DOMAINS} />
      <SectionLink href="/service">サービスをすべて見る</SectionLink>
    </Section>
  );
}
