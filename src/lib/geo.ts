import "server-only";

/**
 * 送信元の IP と、そこから引いた国・都市。
 *
 * 管理画面で「どの地域からの相談か」を見るために使う。判定に失敗しても
 * 問い合わせ自体は成立させたいので、どの関数も投げずに空文字を返す。
 */

/**
 * リクエストヘッダーから接続元の IP を取り出す。
 *
 * Vercel などのプロキシ経由では実際の接続元がヘッダーに入る。
 * `x-forwarded-for` は「client, proxy1, proxy2」の並びなので先頭を採る。
 */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? headers.get("cf-connecting-ip") ?? "";
}

/** ループバックや私設アドレスは引いても意味がないので除く。 */
function isPrivate(ip: string): boolean {
  return (
    !ip ||
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}

export type Geo = { country: string; city: string };

/**
 * IP から国と都市を引く。
 *
 * ip-api.com の無料枠を使う。キー登録が要らず、月あたりの上限も
 * 問い合わせの件数からすれば十分に高い。応答が遅いときは 3 秒で
 * 打ち切り、地域が空のまま保存する（問い合わせを落とさないため）。
 */
export async function lookupIp(ip: string): Promise<Geo> {
  if (isPrivate(ip)) return { country: "", city: "" };

  try {
    const ctl = AbortSignal.timeout(3000);
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,city`,
      { signal: ctl, cache: "no-store" },
    );
    if (!res.ok) return { country: "", city: "" };
    const data = (await res.json()) as {
      status?: string;
      country?: string;
      city?: string;
    };
    if (data.status !== "success") return { country: "", city: "" };
    return { country: data.country ?? "", city: data.city ?? "" };
  } catch {
    return { country: "", city: "" };
  }
}
