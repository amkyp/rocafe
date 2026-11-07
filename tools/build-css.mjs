// Ro Cafe menu: builds assets/css/style.css from src/style.css.
// Edit src/style.css (written the modern way); this adds what older phones need, so the design looks
// the same on all browsers listed under "browserslist" in package.json:
//   - right-to-left aware properties (margin-inline-start, inset-inline-end, text-align:start ...) are
//     also written as left/right for [dir="ltr"] and [dir="rtl"] pages;
//   - inset: becomes top/right/bottom/left;
//   - spacing set with gap on flex rows gets an equal margin fallback, used only where the browser
//     lacks flex gap (the page marks those with class "no-fg"); for rows that wrap only the
//     side-by-side spacing is copied (lines stay exact); grid gaps also get grid-gap;
//   - a rule mixing :focus-visible with other selectors is split, so older browsers keep the rest;
//   - env(...) values get a plain fallback first;
//   - browser prefixes via Autoprefixer (for example -webkit-sticky for older Safari).
// Run by tools/release.mjs. Needs `npm install` once.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import autoprefixer from "autoprefixer";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src/style.css"), OUT = path.join(ROOT, "assets/css/style.css");

const LTR = '[dir="ltr"] ', RTL = '[dir="rtl"] ';
const prefixSel = (rule, pre) => rule.selectors.map(s => s.startsWith(":root") || s.startsWith("html") ? s.replace(/^(:root|html)/, `$1${pre.trim()}`) : pre + s).join(",");
const split2 = v => { const p = postcss.list.space(v); return [p[0], p[1] !== undefined ? p[1] : p[0]]; };

/* ---------- 1. logical properties -> physical ---------- */
function logical(css) {
  css.walkRules(rule => {
    if (rule.parent.type === "atrule" && /keyframes/.test(rule.parent.name)) return;
    const ltr = [], rtl = [];
    rule.walkDecls(d => {
      const p = d.prop, v = d.value, imp = d.important;
      const put = (list, prop, val) => list.push({ prop, value: val, important: imp });
      const both = (base, startVal, endVal) => {           // base: "margin" | "padding" | "" (inset)
        const L = base ? `${base}-left` : "left", R = base ? `${base}-right` : "right";
        put(ltr, L, startVal); put(ltr, R, endVal); put(rtl, R, startVal); put(rtl, L, endVal);
      };
      let m;
      if (p === "inset") {
        const [t, r = t, b = t, l = r] = postcss.list.space(v);
        d.before([{ prop: "top", value: t }, { prop: "right", value: r }, { prop: "bottom", value: b }, { prop: "left", value: l }].map(x => d.clone(x)));
        d.remove(); return;
      }
      if ((m = p.match(/^(margin|padding|inset)-inline$/))) {
        const base = m[1] === "inset" ? "" : m[1], [s, e] = split2(v);
        if (s === e) { // same both sides: no direction needed
          d.before([d.clone({ prop: base ? `${base}-left` : "left", value: s }), d.clone({ prop: base ? `${base}-right` : "right", value: s })]);
        } else both(base, s, e);
        d.remove(); return;
      }
      if ((m = p.match(/^(margin|padding|inset)-block$/))) {
        const base = m[1] === "inset" ? "" : m[1], [s, e] = split2(v);
        d.before([d.clone({ prop: base ? `${base}-top` : "top", value: s }), d.clone({ prop: base ? `${base}-bottom` : "bottom", value: e })]);
        d.remove(); return;
      }
      if ((m = p.match(/^(margin|padding|inset)-inline-(start|end)$/))) {
        const base = m[1] === "inset" ? "" : m[1];
        const side = (dir) => (m[2] === "start") === (dir === "ltr") ? "left" : "right";
        const name = s => base ? `${base}-${s}` : s;
        put(ltr, name(side("ltr")), v); put(rtl, name(side("rtl")), v);
        d.remove(); return;
      }
      if (p === "text-align" && (v === "start" || v === "end")) {
        put(ltr, p, v === "start" ? "left" : "right"); put(rtl, p, v === "start" ? "right" : "left");
        d.remove(); return;
      }
    });
    const add = (list, pre) => {
      if (!list.length) return;
      const r = postcss.rule({ selector: prefixSel(rule, pre) });
      list.forEach(x => r.append(postcss.decl(x)));
      rule.after(r);
    };
    add(rtl, RTL); add(ltr, LTR);
    if (!rule.nodes.length) rule.remove();
  });
}

