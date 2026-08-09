import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "./src/db/index";
import { portfolio } from "./src/db/schema";
import { inArray } from "drizzle-orm";
const rows = await db.select().from(portfolio).where(inArray(portfolio.id, [1, 6]));
for (const r of rows as any[]) {
  console.log(`\n=== id=${r.id} ${r.title.slice(0,30)} ===`);
  for (const k of ["imageUrl","workImageUrl","thumbnailUrl"]) console.log(`  ${k.padEnd(14)} "${r[k]}"`);
  console.log(`  gallery        ${JSON.stringify(r.gallery)}`);
}
process.exit(0);
