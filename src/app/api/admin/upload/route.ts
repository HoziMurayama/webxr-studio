import { NextResponse } from "next/server";
import { uploadImage, isConfigured, MAX_UPLOAD_BYTES } from "@/lib/cloudinary";

export const runtime = "nodejs";
// 画像の変換と転送に時間がかかることがあるので、既定より長く取る。
export const maxDuration = 60;

// POST /api/admin/upload  ← multipart/form-data の `file`
// 認証は proxy.ts が /api/admin/* 全体に掛けている。

/** 受け付ける形式。ここを通ったものだけ Cloudinary へ送る。 */
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

/** MIME 型が付かない送信元のための、拡張子による判定。 */
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      {
        error:
          "画像ストレージが未設定です。CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET を設定してください。",
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が不正です。" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "ファイルが選択されていません。" },
      { status: 400 },
    );
  }
  // ブラウザからは MIME 型が付くが、送信側によっては
  // application/octet-stream になる。その場合は拡張子で判断する。
  const ext = file.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";
  const okByType = ALLOWED.has(file.type);
  const okByExt = ALLOWED_EXT.has(ext);
  if (!okByType && !okByExt) {
    return NextResponse.json(
      { error: `対応していない形式です（${file.type || ext || "不明"}）。` },
      { status: 400 },
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = Math.round(MAX_UPLOAD_BYTES / 1024 / 1024);
    return NextResponse.json(
      { error: `ファイルは ${mb}MB 以内にしてください。` },
      { status: 400 },
    );
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const res = await uploadImage(buf);
    return NextResponse.json({
      url: res.url,
      width: res.width,
      height: res.height,
      bytes: res.bytes,
      // 元のファイル名は返さない。保存先の publicId があれば十分で、
      // 画面には「何KBになったか」を出したいだけのため。
      originalBytes: file.size,
    });
  } catch (err) {
    console.error("cloudinary upload failed", err);
    return NextResponse.json(
      { error: "アップロードに失敗しました。時間をおいてお試しください。" },
      { status: 502 },
    );
  }
}
