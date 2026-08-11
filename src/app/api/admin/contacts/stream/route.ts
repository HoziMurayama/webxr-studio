import { desc, sql as raw } from "drizzle-orm";
import { db } from "@/db";
import { contacts } from "@/db/schema";

// GET /api/admin/contacts/stream → お問い合わせの新着を流す SSE。
// 認証は proxy.ts が /api/admin/* 全体に掛けている。

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Vercel の関数は実行時間に上限がある。切れたらブラウザ側が繋ぎ直す
// ので、上限より短いところで自分から閉じる。
export const maxDuration = 300;

/**
 * DB を見に行く間隔。
 *
 * 購読者をメモリに置く pub/sub は、Vercel のように複数インスタンスへ
 * 分かれる環境では届かない（書き込みを受けた側にしか通知が回らない）。
 * サーバー側で DB を見に行けば、どのインスタンスに繋がっていても同じ
 * 結果になる。ブラウザは接続を保つだけで済み、5秒ごとに HTTP を投げる
 * よりも往復が減る。
 */
const POLL_MS = 3_000;

/** 心拍。プロキシと Chrome の無通信タイムアウトを避ける。 */
const HEARTBEAT_MS = 25_000;

/** この接続を自分から閉じるまで。maxDuration より手前に置く。 */
const MAX_LIFETIME_MS = 4 * 60 * 1000;

/** 最新の id と件数。これが変われば何かが起きたと判断する。 */
async function snapshot() {
  const [row] = await db
    .select({
      maxId: raw<number>`coalesce(max(${contacts.id}), 0)::int`,
      total: raw<number>`count(*)::int`,
    })
    .from(contacts);
  return { maxId: row?.maxId ?? 0, total: row?.total ?? 0 };
}

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | undefined;
  let beat: ReturnType<typeof setInterval> | undefined;
  let life: ReturnType<typeof setTimeout> | undefined;
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          cleanup();
        }
      };

      const cleanup = () => {
        if (closed) return;
        closed = true;
        if (timer) clearInterval(timer);
        if (beat) clearInterval(beat);
        if (life) clearTimeout(life);
        try {
          controller.close();
        } catch {
          // 既に閉じている場合は何もしない。
        }
      };

      // 接続直後に今の状態を送る。ブラウザ側はこれを基準にする。
      let last = await snapshot();
      send(`event: ready\ndata: ${JSON.stringify(last)}\n\n`);

      timer = setInterval(async () => {
        if (closed) return;
        try {
          const now = await snapshot();
          // 件数が減る（削除）のも変化として拾う。別の端末で消したとき、
          // 手元の一覧に残り続けるのを防ぐ。
          if (now.maxId !== last.maxId || now.total !== last.total) {
            last = now;
            send(`event: change\ndata: ${JSON.stringify(now)}\n\n`);
          }
        } catch {
          // 一時的な失敗で接続は切らない。次の周期で取り直す。
        }
      }, POLL_MS);

      beat = setInterval(() => send(": ping\n\n"), HEARTBEAT_MS);

      // 実行時間の上限で強制終了される前に、こちらから畳む。
      life = setTimeout(cleanup, MAX_LIFETIME_MS);

      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // プロキシによるバッファリングを止める。溜め込まれると即時性が消える。
      "X-Accel-Buffering": "no",
    },
  });
}
