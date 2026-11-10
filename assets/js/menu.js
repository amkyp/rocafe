/* The menu list on the page: building it, hiding what the search and filters exclude,
   and its taps. */
import { MENU } from "../../data/menu.js";
import { change, inBill } from "./bill.js";
import { $ } from "./dom.js";
import { ITEMS, billKey, priceOf, setOption } from "./items.js";
import { addLabel, menuHTML } from "./rows.js";
import { matches, marked, searchWords } from "./search.js";
import { state, t, digits, on, emit } from "./state.js";
import { toast, LONG } from "./toast.js";

const menu = $("menu");
let rows = new Map(); // menu rows by item id
let markedWords = ""; // the search words currently marked in the rows
let toldHowToOrder = false;

/* the ids now showing, in page order (the item card moves through these) */
export const visibleIds = () =>
  [...menu.querySelectorAll(".sec:not([hidden]) .it:not([hidden])")].map((row) => row.dataset.open);

/* Build the whole menu (on start and when the language changes). */
export function draw() {
  menu.innerHTML = menuHTML();
  rows = new Map([...menu.querySelectorAll(".it")].map((row) => [row.dataset.open, row]));
  markedWords = ""; // freshly built names carry no marks
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
      const sub = row.querySelector(".info p");
      if (sub) sub.innerHTML = marked(it.sub[state.lang]);
    }
    $(section.id).hidden = !count;
    shown.set(section.id, count);
    total += count;
  }
  menu.querySelector(".unit-note").hidden = !total; // no prices shown, no price note
  emit("filtered", { total, shown });
}

/* every + button shows how many of its item are in the bill */
function drawAdds() {
  for (const button of menu.querySelectorAll("[data-add]")) {
    const count = inBill(button.dataset.add);
    button.classList.toggle("has", count > 0);
    button.textContent = count ? digits(count) : "+";
    button.setAttribute("aria-label", addLabel(button.dataset.add));
  }
}

/* an item's option changed (e.g. the espresso bean): its price, + button and choice follow */
function drawOption(it) {
  const row = rows.get(it.id);
  row.querySelector(".price").textContent = digits(priceOf(it));
  row.querySelector("[data-add]").dataset.add = billKey(it);
  for (const button of row.querySelectorAll("[data-bean]")) {
    const on = Number(button.dataset.bean) === it.sel;
    button.classList.toggle("on", on);
    button.setAttribute("aria-pressed", on);
  }
  drawAdds();
}

/* The bill is the guest's own list, not an order: say so the first time something is added. */
function sayAdded(key) {
  const name = ITEMS[key][state.lang];
  if (toldHowToOrder) return toast(`${name} ${t().added}`);
  toldHowToOrder = true;
  toast(t().addedFirst.replace("{item}", name), LONG);
}

menu.addEventListener("click", (e) => {
  const row = e.target.closest("[data-open]");
  if (!row) return;
  const option = e.target.closest("[data-bean]");
  const add = e.target.closest("[data-add]");
  if (option) setOption(row.dataset.open, Number(option.dataset.bean));
  else if (add) {
    change(add.dataset.add, 1);
    sayAdded(add.dataset.add);
  } else emit("item:open", row.dataset.open);
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
on("bill", drawAdds);
on("option", drawOption);
