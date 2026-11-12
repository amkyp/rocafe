/* The menu as HTML text: sections, rows, tags and option buttons. Nothing here touches the page. */
import { MENU } from "../../data/menu.js";
import { inBill, stepperHTML } from "./bill.js";
import { FILES, pictureHTML } from "./files.js";
import { drawing } from "./icons.js";
import { ITEMS, pics } from "./items.js";
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
export function priceHTML(thousands, cls = "price", text = digits(thousands)) {
  return `<data class="${cls} num" value="${thousands * 1000}">${text}<span class="sr"> ${t().unit}</span></data>`;
}

/* ---------- an item with options (e.g. espresso beans) in the menu list ----------
   Its row shows the lowest price and names the options; its + button opens a small menu with one
   line per option (assets/js/choose.js). */
const optionKeys = (it) => it.options.map((option, i) => `${it.id}.${i}`);

/* how many options there are (one short line, like the other rows); once some are in the bill,
   those with their counts */
export function optionsLine(it) {
  const taken = optionKeys(it)
    .map((key, i) => inBill(key) && `${esc(it.options[i][state.lang])} × ${digits(inBill(key))}`)
    .filter(Boolean);
  return taken.length ? taken.join(" · ") : t().beans.replace("{n}", digits(it.options.length));
}

/* the menu's lines: an option not in the bill is one button (name and price); one that is in
   the bill shows its quantity control. On the item card the prices say their unit, as the
   card's other prices do. */
export function choicesHTML(it, withUnit = false) {
  return optionKeys(it)
    .map((key, i) => {
      const name = `<span>${esc(it.options[i][state.lang])}</span>`;
      if (inBill(key)) return `<div class="pick">${name}${stepperHTML(key)}</div>`;
      const price = it.options[i].price;
      const shown = withUnit
        ? `<data class="num" value="${price * 1000}">${digits(price)} <small>${t().unit}</small></data>`
        : priceHTML(price, "");
      return `<button type="button" class="pick" data-add="${key}">${name}${shown}</button>`;
    })
    .join("");
}

function chooseHTML(it) {
  const label = esc(`${it[state.lang]}: ${t().bean}`);
  return `<button type="button" class="add" data-choose aria-label="${label}" aria-haspopup="dialog" aria-expanded="false">+</button>
    <dialog class="pop" aria-label="${label}"></dialog>`;
}

function optionRowEndHTML(it) {
  const lowest = Math.min(...it.options.map((option) => option.price));
  return `<p class="opts">${optionsLine(it)}</p>
      ${priceHTML(lowest, "price", t().from.replace("{p}", digits(lowest)))}
    </div>
    <div class="buy">${chooseHTML(it)}</div>`;
}

/* One menu row: the item's name is a real button (opens the card; the whole row is its tap
   area); the bill control and the option buttons are separate buttons on top of it.
   .why is filled while searching, when the item matched through something other than its name. */
function rowHTML(it, first) {
  return `<li class="it" data-open="${it.id}">
    <div class="pic">${thumbHTML(it, first)}</div>
    <div class="info">
      <h3><button type="button" class="it-name">${esc(it[state.lang])}</button></h3>
      <p class="why" hidden></p>
      ${
        it.options
          ? optionRowEndHTML(it)
          : `${tagsHTML(it)}
      ${priceHTML(it.price)}
    </div>
    <div class="buy" data-key="${it.id}">${buyHTML(it.id)}</div>`
      }
  </li>`;
}

export function menuHTML() {
  let rows = 0;
  const sections = MENU.map((section) => {
    const items = section.items.map((it) => rowHTML(it, rows++ < LOAD_FIRST));
    const id = esc(section.id);
    // role="list": Safari stops announcing a list once its bullets are styled away
    return `<section class="sec" id="${id}" aria-labelledby="${id}-title" data-tint="${esc(section.tint)}">
      <h2 class="sec-h" id="${id}-title">${esc(section[state.lang])}</h2>
      <ul class="grid" role="list">${items.join("")}</ul>
    </section>`;
  });
  return sections.join("");
}
