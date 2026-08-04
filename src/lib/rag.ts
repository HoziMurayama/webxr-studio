// RAG index built from the site's own content tables. Each content row is
// flattened into a human-readable chunk, embedded locally, and stored in the
// `embeddings` table (pgvector). Retrieval is cosine-similarity nearest-neighbor.
import { sql, eq, and } from "drizzle-orm";
import { db } from "@/db";
import {
  company,
  services,
  portfolio,
  reviews,
  team,
  faqs,
  siteSettings,
  embeddings,
} from "@/db/schema";
import { embed } from "./embeddings";

/** A chunk of source content, tagged with where it came from. */
type Chunk = { sourceTable: string; sourceId: number; text: string };

/**
 * Collect every content row and turn it into retrievable Japanese text chunks.
 * When `only` is given, restrict to that one table (used after an edit).
 */
async function collectChunks(only?: { table: string; id?: number }): Promise<Chunk[]> {
  const chunks: Chunk[] = [];
  const want = (t: string) => !only || only.table === t;

  if (want("company")) {
    const rows = await db.select().from(company);
    for (const c of rows) {
      const stats = (c.stats ?? []).map((s) => `${s.label}: ${s.value}`).join("、");
      chunks.push({
        sourceTable: "company",
        sourceId: c.id,
        text: `会社概要（${c.name}）。キャッチコピー: ${c.tagline}。${c.about} ミッション: ${c.mission} 沿革: ${c.history} 数値: ${stats}`,
      });
    }
  }
  if (want("services")) {
    for (const s of await db.select().from(services)) {
      chunks.push({
        sourceTable: "services",
        sourceId: s.id,
        text: `サービス「${s.title}」: ${s.description}${s.price ? ` 料金目安: ${s.price}` : ""}`,
      });
    }
  }
  if (want("portfolio")) {
    for (const p of await db.select().from(portfolio)) {
      chunks.push({
        sourceTable: "portfolio",
        sourceId: p.id,
        text: `制作実績「${p.title}」（${(p.tags ?? []).join("、")}）: ${p.description}`,
      });
    }
  }
  if (want("reviews")) {
    for (const r of await db.select().from(reviews)) {
      chunks.push({
        sourceTable: "reviews",
        sourceId: r.id,
        text: `クライアントの声（${r.clientName}${r.role ? "・" + r.role : ""}、評価${r.rating}/5）: ${r.body}`,
      });
    }
  }
  if (want("team")) {
    for (const m of await db.select().from(team)) {
      chunks.push({
        sourceTable: "team",
        sourceId: m.id,
        text: `チームメンバー ${m.name}（${m.role}）: ${m.bio}`,
      });
    }
  }
  if (want("faqs")) {
    for (const f of await db.select().from(faqs)) {
      chunks.push({
        sourceTable: "faqs",
        sourceId: f.id,
        text: `よくある質問 Q: ${f.question} A: ${f.answer}`,
      });
    }
  }
  if (want("site_settings")) {
    for (const s of await db.select().from(siteSettings)) {
      chunks.push({
        sourceTable: "site_settings",
        sourceId: s.id,
        text: `連絡先情報。メール: ${s.contactEmail} 電話: ${s.phone} 所在地: ${s.address}`,
      });
    }
  }

  // Drop rows that are effectively empty (placeholders with no real text).
  return chunks.filter((c) => c.text.replace(/\s|：|:|、|。/g, "").length > 8);
}

function toVectorLiteral(v: number[]): string {
  return `[${v.join(",")}]`;
}

/** Re-embed a single source row (delete its old chunks, insert the new one). */
export async function reindexRow(table: string, id: number): Promise<void> {
  await db
    .delete(embeddings)
    .where(and(eq(embeddings.sourceTable, table), eq(embeddings.sourceId, id)));

  const chunks = await collectChunks({ table, id });
  for (const chunk of chunks) {
    if (chunk.sourceId !== id) continue;
    const vec = await embed(chunk.text);
    await db.insert(embeddings).values({
      sourceTable: chunk.sourceTable,
      sourceId: chunk.sourceId,
      chunkText: chunk.text,
      embedding: vec,
    });
  }
}

/** Re-embed an entire table (used when rows are deleted/reordered in bulk). */
export async function reindexTable(table: string): Promise<void> {
  await db.delete(embeddings).where(eq(embeddings.sourceTable, table));
  const chunks = await collectChunks({ table });
  for (const chunk of chunks) {
    const vec = await embed(chunk.text);
    await db.insert(embeddings).values({
      sourceTable: chunk.sourceTable,
      sourceId: chunk.sourceId,
      chunkText: chunk.text,
      embedding: vec,
    });
  }
}

/** Rebuild the entire RAG index from scratch. */
export async function reindexAll(): Promise<number> {
  await db.delete(embeddings);
  const chunks = await collectChunks();
  for (const chunk of chunks) {
    const vec = await embed(chunk.text);
    await db.insert(embeddings).values({
      sourceTable: chunk.sourceTable,
      sourceId: chunk.sourceId,
      chunkText: chunk.text,
      embedding: vec,
    });
  }
  return chunks.length;
}

/** Retrieve the top-k most relevant chunks for a user query. */
export async function retrieve(query: string, k = 5): Promise<string[]> {
  const q = await embed(query);
  const literal = toVectorLiteral(q);
  // pgvector cosine distance operator `<=>`; smaller = closer.
  const rows = await db
    .select({
      chunkText: embeddings.chunkText,
      distance: sql<number>`${embeddings.embedding} <=> ${literal}::vector`,
    })
    .from(embeddings)
    .orderBy(sql`${embeddings.embedding} <=> ${literal}::vector`)
    .limit(k);
  return rows.map((r) => r.chunkText);
}
