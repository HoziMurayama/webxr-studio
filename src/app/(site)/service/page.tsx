import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Services } from "@/components/sections/Services";
import { getServices } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "サービス",
  description:
    "Web制作からシステム開発・アプリ開発・AIソリューションまで、一社で一気通貫にご支援します。",
};

export default async function ServicePage() {
  const services = await getServices();
  return (
    <>
      <PageHero
        en="SERVICE"
        title="サービス"
        description="Web制作からシステム・アプリ・AIまで。一社で一気通貫にご支援します。"
      />
      <Services services={services} />
    </>
  );
}
