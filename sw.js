/* Ro Cafe menu: offline support.
   - The page and menu data: network first, saved copy when offline (prices stay fresh).
   - Styles, scripts, fonts, photos: saved copy first (fast), refreshed in the background.
   Raise VERSION after a release to clear old saved files. */
const VERSION = "ro-v7";
const CORE = ["./", "index.html", "assets/css/fonts.css?v=7", "assets/css/style.css?v=7", "data/config.js?v=7",
  "data/strings.js?v=7", "data/menu.js?v=7", "assets/js/app.js?v=7", "assets/icon.svg", "manifest.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  const fresh = req.mode === "navigate" || url.pathname.includes("/data/");
  if (fresh) {
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
  } else {
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
