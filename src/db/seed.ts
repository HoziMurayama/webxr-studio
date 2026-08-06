// Seed the database with placeholder content for every section, then build the
// RAG index. Run with:  npm run db:seed
//
// The copy here is intentionally generic placeholder text — real content is
// entered later through the admin dashboard. Company facts that are known and
// stable (founding year, service focus) are reflected so the site is coherent.
// Env (.env.local / .env) is loaded inside ./index for standalone scripts.
import { db } from "./index";
import {
  company,
  services,
  portfolio,
  reviews,
  team,
  faqs,
  siteSettings,
} from "./schema";
import { reindexAll } from "@/lib/rag";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear content tables (idempotent re-seed). Order doesn't matter — no FKs.
  await Promise.all([
    db.delete(services),
    db.delete(portfolio),
    db.delete(reviews),
    db.delete(team),
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

  await db.insert(services).values([
    {
      title: "システム開発",
      description:
        "業務システムや基幹システムの設計・開発。要件定義から運用保守まで、Web制作で培った8年以上の知見で伴走します。",
      icon: "server",
      price: "¥5,000〜/時",
      order: 1,
    },
    {
      title: "Web制作・EC構築",
      description:
        "コーポレートサイト、ランディングページ、ECサイトまで。スクロールアニメーションを含む高品質なUI/UXを実装します。",
      icon: "layout",
      price: "¥4,000〜/時",
      order: 2,
    },
    {
      title: "アプリ開発",
      description:
        "iOS / Android / Flutter によるモバイルアプリ開発。企画から公開・運用改善まで一貫してご支援します。",
      icon: "smartphone",
      price: "¥6,000〜/時",
      order: 3,
    },
    {
      title: "AIソリューション",
      description:
        "ChatGPT・Claude を活用した業務効率化、RAGによる社内ナレッジ検索、AIアシスタントの開発など。",
      icon: "sparkles",
      price: "¥6,500〜/時",
      order: 4,
    },
  ]);

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

  await db.insert(reviews).values([
    {
      clientName: "A様",
      role: "スタートアップ 代表",
      body: "柔軟に対応いただき、こちらの意図を汲み取った提案が非常に助かりました。",
      rating: 5,
      order: 1,
    },
    {
      clientName: "B様",
      role: "EC事業 責任者",
      body: "ドキュメントを丁寧に残してくださるので、認識のズレがなく安心して任せられました。",
      rating: 5,
      order: 2,
    },
    {
      clientName: "C様",
      role: "サービス開発担当",
      body: "納品後の運用フェーズまで親身に相談に乗っていただけました。",
      rating: 5,
      order: 3,
    },
  ]);

  await db.insert(team).values([
    {
      name: "代表 / エンジニア",
      role: "Founder & Lead Engineer",
      bio: "Web・システム・アプリ・AIまで横断して開発をリード。要件定義から運用まで一貫して担当します。",
      order: 1,
    },
    {
      name: "フロントエンド担当",
      role: "Frontend Engineer",
      bio: "React / Next.js を中心に、高品質なUIとアニメーションの実装を得意としています。",
      order: 2,
    },
    {
      name: "AIエンジニア",
      role: "AI Engineer",
      bio: "LLM・RAGを活用したAIソリューションの設計と実装を担当します。",
      order: 3,
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
      answer: "はい、お見積もり・ご相談は無料です。お問い合わせフォームよりお気軽にご連絡ください。",
      order: 4,
    },
  ]);

  await db.insert(siteSettings).values({
    id: 1,
    contactEmail: "contact@web-xr.studio",
    phone: "",
    address: "",
    socials: [{ label: "Lancers", url: "https://www.lancers.jp/profile/WEB-XR_studio" }],
    seoTitle: "WEB-XR.studio｜Web・アプリ・AI開発スタジオ",
    seoDescription:
      "WEB-XR.studioは、Web制作・システム開発・アプリ開発・AIソリューションを一気通貫で提供する開発スタジオです。",
  });

  console.log("✅ Content seeded. Building RAG index (first run downloads the embedding model)...");
  const n = await reindexAll();
  console.log(`✅ RAG index built: ${n} chunks embedded.`);
  console.log("🎉 Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
