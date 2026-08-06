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
  stats: jsonb("stats").$type<{ label: string; value: string }[]>().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** サービス内容 / Services. */
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  icon: text("icon").notNull().default("sparkles"),
  price: text("price").notNull().default(""),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** 制作実績 / Portfolio. */
export const portfolio = pgTable("portfolio", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  imageUrl: text("image_url").notNull().default(""),
  link: text("link").notNull().default(""),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** クライアントの声 / Client Reviews. */
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  role: text("role").notNull().default(""),
  body: text("body").notNull().default(""),
  rating: integer("rating").notNull().default(5),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** チーム紹介 / Team. */
export const team = pgTable("team", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull().default(""),
  bio: text("bio").notNull().default(""),
  avatarUrl: text("avatar_url").notNull().default(""),
  socials: jsonb("socials").$type<{ label: string; url: string }[]>().notNull().default([]),
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
  message: text("message").notNull(),
  handled: boolean("handled").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Singleton row (id = 1): global site settings / SEO / socials. */
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  contactEmail: text("contact_email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  socials: jsonb("socials").$type<{ label: string; url: string }[]>().notNull().default([]),
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
    index("embeddings_vector_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
    index("embeddings_source_idx").on(t.sourceTable, t.sourceId),
  ],
);

export type Company = typeof company.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Portfolio = typeof portfolio.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type TeamMember = typeof team.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
