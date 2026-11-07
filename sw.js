/* Ro Cafe menu: offline support.
   - The page and menu data: network first, saved copy when offline (prices stay fresh).
   - Styles, scripts, fonts, photos: saved copy first (fast), refreshed in the background.
   - Photos: downloaded once into their own store, which new releases keep.
   Only good same-site answers are saved, so an error page can never replace a working file.
   VERSION and the ?v= numbers are raised by tools/release.mjs. */
const PICS = "ro-photos-1"; // photos keep their names, so they survive new releases
const VERSION = "ro-v11";
const CORE = ["./", "index.html", "assets/css/fonts.css?v=11", "assets/css/style.css?v=11", "data/config.js?v=11",
  "data/strings.js?v=11", "data/menu.js?v=11", "assets/js/app.js?v=11", "assets/icon.svg", "manifest.webmanifest"];

const cacheable = res => res && res.ok && res.type === "basic";
const save = (req, res, name = VERSION) => { if (cacheable(res)) { const copy = res.clone(); caches.open(name).then(c => c.put(req, copy)); } return res; };

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("ro-") && k !== VERSION && k !== PICS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || req.headers.has("range")) return;
  const fresh = req.mode === "navigate" || url.pathname.includes("/data/");
  if (url.pathname.includes("/img/")) {
    // photos: saved copy only, downloaded once
    e.respondWith(caches.open(PICS).then(c => c.match(req)).then(hit => hit || fetch(req).then(res => save(req, res, PICS))));
    return;
  }
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
