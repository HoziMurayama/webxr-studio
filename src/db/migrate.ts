// Prepares the Neon database: enables pgvector, then applies the Drizzle schema
// via `drizzle-kit push`. Run with:  npm run db:migrate
import { config } from "dotenv";
// Load .env.local first (Next.js convention), falling back to .env.
config({ path: [".env.local", ".env"] });
import { neon } from "@neondatabase/serverless";
import { execSync } from "node:child_process";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set (see .env.example).");

  console.log("🔧 Enabling pgvector extension...");
  const sql = neon(url);
  await sql`CREATE EXTENSION IF NOT EXISTS vector`;
  console.log("✅ pgvector ready.");

  console.log("🔧 Pushing schema with drizzle-kit...");
  execSync("npx drizzle-kit push --force", { stdio: "inherit" });
  console.log("✅ Schema applied.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
