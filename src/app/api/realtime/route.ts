import { subscribeToContentChanges } from "@/lib/realtime";

// GET /api/realtime → Server-Sent Events stream of content changes.
//
// Public on purpose: it carries only which section changed, never row content,
// and the public site needs it to live-update for anonymous visitors.

export const runtime = "nodejs";
// Must never be cached or statically rendered — it is a long-lived stream.
export const dynamic = "force-dynamic";

// Comment frames every 25s keep proxies (and Chrome's ~60s idle timeout) from
// dropping an otherwise silent connection.
const HEARTBEAT_MS = 25_000;

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  let unsubscribe: (() => void) | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const send = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // Client vanished between our check and the write; clean up below.
          cleanup();
        }
      };

      const cleanup = () => {
        if (closed) return;
        closed = true;
        unsubscribe?.();
        if (heartbeat) clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          // Already closed by the runtime — nothing to do.
        }
      };

      // Tell the browser how long to wait before reconnecting, then confirm the
      // stream is live so the client can flip its indicator to "connected".
      send("retry: 3000\n\n");
      send(`event: ready\ndata: ${JSON.stringify({ at: Date.now() })}\n\n`);

      unsubscribe = subscribeToContentChanges((event) => {
        send(`event: content\ndata: ${JSON.stringify(event)}\n\n`);
      });

      heartbeat = setInterval(() => send(": ping\n\n"), HEARTBEAT_MS);

      // Fires when the client disconnects or navigates away.
      request.signal.addEventListener("abort", cleanup);
    },

    cancel() {
      closed = true;
      unsubscribe?.();
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Disable proxy buffering (nginx and friends) so events flush immediately.
      "X-Accel-Buffering": "no",
    },
  });
}
