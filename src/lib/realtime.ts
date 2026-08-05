// In-process pub/sub backing the live-content stream.
//
// Admin writes call `publishContentChange()`; the SSE route handler
// (`/api/realtime`) subscribes each connected browser and forwards events so
// open pages refresh themselves without a manual reload.
//
// Scope: subscribers live in the memory of a single Node process. That covers
// `next dev` and a single-instance deployment. Behind multiple instances a
// client only hears about writes served by the instance it is connected to —
// moving to a shared broker (Redis pub/sub, Postgres LISTEN/NOTIFY) would mean
// replacing the body of these two functions, not their call sites.
import "server-only";

export type ContentChange = {
  /** Section slug that changed, e.g. "company" or "faqs". */
  section: string;
  /** What happened to the row. */
  action: "create" | "update" | "delete";
  /** Affected row id, when the operation targets one row. */
  id?: number;
  /** Server timestamp (ms) so clients can ignore stale replays. */
  at: number;
};

type Subscriber = (event: ContentChange) => void;

// Survives dev-server hot reloads, which otherwise re-evaluate this module and
// silently orphan every existing subscriber.
const globalForRealtime = globalThis as unknown as {
  __xrContentSubscribers?: Set<Subscriber>;
};

const subscribers: Set<Subscriber> =
  globalForRealtime.__xrContentSubscribers ??
  (globalForRealtime.__xrContentSubscribers = new Set());

/** Register a listener; call the returned function to detach it. */
export function subscribeToContentChanges(fn: Subscriber): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

/**
 * Broadcast a content change to every connected client.
 *
 * Never throws: a failing subscriber (e.g. a stream whose client vanished
 * mid-write) must not turn a successful admin save into a 500.
 */
export function publishContentChange(event: Omit<ContentChange, "at">): void {
  const payload: ContentChange = { ...event, at: Date.now() };
  for (const fn of subscribers) {
    try {
      fn(payload);
    } catch (err) {
      console.error("[realtime] subscriber failed:", err);
      subscribers.delete(fn);
    }
  }
}

/** Current listener count — used by the health check in the SSE route. */
export function subscriberCount(): number {
  return subscribers.size;
}