/* ---------- 2. gap fallbacks ---------- */
function gaps(css, warn) {
  // what display/direction/wrap each selector has, from plain (non-media) rules
  const info = new Map();
  css.walkRules(rule => {
    if (rule.parent.type !== "root") return;
    rule.selectors.forEach(s => {
      const o = info.get(s) || {};
      rule.walkDecls(/^(display|flex-direction|flex-wrap)$/, d => { o[d.prop] = d.value; });
      rule.walkDecls(/^(height|min-height|padding|padding-(top|bottom|block|block-end)|border|border-bottom|background|background-color)$/, () => { o.boxed = true; });
      info.set(s, o);
    });
  });
  const SKIP = ".chip-ind";   // absolutely placed children must not get margins
  css.walkRules(rule => {
    if (rule.parent.type === "atrule" && /keyframes/.test(rule.parent.name)) return;
    rule.walkDecls(/^(gap|row-gap|column-gap)$/, d => {
      const sels = rule.selectors;
      const look = k => { let v; rule.walkDecls(k, x => { v = x.value; }); if (v) return v; for (const s of sels) for (const c of [s].concat(s.match(/\.[\w-]+/g) || [])) { const o = info.get(c); if (o && o[k]) return o[k]; } return undefined; };
      const display = look("display") || "";
      const [rg, cg] = d.prop === "gap" ? split2(d.value) : d.prop === "row-gap" ? [d.value, null] : [null, d.value];
      if (/grid/.test(display)) { d.before(d.clone({ prop: "grid-" + d.prop })); return; }
      if (!/flex/.test(display)) { warn(`gap without a known display on "${rule.selector}"`); return; }
      const dir = look("flex-direction") || "row";
      const col = /column/.test(dir), rev = /reverse/.test(dir);
      const nexts = (pre = "") => sels.map(s => `html.no-fg${pre} ${s} > * + *:not(${SKIP})`);
      const L = '[dir="ltr"]', R = '[dir="rtl"]';
      const out = [];
      const r = (sel, decls) => { const n = postcss.rule({ selector: sel }); decls.forEach(([p, v]) => n.append(postcss.decl({ prop: p, value: v }))); out.push(n); };
      if (col) { if (rg) r(nexts().join(","), [[rev ? "margin-bottom" : "margin-top", rg]]); }
      else {
        const wrap = /wrap/.test(look("flex-wrap") || "");
        // a plain wrapping row (no box of its own) can copy the spacing exactly, between lines too:
        // every child gets space after and below, and the row takes that space back
        let boxed = false;
        const props = /^(height|min-height|padding|padding-(top|bottom|block|block-end)|border|border-bottom|background|background-color)$/;
        rule.walkDecls(props, () => { boxed = true; });
        for (const s of sels) { const o = info.get(s); if (o && o.boxed) boxed = true; }
        const startSide = dirName => (dirName === "ltr") !== rev ? "left" : "right";
        const endSide = dirName => startSide(dirName) === "left" ? "right" : "left";
        if (wrap && !boxed) {
          const kids = pre => sels.map(s => `html.no-fg${pre} ${s} > *:not(${SKIP})`);
          if (cg) { r(kids(L).join(","), [[`margin-${endSide("ltr")}`, cg]]); r(kids(R).join(","), [[`margin-${endSide("rtl")}`, cg]]);
                    r(sels.map(s => `html.no-fg${L} ${s}`).join(","), [[`margin-${endSide("ltr")}`, `calc(-1 * ${cg})`]]);
                    r(sels.map(s => `html.no-fg${R} ${s}`).join(","), [[`margin-${endSide("rtl")}`, `calc(-1 * ${cg})`]]); }
          if (rg) { r(kids("").join(","), [["margin-bottom", rg]]); r(sels.map(s => `html.no-fg ${s}`).join(","), [["margin-bottom", `calc(-1 * ${rg})`]]); }
        } else if (cg) {
          // rows with a box of their own: side-by-side spacing only, so a one-line row is exact
          r(nexts(L).join(","), [[`margin-${startSide("ltr")}`, cg]]);
          r(nexts(R).join(","), [[`margin-${startSide("rtl")}`, cg]]);
        }
      }
      let at = rule; out.forEach(n => { at.after(n); at = n; });
    });
  });
}

/* ---------- 3. keep rules alive in browsers without :focus-visible ---------- */
function focusVisible(css) {
  css.walkRules(rule => {
    const fv = rule.selectors.filter(s => s.includes(":focus-visible")), rest = rule.selectors.filter(s => !s.includes(":focus-visible"));
    if (!fv.length || !rest.length) return;
    rule.selector = rest.join(",");
    rule.after(rule.clone({ selector: fv.join(",") }));
  });
}

/* ---------- 4. env() fallback ---------- */
function envFallback(css) {
  css.walkDecls(d => {
    if (!d.value.includes("env(")) return;
    const prev = d.prev();
    if (prev && prev.type === "decl" && prev.prop === d.prop) return;
    d.before(d.clone({ value: d.value.replace(/env\([^)]*\)/g, "0px") }));
  });
}

export async function buildCss() {
  const src = readFileSync(SRC, "utf8");
  const warnings = [];
  const plugin = () => ({ postcssPlugin: "ro-compat", Once(css) { envFallback(css); gaps(css, m => warnings.push(m)); logical(css); focusVisible(css); } });
  plugin.postcss = true;
  const result = await postcss([plugin, autoprefixer({ overrideBrowserslist: JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")).browserslist })])
    .process(src, { from: SRC, to: OUT });
  const hash = createHash("sha256").update(src).digest("hex").slice(0, 12);
  writeFileSync(OUT, `/* Built from src/style.css (${hash}) by tools/build-css.mjs. Edit src/style.css, not this file. */\n` + result.css);
  return { warnings, hash };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { warnings } = await buildCss();
  warnings.forEach(w => console.warn("! " + w));
  console.log("Built assets/css/style.css");
}
