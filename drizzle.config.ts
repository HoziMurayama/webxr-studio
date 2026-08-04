import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
// Load .env.local first (Next.js convention), falling back to .env.
config({ path: [".env.local", ".env"] });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
