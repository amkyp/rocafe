/* Ro Cafe menu: offline support.
   - The page: network first, saved copy when offline. It names the current menu data files, so new
     prices arrive with the page.
   - Menu data, styles, scripts, fonts (addresses carry a ?v= fingerprint): saved copy only; a change gets a new address.
   - Icon and app manifest: saved copy first, refreshed in the background.
   - Photos: downloaded once into their own store, which new releases keep.
   Only good same-site answers are saved, so an error page can never replace a working file.
   tools/release.mjs sets each ?v= to a fingerprint of the file and raises VERSION. */
const PICS = "ro-photos-1"; // photos keep their names, so they survive new releases
const VERSION = "ro-v15";
const CORE = ["./", "index.html", "assets/css/fonts.css?v=5642df5a", "assets/css/style.css?v=7d9bc34c", "data/config.js?v=baba6e62",
  "data/strings.js?v=9ab89a8e", "data/menu.js?v=68247d84", "assets/js/app.js?v=5dbca179", "assets/icon.svg", "manifest.webmanifest"];

const cacheable = res => res && res.ok && res.type === "basic";
const save = (req, res, name = VERSION) => { if (cacheable(res)) { const copy = res.clone(); caches.open(name).then(c => c.put(req, copy)); } return res; };

self.addEventListener("install", e => {
  // a file with the same ?v= fingerprint is the same file: copy it from the old release instead of downloading
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(CORE.map(async u => {
    const hit = u.includes("?v=") && await caches.match(u);
    return hit ? c.put(u, hit) : c.add(u);
  }))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("ro-") && k !== VERSION && k !== PICS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || req.headers.has("range")) return;
  const fresh = req.mode === "navigate" || (url.pathname.includes("/data/") && !url.search.includes("v="));
  if (url.pathname.includes("/img/")) {
    // photos: saved copy only, downloaded once
    e.respondWith(caches.open(PICS).then(c => c.match(req)).then(hit => hit || fetch(req).then(res => save(req, res, PICS))));
    return;
  }
  if (fresh) {
    e.respondWith(fetch(req).then(res => save(req, res))
      .catch(() => caches.match(req).then(hit => hit || (req.mode === "navigate" ? caches.match("./") : Response.error()))));
  } else if (url.search.includes("v=")) {
    // fingerprinted file: the same address always means the same contents, so the saved copy is final
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => save(req, res))));
  } else {
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(res => save(req, res)).catch(() => hit || Response.error());
      if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
      return net;
    }));
  }
});
