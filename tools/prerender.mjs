// Ro Cafe menu: writes the ready-made Persian menu (and the category row) into index.html, using the
// same code the browser uses (assets/js/render.js). The page then shows the full menu at once, before
// its script runs, even on phones where the script can't run, and search engines can read it.
import { readFileSync } from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = f => readFileSync(path.join(ROOT, f), "utf8");

export function renderMenu() {
  const ctx = vm.createContext({});
  for (const f of ["data/config.js", "data/strings.js", "data/menu.js", "assets/js/render.js"]) vm.runInContext(read(f), ctx, { filename: f });
  return vm.runInContext('({ menu: RO.menuHTML({ lang: "fa" }), chips: RO.chipsHTML("fa") })', ctx);
}
const between = (html, name, inner) => html.replace(new RegExp(`<!--${name}-->[\\s\\S]*?<!--/${name}-->`), () => `<!--${name}-->${inner}<!--/${name}-->`);
export function prerender(html) {
  const { menu, chips } = renderMenu();
  return between(between(html, "menu", menu), "chips", chips);
}
export function isCurrent(html) { return prerender(html) === html; }
