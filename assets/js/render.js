/* Ro Cafe menu: turns the menu data into HTML. No page access here; app.js puts it on the page. */
import { MENU } from "../../data/menu.js";
import { T } from "../../data/strings.js";
import { THUMB_WIDTHS, CARD_WIDTHS } from "../../data/photos.js";

/* ---------- line illustrations ---------- */
export const ICONS = {
  espresso:'<path d="M14 26h22v6a11 11 0 0 1-22 0z"/><path d="M36 28h3a4 4 0 0 1 0 8h-4"/><path d="M10 46h30"/><path d="M20 20c0-2 2-3 2-5M27 20c0-2 2-3 2-5"/>',
  cup:'<path d="M10 22h28l-2 18a6 6 0 0 1-6 5H18a6 6 0 0 1-6-5z"/><path d="M38 26h3a5 5 0 0 1 0 10h-4"/><path d="M15 27c3-3 6 2 9-1s6 2 9-1" /><path d="M8 50h34"/>',
  glass:'<path d="M15 10h20l-2 38H17z"/><path d="M15.6 22h18.8"/><path d="M16.2 30h17.6"/><path d="M20 15c2 1 6 1 10 0"/>',
  dripper:'<path d="M10 12h30l-9 16H19z"/><path d="M19 28h12v3H19z"/><path d="M14 36h22v10a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2z"/><path d="M36 39h3a3 3 0 0 1 0 6h-3"/><path d="M25 31v4"/>',
  cezve:'<path d="M14 18h16l-2 26a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3z"/><path d="M30 22l14-6"/><path d="M12 18h20"/><path d="M19 12c0-2 2-2 2-4M24 12c0-2 2-2 2-4"/>',
  coldbrew:'<path d="M16 8h18v6l3 4v28a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V18l3-4z"/><path d="M13 26h24"/><path d="M19 32h4v4h-4zM26 36h4v4h-4z"/>',
  mug:'<path d="M10 18h26v22a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z"/><path d="M36 22h4a5 5 0 0 1 0 10h-4"/><path d="M15 12c0-2 2-3 2-5M23 12c0-2 2-3 2-5M31 12c0-2 2-3 2-5"/>',
  istikan:'<path d="M17 14h16c0 6-3 8-3 13s4 7 4 13H16c0-6 4-8 4-13s-3-7-3-13z"/><path d="M12 44h26"/><path d="M20 33h10"/>',
  teapot:'<path d="M13 22h22v14a8 8 0 0 1-8 8h-6a8 8 0 0 1-8-8z"/><path d="M35 26h4a4 4 0 0 1 0 8h-4"/><path d="M13 27l-6-5v-3"/><path d="M19 22v-3h10v3"/><path d="M24 19v-3"/><path d="M28 30c-3 0-4 4-7 4"/>',
  shake:'<path d="M14 18h22l-3 30H17z"/><path d="M13 18c0-5 5-8 12-8s12 3 12 8"/><path d="M29 10l5-7"/><circle cx="25" cy="8" r="2"/><path d="M15 28h20"/>',
  iced:'<path d="M13 14h24l-3 34H16z"/><path d="M19 22h6v6h-6zM26 27h6v6h-6zM20 33h6v6h-6z"/><path d="M30 14l4-10"/>',
  lemon:'<path d="M14 14h22l-3 34H17z"/><circle cx="35" cy="14" r="6"/><path d="M35 8v12M29 14h12"/><path d="M20 24c1 6 0 12 2 18"/><path d="M28 26c-1 5 0 10-1 16"/>',
  matcha:'<path d="M8 22h34a17 15 0 0 1-34 0z"/><path d="M12 22c4-3 8 1 13-1s9 2 13-1"/><path d="M18 48h14"/><path d="M38 6l-8 14"/>',
  bottle:'<path d="M20 6h10v6l3 4v28a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4V16l3-4z"/><path d="M17 24h16v12H17z"/><path d="M20 6h10"/>',
  bomb:'<path d="M14 16h22l-3 32H17z"/><path d="M14 16c3-4 19-4 22 0"/><path d="M17 28h16M18 36h14"/><path d="M27 8l2-4 2 4"/>',
  affogato:'<path d="M10 26h30a15 13 0 0 1-30 0z"/><circle cx="25" cy="20" r="7"/><path d="M14 30c4 2 8 0 11 2s7 0 11-2"/>',
  cake:'<path d="M8 38l34-14v20H8z"/><path d="M8 38v6"/><path d="M8 38l34-14"/><path d="M8 32l20-8 14 0"/><path d="M8 32v6"/><path d="M28 24c0-4 4-5 4-9"/>',
  cookie:'<circle cx="25" cy="27" r="16"/><circle cx="19" cy="21" r="1.6"/><circle cx="29" cy="20" r="1.6"/><circle cx="31" cy="31" r="1.6"/><circle cx="20" cy="32" r="1.6"/><circle cx="25" cy="27" r="1"/>',
  croissant:'<path d="M5 34c2-12 12-20 20-20s18 8 20 20c-4 0-6-2-8-4-2 4-6 6-12 6s-10-2-12-6c-2 2-4 4-8 4z"/><path d="M17 18l3 12M25 14v16M33 18l-3 12"/>',
  baguette:'<path d="M5 30c0-6 8-12 20-12s20 6 20 12-8 6-20 6-20 0-20-6z"/><path d="M8 32c4-2 10-1 17-1s13-1 17 1"/><path d="M14 26c2 1 4 1 6 0M24 26c2 1 4 1 6 0M34 26c2 1 3 1 5 0"/>',
  plus:'<circle cx="25" cy="25" r="16"/><path d="M25 18v14M18 25h14"/>',
  shot:'<path d="M17 14h16l-2 30H19z"/><path d="M18 24h14"/><path d="M25 6v4"/>',
  milk:'<path d="M17 10h16v6l4 6v24a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2V22l4-6z"/><path d="M13 30h24"/>',
  syrup:'<path d="M20 4h10v6h-10z"/><path d="M18 10h14l2 6v28a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V16z"/><path d="M16 26h18"/>'
};

