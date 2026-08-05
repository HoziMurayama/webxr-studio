"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Subscribes to `/api/realtime` and re-renders the current route whenever an
 * admin save lands, so the public site reflects edits without a manual reload.
 *
 * Renders nothing. `router.refresh()` re-fetches the server components in
 * place, preserving scroll position and client state.
 */
export function LiveContent() {
  const router = useRouter();

  useEffect(() => {
    // Nothing to listen to if the browser predates EventSource.
    if (typeof window === "undefined" || !("EventSource" in window)) return;

    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    // Coalesce bursts (e.g. saving several rows quickly) into one refresh.
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRefresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), 150);
    };

    const connect = () => {
      if (disposed) return;
      source = new EventSource("/api/realtime");

      source.addEventListener("content", scheduleRefresh);

      source.onerror = () => {
        // EventSource retries on its own, but a server restart can leave the
        // handle permanently closed — reopen it ourselves in that case.
        if (source?.readyState === EventSource.CLOSED && !disposed) {
          source.close();
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      clearTimeout(refreshTimer);
      source?.close();
    };
  }, [router]);

  return null;
}
