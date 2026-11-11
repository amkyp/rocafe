/* The table's bill: a private running total. Nothing is sent to the cafe.
   It is remembered while the tab lives, so a reload (phones reload background tabs) keeps it. */
import { $ } from "./dom.js";
import { ITEMS } from "./items.js";
import { openSheet, closeSheet } from "./sheets.js";
import { state, session, t, digits, money, on, emit } from "./state.js";
import { esc } from "./text.js";

const SAVED = "ro-bill";
const MAX_PEOPLE = 20;
const bill = {}; // how many of each, by item key
let people = 1;

const validPeople = (n) => (Number.isInteger(n) ? Math.max(1, Math.min(MAX_PEOPLE, n)) : 1);

/* what was saved may be anything: keep only real items with whole, positive counts */
function restore() {
  let saved = null;
  try {
    saved = JSON.parse(session.get(SAVED));
  } catch {
    return;
  }
  for (const [key, count] of Object.entries(saved?.items || {})) {
    if (ITEMS[key] && Number.isInteger(count) && count > 0) bill[key] = count;
  }
  people = validPeople(saved?.people);
}

function save() {
  session.set(SAVED, JSON.stringify({ items: bill, people }));
}

export const inBill = (key) => bill[key] || 0;
export const isEmpty = () => Object.keys(bill).length === 0;

export function change(key, by) {
  if (by > 0) navigator.vibrate?.(8);
  bill[key] = inBill(key) + by;
  if (bill[key] <= 0) delete bill[key];
  emit("bill");
}

/* the quantity control: one fewer, the count, one more */
export function stepperHTML(key, cls = "") {
  const name = ITEMS[key][state.lang];
  const label = (text) => esc(text.replace("{item}", name));
  return `<div class="stepper${cls ? ` ${cls}` : ""}">
    <button type="button" data-dec="${key}" aria-label="${label(t().less)}">−</button>
    <span class="num" aria-live="polite">${digits(inBill(key))}</span>
    <button type="button" data-inc="${key}" aria-label="${label(t().more)}">+</button>
  </div>`;
}

function lineHTML(key) {
  const item = ITEMS[key];
  return `<li class="line">
    <div class="nm">${esc(item[state.lang])}<small class="num">${digits(item.p)} ${t().unit}</small></div>
    ${stepperHTML(key)}
    <span class="s num">${digits(bill[key] * item.p)}</span>
  </li>`;
}

export function draw() {
  const keys = Object.keys(bill);
  const count = keys.reduce((n, key) => n + bill[key], 0);
  const sum = keys.reduce((n, key) => n + bill[key] * ITEMS[key].p, 0);

  $("billbar").classList.toggle("up", count > 0);
  const badge = $("bCount");
  if (badge.textContent !== digits(count)) {
    badge.textContent = digits(count);
    // replay the stylesheet's "pop" (only while the bar shows)
    if (count) {
      for (const animation of badge.getAnimations()) {
        animation.cancel();
        animation.play();
      }
    }
  }
  $("bTotal").textContent = money(sum);
  $("sTotal").textContent = money(sum);
  $("pCount").textContent = digits(people);
  $("perRow").hidden = people === 1;
  $("sEach").textContent = money(Math.ceil(sum / people));
  $("lines").innerHTML = keys.length
    ? keys.map(lineHTML).join("")
    : `<li class="sub">${t().empty}</li>`;
  if (!count) closeSheet("billSheet");
}

function setPeople(n) {
  people = validPeople(n);
  save();
  draw();
}

restore();
on("bill", () => {
  save();
  draw();
});
$("openBill").addEventListener("click", () => openSheet("billSheet"));
$("pMinus").addEventListener("click", () => setPeople(people - 1));
$("pPlus").addEventListener("click", () => setPeople(people + 1));
$("clearBill").addEventListener("click", () => {
  for (const key of Object.keys(bill)) delete bill[key];
  people = 1;
  emit("bill");
});
/* the − and + of any quantity control: on a menu row, on an item card, in the bill */
document.addEventListener("click", (e) => {
  const more = e.target.closest("[data-inc]");
  const less = e.target.closest("[data-dec]");
  if (more) change(more.dataset.inc, 1);
  if (less) change(less.dataset.dec, -1);
});