/* ITEMS: what the bill needs for each thing that can be ordered, by key. An item with
   options (e.g. espresso beans) is ordered per option, keyed "id.option"; its current
   option is it.sel. Each item also learns its section (it.cat). */
export const ITEMS = {};
export const billKey = it => it.options ? `${it.id}.${it.sel}` : it.id;
for (const c of MENU) for (const it of c.items) {
  it.cat = c;
  if (it.options) { it.sel = 0; it.options.forEach((o, i) => { ITEMS[`${it.id}.${i}`] = { fa: `${it.fa} ${o.fa}`, en: `${it.en}, ${o.en}`, p: o.price }; }); }
  else ITEMS[it.id] = { fa: it.fa, en: it.en, p: it.price };
}
export const priceOf = it => it.options ? it.options[it.sel].price : it.price;


/* where the site's files live, in one place: menu photos and the apps' icons.
   Every photo is square and comes in several widths (data/photos.js, made by the photo
   preparation script); the browser picks the file that suits the screen (srcset + sizes).
   SHOWN is how wide the photos appear: keep it in step with --thumb, --pw and --ph-max in style.css. */
const SHOWN = { thumb: "(min-width: 860px) 104px, (max-width: 380px) 72px, 92px", card: "(min-width: 1000px) 720px, (min-width: 700px) 560px, 100vw" };
const photo = (dir, f, widths, sizes) => ({
  src: `${dir}${encodeURIComponent(f)}-${widths[0]}.webp`,
  srcset: widths.map(w => `${dir}${encodeURIComponent(f)}-${w}.webp ${w}w`).join(", "),
  sizes, side: widths.at(-1)
});
export const FILES = {
  thumb: (f, sizes = SHOWN.thumb) => photo("img/", f, THUMB_WIDTHS, sizes),
  card: f => photo("img/lg/", f, CARD_WIDTHS[f], SHOWN.card),
  brand: k => `assets/brands/${encodeURIComponent(k)}.webp`
};
/* a photo's attributes for an <img> in HTML text */
export const srcAttrs = p => `src="${p.src}" srcset="${p.srcset}" sizes="${p.sizes}"`;

