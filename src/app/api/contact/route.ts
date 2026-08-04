import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { contacts } from "@/db/schema";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(1, "お名前を入力してください。").max(100),
  email: z.string().trim().email("正しいメールアドレスを入力してください。").max(200),
  company: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().min(1, "ご相談内容を入力してください。").max(5000),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "入力内容を確認してください。";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  await db.insert(contacts).values(parsed.data);
  return NextResponse.json({ ok: true });
}
