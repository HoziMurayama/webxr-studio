import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
const r = await sql`SELECT gallery FROM portfolio WHERE id = 6`;
console.log("現在のギャラリー:");
for (const g of r[0].gallery as any[]) console.log(`  ${g.label.padEnd(24)} ${g.value}`);
