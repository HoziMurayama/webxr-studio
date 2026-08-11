import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  vector,
  index,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Content tables — each is editable from the admin dashboard. The public site
// reads from these; the RAG index (see `embeddings`) is derived from them.
// ---------------------------------------------------------------------------

/** Singleton row (id = 1): 会社概要 / About Us. */
export const company = pgTable("company", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("WEB-XR.studio"),
  tagline: text("tagline").notNull().default(""),
  about: text("about").notNull().default(""),
  mission: text("mission").notNull().default(""),
  history: text("history").notNull().default(""),
  // Freeform stat tiles e.g. [{ label: "設立", value: "2022年" }]
  stats: jsonb("stats")
    .$type<{ label: string; value: string }[]>()
    .notNull()
    .default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** 制作実績 / Portfolio. お客様事例ページのカードとして表示される。 */
export const portfolio = pgTable("portfolio", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  // 技術スタック。カード下部にチップとして並ぶ。
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  // お客様のお写真。詳細ページでは最上部に置く。
  imageUrl: text("image_url").notNull().default(""),
  // 制作物のスクリーンショット。詳細ページでお客様写真の下に置く。
  workImageUrl: text("work_image_url").notNull().default(""),
  // 一覧カード用のサムネイル。未設定なら workImageUrl を使う。
  thumbnailUrl: text("thumbnail_url").notNull().default(""),
  // 制作物のギャラリー。詳細ページで切り替えて閲覧する。
  gallery: jsonb("gallery")
    .$type<{ label: string; value: string }[]>()
    .notNull()
    .default([]),
  link: text("link").notNull().default(""),
  // お客様の声。カードに要約、展開時に全文が出る。
  review: text("review").notNull().default(""),
  // 企業名。個人のお客様の場合は空にして clientName だけを使う。
  companyName: text("company_name").notNull().default(""),
  clientName: text("client_name").notNull().default(""),
  // 業界（医療・不動産など）。
  industry: text("industry").notNull().default(""),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** よくある質問 / FAQ. */
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull().default(""),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** お問い合わせ / Contact submissions (write-only from the public site). */
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull().default(""),
  phone: text("phone").notNull().default(""),
  // 対応サービス（Web制作 / システム開発 / アプリ開発 / AI開発 など）。
  service: text("service").notNull().default(""),
  // 本文。太字・赤字は HTML として保存する。
  message: text("message").notNull(),
  // 添付ファイル。実体は Cloudinary に置き、ここには URL だけを持つ。
  // data URL のまま入れると 1 件で数 MB になり、一覧の取得まで重くなる。
  attachmentName: text("attachment_name").notNull().default(""),
  attachmentUrl: text("attachment_url").notNull().default(""),
  // 旧方式で保存された data URL。新規では使わないが、既存データの
  // 表示のために残している。
  attachmentData: text("attachment_data").notNull().default(""),
  // 送信元。どこからの問い合わせかを管理画面で見るために持つ。
  ip: text("ip").notNull().default(""),
  country: text("country").notNull().default(""),
  city: text("city").notNull().default(""),
  handled: boolean("handled").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Singleton row (id = 1): global site settings / SEO / socials. */
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  contactEmail: text("contact_email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  socials: jsonb("socials")
    .$type<{ label: string; url: string }[]>()
    .notNull()
    .default([]),
  seoTitle: text("seo_title").notNull().default("WEB-XR.studio"),
  seoDescription: text("seo_description").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// RAG index. One row per content chunk; `embedding` is a 384-dim vector
// produced locally by all-MiniLM-L6-v2. Rebuilt when content changes.
// ---------------------------------------------------------------------------
export const embeddings = pgTable(
  "embeddings",
  {
    id: serial("id").primaryKey(),
    sourceTable: text("source_table").notNull(),
    sourceId: integer("source_id").notNull(),
    chunkText: text("chunk_text").notNull(),
    embedding: vector("embedding", { dimensions: 384 }).notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("embeddings_vector_idx").using(
      "hnsw",
      t.embedding.op("vector_cosine_ops"),
    ),
    index("embeddings_source_idx").on(t.sourceTable, t.sourceId),
  ],
);

export type Company = typeof company.$inferSelect;
export type Portfolio = typeof portfolio.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
