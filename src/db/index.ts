import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// In the Next.js runtime, env vars are already loaded. For standalone scripts
// (tsx: migrate/seed), load .env.local (Next.js convention) then .env. This
// runs at import time so anything importing `db` has DATABASE_URL available.
// The dynamic require avoids bundling dotenv into the Next.js server output.
if (!process.env.DATABASE_URL && typeof process !== "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("dotenv").config({ path: [".env.local", ".env"] });
  } catch {
    // dotenv not available (e.g. edge runtime) — env is expected to be preset.
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon connection string.",
  );
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
export { schema };
