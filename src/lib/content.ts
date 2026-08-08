// Server-side content queries shared by the public site and the admin. Each
// returns the section's rows in display order. Kept in one place so the public
// pages and the RAG indexer read content the same way.
import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  company,
  services,
  portfolio,
  reviews,
  team,
  faqs,
  siteSettings,
} from "@/db/schema";

// The public pages are `force-dynamic`, but the site layout also reads content.
// Wrap queries so an unreachable DB (e.g. during `next build`, or before
// `db:seed` has run) degrades to empty content instead of crashing the render.
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[content] query failed, using fallback:", err);
    return fallback;
  }
}

export async function getCompany() {
  return safe(async () => {
    const rows = await db.select().from(company).limit(1);
    return rows[0] ?? null;
  }, null);
}

export async function getServices() {
  return safe(
    () => db.select().from(services).orderBy(asc(services.order), asc(services.id)),
    [],
  );
}

export async function getPortfolio() {
  return safe(
    () => db.select().from(portfolio).orderBy(asc(portfolio.order), asc(portfolio.id)),
    [],
  );
}

/** 事例1件。存在しない ID では null を返し、呼び出し側で 404 にする。 */
export async function getPortfolioItem(id: number) {
  const rows = await safe(
    () => db.select().from(portfolio).where(eq(portfolio.id, id)).limit(1),
    [],
  );
  return rows[0] ?? null;
}

export async function getReviews() {
  return safe(
    () => db.select().from(reviews).orderBy(asc(reviews.order), asc(reviews.id)),
    [],
  );
}

export async function getTeam() {
  return safe(() => db.select().from(team).orderBy(asc(team.order), asc(team.id)), []);
}

export async function getFaqs() {
  return safe(() => db.select().from(faqs).orderBy(asc(faqs.order), asc(faqs.id)), []);
}

export async function getSiteSettings() {
  return safe(async () => {
    const rows = await db.select().from(siteSettings).limit(1);
    return rows[0] ?? null;
  }, null);
}
