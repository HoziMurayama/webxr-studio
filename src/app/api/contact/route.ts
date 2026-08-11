import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { uploadAttachment, isConfigured } from "@/lib/cloudinary";
import { lookupIp, clientIpFrom } from "@/lib/geo";
import { publishContentChange } from "@/lib/realtime";
import { notifyContact } from "@/lib/slack";

export const runtime = "nodejs";
export const maxDuration = 60;

/** 添付ファイルの上限（data URL 換算）。Base64 で約 1.37 倍に膨らむ。 */
const MAX_ATTACHMENT = 50 * 1024 * 1024 * 1.4;

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
  email: z
    .string()
    .trim()
    .email("正しいメールアドレスを入力してください。")
    .max(200),
  company: z.string().trim().max(200).optional().default(""),
  phone: z.string().trim().max(50).optional().default(""),
  service: z
    .string()
    .trim()
    .min(1, "対応サービスを選択してください。")
    .max(100),
  message: z.string().trim().min(1, "内容を入力してください。").max(20000),
  attachmentName: z.string().trim().max(255).optional().default(""),
  attachmentData: z
    .string()
    .max(MAX_ATTACHMENT, "添付ファイルは 50MB 以内にしてください。")
    .optional()
    .default(""),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストが不正です。" },
      { status: 400 },
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first =
      parsed.error.issues[0]?.message ?? "入力内容を確認してください。";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  // HTML タグを除いた実文字数で 10 文字以上を担保する。
  const plain = parsed.data.message
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  if (plain.length < 10) {
    return NextResponse.json(
      { error: "内容は10文字以上で入力してください。" },
      { status: 400 },
    );
  }

  // 添付は Cloudinary へ逃がす。data URL のまま DB に入れると 1 件で
  // 数 MB になり、管理画面の一覧まで重くなる。
  let attachmentUrl = "";
  const { attachmentData, attachmentName, ...rest } = parsed.data;
  if (attachmentData && attachmentName && isConfigured()) {
    try {
      const base64 = attachmentData.split(",")[1] ?? "";
      const buf = Buffer.from(base64, "base64");
      const up = await uploadAttachment(buf, attachmentName);
      attachmentUrl = up.url;
    } catch (err) {
      // 添付だけで問い合わせ全体を落とさない。本文は届けたい。
      console.error("attachment upload failed", err);
    }
  }

  // 送信元を控える。どの地域からの相談かを管理画面で見るために使う。
  const ip = clientIpFrom(request.headers);
  const geo = await lookupIp(ip);

  const [row] = await db
    .insert(contacts)
    .values({
      ...rest,
      attachmentName,
      attachmentUrl,
      // Cloudinary に上げられた場合は data URL を持たない。
      attachmentData: attachmentUrl ? "" : attachmentData,
      ip,
      country: geo.country,
      countryCode: geo.countryCode,
      city: geo.city,
      message: sanitize(parsed.data.message),
    })
    .returning();

  // 管理画面を開いている端末へ知らせる。通知の可否は受け手側で決める。
  publishContentChange({ section: "contacts", action: "create" });

  // Slack へ流す。管理画面を開いていないときに気づくための補助なので、
  // 失敗しても送信は成功として返す（記録は DB に残っている）。
  if (row) await notifyContact(row);

  return NextResponse.json({ ok: true });
}
