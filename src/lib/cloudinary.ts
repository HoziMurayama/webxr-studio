import "server-only";
import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary への画像アップロード。
 *
 * 画像はリポジトリに置かず、ここから外部ストレージへ送る。WebP への変換と
 * 圧縮は Cloudinary 側に任せる（`format: "webp"` と `quality: "auto"`）。
 * サーバー側で変換すると sharp などの依存が増えるうえ、配信時に端末へ
 * 合わせた形式を選ぶ余地もなくなるため。
 */

/** 事例画像の置き場。Cloudinary 上でフォルダ分けしておくと後から探しやすい。 */
const FOLDER = "webxr-studio/case";

/** アップロード上限。管理画面からの誤操作で巨大な原本が飛ぶのを防ぐ。 */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

let configured = false;

/**
 * 環境変数から設定を読む。未設定なら投げるので、呼び出し側で 503 を返して
 * 「まだ使えない」ことをはっきり伝える。
 */
function getClient() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary の環境変数が設定されていません。");
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

export type UploadResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
};

/**
 * 画像を WebP に変換して Cloudinary へ保存し、配信 URL を返す。
 *
 * `quality: "auto"` は画像ごとに圧縮率を決めるので、写真は強めに、
 * 文字の多いスクリーンショットは控えめに落ちる。
 */
export async function uploadImage(
  file: Buffer,
  options: { folder?: string; publicId?: string } = {},
): Promise<UploadResult> {
  const client = getClient();

  const res = await new Promise<Record<string, unknown>>((resolve, reject) => {
    client.uploader
      .upload_stream(
        {
          folder: options.folder ?? FOLDER,
          public_id: options.publicId,
          resource_type: "image",
          format: "webp",
          // 幅の上限だけ与える。縦横比は保ち、小さい画像は拡大しない。
          transformation: [
            { width: 1600, crop: "limit" },
            { quality: "auto", fetch_format: "webp" },
          ],
          overwrite: true,
          invalidate: true,
        },
        (err, result) => {
          if (err || !result)
            return reject(err ?? new Error("アップロードに失敗しました。"));
          resolve(result as unknown as Record<string, unknown>);
        },
      )
      .end(file);
  });

  return {
    url: String(res.secure_url),
    publicId: String(res.public_id),
    width: Number(res.width ?? 0),
    height: Number(res.height ?? 0),
    bytes: Number(res.bytes ?? 0),
    format: String(res.format ?? "webp"),
  };
}

/**
 * お問い合わせの添付ファイル。画像とは扱いを分ける。
 *
 * 画像に限らず PDF なども受けるので変換はせず、原本のまま置く。
 * `type: "authenticated"` にはせず、URL を知っていれば取れる状態にする
 * （管理画面からダウンロードするだけなので、署名の仕組みまでは要らない）。
 */
export async function uploadAttachment(
  file: Buffer,
  filename: string,
): Promise<{ url: string; bytes: number }> {
  const client = getClient();

  const res = await new Promise<Record<string, unknown>>((resolve, reject) => {
    client.uploader
      .upload_stream(
        {
          folder: "webxr-studio/contacts",
          // 元の名前を残す。管理画面で何のファイルか分かるようにするため。
          public_id: filename.replace(/\.[^.]+$/, ""),
          // 画像以外も来るので raw ではなく auto に任せる。
          resource_type: "auto",
          use_filename: true,
          unique_filename: true,
        },
        (err, result) => {
          if (err || !result)
            return reject(err ?? new Error("アップロードに失敗しました。"));
          resolve(result as unknown as Record<string, unknown>);
        },
      )
      .end(file);
  });

  return { url: String(res.secure_url), bytes: Number(res.bytes ?? 0) };
}

/** 設定済みかどうか。管理画面で「使えない」ことを先に伝えるために使う。 */
export function isConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
  );
}
