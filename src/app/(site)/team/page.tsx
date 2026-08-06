import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Team } from "@/components/sections/Team";
import { getTeam } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "チーム",
  description: "企画から運用までを担う、WEB-XR.studioのメンバーをご紹介します。",
};

export default async function TeamPage() {
  const team = await getTeam();
  return (
    <>
      <PageHero
        en="TEAM"
        title="チーム"
        description="少数精鋭で、企画から運用までを担うメンバーです。"
        image="/about/fv-team.webp"
      />
      <Team members={team} />
    </>
  );
}
