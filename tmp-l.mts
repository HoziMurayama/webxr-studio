import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
const r = await sql`SELECT id, "order", company_name, client_name, link, title FROM portfolio ORDER BY "order", id`;
for (const x of r as any[])
  console.log(`  id=${String(x.id).padEnd(2)} order=${String(x.order).padEnd(2)} ${(x.company_name||'').padEnd(22)} link="${x.link||''}"`);
