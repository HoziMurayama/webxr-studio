import { Section } from "@/components/ui/Section";
import { ServiceCarousel } from "@/components/sections/ServiceCarousel";
import { DOMAINS } from "@/components/sections/ServiceDetail";

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
      tone="muted"
      eyebrow="Services"
      title="サービス内容"
      description="Web制作からシステム・アプリ・AIまで。一社で一気通貫にご支援します。"
    >
      <ServiceCarousel domains={DOMAINS} />
    </Section>
  );
}
