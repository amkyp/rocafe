// Ro Cafe menu: prepare a new version for publishing. Run `node tools/release.mjs` from the site folder
// after editing anything. It raises the ?v= number (so phones load the new files instead of old saved
// copies), keeps the security policy in step with the page, then runs tools/check.mjs.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = f => path.join(ROOT, f);
const read = f => readFileSync(file(f), "utf8");
const write = (f, s) => writeFileSync(file(f), s);

let html = read("index.html"), sw = read("sw.js");
const now = Math.max(...[...html.matchAll(/\?v=(\d+)/g)].map(m => +m[1]));
const next = now + 1;

html = html.replace(/\?v=\d+/g, `?v=${next}`);
sw = sw.replace(/\?v=\d+/g, `?v=${next}`).replace(/VERSION = "ro-v\d+"/, `VERSION = "ro-v${next}"`);

// the one small inline script is allowed by its fingerprint; refresh it in case the script was edited
const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map(m => `'sha256-${createHash("sha256").update(m[1]).digest("base64")}'`).join(" ");
const oldCsp = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
const csp = oldCsp.replace(/script-src [^;]+/, `script-src 'self' ${hashes}`);
html = html.replace(oldCsp, csp);

write("index.html", html);
write("sw.js", sw);
for (const f of ["_headers", ".htaccess"]) write(f, read(f).split(oldCsp).join(csp));

console.log(`Version ${now} → ${next}`);
execFileSync(process.execPath, [file("tools/check.mjs")], { stdio: "inherit" });