export const faDigits = s => String(s).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d]);
export const esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* an item's photos; the first one is shown in the menu list */
export const pics = it => it.photos || [];
export const svg = k => `<svg viewBox="0 0 50 50" aria-hidden="true">${ICONS[k]||ICONS.cup}</svg>`;

export const RO = {
  digits: (s, lang) => lang === "fa" ? faDigits(s) : String(s),
  tagsHTML(it, lang){ const t = it.tags; return t && t.length ? `<div class="tags">${t.map(x=>`<span class="tag ${esc(x)}">${esc(T[lang]["tag_"+x]||x)}</span>`).join("")}</div>` : ""; },
  /* the menu photo: the first six load at once, the rest when scrolled near */
  thumbHTML(it, ctx){
    const f = pics(it)[0]; if (!f) return svg(it.icon);
    return `<img ${srcAttrs(FILES.thumb(f))} alt="" ${ctx.count++ < 6 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="104" height="104">`;
  },
  /* one menu row: the item's name is a real button (opens the card; the whole row is its tap area),
     the + button and the bean choice are separate buttons on top of it */
  itemHTML(it, ctx){
    const { lang, bill = {} } = ctx, D = s => RO.digits(s, lang);
    const name = it[lang], sub = it.sub?.[lang];
    if(it.options){
      const key=billKey(it), q=bill[key]||0;
      return `<div class="it has-beans" data-open="${it.id}"><div class="pic">${RO.thumbHTML(it, ctx)}</div>
      <div class="info"><h3><button type="button" class="it-name">${esc(name)}</button></h3><span class="price num">${D(priceOf(it))}</span></div>
      <button type="button" class="add${q?" has":""} num" data-add="${key}" aria-label="${esc(RO.addLabel(key, q, lang))}">${q?D(q):"+"}</button>
      ${RO.optionsHTML(it, lang, "data-bean")}</div>`;
    }
    const q=bill[it.id]||0;
    return `<div class="it" data-open="${it.id}"><div class="pic">${RO.thumbHTML(it, ctx)}</div>
    <div class="info"><h3><button type="button" class="it-name">${esc(name)}</button></h3>${sub?`<p>${esc(sub)}</p>`:""}${RO.tagsHTML(it, lang)}<span class="price num">${D(it.price)}</span></div>
    <button type="button" class="add${q?" has":""} num" data-add="${it.id}" aria-label="${esc(RO.addLabel(it.id, q, lang))}">${q?D(q):"+"}</button></div>`;
  },
  /* the + button's spoken name: the item, and how many are in the bill (the number it shows) */
  addLabel(key, q, lang){ return q ? `${ITEMS[key][lang]}${T[lang].sep}${T[lang].inBill.replace("{n}", RO.digits(q, lang))}` : ITEMS[key][lang]; },
  /* an item's option buttons (in the menu row: data-bean; on the item card: data-dbean) */
  optionsHTML(it, lang, attr){
    return `<div class="beans" role="group" aria-label="${T[lang].bean}">${it.options.map((o,i)=>`<button type="button" class="bean${i===it.sel?" on":""}" aria-pressed="${i===it.sel}" ${attr}="${i}">${esc(o[lang])}</button>`).join("")}</div>`;
  },
  /* ctx: { lang, bill } */
  menuHTML(ctx){
    const c2 = { count: 0, ...ctx }, lang = ctx.lang;
    return `<p class="unit-note">${T[lang].unitNote}</p>` + MENU.map(c => `<section class="sec" id="${esc(c.id)}" data-tint="${esc(c.tint)}"><div class="sec-h"><h2>${esc(c[lang])}</h2></div><div class="grid">${c.items.map(it => RO.itemHTML(it, c2)).join("")}</div></section>`).join("");
  },
  chipsHTML(lang){
    return MENU.map(c=>`<button type="button" class="chip" data-go="${esc(c.id)}">${esc(c[lang])}</button>`).join("")+`<span class="chip-ind" aria-hidden="true"></span>`;
  }
};
