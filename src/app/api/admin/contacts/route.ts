import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { contacts } from "@/db/schema";

export const runtime = "nodejs";

// GET /api/admin/contacts → list submissions, newest first.
export async function GET() {
  const rows = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  return NextResponse.json({ rows });
}
