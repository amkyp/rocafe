/* The menu list on the page: building it, hiding what the search and filters exclude,
   and its taps. */
import { MENU } from "../../data/menu.js";
import { change, inBill, isEmpty } from "./bill.js";
import { $ } from "./dom.js";
import { ITEMS, findItem } from "./items.js";
import { closePopup, togglePopup } from "./popup.js";
import { buyHTML, choicesHTML, menuHTML, optionsLine } from "./rows.js";
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

/* Build the whole menu (on start and when the language changes). */
export function draw() {
  closePopup(); // an open choice menu is part of what is redrawn
  menu.innerHTML = menuHTML();
  menu.removeAttribute("aria-busy");
  rows = new Map([...menu.querySelectorAll(".it")].map((row) => [row.dataset.open, row]));
  markedWords = ""; // freshly built names carry no marks
  emit("menu:drawn");
  applySearch();
}

/* Hide what doesn't match and mark the matching words. Nothing is rebuilt, so photos never
   reload or blink while typing. */
function applySearch() {
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
  menu.querySelector(".unit-note").hidden = !total; // no prices shown, no price note
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
function drawChoices(row) {
  const it = findItem(row.dataset.open);
  row.querySelector(".opts").innerHTML = optionsLine(it);
  const pop = row.querySelector(".pop");
  if (!pop.open) return;
  const focused = document.activeElement.closest(".pick")?.firstChild.textContent;
  pop.innerHTML = choicesHTML(it);
  const again = [...pop.querySelectorAll(".pick")].find(
    (p) => p.firstChild.textContent === focused,
  );
  (again?.querySelector("[data-inc]") || again)?.focus(); // the keyboard stays on its line
}

function drawBuys() {
  for (const cell of menu.querySelectorAll(".buy[data-key]")) drawBuy(cell);
  for (const pop of menu.querySelectorAll(".pop")) drawChoices(pop.closest(".it"));
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
    pop.innerHTML = choicesHTML(findItem(row.dataset.open));
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
