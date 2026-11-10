/* The table's bill: a private running total. Nothing is sent to the cafe. */
import { $ } from "./dom.js";
import { ITEMS } from "./items.js";
import { openSheet, closeSheet } from "./sheets.js";
import { state, t, digits, money, on, emit } from "./state.js";
import { esc } from "./text.js";

const bill = {}; // how many of each, by item key
let people = 1;
const MAX_PEOPLE = 20;

export const inBill = (key) => bill[key] || 0;

export function change(key, by) {
  if (by > 0) navigator.vibrate?.(8);
  bill[key] = inBill(key) + by;
  if (bill[key] <= 0) delete bill[key];
  emit("bill");
}

function lineHTML(key) {
  const item = ITEMS[key];
  return `<div class="line">
    <div class="nm">${esc(item[state.lang])}<small class="num">${digits(item.p)} ${t().unit}</small></div>
    <div class="stepper">
      <button type="button" data-dec="${key}" aria-label="-">−</button>
      <span class="num">${digits(bill[key])}</span>
      <button type="button" data-inc="${key}" aria-label="+">+</button>
    </div>
    <span class="s num">${digits(bill[key] * item.p)}</span>
  </div>`;
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
    : `<p class="sub">${t().empty}</p>`;
  if (!count) closeSheet("billSheet");
}

function setPeople(n) {
  people = Math.max(1, Math.min(MAX_PEOPLE, n));
  draw();
}

on("bill", draw);
$("openBill").addEventListener("click", () => openSheet("billSheet"));
$("pMinus").addEventListener("click", () => setPeople(people - 1));
$("pPlus").addEventListener("click", () => setPeople(people + 1));
$("clearBill").addEventListener("click", () => {
  for (const key of Object.keys(bill)) delete bill[key];
  people = 1;
  emit("bill");
});
/* the − and + of any quantity control, in the bill or on an item card */
document.addEventListener("click", (e) => {
  const more = e.target.closest("[data-inc]");
  const less = e.target.closest("[data-dec]");
  if (more) change(more.dataset.inc, 1);
  if (less) change(less.dataset.dec, -1);
});
