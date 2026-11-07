// Ro Cafe menu: checks the site before publishing. No installs needed: run `node tools/check.mjs`
// from the site folder. It stops with a clear message if something would break the live menu.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import vm from "node:vm";
import { isCurrent } from "./prerender.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = f => readFileSync(path.join(ROOT, f), "utf8");
const problems = [];
const bad = msg => problems.push(msg);

/* ---------- 1. load the data files exactly as the browser does ---------- */
const ctx = vm.createContext({});
for (const f of ["data/config.js", "data/strings.js", "data/menu.js"]) {
  try { vm.runInContext(read(f), ctx, { filename: f }); }
  catch (e) { console.error(`✖ ${f} has a typo and cannot be read: ${e.message}`); process.exit(1); }
}
const { CONFIG, T, MENU, DESC, TAGS, IMG } = vm.runInContext("({CONFIG,T,MENU,DESC,TAGS,IMG})", ctx);

/* ---------- 2. menu ---------- */
const names = new Set(), catIds = new Set();
for (const c of MENU) {
  if (!/^[a-z][a-z0-9-]*$/.test(c.id)) bad(`category id "${c.id}" should be lowercase letters`);
  if (catIds.has(c.id)) bad(`category id "${c.id}" is used twice`);
  catIds.add(c.id);
  if (!c.fa || !c.en) bad(`category "${c.id}" needs a Persian and an English name`);
  for (const it of c.items) {
    if (it.espresso) {
      for (const b of it.beans) if (!(b[2] > 0)) bad(`espresso bean "${b[1]}" needs a price`);
      names.add(it.en); continue;
    }
    const [fa, en, p] = it;
    const where = `item "${en || fa}" in ${c.id}`;
    if (typeof fa !== "string" || !fa.trim()) bad(`${where}: Persian name is missing`);
    if (typeof en !== "string" || !en.trim()) bad(`${where}: English name is missing`);
    if (typeof p !== "number" || !(p > 0) || p > 10000) bad(`${where}: price should be a number in thousand toman (e.g. 265)`);
    if (names.has(en)) bad(`${where}: English name is used twice (photos and tags are matched by it)`);
    names.add(en);
  }
}
const TAG_CODES = new Set(Object.keys(T.fa).filter(k => k.startsWith("tag_")).map(k => k.slice(4)));
for (const [en, tags] of Object.entries(TAGS)) {
  if (!names.has(en)) bad(`TAGS mentions "${en}", which is not on the menu`);
  for (const t of tags) if (!TAG_CODES.has(t)) bad(`TAGS for "${en}": unknown tag "${t}"`);
}
for (const en of Object.keys(DESC)) if (!names.has(en)) bad(`DESC mentions "${en}", which is not on the menu`);
const used = new Set();
for (const [en, v] of Object.entries(IMG)) for (const file of [].concat(v)) {
  used.add(file);
  if (!names.has(en)) bad(`IMG mentions "${en}", which is not on the menu`);
  if (!/^[\w-]+$/.test(file)) bad(`IMG file name "${file}" should use only letters, digits, - and _`);
  for (const dir of ["img", "img/lg"]) {
    if (!existsSync(path.join(ROOT, dir, file + ".webp"))) bad(`photo missing: ${dir}/${file}.webp`);
    if (!existsSync(path.join(ROOT, dir, "jpg", file + ".jpg"))) bad(`older-iPhone copy missing: ${dir}/jpg/${file}.jpg`);
  }
}

for (const dir of ["img", "img/lg", "img/jpg", "img/lg/jpg"]) for (const f of readdirSync(path.join(ROOT, dir)))
  if (/\.(webp|jpg)$/.test(f) && !used.has(f.replace(/\.(webp|jpg)$/, ""))) bad(`${dir}/${f} is not used by any item (delete it, it only makes the site bigger)`);
for (const it of names) if (!(it in IMG)) bad(`"${it}" has no photo in IMG`);

