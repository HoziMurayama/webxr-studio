/**
 * お問い合わせの表示まわりで共通に使う小物。
 *
 * 管理画面（ブラウザ）と Slack 通知（サーバー）の双方から呼ぶため、
 * どちらにも寄せずここに置く。`server-only` は付けない。
 */

/**
 * ISO の 2 文字コードを旗の絵文字にする。
 *
 * 各文字を「地域表示記号」（U+1F1E6 から始まる A–Z）に移すと、2 文字の
 * 並びがその国の旗として描画される。画像を持たずに済む。
 */
export function flagOf(code: string | null | undefined): string {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

/**
 * 保存用の URL。
 *
 * `download` 属性は別ドメインの相手には効かず、Cloudinary の URL では
 * ただ開くだけになる。`fl_attachment` を挟むと Content-Disposition が
 * 付いて確実に保存される。data URL（旧データ）は同一文書扱いなので
 * そのままで効く。
 */
export function downloadUrl(url: string): string {
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", "/upload/fl_attachment/");
}
