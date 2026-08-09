import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { contacts } from "@/db/schema";

export const runtime = "nodejs";

/** 添付ファイルの上限（data URL 換算）。Base64 で約 1.37 倍に膨らむ。 */
const MAX_ATTACHMENT = 2 * 1024 * 1024 * 1.4;

/**
 * 本文は太字・赤字だけを許す簡易サニタイズを通す。エディタ由来の HTML を
 * そのまま保存すると、管理画面で表示したときに任意のマークアップが動くため。
 */
function sanitize(html: string): string {
  return html
    // script/style は中身ごと落とす
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    // execCommand は色を <font color> で出すので span に寄せる
    .replace(/<font[^>]*color=["']?#?dc2626["']?[^>]*>/gi, '<span style="color:#dc2626">')
    .replace(/<font[^>]*>/gi, "<span>")
    .replace(/<\/font>/gi, "</span>")
    // 許可タグ以外を除去（b/strong/span/br のみ残す）
    .replace(/<(?!\/?(b|strong|span|br)\b)[^>]*>/gi, "")
    // span は赤字指定のみ許可し、他の属性は落とす
    .replace(/<span[^>]*>/gi, (m) =>
      /#dc2626/i.test(m) ? '<span style="color:#dc2626">' : "<span>",
    )
    // 残ったタグから属性を除去
    .replace(/<(b|strong|br)[^>]*>/gi, "<$1>");
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
