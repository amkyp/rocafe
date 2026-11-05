/* Ro Cafe menu: offline support.
   - The page and menu data: network first, saved copy when offline (prices stay fresh).
   - Styles, scripts, fonts, photos: saved copy first (fast), refreshed in the background.
   Only good same-site answers are saved, so an error page can never replace a working file.
   VERSION and the ?v= numbers are raised by tools/release.mjs. */
const VERSION = "ro-v9";
const CORE = ["./", "index.html", "assets/css/fonts.css?v=9", "assets/css/style.css?v=9", "data/config.js?v=9",
  "data/strings.js?v=9", "data/menu.js?v=9", "assets/js/app.js?v=9", "assets/icon.svg", "manifest.webmanifest"];

const cacheable = res => res && res.ok && res.type === "basic";
const save = (req, res) => { if (cacheable(res)) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; };

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("ro-") && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || req.headers.has("range")) return;
  const fresh = req.mode === "navigate" || url.pathname.includes("/data/");
  if (fresh) {
    e.respondWith(fetch(req).then(res => save(req, res))
      .catch(() => caches.match(req).then(hit => hit || (req.mode === "navigate" ? caches.match("./") : Response.error()))));
  } else {
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(res => save(req, res)).catch(() => hit || Response.error());
      if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
      return net;
    }));
  }
});
