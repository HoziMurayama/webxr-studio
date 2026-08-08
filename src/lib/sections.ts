// Registry mapping each admin-editable section slug to its Drizzle table, Zod
// validation schema, and metadata (labels, whether it's a singleton). The admin
// API and admin UI both drive off this single source of truth.
import { z } from "zod";
import {
  company,
  services,
  portfolio,
  reviews,
  team,
  faqs,
  siteSettings,
  contacts,
} from "@/db/schema";
import type { PgTable } from "drizzle-orm/pg-core";

const kv = z.object({ label: z.string(), value: z.string() });
const linkItem = z.object({ label: z.string(), url: z.string() });

// Coerce common form values (numbers arrive as strings; arrays may need parsing).
const num = z.coerce.number().int();

export const companySchema = z.object({
  name: z.string().min(1),
  tagline: z.string().default(""),
  about: z.string().default(""),
  mission: z.string().default(""),
  history: z.string().default(""),
  stats: z.array(kv).default([]),
});

export const serviceSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  icon: z.string().default("sparkles"),
  price: z.string().default(""),
  order: num.default(0),
});

export const portfolioSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  tags: z.array(z.string()).default([]),
  imageUrl: z.string().default(""),
  workImageUrl: z.string().default(""),
  thumbnailUrl: z.string().default(""),
  link: z.string().default(""),
  review: z.string().default(""),
  companyName: z.string().default(""),
  clientName: z.string().default(""),
  industry: z.string().default(""),
  order: num.default(0),
});

export const reviewSchema = z.object({
  clientName: z.string().min(1),
  role: z.string().default(""),
  body: z.string().default(""),
  rating: num.min(1).max(5).default(5),
  order: num.default(0),
});

export const teamSchema = z.object({
  name: z.string().min(1),
  role: z.string().default(""),
  bio: z.string().default(""),
  avatarUrl: z.string().default(""),
  socials: z.array(linkItem).default([]),
  order: num.default(0),
});

export const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().default(""),
  order: num.default(0),
});

export const settingsSchema = z.object({
  contactEmail: z.string().default(""),
  phone: z.string().default(""),
  address: z.string().default(""),
  socials: z.array(linkItem).default([]),
  seoTitle: z.string().default(""),
  seoDescription: z.string().default(""),
});

export type FieldType = "text" | "textarea" | "number" | "kvlist" | "linklist" | "taglist";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  hint?: string;
};

export type SectionDef = {
  slug: string;
  label: string; // Japanese section name
  table: PgTable;
  schema: z.ZodTypeAny;
  singleton: boolean; // true → a single row edited in place (no list/create/delete)
  indexed: boolean; // true → included in the RAG index
  fields: FieldDef[];
};

export const SECTIONS: Record<string, SectionDef> = {
  company: {
    slug: "company",
    label: "会社概要",
    table: company,
    schema: companySchema,
    singleton: true,
    indexed: true,
    fields: [
      { name: "name", label: "会社名", type: "text" },
      { name: "tagline", label: "キャッチコピー", type: "text" },
      { name: "about", label: "紹介文", type: "textarea" },
      { name: "mission", label: "ミッション", type: "textarea" },
      { name: "history", label: "沿革", type: "textarea" },
      { name: "stats", label: "会社データ", type: "kvlist", hint: "ラベルと値のペア" },
    ],
  },
  services: {
    slug: "services",
    label: "サービス内容",
    table: services,
    schema: serviceSchema,
    singleton: false,
    indexed: true,
    fields: [
      { name: "title", label: "タイトル", type: "text" },
      { name: "description", label: "説明", type: "textarea" },
      { name: "icon", label: "アイコン", type: "text", hint: "server / layout / smartphone / sparkles / code / cloud" },
      { name: "price", label: "料金目安", type: "text" },
      { name: "order", label: "表示順", type: "number" },
    ],
  },
  portfolio: {
    slug: "portfolio",
    label: "制作実績",
    table: portfolio,
    schema: portfolioSchema,
    singleton: false,
    indexed: true,
    fields: [
      { name: "title", label: "案件名", type: "text" },
      { name: "description", label: "詳細説明", type: "textarea" },
      { name: "imageUrl", label: "お客様画像URL", type: "text" },
      { name: "workImageUrl", label: "制作物画像URL", type: "text" },
      { name: "thumbnailUrl", label: "一覧サムネイルURL", type: "text", hint: "未設定なら制作物画像を使用" },
      { name: "review", label: "お客様の声", type: "textarea" },
      { name: "companyName", label: "企業名", type: "text", hint: "個人のお客様の場合は空欄" },
      { name: "clientName", label: "お名前", type: "text" },
      { name: "industry", label: "業界", type: "text", hint: "医療・不動産・教育 など" },
      { name: "tags", label: "技術スタック", type: "taglist" },
      { name: "link", label: "リンクURL", type: "text" },
      { name: "order", label: "表示順", type: "number" },
    ],
  },
  reviews: {
    slug: "reviews",
    label: "クライアントの声",
    table: reviews,
    schema: reviewSchema,
    singleton: false,
    indexed: true,
    fields: [
      { name: "clientName", label: "お客様名", type: "text" },
      { name: "role", label: "肩書き", type: "text" },
      { name: "body", label: "コメント", type: "textarea" },
      { name: "rating", label: "評価 (1-5)", type: "number" },
      { name: "order", label: "表示順", type: "number" },
    ],
  },
  team: {
    slug: "team",
    label: "チーム紹介",
    table: team,
    schema: teamSchema,
    singleton: false,
    indexed: true,
    fields: [
      { name: "name", label: "名前", type: "text" },
      { name: "role", label: "役割", type: "text" },
      { name: "bio", label: "プロフィール", type: "textarea" },
      { name: "avatarUrl", label: "アバターURL", type: "text" },
      { name: "socials", label: "リンク", type: "linklist" },
      { name: "order", label: "表示順", type: "number" },
    ],
  },
  faqs: {
    slug: "faqs",
    label: "よくある質問",
    table: faqs,
    schema: faqSchema,
    singleton: false,
    indexed: true,
    fields: [
      { name: "question", label: "質問", type: "text" },
      { name: "answer", label: "回答", type: "textarea" },
      { name: "order", label: "表示順", type: "number" },
    ],
  },
  site_settings: {
    slug: "site_settings",
    label: "サイト設定",
    table: siteSettings,
    schema: settingsSchema,
    singleton: true,
    indexed: true,
    fields: [
      { name: "contactEmail", label: "問い合わせメール", type: "text" },
      { name: "phone", label: "電話番号", type: "text" },
      { name: "address", label: "所在地", type: "text" },
      { name: "socials", label: "SNS/リンク", type: "linklist" },
      { name: "seoTitle", label: "SEOタイトル", type: "text" },
      { name: "seoDescription", label: "SEO説明文", type: "textarea" },
    ],
  },
};

// Contact submissions are read/deleted in admin but never edited or indexed.
export const CONTACTS_TABLE = contacts;

export function getSection(slug: string): SectionDef | null {
  return SECTIONS[slug] ?? null;
}
