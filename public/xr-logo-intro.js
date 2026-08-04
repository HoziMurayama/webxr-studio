/*!
 * <xr-logo-intro> — XR logo assembly animation as a page-load intro overlay.
 *
 * A self-contained custom element: no dependencies, no build step, no network
 * requests. The logo geometry is traced from the master PNG and embedded below,
 * so it renders identically everywhere and needs no fonts or image files.
 *
 * ---------------------------------------------------------------------------
 * USAGE (recommended — zero flash of the site before the overlay appears)
 * ---------------------------------------------------------------------------
 *
 *   <head>
 *     <script src="/xr-logo-intro.js"></script>
 *   </head>
 *   <body>
 *     <xr-logo-intro></xr-logo-intro>
 *     ...the rest of the site...
 *
 * The script MUST be a plain <script> in <head> with no `defer` or `async`.
 * It runs before the page paints (28 KB raw, ~9.5 KB gzipped, and it makes no
 * requests of its own — most of the weight is the traced logo geometry) and
 * injects the few lines of CSS that let the overlay cover the screen from the
 * very first frame. With `defer`, visitors see the site flash before the
 * overlay drops over it.
 *
 * No-markup alternative: add `data-auto` to the script tag and the overlay
 * mounts itself — handy when you cannot edit <body> (CMS themes, etc.).
 *
 *   <script src="/xr-logo-intro.js" data-auto></script>
 *
 * ---------------------------------------------------------------------------
 * CONFIG
 * ---------------------------------------------------------------------------
 *
 * On the SCRIPT tag (needed before first paint, so it cannot live on the
 * element):
 *   data-theme="dark|light|auto"  backdrop + mark colours. auto follows the
 *                                 visitor's OS setting. Default: dark.
 *   data-once="session|always"    how often a visitor sees it.
 *                                 Default: session (once per browser tab).
 *   data-auto                     self-mount, no <xr-logo-intro> markup needed.
 *
 * On the ELEMENT (animation tuning):
 *   speed="1"          playback rate. 0.5 = half speed, 2 = double.
 *   accent="#5ec8ff"   colour of the burst bloom, rings and glint.
 *   hold="260"         ms to rest on the finished logo before exiting.
 *   exit="520"         ms of the fade-out that reveals the site.
 *   glint="off"        disables the light sweep across the finished mark.
 *   skip="off"         removes the Skip button (click / Esc still work).
 *
 * ---------------------------------------------------------------------------
 * HOOKS
 * ---------------------------------------------------------------------------
 *
 * <html> carries data-xr-intro="playing" then "done", so CSS can stage the
 * page — e.g. hold the hero back until the intro clears:
 *
 *   [data-xr-intro="playing"] .hero { opacity: 0 }
 *   .hero { opacity: 1; transition: opacity .6s ease }
 *
 * Two events fire on `document`, both bubbling:
 *
 *   document.addEventListener('xr-logo-intro:start', () => {...});
 *   document.addEventListener('xr-logo-intro:done',  () => {...});
 *
 * `:done` fires when the overlay is gone (also fires immediately, before any
 * paint, when the intro is skipped for a returning visitor) — a safe place to
 * kick off hero animations or autoplay video.
 *
 * Fail-safes: the overlay removes itself if anything throws, and a hard
 * watchdog tears it down a few seconds past its natural end, so the site can
 * never be left covered.
 */
