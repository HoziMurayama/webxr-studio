/**
 * public/case の画像を Cloudinary へ移し、DB の URL を差し替える。
 *
 *   npx tsx scripts/migrate-images-to-cloudinary.mts --dry     # 確認のみ
 *   npx tsx scripts/migrate-images-to-cloudinary.mts           # 実行
 *
 * 対象は portfolio の imageUrl / workImageUrl / thumbnailUrl / gallery。
 * `/case/...` で始まるものだけを見るので、すでに Cloudinary に移ったものは
 * 二度送らない。何度流しても結果は同じになる。
 *
 * 画像ファイル自体はこのスクリプトでは消さない。DB の差し替えが済み、
 * サイトの表示を確認してから手で消す方が安全なため。
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { v2 as cloudinary } from "cloudinary";

const DRY = process.argv.includes("--dry");
const FOLDER = "webxr-studio/case";
const PUBLIC_DIR = path.join(process.cwd(), "public");

const sql = neon(process.env.DATABASE_URL!);

/**
 * 設定を読む。`--dry` は何件が対象になるかを見るためのものなので、
 * 環境変数が無くても動くようにしておく。
 */
function configure() {
  const need = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  const missing = need.filter((n) => !process.env[n]);
  if (missing.length) {
    if (DRY) {
      console.log(`  ※ ${missing.join(" / ")} が未設定です。`);
      console.log("    確認のみ行います（送信はしません）。\n");
      return;
    }
    console.error(
      `  ${missing.join(" / ")} が未設定です。.env.local を確認してください。`,
    );
    process.exit(1);
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}
configure();

/** ローカルパス（/case/foo.webp）→ Cloudinary の URL。同じ原本は使い回す。 */
const uploaded = new Map<string, string>();

async function toCloudinary(localPath: string): Promise<string | null> {
  if (uploaded.has(localPath)) return uploaded.get(localPath)!;

  const abs = path.join(PUBLIC_DIR, localPath.replace(/^\//, ""));
  if (!existsSync(abs)) {
    console.warn(`    ファイルなし: ${localPath}`);
    return null;
  }
  if (DRY) {
    uploaded.set(localPath, `(dry) ${localPath}`);
    return uploaded.get(localPath)!;
  }

  const buf = await readFile(abs);
  // 拡張子を除いたファイル名を public_id にする。再実行時に同じ場所へ
  // 上書きされ、URL が変わらない。
  const publicId = path.basename(localPath).replace(/\.[^.]+$/, "");

  const res = await new Promise<Record<string, unknown>>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: FOLDER,
          public_id: publicId,
          resource_type: "image",
          format: "webp",
          transformation: [
            { width: 1600, crop: "limit" },
            { quality: "auto", fetch_format: "webp" },
          ],
          overwrite: true,
          invalidate: true,
        },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error("upload failed"));
          resolve(result as unknown as Record<string, unknown>);
        },
      )
      .end(buf);
  });

  const url = String(res.secure_url);
  uploaded.set(localPath, url);
  const before = buf.length,
    after = Number(res.bytes ?? 0);
  console.log(
    `    ${localPath} → ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB`,
  );
  return url;
}

/** ローカル画像なら Cloudinary に送って URL を返す。それ以外はそのまま。 */
async function convert(value: string): Promise<string> {
  if (!value || !value.startsWith("/case/")) return value;
  return (await toCloudinary(value)) ?? value;
}

async function main() {
  console.log(DRY ? "確認のみ（送信しません）\n" : "Cloudinary へ移行します\n");

  const rows = (await sql`
    SELECT id, image_url, work_image_url, thumbnail_url, gallery
    FROM portfolio ORDER BY id
  `) as Record<string, unknown>[];

  let changed = 0;
  for (const row of rows) {
    const id = Number(row.id);
    const before = {
      image: String(row.image_url ?? ""),
      work: String(row.work_image_url ?? ""),
      thumb: String(row.thumbnail_url ?? ""),
      gallery: (row.gallery ?? []) as { label: string; value: string }[],
    };

    const local = [
      before.image,
      before.work,
      before.thumb,
      ...before.gallery.map((g) => g.value),
    ].filter((v) => v.startsWith("/case/"));
    if (local.length === 0) continue;

    console.log(`  id=${id}: ローカル画像 ${local.length} 件`);

    const after = {
      image: await convert(before.image),
      work: await convert(before.work),
      thumb: await convert(before.thumb),
      gallery: [] as { label: string; value: string }[],
    };
    for (const g of before.gallery) {
      after.gallery.push({ label: g.label, value: await convert(g.value) });
    }

    if (!DRY) {
      await sql`
        UPDATE portfolio SET
          image_url = ${after.image},
          work_image_url = ${after.work},
          thumbnail_url = ${after.thumb},
          gallery = ${JSON.stringify(after.gallery)}::jsonb
        WHERE id = ${id}
      `;
    }
    changed++;
  }

  console.log(`\n  対象レコード: ${changed} 件 / 画像: ${uploaded.size} 枚`);
  if (DRY) console.log("  --dry を外すと実際に送信します。");
  else
    console.log(
      "  完了。サイトの表示を確認してから public/case を削除してください。",
    );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
