// Ro Cafe menu: prepare a new version for publishing. Run `node tools/release.mjs` from the site folder
// after editing anything. Each file gets ?v=<fingerprint of its contents>, so phones download only the
// files that really changed and keep the rest. It also raises the offline-copy version, keeps the
// security policy in step with the page, then runs tools/check.mjs.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { buildCss } from "./build-css.mjs";
import { prerender } from "./prerender.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = f => path.join(ROOT, f);
const read = f => readFileSync(file(f), "utf8");
const write = (f, s) => writeFileSync(file(f), s);

// 1. stylesheet: src/style.css -> assets/css/style.css (adds what older phones need)
const css = await buildCss();
css.warnings.forEach(w => console.warn("! " + w));

// 2. the ready-made menu inside the page
let html = prerender(read("index.html")), sw = read("sw.js");
const fingerprint = f => createHash("sha256").update(readFileSync(file(f))).digest("hex").slice(0, 8);
const stamp = s => s.replace(/([\w./-]+\.(?:css|js))\?v=[\w]+/g, (m, f) => `${f}?v=${fingerprint(f)}`);
html = stamp(html);
sw = stamp(sw);
const now = +(sw.match(/VERSION = "ro-v(\d+)"/) || [0, 0])[1], next = now + 1;
sw = sw.replace(/VERSION = "ro-v\d+"/, `VERSION = "ro-v${next}"`);

// the one small inline script is allowed by its fingerprint; refresh it in case the script was edited
const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map(m => `'sha256-${createHash("sha256").update(m[1]).digest("base64")}'`).join(" ");
const oldCsp = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
const csp = oldCsp.replace(/script-src [^;]+/, `script-src 'self' ${hashes}`);
html = html.replace(oldCsp, csp);

write("index.html", html);
write("sw.js", sw);
for (const f of ["_headers", ".htaccess"]) write(f, read(f).split(oldCsp).join(csp));

console.log(`Release ${now} → ${next}`);
execFileSync(process.execPath, [file("tools/check.mjs")], { stdio: "inherit" });
