import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { contacts } from "@/db/schema";

export const runtime = "nodejs";

/** 添付ファイルの上限（data URL 換算）。Base64 で約 1.37 倍に膨らむ。 */
const MAX_ATTACHMENT = 2 * 1024 * 1024 * 1.4;

/**
 * 本文は改行だけを持つ素のテキストとして保存する。エディタ由来の HTML を
 * そのまま保存すると、管理画面で表示したときに任意のマークアップが動くため、
 * <br> を改行に戻したうえでタグを全て除去する。
 */
function sanitize(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

const schema = z.object({
  name: z.string().trim().min(1, "お名前を入力してください。").max(100),
  email: z.string().trim().email("正しいメールアドレスを入力してください。").max(200),
  company: z.string().trim().max(200).optional().default(""),
  phone: z.string().trim().max(50).optional().default(""),
  service: z.string().trim().min(1, "対応サービスを選択してください。").max(100),
  message: z.string().trim().min(1, "内容を入力してください。").max(20000),
  attachmentName: z.string().trim().max(255).optional().default(""),
  attachmentData: z
    .string()
    .max(MAX_ATTACHMENT, "添付ファイルは 2MB 以内にしてください。")
    .optional()
    .default(""),
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

  // HTML タグを除いた実文字数で 10 文字以上を担保する。
  const plain = parsed.data.message.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  if (plain.length < 10) {
    return NextResponse.json(
      { error: "内容は10文字以上で入力してください。" },
      { status: 400 },
    );
  }

  await db.insert(contacts).values({
    ...parsed.data,
    message: sanitize(parsed.data.message),
  });
  return NextResponse.json({ ok: true });
}
