/* The menu as HTML text: sections, rows, tags and option buttons. Nothing here touches the page. */
import { MENU } from "../../data/menu.js";
import { inBill } from "./bill.js";
import { FILES, imgAttrs } from "./files.js";
import { drawing } from "./icons.js";
import { ITEMS, billKey, priceOf, pics } from "./items.js";
import { state, t, digits } from "./state.js";
import { esc } from "./text.js";

/* photos of the first rows load at once and first; the rest load as the page nears them */
const LOAD_FIRST = 6;

export function tagsHTML(it) {
  if (!it.tags?.length) return "";
  const tags = it.tags.map(
    (tag) => `<span class="tag ${esc(tag)}">${esc(t()[`tag_${tag}`] || tag)}</span>`,
  );
  return `<div class="tags">${tags.join("")}</div>`;
}

/* an item's option buttons (in the menu row: data-bean; on the item card: data-dbean) */
export function optionsHTML(it, attribute) {
  const buttons = it.options.map((option, i) => {
    const on = i === it.sel;
    return `<button type="button" class="bean${on ? " on" : ""}" aria-pressed="${on}" ${attribute}="${i}">${esc(option[state.lang])}</button>`;
  });
  return `<div class="beans" role="group" aria-label="${t().bean}">${buttons.join("")}</div>`;
}

/* the + button's spoken name: the item, and how many are in the bill (the number it shows) */
export function addLabel(key) {
  const name = ITEMS[key][state.lang];
  const count = inBill(key);
  return count ? `${name}${t().sep}${t().inBill.replace("{n}", digits(count))}` : name;
}

/* the + button shows the number in the bill once there is one */
export function addHTML(key) {
  const count = inBill(key);
  return `<button type="button" class="add${count ? " has" : ""} num" data-add="${key}" aria-label="${esc(addLabel(key))}">${count ? digits(count) : "+"}</button>`;
}

function thumbHTML(it, first) {
  const name = pics(it)[0];
  if (!name) return drawing(it.icon);
  const loading = first ? 'fetchpriority="high"' : 'loading="lazy"';
  return `<img ${imgAttrs(FILES.thumb(name))} alt="" ${loading} decoding="async">`;
}

/* One menu row: the item's name is a real button (opens the card; the whole row is its tap
   area); the + button and the option buttons are separate buttons on top of it. */
function rowHTML(it, first) {
  const sub = it.options ? "" : it.sub?.[state.lang];
  return `<div class="it${it.options ? " has-beans" : ""}" data-open="${it.id}">
    <div class="pic">${thumbHTML(it, first)}</div>
    <div class="info">
      <h3><button type="button" class="it-name">${esc(it[state.lang])}</button></h3>
      ${sub ? `<p>${esc(sub)}</p>` : ""}
      ${it.options ? "" : tagsHTML(it)}
      <span class="price num">${digits(priceOf(it))}</span>
    </div>
    ${addHTML(billKey(it))}
    ${it.options ? optionsHTML(it, "data-bean") : ""}
  </div>`;
}

export function menuHTML() {
  let rows = 0;
  const sections = MENU.map((section) => {
    const items = section.items.map((it) => rowHTML(it, rows++ < LOAD_FIRST));
    return `<section class="sec" id="${esc(section.id)}" data-tint="${esc(section.tint)}">
      <div class="sec-h"><h2>${esc(section[state.lang])}</h2></div>
      <div class="grid">${items.join("")}</div>
    </section>`;
  });
  return `<p class="unit-note">${t().unitNote}</p>${sections.join("")}`;
}
