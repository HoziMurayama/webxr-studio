"use client";

import { useEffect } from "react";

// Loads the self-contained intro-overlay engine (public/xr-logo-intro.js) and
// mounts the <xr-logo-intro> custom element imperatively, entirely outside
// React's render tree. Doing it this way avoids two App-Router pitfalls:
//   1. A raw <script> written in JSX does not execute on the client.
//   2. SSR-ing the custom element causes a hydration mismatch, because the
//      engine rewrites the element's DOM before React can hydrate it.
// The engine handles its own "once per session" gating and watchdog, so
// running it right after mount (rather than pre-paint) is fine.
export function IntroOverlay() {
  useEffect(() => {
    // Only ever run on the public site, once per browser tab (session).
    if (sessionStorage.getItem("xr-intro-shown")) return;

    let el: HTMLElement | null = null;

    function mountOverlay() {
      if (document.querySelector("xr-logo-intro")) return;
      el = document.createElement("xr-logo-intro");
      document.body.prepend(el);
      sessionStorage.setItem("xr-intro-shown", "1");
    }

    // If the engine is already loaded (client nav), just mount the element.
    if (customElements.get("xr-logo-intro")) {
      mountOverlay();
      return;
    }

    // Otherwise inject the engine script, then mount once it defines the element.
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-xr-intro-engine="1"]',
    );
    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.src = "/xr-logo-intro.js";
      script.dataset.theme = "light";
      script.dataset.once = "session";
      script.dataset.xrIntroEngine = "1";
      document.head.appendChild(script);
    }

    customElements.whenDefined("xr-logo-intro").then(mountOverlay);

    return () => {
      // Leave the overlay to finish/clean itself up; nothing to tear down.
    };
  }, []);

  return null;
}
