/* The menu list on the page: building it, hiding what the search and filters exclude,
   and its taps. */
import { MENU } from "../../data/menu.js";
import { change, inBill, isEmpty } from "./bill.js";
import { drawChoices } from "./choices.js";
import { $ } from "./dom.js";
import { ITEMS, findItem } from "./items.js";
import { closePopup, togglePopup } from "./popup.js";
import { buyHTML, optionsLine, sectionsHTML } from "./rows.js";
import { matches, marked, matchedText, searchWords } from "./search.js";
import { state, t, digits, on, emit } from "./state.js";
import { toast, LONG } from "./toast.js";

const menu = $("menu");
let rows = new Map(); // menu rows by item id
let markedWords = ""; // the search words currently marked in the rows
let toldHowToOrder = !isEmpty(); // a bill kept from before the reload was explained then

/* the ids now showing, in page order (the item card moves through these) */
export const visibleIds = () =>
  [...menu.querySelectorAll(".sec:not([hidden]) .it:not([hidden])")].map((row) => row.dataset.open);

/* Build the whole menu: on start, and when the language changes.
   On start it is built section by section: the first at once, so the first screen needs no
   waiting, then each of the others in a short task of its own, so a tap meanwhile is answered
   at once rather than after the whole menu. What needs all of it (the search, the category bar,
   a place in the menu to go to) waits for whenBuilt. A later build (a language change) is one
   step: the guest is somewhere down the page, and the page must not get shorter under them. */
let built = false; // the whole menu is on the page
let build = 0; // the build under way: a newer one stops an older one
const nextTask = () => new Promise((go) => setTimeout(go));

export function draw() {
  closePopup(); // an open choice menu is part of what is redrawn
  const sections = sectionsHTML();
  const current = ++build;
  if (built) {
    menu.innerHTML = sections.join("");
    finish();
    return;
  }
  menu.innerHTML = sections.shift();
  (async () => {
    for (const section of sections) {
      await nextTask();
      if (current !== build) return; // the language changed: that build drew it all
      menu.insertAdjacentHTML("beforeend", section);
    }
    finish();
  })();
}

function finish() {
  built = true;
  menu.removeAttribute("aria-busy");
  rows = new Map([...menu.querySelectorAll(".it")].map((row) => [row.dataset.open, row]));
  markedWords = ""; // freshly built names carry no marks
  emit("menu:drawn");
  applySearch();
}

/* do something that needs the whole menu: now, or as soon as it is built */
export const whenBuilt = (fn) => (built ? fn() : on("menu:drawn", fn, { once: true }));

/* Hide what doesn't match and mark the matching words. Nothing is rebuilt, so photos never
   reload or blink while typing. */
function applySearch() {
  if (!built) return; // the build ends by applying it
  const words = searchWords();
  const remark = words !== markedWords; // rewrite names only when the search words changed
  markedWords = words;
  const shown = new Map();
  let total = 0;

  for (const section of MENU) {
    let count = 0;
    for (const it of section.items) {
      const row = rows.get(it.id);
      row.hidden = !matches(it);
      if (row.hidden) continue;
      count++;
      if (!remark) continue;
      row.querySelector(".it-name").innerHTML = marked(it[state.lang]);
      for (const tag of row.querySelectorAll(".tag")) tag.innerHTML = marked(tag.textContent);
      const why = row.querySelector(".why");
      const match = matchedText(it);
      why.innerHTML = match ? marked(match.text) : "";
      why.lang = match ? match.lang : "";
      why.hidden = !match;
    }
    const part = $(section.id);
    part.hidden = !count;
    shown.set(section.id, count);
    total += count;
  }
  emit("filtered", { total, shown });
}

/* A row's bill control follows the bill: the + button, or the quantity control once the item is
   in it. It is rebuilt only when it changes kind, so the keyboard stays on the button in use. */
function drawBuy(cell) {
  const count = inBill(cell.dataset.key);
  const number = cell.querySelector(".stepper .num");
  if (number && count) {
    number.textContent = digits(count);
    return;
  }
  if (!number && !count && cell.querySelector(`[data-add="${cell.dataset.key}"]`)) return;
  const focused = cell.contains(document.activeElement);
  cell.innerHTML = buyHTML(cell.dataset.key);
  if (focused) cell.querySelector("[data-inc], [data-add]").focus();
}

/* a row with options: its line of names and counts, and its menu if that is open */
function drawOptionRow(row) {
  const it = findItem(row.dataset.open);
  row.querySelector(".opts").innerHTML = optionsLine(it);
  const pop = row.querySelector(".pop");
  if (pop.open) drawChoices(pop, it);
}

function drawBuys() {
  for (const cell of menu.querySelectorAll(".buy[data-key]")) drawBuy(cell);
  for (const pop of menu.querySelectorAll(".pop")) drawOptionRow(pop.closest(".it"));
}

/* The bill is the guest's own list, not an order: say so the first time something is added.
   After that the row's own count is the answer to a tap. */
function sayHowToOrder(key) {
  if (toldHowToOrder) return;
  toldHowToOrder = true;
  toast(t().addedFirst.replace("{item}", ITEMS[key][state.lang]), LONG);
}

menu.addEventListener("click", (e) => {
  const row = e.target.closest("[data-open]");
  if (!row) return;
  const choose = e.target.closest("[data-choose]");
  const add = e.target.closest("[data-add]");
  if (choose) {
    const pop = row.querySelector(".pop");
    drawChoices(pop, findItem(row.dataset.open));
    togglePopup(pop, choose);
  } else if (add) {
    change(add.dataset.add, 1);
    sayHowToOrder(add.dataset.add);
    if (add.matches(".pick")) {
      closePopup(); // chosen: back to the row's + button
      row.querySelector("[data-choose]").focus();
    }
  } else if (!e.target.closest(".buy")) emit("item:open", row.dataset.open); // not the − or +
});

/* a finger or mouse on a row: its large photo can start downloading */
for (const event of ["pointerdown", "mouseover"]) {
  menu.addEventListener(
    event,
    (e) => {
      const row = e.target.closest("[data-open]");
      if (row) emit("item:near", row.dataset.open);
    },
    { passive: true },
  );
}

on("search", applySearch);
on("bill", drawBuys);