(function () {
  "use strict";

  var TAG = "xr-logo-intro";
  if (window.customElements && customElements.get(TAG)) return;

  /* -------------------------------------------------------------------------
     Boot-time config. Read synchronously so the backdrop can be painted
     before the browser paints anything else.
  ------------------------------------------------------------------------- */
  var script = document.currentScript ||
               document.querySelector('script[src*="' + TAG + '"]');
  var sd = (script && script.dataset) || {};

  var STORAGE_KEY = "xr-logo-intro:seen";
  var ONCE  = sd.once || "session";
  var THEME = sd.theme || "dark";

  var THEMES = {
    dark:  { bg: "#0a0c11", bg2: "#12151d", ink: "#ffffff" },
    light: { bg: "#eef1f6", bg2: "#dfe4ec", ink: "#111111" },
  };

  function resolveTheme(name) {
    if (name === "auto") {
      return (window.matchMedia &&
              matchMedia("(prefers-color-scheme: light)").matches)
        ? "light" : "dark";
    }
    return THEMES[name] ? name : "dark";
  }

  function shouldPlay() {
    if (ONCE === "always") return true;
    try { return !sessionStorage.getItem(STORAGE_KEY); }
    catch (e) { return true; }   // private mode, blocked storage, etc.
  }

  var themeName = resolveTheme(THEME);
  var palette = THEMES[themeName];
  var PLAY = shouldPlay();

  /* -------------------------------------------------------------------------
     Critical CSS — injected now, not on upgrade, so an un-upgraded
     <xr-logo-intro> in the markup already covers the page on frame one.
  ------------------------------------------------------------------------- */
  (function injectBootCSS() {
    var css = PLAY
      ? TAG + "{position:fixed;inset:0;z-index:2147483000;display:block;" +
              "background:" + palette.bg + ";contain:strict}" +
        "html[data-xr-intro='playing']{overflow:hidden}"
      : TAG + "{display:none}";
    var el = document.createElement("style");
    el.id = "xr-logo-intro-boot";
    el.textContent = css;
    (document.head || document.documentElement).appendChild(el);
  })();

  if (PLAY) document.documentElement.setAttribute("data-xr-intro", "playing");

  /* -------------------------------------------------------------------------
     Geometry — traced from the master logo PNG at 6x and curve-fitted.
     viewBox is 200x200; the four pieces tile the finished mark exactly.
  ------------------------------------------------------------------------- */
  var PATHS = {
    "arrow-top": "M 98.17 21.5 C 98.17 21.5 109.5 22.23 114.83 23.17 C 120.16 24.12 125.53 25.5 130.17 27.17 C 134.81 28.84 139.42 31.37 142.67 33.17 C 145.92 34.98 147.7 36.5 149.67 38.0 C 151.64 39.5 152.14 39.67 154.5 42.17 C 156.86 44.67 161.28 49.53 163.83 53.0 C 166.39 56.47 167.8 58.75 169.83 63.0 C 171.86 67.25 174.5 74.08 176.0 78.5 C 177.5 82.92 178.3 87.11 178.83 89.5 C 179.36 91.89 179.17 92.83 179.17 92.83 L 178.33 93.5 L 170.83 93.33 L 169.33 92.33 C 169.33 92.33 167.69 84.45 166.83 81.67 C 165.97 78.89 164.84 77.45 164.17 75.67 C 163.5 73.89 164.05 73.58 162.83 71.0 C 161.61 68.42 159.14 63.5 156.83 60.17 C 154.53 56.84 151.75 53.67 149.0 51.0 C 146.25 48.33 143.36 46.17 140.33 44.17 C 137.3 42.17 130.83 39.0 130.83 39.0 L 128.83 39.17 L 122.33 44.83 L 120.33 45.0 C 120.33 45.0 106.86 32.02 103.17 28.33 C 99.48 24.63 98.17 22.83 98.17 22.83 L 98.17 21.5 Z",
    "r": "M 110.33 72.17 C 113.44 72.14 120.28 72.0 126.17 72.17 C 132.06 72.34 141.95 72.84 145.67 73.17 C 149.39 73.5 147.42 73.5 148.5 74.17 C 149.58 74.84 151.11 75.98 152.17 77.17 C 153.22 78.36 154.19 79.83 154.83 81.33 C 155.47 82.83 155.81 84.86 156.0 86.17 C 156.19 87.48 156.19 87.87 156.0 89.17 C 155.81 90.47 155.66 92.36 154.83 94.0 C 154.0 95.64 152.28 97.72 151.0 99.0 C 149.72 100.28 148.25 101.12 147.17 101.67 C 146.09 102.22 145.06 102.14 144.5 102.33 C 143.94 102.52 143.83 102.83 143.83 102.83 L 143.83 103.67 C 143.83 103.67 145.5 104.0 146.67 105.0 C 147.84 106.0 148.64 106.17 150.83 109.67 C 153.02 113.17 159.83 126.0 159.83 126.0 L 159.67 127.17 L 141.17 127.17 C 141.17 127.17 133.91 113.67 131.83 110.17 C 129.75 106.67 129.61 107.03 128.67 106.17 C 127.73 105.31 126.89 105.19 126.17 105.0 C 125.45 104.81 124.33 105.0 124.33 105.0 L 123.0 106.5 L 123.0 127.0 C 123.0 127.0 118.58 127.42 115.83 127.5 C 113.08 127.58 106.5 127.5 106.5 127.5 L 106.0 127.0 L 106.17 73.33 L 107.5 72.33 C 107.5 72.33 107.22 72.2 110.33 72.17 Z M 127.33 83.17 C 125.61 83.17 124.33 83.33 124.33 83.33 L 123.17 84.83 L 123.17 93.67 L 124.17 94.67 C 124.17 94.67 130.64 94.64 132.5 94.5 C 134.36 94.36 134.39 94.3 135.33 93.83 C 136.28 93.36 137.59 92.25 138.17 91.67 C 138.75 91.09 138.72 91.03 138.83 90.33 C 138.94 89.63 138.83 87.5 138.83 87.5 C 138.83 87.5 137.19 84.87 136.5 84.17 C 135.81 83.47 136.2 83.5 134.67 83.33 C 133.14 83.16 129.05 83.17 127.33 83.17 Z",
    "x": "M 46.67 72.17 C 46.67 72.17 57.53 72.19 60.5 72.33 C 63.47 72.47 64.5 73.0 64.5 73.0 L 73.67 88.67 L 74.83 88.33 L 83.33 72.83 C 83.33 72.83 88.7 72.25 91.67 72.17 C 94.64 72.09 101.17 72.33 101.17 72.33 C 101.17 72.33 103.67 69.89 101.0 74.17 C 98.33 78.45 87.84 93.81 85.17 98.0 C 82.5 102.19 85.0 99.33 85.0 99.33 L 103.0 126.17 L 103.0 127.0 C 103.0 127.0 99.81 127.5 96.67 127.5 C 93.53 127.5 84.17 127.0 84.17 127.0 C 84.17 127.0 77.73 116.55 76.17 113.83 C 74.61 111.11 74.83 110.67 74.83 110.67 L 73.5 110.17 L 62.83 127.17 C 62.83 127.17 64.47 127.67 61.5 127.67 C 58.53 127.67 45.0 127.17 45.0 127.17 L 44.67 126.17 C 44.67 126.17 43.14 128.2 45.17 125.17 C 47.2 122.14 53.97 112.39 56.83 108.0 C 59.69 103.61 62.33 98.83 62.33 98.83 C 62.33 98.83 61.52 96.55 58.83 92.33 C 56.14 88.11 46.17 73.5 46.17 73.5 L 46.67 72.17 Z",
    "arrow-bottom": "M 22.0 107.17 L 29.67 107.17 L 31.0 108.17 C 31.0 108.17 33.97 118.83 35.33 122.83 C 36.69 126.83 37.53 128.95 39.17 132.17 C 40.81 135.39 42.87 139.03 45.17 142.17 C 47.48 145.31 50.61 148.72 53.0 151.0 C 55.39 153.28 56.61 154.05 59.5 155.83 C 62.39 157.61 70.33 161.67 70.33 161.67 C 70.33 161.67 71.44 161.91 72.83 160.83 C 74.22 159.75 78.67 155.17 78.67 155.17 L 79.67 155.17 C 79.67 155.17 92.31 167.06 96.17 171.0 C 100.03 174.94 102.83 178.83 102.83 178.83 C 102.83 178.83 96.5 178.94 94.83 178.83 C 93.16 178.72 93.8 178.31 92.83 178.17 C 91.86 178.03 90.72 178.22 89.0 178.0 C 87.28 177.78 83.75 177.14 82.5 176.83 C 81.25 176.53 82.06 176.31 81.5 176.17 C 80.94 176.03 80.7 176.36 79.17 176.0 C 77.64 175.64 74.8 174.86 72.33 174.0 C 69.86 173.14 66.88 172.03 64.33 170.83 C 61.77 169.64 59.89 168.77 57.0 166.83 C 54.11 164.89 50.14 162.06 47.0 159.17 C 43.86 156.28 40.84 153.06 38.17 149.5 C 35.5 145.94 32.83 141.22 31.0 137.83 C 29.17 134.44 28.34 132.17 27.17 129.17 C 26.0 126.17 24.95 123.25 24.0 119.83 C 23.05 116.41 21.83 110.78 21.5 108.67 C 21.17 106.56 22.0 107.17 22.0 107.17 Z",
  };

  // ox/oy: the piece's centroid, used as its rotation pivot.
  // fx/fy: where it starts, in viewBox units, out along its own axis.
  var PIECES = [
    { key: "arrow-top",    ox: 143.3, oy: 49.1,  fx: 108,  fy: -140, rot:  58, delay:   0 },
    { key: "r",            ox: 129.6, oy: 98.9,  fx: 172,  fy:   26, rot: -42, delay:  46 },
    { key: "x",            ox:  73.7, oy: 100.1, fx: -172, fy:   26, rot:  42, delay:  75 },
    { key: "arrow-bottom", ox:  57.3, oy: 151.4, fx: -108, fy:  140, rot: -58, delay: 110 },
  ];

  var T = {
    fly:    880,   // travel time for one piece
    settle: 460,   // spring-back after the pieces collide
    sweep:  700,   // glint across the finished mark
    sweepAt: 480,  // delay after impact before the glint runs
  };
  var MEET = 0.78; // fraction of `fly` at which the pieces meet — the flash beat

  var EASE = {
    approach: "cubic-bezier(.34,.02,.26,1)",  // keeps momentum, brakes into the centre
    settle:   "cubic-bezier(.34,1.46,.58,1)", // small overshoot on landing
    burst:    "cubic-bezier(.12,.78,.26,1)",  // shockwave
    out:      "cubic-bezier(.4,0,.6,1)",
  };

  var SPOKES = 12, SPARKS = 16;
  var SVGNS = "http://www.w3.org/2000/svg";

  /* -------------------------------------------------------------------------
     Shadow DOM
  ------------------------------------------------------------------------- */
  function styles() {
    return [
      ":host{--xr-bg:" + palette.bg + ";--xr-bg2:" + palette.bg2 + ";",
      "--xr-ink:" + palette.ink + ";--xr-accent:#5ec8ff;",
      "position:fixed;inset:0;z-index:2147483000;display:block;",
      "background:radial-gradient(120% 120% at 50% 0%,var(--xr-bg2) 0%,var(--xr-bg) 62%);",
      "overflow:hidden;isolation:isolate}",
      ".wrap{position:absolute;inset:0;display:grid;place-items:center}",
      "svg.mark{width:min(46vmin,340px);height:min(46vmin,340px);overflow:visible;display:block}",
      ".piece{opacity:0}",
      ".piece path{fill:var(--xr-ink)}",
      "#flash>*{opacity:0}",
      "#spokes line,#ring1,#ring2{vector-effect:non-scaling-stroke}",
      "#ring2{stroke:var(--xr-accent)}",
      "#gBloom .s-mid,#gBloom .s-end,#gSweep .s-edge,#gSweep .s-mid{stop-color:var(--xr-accent)}",
      // the glint has to darken a white mark and lighten a black one
      "#sweep{mix-blend-mode:" + (themeName === "light" ? "screen" : "multiply") + "}",
      // square, not inset:0 — a percentage radial gradient in a wide viewport
      // would smear the burst into an ellipse
      ".wash{position:absolute;left:50%;top:50%;width:170vmax;height:170vmax;",
      "transform:translate(-50%,-50%);opacity:0;pointer-events:none;",
      "background:radial-gradient(38% 38% at 50% 50%,#fff 0%,rgba(255,255,255,.35) 45%,transparent 72%);",
      "mix-blend-mode:" + (themeName === "light" ? "normal" : "screen") + "}",
      ".skip{position:absolute;right:max(18px,3vw);bottom:max(18px,3vh);",
      "font:500 12px/1 ui-sans-serif,system-ui,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;",
      "letter-spacing:.06em;text-transform:uppercase;color:var(--xr-ink);",
      "background:transparent;border:1px solid currentColor;border-radius:999px;",
      "padding:9px 16px;cursor:pointer;opacity:0;transition:opacity .3s ease,background .2s ease}",
      ".skip:hover{background:color-mix(in srgb,var(--xr-ink) 12%,transparent)}",
      ".skip:focus-visible{outline:2px solid var(--xr-accent);outline-offset:3px}",
      "@media (prefers-reduced-motion:reduce){.skip{transition:none}}",
    ].join("");
  }

  function markup() {
    return (
      "<style>" + styles() + "</style>" +
      '<div class="wrap" part="wrap">' +
        '<svg class="mark" viewBox="0 0 200 200" aria-hidden="true" focusable="false">' +
          "<defs>" +
            '<radialGradient id="gCore">' +
              '<stop offset="0%" stop-color="#fff" stop-opacity="1"/>' +
              '<stop offset="45%" stop-color="#fff" stop-opacity=".92"/>' +
              '<stop offset="100%" stop-color="#fff" stop-opacity="0"/>' +
            "</radialGradient>" +
            '<radialGradient id="gBloom">' +
              '<stop offset="0%" stop-color="#fff" stop-opacity=".95"/>' +
              '<stop offset="35%" class="s-mid" stop-opacity=".45"/>' +
              '<stop offset="100%" class="s-end" stop-opacity="0"/>' +
            "</radialGradient>" +
            '<linearGradient id="gSweep" x1="0" y1="0" x2="1" y2="0">' +
              '<stop offset="0%" class="s-edge" stop-opacity="0"/>' +
              '<stop offset="50%" class="s-mid" stop-opacity=".9"/>' +
              '<stop offset="100%" class="s-edge" stop-opacity="0"/>' +
            "</linearGradient>" +
            '<clipPath id="logoClip">' +
              '<path d="' + PATHS["arrow-top"] + '"/>' +
              '<path d="' + PATHS.r + '"/>' +
              '<path d="' + PATHS.x + '"/>' +
              '<path d="' + PATHS["arrow-bottom"] + '"/>' +
            "</clipPath>" +
          "</defs>" +
          '<g id="logo">' +
            PIECES.map(function (p) {
              return '<g class="piece" id="pc-' + p.key + '">' +
                       '<path d="' + PATHS[p.key] + '"/></g>';
            }).join("") +
            '<g clip-path="url(#logoClip)">' +
              '<rect id="sweep" x="-90" y="-40" width="70" height="280" ' +
                'fill="url(#gSweep)" opacity="0" transform="rotate(18 100 100)"/>' +
            "</g>" +
          "</g>" +
          '<g id="flash">' +
            '<circle id="bloom" cx="100" cy="100" r="40" fill="url(#gBloom)"/>' +
            '<g id="spokes" stroke="#fff" stroke-width="2.5" stroke-linecap="round"></g>' +
            '<circle id="ring1" cx="100" cy="100" r="20" fill="none" stroke="#fff" stroke-width="9"/>' +
            '<circle id="ring2" cx="100" cy="100" r="20" fill="none" stroke-width="4"/>' +
            '<g id="sparks" fill="#fff"></g>' +
            '<circle id="core" cx="100" cy="100" r="26" fill="url(#gCore)"/>' +
          "</g>" +
        "</svg>" +
        '<div class="wash"></div>' +
      "</div>" +
      '<button class="skip" type="button">Skip</button>'
    );
  }

  /* -------------------------------------------------------------------------
     Element
  ------------------------------------------------------------------------- */
  class XRLogoIntro extends HTMLElement {}
  var proto = XRLogoIntro.prototype;

  proto.connectedCallback = function () {
    if (this._booted) return;
    this._booted = true;

    // Returning visitor: get out of the way before anything paints.
    if (!PLAY) { this.remove(); finishDocument(); return; }

    try { sessionStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (e) {}

    this._anims = [];
    this._timers = [];
    this._done = false;

    try {
      this._build();
      this._play();
    } catch (e) {
      // Never let a broken intro hold the site hostage.
      if (window.console) console.error("[xr-logo-intro]", e);
      this._finish(true);
    }
  };

  proto.disconnectedCallback = function () {
    this._clearTimers();
  };

  proto._num = function (attr, fallback) {
    var v = parseFloat(this.getAttribute(attr));
    return isFinite(v) ? v : fallback;
  };

  proto._build = function () {
    var root = this.attachShadow({ mode: "open" });
    root.innerHTML = markup();

    this.setAttribute("role", "presentation");

    var accent = this.getAttribute("accent");
    if (accent) this.style.setProperty("--xr-accent", accent);

    var $ = root.querySelector.bind(root);
    this.el = {
      logo: $("#logo"),   wash: $(".wash"),   sweep: $("#sweep"),
      bloom: $("#bloom"), core: $("#core"),
      ring1: $("#ring1"), ring2: $("#ring2"),
      spokes: $("#spokes"), sparks: $("#sparks"),
      skip: $(".skip"),
    };

    // burst geometry
    var i, a;
    for (i = 0; i < SPOKES; i++) {
      a = (i / SPOKES) * Math.PI * 2;
      var line = document.createElementNS(SVGNS, "line");
      line.setAttribute("x1", 100 + Math.cos(a) * 14);
      line.setAttribute("y1", 100 + Math.sin(a) * 14);
      line.setAttribute("x2", 100 + Math.cos(a) * (26 + (i % 3) * 7));
      line.setAttribute("y2", 100 + Math.sin(a) * (26 + (i % 3) * 7));
      this.el.spokes.appendChild(line);
    }
    this._sparkNodes = [];
    for (i = 0; i < SPARKS; i++) {
      a = (i / SPARKS) * Math.PI * 2 + 0.3;
      var c = document.createElementNS(SVGNS, "circle");
      c.setAttribute("cx", 100);
      c.setAttribute("cy", 100);
      c.setAttribute("r", (i % 3 === 0) ? 2.2 : 1.4);
      c._dx = Math.cos(a) * (46 + (i % 5) * 13);
      c._dy = Math.sin(a) * (46 + (i % 5) * 13);
      this.el.sparks.appendChild(c);
      this._sparkNodes.push(c);
    }

    // skip affordances
    var self = this;
    if (this.getAttribute("skip") === "off") {
      this.el.skip.remove();
    } else {
      this.el.skip.addEventListener("click", function (e) {
        e.stopPropagation();
        self._finish();
      });
    }
    this._onKey = function (e) {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") self._finish();
    };
    this.addEventListener("click", function () { self._finish(); });
    document.addEventListener("keydown", this._onKey);
  };

  proto._animate = function (node, keyframes, options) {
    if (!node || !node.animate) return null;
    options.fill = "both";
    var a = node.animate(keyframes, options);
    a.playbackRate = this._speed;
    this._anims.push(a);
    return a;
  };

  proto._after = function (ms, fn) {
    this._timers.push(setTimeout(fn, ms / this._speed));
  };

  proto._clearTimers = function () {
    (this._timers || []).forEach(clearTimeout);
    this._timers = [];
  };

  proto._play = function () {
    var self = this;
    this._speed = Math.max(0.1, this._num("speed", 1));
    var hold = this._num("hold", 260);
    var exit = this._num("exit", 520);

    emit("xr-logo-intro:start");

    var reduced = window.matchMedia &&
                  matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      // No flying parts, no burst: show the finished mark, then get out.
      PIECES.forEach(function (p) {
        var n = self.shadowRoot.getElementById("pc-" + p.key);
        n.style.opacity = 1;
      });
      this._after(520, function () { self._finish(); });
      this._watchdog(1400 + exit);
      return;
    }

    var impactAt = Math.round(T.fly * MEET + 60);

    /* 1. the pieces converge on the centre */
    PIECES.forEach(function (p) {
      var node = self.shadowRoot.getElementById("pc-" + p.key);
      node.style.transformBox = "view-box";
      node.style.transformOrigin = p.ox + "px " + p.oy + "px";

      // unit vector outward, so a piece can dip past its resting place
      // toward the centre on impact and spring back out of it
      var len = Math.sqrt(p.fx * p.fx + p.fy * p.fy) || 1;
      var ux = (p.fx / len) * 7, uy = (p.fy / len) * 7;

      self._animate(node, [
        { offset: 0, easing: EASE.approach,
          transform: "translate(" + p.fx + "px," + p.fy + "px) rotate(" + p.rot + "deg) scale(.55)" },
        { offset: MEET, easing: EASE.settle,
          transform: "translate(" + (-ux) + "px," + (-uy) + "px) rotate(0deg) scale(.965)" },
        { offset: 1, transform: "translate(0,0) rotate(0deg) scale(1)" },
      ], { duration: T.fly, delay: p.delay });

      // fade on its own track so it cannot disturb the travel easing
      self._animate(node, [{ opacity: 0 }, { opacity: 1 }],
        { duration: 170, delay: p.delay, easing: EASE.out });
    });

    /* 2. the light flash, right as they merge */
    this.el.logo.style.transformBox = "view-box";
    this.el.logo.style.transformOrigin = "100px 100px";

    this._animate(this.el.logo, [
      { offset: 0,   transform: "scale(1)",     filter: "drop-shadow(0 0 0 rgba(255,255,255,0))" },
      { offset: .18, transform: "scale(1.055)", filter: "drop-shadow(0 0 22px rgba(255,255,255,.85))",
        easing: EASE.settle },
      { offset: 1,   transform: "scale(1)",     filter: "drop-shadow(0 0 0 rgba(255,255,255,0))" },
    ], { duration: T.settle + 260, delay: impactAt });

    this._animate(this.el.wash, [
      { offset: 0, opacity: 0 },
      { offset: .22, opacity: .95, easing: EASE.out },
      { offset: 1, opacity: 0 },
    ], { duration: 420, delay: impactAt - 40 });

    setOrigin(this.el.bloom);
    this._animate(this.el.bloom, [
      { offset: 0,   opacity: 0,   transform: "scale(.15)", easing: EASE.burst },
      { offset: .16, opacity: .95, easing: EASE.out },
      { offset: 1,   opacity: 0,   transform: "scale(3.1)" },
    ], { duration: 760, delay: impactAt - 30 });

    setOrigin(this.el.core);
    this._animate(this.el.core, [
      { offset: 0,   opacity: 0, transform: "scale(.1)",  easing: EASE.burst },
      { offset: .18, opacity: 1, transform: "scale(1.5)", easing: EASE.out },
      { offset: 1,   opacity: 0, transform: "scale(.7)" },
    ], { duration: 440, delay: impactAt - 30 });

    [[this.el.ring1, 0, 620, 9, 4.6], [this.el.ring2, 90, 720, 4, 6.2]].forEach(
      function (cfg) {
        setOrigin(cfg[0]);
        self._animate(cfg[0], [
          { offset: 0,   opacity: 0,  transform: "scale(.12)", strokeWidth: cfg[3] + "px",
            easing: EASE.burst },
          { offset: .12, opacity: .9 },
          { offset: 1,   opacity: 0,  transform: "scale(" + cfg[4] + ")", strokeWidth: "0px" },
        ], { duration: cfg[2], delay: impactAt + cfg[1] });
      }
    );

    setOrigin(this.el.spokes);
    this._animate(this.el.spokes, [
      { offset: 0,   opacity: 0, transform: "scale(.3) rotate(0deg)", easing: EASE.burst },
      { offset: .14, opacity: 1 },
      { offset: 1,   opacity: 0, transform: "scale(2.6) rotate(14deg)" },
    ], { duration: 520, delay: impactAt - 10 });

    this._sparkNodes.forEach(function (c, i) {
      self._animate(c, [
        { offset: 0,   opacity: 0, transform: "translate(0,0) scale(.4)", easing: EASE.burst },
        { offset: .12, opacity: 1, easing: "cubic-bezier(.2,.6,.3,1)" },
        { offset: 1,   opacity: 0,
          transform: "translate(" + c._dx + "px," + c._dy + "px) scale(.2)" },
      ], { duration: 640 + (i % 4) * 90, delay: impactAt + (i % 5) * 18 });
    });

    /* 3. glint across the finished mark */
    var glintEnd = impactAt;
    if (this.getAttribute("glint") !== "off") {
      this._animate(this.el.sweep, [
        { offset: 0,  opacity: 0,   transform: "translateX(0)" },
        { offset: .2, opacity: .75 },
        { offset: .8, opacity: .75 },
        { offset: 1,  opacity: 0,   transform: "translateX(320px)" },
      ], { duration: T.sweep, delay: impactAt + T.sweepAt,
           easing: "cubic-bezier(.3,0,.3,1)" });
      glintEnd = impactAt + T.sweepAt + T.sweep;
    } else {
      glintEnd = impactAt + T.settle;
    }

    /* 4. reveal the site */
    if (this.el.skip) {
      this._after(600, function () { self.el.skip.style.opacity = ".55"; });
    }
    this._after(glintEnd + hold, function () { self._finish(); });
    this._watchdog(glintEnd + hold + exit);
  };

  /** Hard stop: if the natural end is missed, tear the overlay down anyway. */
  proto._watchdog = function (naturalEnd) {
    var self = this;
    this._timers.push(setTimeout(function () { self._finish(true); },
      naturalEnd / this._speed + 3000));
  };

  proto._finish = function (immediate) {
    if (this._done) return;
    this._done = true;

    var self = this;
    var exit = immediate ? 0 : this._num("exit", 520);

    this._clearTimers();
    document.removeEventListener("keydown", this._onKey);
    this.style.pointerEvents = "none";   // the site is clickable again at once
    if (this.el && this.el.skip) this.el.skip.style.opacity = "0";

    var teardown = function () {
      self.remove();
      finishDocument();
    };

    if (!exit || !this.animate) { teardown(); return; }

    // let the burst finish its own arc rather than cutting it off mid-flight
    this._anims.forEach(function (a) {
      try { if (a.playState === "running") a.playbackRate = self._speed * 1.6; }
      catch (e) {}
    });

    if (this.el && this.el.logo) {
      this.el.logo.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.06)" }],
        { duration: exit, easing: "cubic-bezier(.4,0,.7,1)", fill: "both" }
      );
    }
    var fade = this.animate([{ opacity: 1 }, { opacity: 0 }],
      { duration: exit, easing: "cubic-bezier(.4,0,.6,1)", fill: "both" });
    fade.onfinish = teardown;
    fade.oncancel = teardown;
    // belt and braces: if onfinish never lands (tab backgrounded, etc.)
    setTimeout(teardown, exit + 400);
  };

  /* -------------------------------------------------------------------------
     Helpers
  ------------------------------------------------------------------------- */
  function setOrigin(node) {
    node.style.transformBox = "view-box";
    node.style.transformOrigin = "100px 100px";
  }

  function emit(name) {
    document.dispatchEvent(new CustomEvent(name, { bubbles: true }));
  }

  var documentFinished = false;
  function finishDocument() {
    if (documentFinished) return;
    documentFinished = true;
    document.documentElement.setAttribute("data-xr-intro", "done");
    emit("xr-logo-intro:done");
  }

  customElements.define(TAG, XRLogoIntro);

  /* -------------------------------------------------------------------------
     data-auto: mount without touching the site's markup.
  ------------------------------------------------------------------------- */
  if ("auto" in sd) {
    var mount = function () {
      if (document.querySelector(TAG)) return;
      var host = document.createElement(TAG);
      if (script) {
        for (var k in sd) {
          if (k !== "auto" && k !== "once" && k !== "theme") host.setAttribute(k, sd[k]);
        }
      }
      (document.body || document.documentElement).appendChild(host);
    };
    if (document.body) {
      mount();
    } else if (window.MutationObserver) {
      // mount the instant the parser opens <body>, i.e. still before the
      // site's own markup has had a chance to paint
      var mo = new MutationObserver(function () {
        if (document.body) { mo.disconnect(); mount(); }
      });
      mo.observe(document.documentElement, { childList: true });
    } else {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
    }
  }
})();
