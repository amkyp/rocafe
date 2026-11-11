/* The menu as HTML text: sections, rows, tags and option buttons. Nothing here touches the page. */
import { MENU } from "../../data/menu.js";
import { inBill, stepperHTML } from "./bill.js";
import { FILES, pictureHTML } from "./files.js";
import { drawing } from "./icons.js";
import { ITEMS, billKey, optionOf, priceOf, pics } from "./items.js";
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
    const on = i === optionOf(it);
    return `<button type="button" class="bean${on ? " on" : ""}" aria-pressed="${on}" ${attribute}="${i}">${esc(option[state.lang])}</button>`;
  });
  return `<div class="beans" role="group" aria-label="${t().bean}">${buttons.join("")}</div>`;
}

/* A row's way to the bill: a + button, and once the item is in the bill, the quantity control
   (so a mistaken tap can be undone right there). */
export function buyHTML(key) {
  if (inBill(key)) return stepperHTML(key);
  const name = esc(ITEMS[key][state.lang]);
  return `<button type="button" class="add" data-add="${key}" aria-label="${name}">+</button>`;
}

function thumbHTML(it, first) {
  const name = pics(it)[0];
  if (!name) return drawing(it.icon);
  const loading = first ? 'fetchpriority="high"' : 'loading="lazy"';
  return pictureHTML(FILES.thumb(name), `alt="" ${loading}`);
}

/* a price: the number guests read (in thousands), and the full amount in Toman for machines */
export function priceHTML(thousands, cls = "price") {
  return `<data class="${cls} num" value="${thousands * 1000}">${digits(thousands)}<span class="sr"> ${t().unit}</span></data>`;
}

/* One menu row: the item's name is a real button (opens the card; the whole row is its tap
   area); the bill control and the option buttons are separate buttons on top of it.
   .why is filled while searching, when the item matched through something other than its name. */
function rowHTML(it, first) {
  const key = billKey(it);
  return `<li class="it" data-open="${it.id}">
    <div class="pic">${thumbHTML(it, first)}</div>
    <div class="info">
      <h3><button type="button" class="it-name">${esc(it[state.lang])}</button></h3>
      <p class="why" hidden></p>
      ${it.options ? "" : tagsHTML(it)}
      ${priceHTML(priceOf(it))}
    </div>
    <div class="buy" data-key="${key}">${buyHTML(key)}</div>
    ${it.options ? `<div class="choice">${optionsHTML(it, "data-bean")}</div>` : ""}
  </li>`;
}

export function menuHTML() {
  let rows = 0;
  const sections = MENU.map((section) => {
    const items = section.items.map((it) => rowHTML(it, rows++ < LOAD_FIRST));
    const id = esc(section.id);
    // role="list": Safari stops announcing a list once its bullets are styled away
    return `<section class="sec" id="${id}" aria-labelledby="${id}-title" data-tint="${esc(section.tint)}">
      <div class="sec-h">
        <h2 id="${id}-title">${esc(section[state.lang])}</h2>
        <span class="count num"></span>
      </div>
      <ul class="grid" role="list">${items.join("")}</ul>
    </section>`;
  });
  return `<p class="unit-note">${t().unitNote}</p>${sections.join("")}`;
}
