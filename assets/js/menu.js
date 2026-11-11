/* The menu list on the page: building it, hiding what the search and filters exclude,
   and its taps. */
import { MENU } from "../../data/menu.js";
import { change, inBill, isEmpty } from "./bill.js";
import { $ } from "./dom.js";
import { ITEMS, billKey, optionOf, priceOf, setOption } from "./items.js";
import { buyHTML, menuHTML } from "./rows.js";
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
    part.querySelector(".count").textContent = digits(count);
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

function drawBuys() {
  for (const cell of menu.querySelectorAll(".buy")) drawBuy(cell);
}

/* an item's option changed (e.g. the espresso bean): its price, + button and choice follow */
function drawOption(it) {
  const row = rows.get(it.id);
  const price = row.querySelector(".price");
  price.value = priceOf(it) * 1000;
  price.firstChild.textContent = digits(priceOf(it));
  const cell = row.querySelector(".buy");
  cell.dataset.key = billKey(it);
  cell.replaceChildren(); // its control belongs to the other option: build it anew
  drawBuy(cell);
  for (const button of row.querySelectorAll("[data-bean]")) {
    const on = Number(button.dataset.bean) === optionOf(it);
    button.classList.toggle("on", on);
    button.setAttribute("aria-pressed", on);
  }
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
  const option = e.target.closest("[data-bean]");
  const add = e.target.closest("[data-add]");
  if (option) setOption(row.dataset.open, Number(option.dataset.bean));
  else if (add) {
    change(add.dataset.add, 1);
    sayHowToOrder(add.dataset.add);
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
on("option", drawOption);
