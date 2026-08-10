// Seed the database with placeholder content for every section, then build the
// RAG index. Run with:  npm run db:seed
//
// The copy here is intentionally generic placeholder text — real content is
// entered later through the admin dashboard. Company facts that are known and
// stable (founding year, service focus) are reflected so the site is coherent.
// Env (.env.local / .env) is loaded inside ./index for standalone scripts.
import { db } from "./index";
import { company, portfolio, faqs, siteSettings } from "./schema";
import { reindexAll } from "@/lib/rag";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear content tables (idempotent re-seed). Order doesn't matter — no FKs.
  await Promise.all([
    db.delete(portfolio),
    db.delete(faqs),
    db.delete(company),
    db.delete(siteSettings),
  ]);

  await db.insert(company).values({
    id: 1,
    name: "WEB-XR.studio",
    tagline: "Web・アプリ・AIで、事業の次の一手をつくる。",
    about:
      "私たちWEB-XR.studioは、単なる制作会社ではなく、お客様のITパートナーです。豊富なWeb制作の経験を礎に、システム・アプリ・AIまで一気通貫でご支援します。納品して終わりではなく、公開後の運用・改善まで伴走することを大切にしています。",
    mission:
      "テクノロジーの力で、お客様のビジネスに新しい可能性を届けること。作って終わりではなく、育て続けるパートナーであること。",
    history:
      "8年前にシステム開発事業を開始し、Web制作で培った知見を武器に事業を拡大してきました。その2年後にはアプリ開発へと領域を広げ、3年前からはAIソリューションの開発にも本格的に取り組んでいます。",
    stats: [
      { label: "設立", value: "2022年" },
      { label: "システム開発", value: "8年+" },
      { label: "アプリ開発", value: "6年+" },
      { label: "AI開発", value: "3年+" },
    ],
  });

  await db.insert(portfolio).values([
    {
      title: "スクロール演出のブランドLP",
      description:
        "スクロールに連動したアニメーションで世界観を伝える、高品質なランディングページ。",
      tags: ["LP", "アニメーション", "Next.js"],
      order: 1,
    },
    {
      title: "オーガニック食品ECサイト",
      description: "MERNスタックで構築したフルスタックのECサイト。",
      tags: ["EC", "React", "Node.js", "MongoDB"],
      order: 2,
    },
    {
      title: "セキュリティ企業向けWebシステム",
      description: "業務フローに合わせた管理機能を備えたWebシステム。",
      tags: ["システム開発", "業務システム"],
      order: 3,
    },
    {
      title: "教育ポータル & 管理システム",
      description: "Laravelベースの教育ポータルサイトと管理システム。",
      tags: ["Laravel", "PHP", "管理システム"],
      order: 4,
    },
  ]);

  await db.insert(faqs).values([
    {
      question: "対応可能な開発領域を教えてください。",
      answer:
        "Web制作、システム開発、モバイルアプリ開発（iOS/Android/Flutter）、AI・ChatGPT連携まで幅広く対応しています。",
      order: 1,
    },
    {
      question: "小規模な案件でも相談できますか？",
      answer:
        "はい。ランディングページ1枚から大規模システムまで、規模を問わずご相談いただけます。",
      order: 2,
    },
    {
      question: "納品後の運用・保守もお願いできますか？",
      answer:
        "もちろんです。私たちは「作って終わり」ではなく、公開後の運用・改善まで伴走することを大切にしています。",
      order: 3,
    },
    {
      question: "見積もりは無料ですか？",
      answer:
        "はい、お見積もり・ご相談は無料です。お問い合わせフォームよりお気軽にご連絡ください。",
      order: 4,
    },
  ]);

  await db.insert(siteSettings).values({
    id: 1,
    contactEmail: "contact@web-xr.studio",
    phone: "",
    address: "",
    socials: [
      { label: "Lancers", url: "https://www.lancers.jp/profile/WEB-XR_studio" },
    ],
    seoTitle: "WEB-XR.studio｜Web・アプリ・AI開発スタジオ",
    seoDescription:
      "WEB-XR.studioは、Web制作・システム開発・アプリ開発・AIソリューションを一気通貫で提供する開発スタジオです。",
  });

  console.log(
    "✅ Content seeded. Building RAG index (first run downloads the embedding model)...",
  );
  const n = await reindexAll();
  console.log(`✅ RAG index built: ${n} chunks embedded.`);
  console.log("🎉 Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
