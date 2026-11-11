/* Ro Cafe menu: works offline and from the home screen.
   Pages, data, styles and scripts come from the network when it answers in time (so they are
   never out of date) and from the saved copy when it is slow or absent. Photos are saved once,
   then come from the phone. */
const SITE = "ro-site-3";
const PHOTOS = "ro-photos-4";
const WAIT = 3000; // ms the network gets before a saved copy is shown instead

/* What to save at install is read from the page itself (its styles, scripts, fonts and icons,
   and the fonts its stylesheet names), so there is no second list to keep up to date. */
async function siteFiles() {
  const files = new Set(); // full addresses, so a file named twice is saved once
  const add = (path, base = location.href) => files.add(new URL(path, base).href);
  add("./");
  add("index.html");
  const page = await (await fetch("index.html", { cache: "reload" })).text();
  for (const [, path] of page.matchAll(/<(?:link|script)\b[^>]*?\b(?:href|src)="([^":#]+)"/g)) {
    add(path);
  }
  for (const sheet of [...files].filter((file) => file.endsWith(".css"))) {
    const css = await (await fetch(sheet, { cache: "reload" })).text();
    for (const [, path] of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) add(path, sheet);
  }
  return [...files];
}

self.addEventListener("install", (e) => {
  e.waitUntil(
    siteFiles()
      .then((files) => caches.open(SITE).then((cache) => cache.addAll(files)))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  // remove every older store this site ever made
  e.waitUntil(
    caches
      .keys()
      .then((keys) => keys.filter((key) => key !== SITE && key !== PHOTOS))
      .then((old) => Promise.all(old.map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function keep(store, request, response) {
  if (response.ok && response.type === "basic") {
    const copy = response.clone();
    caches.open(store).then((cache) => cache.put(request, copy));
  }
  return response;
}

const savedCopy = (request) =>
  caches
    .match(request, { ignoreSearch: true })
    .then((hit) => hit || (request.mode === "navigate" ? caches.match("./") : undefined));

const after = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* The network's answer if it comes within WAIT, otherwise the saved copy (if there is one).
   Once the network has been that slow, the files that follow come straight from the saved copies
   for a while, so a page waits once, not once per file. Every answer that does arrive, however
   late, replaces the saved copy. */
const SLOW_FOR = 30000; // ms
let slowUntil = 0;

async function freshOrSaved(e) {
  const fresh = fetch(e.request).then((response) => keep(SITE, e.request, response));
  const saved = await savedCopy(e.request);
  if (!saved) return fresh;
  e.waitUntil(fresh.catch(() => {}));
  if (Date.now() < slowUntil) return saved;
  let answered = false;
  const inTime = fresh.catch(() => saved).finally(() => (answered = true));
  const tooSlow = after(WAIT).then(() => {
    if (!answered) slowUntil = Date.now() + SLOW_FOR;
    return saved;
  });
  return Promise.race([inTime, tooSlow]);
}

self.addEventListener("fetch", (e) => {
  const request = e.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.includes("/img/")) {
    e.respondWith(
      caches
        .match(request)
        .then((hit) => hit || fetch(request).then((r) => keep(PHOTOS, request, r))),
    );
  } else {
    e.respondWith(freshOrSaved(e).catch(() => Response.error()));
  }
});
