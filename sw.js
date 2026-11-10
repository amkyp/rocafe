/* Ro Cafe menu: works offline and from the home screen.
   Pages, data, styles and scripts: always from the network when online (so they are never out of
   date), the saved copy when offline. Photos: saved once, then from the phone. */
const SITE = "ro-site-2",
  PHOTOS = "ro-photos-3";
const CORE = [
  "./",
  "index.html",
  "assets/css/style.css",
  "assets/js/theme.js",
  "assets/js/app.js",
  "assets/js/bill.js",
  "assets/js/card.js",
  "assets/js/chips.js",
  "assets/js/dom.js",
  "assets/js/files.js",
  "assets/js/gallery.js",
  "assets/js/header.js",
  "assets/js/icons.js",
  "assets/js/items.js",
  "assets/js/menu.js",
  "assets/js/rows.js",
  "assets/js/search.js",
  "assets/js/sheets.js",
  "assets/js/state.js",
  "assets/js/text.js",
  "assets/js/toast.js",
  "assets/js/visit.js",
  "data/config.js",
  "data/strings.js",
  "data/menu.js",
  "data/photos.js",
  "assets/fonts/plex-arabic-400-500.woff2",
  "assets/fonts/plex-arabic-600-800.woff2",
  "assets/fonts/plex-latin-400-500.woff2",
  "assets/fonts/plex-latin-600-800.woff2",
  "assets/icon.svg",
  "manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(SITE)
      .then((c) => c.addAll(CORE))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (e) => {
  // remove every older store this site ever made
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== SITE && k !== PHOTOS).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});
const keep = (store, req, res) => {
  if (res.ok && res.type === "basic") {
    const copy = res.clone();
    caches.open(store).then((c) => c.put(req, copy));
  }
  return res;
};
self.addEventListener("fetch", (e) => {
  const req = e.request,
    url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.includes("/img/")) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => keep(PHOTOS, req, res))),
    );
  } else {
    e.respondWith(
      fetch(req)
        .then((res) => keep(SITE, req, res))
        .catch(() =>
          caches
            .match(req, { ignoreSearch: true })
            .then(
              (hit) => hit || (req.mode === "navigate" ? caches.match("./") : Response.error()),
            ),
        ),
    );
  }
});