/* ---------- 3. texts and settings ---------- */
for (const k of Object.keys(T.fa)) if (!(k in T.en)) bad(`strings.js: "${k}" has Persian text but no English`);
for (const k of Object.keys(T.en)) if (!(k in T.fa)) bad(`strings.js: "${k}" has English text but no Persian`);
if (!/^\+\d{8,15}$/.test(CONFIG.phone)) bad(`config.js: phone should look like +981155226936`);
for (const m of CONFIG.maps || []) {
  if (!/^https:\/\//.test(m.url)) bad(`config.js: the ${m.app} map link must start with https://`);
  if (!T.fa["app_" + m.app] || !T.en["app_" + m.app]) bad(`config.js: map app "${m.app}" needs a name in strings.js (app_${m.app})`);
}
if (!/^[\w.]+$/.test(CONFIG.instagram)) bad(`config.js: instagram should be the handle only, without @ or a link`);
if (CONFIG.hours) for (const [d, slots] of Object.entries(CONFIG.hours))
  for (const s of slots) for (const tm of s) if (!/^([01]\d|2[0-4]):[0-5]\d$/.test(tm)) bad(`config.js: hours for ${d} has "${tm}", use 24h time like "09:00"`);

/* ---------- 4. release consistency ---------- */
const html = read("index.html"), sw = read("sw.js");
const fingerprint = f => createHash("sha256").update(readFileSync(path.join(ROOT, f))).digest("hex").slice(0, 8);
const refs = s => [...s.matchAll(/([\w./-]+\.(?:css|js))\?v=(\w+)/g)];
for (const [, f, v] of [...refs(html), ...refs(sw)])
  if (existsSync(path.join(ROOT, f)) && v !== fingerprint(f)) bad(`${f} changed since the last release (run node tools/release.mjs)`);
const pageRefs = new Set(refs(html).map(m => m[0])), swRefs = new Set(refs(sw).map(m => m[0]));
for (const r of pageRefs) if (!swRefs.has(r)) bad(`sw.js does not save ${r} for offline use`);
const release = (sw.match(/VERSION = "ro-v(\d+)"/) || [])[1];
if (!release) bad("sw.js: VERSION is missing");
for (const m of sw.matchAll(/"([^"]+\?v=\d+|[^"]+\.(?:svg|webmanifest))"/g)) {
  const f = m[1].split("?")[0]; if (!existsSync(path.join(ROOT, f))) bad(`sw.js saves "${f}" for offline use, but that file does not exist`);
}

/* ---------- 4b. the stylesheet was built from the current source ---------- */
{
  const src = readFileSync(path.join(ROOT, "src/style.css"));
  const want = createHash("sha256").update(src).digest("hex").slice(0, 12);
  const built = (read("assets/css/style.css").match(/^\/\* Built from src\/style\.css \((\w+)\)/) || [])[1];
  if (built !== want) bad("assets/css/style.css is older than src/style.css (run node tools/release.mjs)");
}

if (!isCurrent(read("index.html"))) bad("the menu written into index.html is out of date (run node tools/release.mjs)");

/* ---------- 5. security rules ---------- */
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const csp = (html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/) || [])[1];
if (!csp) bad("index.html: Content-Security-Policy is missing");
else for (const s of inline) {
  const h = createHash("sha256").update(s).digest("base64");
  if (!csp.includes(`'sha256-${h}'`)) bad(`index.html: the small inline script changed; its hash must be updated (run node tools/release.mjs)`);
}
if (/\son[a-z]+="/i.test(html)) bad("index.html: inline event handlers (onclick=…) are blocked by the security policy");
if (/\sstyle="/i.test(html) || /\sstyle="/.test(read("assets/js/app.js"))) bad("inline style=\"…\" is blocked by the security policy; use a CSS class");
for (const f of ["_headers", ".htaccess"]) if (csp && !read(f).includes(csp)) bad(`${f}: security policy differs from index.html (run node tools/release.mjs)`);

/* ---------- result ---------- */
if (problems.length) {
  console.error(`✖ ${problems.length} problem${problems.length > 1 ? "s" : ""}:\n  - ` + problems.join("\n  - "));
  process.exit(1);
}
const count = MENU.reduce((a, c) => a + c.items.length, 0);
console.log(`✓ All good: ${MENU.length} categories, ${count} items, ${used.size} photos, release ${release}.`);
