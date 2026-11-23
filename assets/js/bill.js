/* The table's bill: a private running total. Nothing is sent to the cafe.
   It is remembered while the tab lives, so a reload (phones reload background tabs) keeps it. */
import { $ } from "./dom.js";
import { ITEMS } from "./items.js";
import { openSheet, closeSheet } from "./sheets.js";
import { state, session, t, digits, amount, money, on, emit } from "./state.js";
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

/* The bill's lines. A line stays on the page while its count changes and only its numbers are
   rewritten, so the keyboard stays on its − or + and the count stays in its live region. */
const lines = $("lines");

function lineHTML(key) {
  return `<li class="line" data-line="${key}">
    <div class="nm">${esc(ITEMS[key][state.lang])}<small class="num"></small></div>
    ${stepperHTML(key)}
    <span class="s num"></span>
  </li>`;
}

function fillLine(line, key) {
  const { p } = ITEMS[key];
  const each = line.querySelector(".nm small");
  each.hidden = bill[key] < 2;
  each.textContent = `${digits(bill[key])} × ${amount(p)}`;
  line.querySelector(".stepper .num").textContent = digits(bill[key]);
  line.querySelector(".s").textContent = amount(bill[key] * p);
}

/* A line whose item left the bill. If the keyboard was on it, it moves to the same button on the
   line that takes its place (or the one before), else to the panel's title. */
function removeLine(line) {
  const focused = line.contains(document.activeElement) ? document.activeElement : null;
  const neighbour = line.nextElementSibling || line.previousElementSibling;
  line.remove();
  if (!focused) return;
  const same = focused.matches("[data-inc]") ? "[data-inc]" : "[data-dec]";
  (neighbour?.querySelector(same) || $("billTitle")).focus();
}

/* anew: every line rebuilt (the language changed); otherwise lines are kept, added or removed */
function drawLines(anew) {
  const keys = Object.keys(bill);
  if (anew || !keys.length) lines.replaceChildren();
  if (!keys.length) {
    lines.innerHTML = `<li class="sub">${t().empty}</li>`;
    return;
  }
  lines.querySelector(".sub")?.remove();
  const shown = new Map([...lines.querySelectorAll("[data-line]")].map((l) => [l.dataset.line, l]));
  for (const [key, line] of shown) if (!bill[key]) removeLine(line);
  for (const key of keys) {
    let line = shown.get(key);
    if (!line) {
      lines.insertAdjacentHTML("beforeend", lineHTML(key));
      line = lines.lastElementChild;
    }
    fillLine(line, key);
  }
}

function drawTotals() {
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
  $("pCount").textContent = `${digits(people)} ${people === 1 ? t().person : t().persons}`;
  $("perRow").hidden = people === 1;
  $("sEach").textContent = money(Math.ceil(sum / people));
  if (count || !$("billSheet").open) return;
  closeSheet("billSheet");
  // the browser hands the keyboard back to the bar's button, which leaves with the bill
  if (document.activeElement === $("openBill")) $("menu").focus({ preventScroll: true });
}

/* everything, in the current language */
export function draw() {
  drawLines(true);
  drawTotals();
}

function setPeople(n) {
  people = validPeople(n);
  save();
  drawTotals();
}

restore();
on("bill", () => {
  save();
  drawLines(false);
  drawTotals();
});
$("openBill").addEventListener("click", () => openSheet("billSheet"));
$("pMinus").addEventListener("click", () => setPeople(people - 1));
$("pPlus").addEventListener("click", () => setPeople(people + 1));
/* Clearing the whole bill takes two taps, as nothing brings it back: the first turns the button
   into the question, the second clears. The question lapses after a few seconds, or with the panel. */
const clearButton = $("clearBill");
const ASK_FOR = 4000; // ms
let askTimer = 0;

function stopAsking() {
  clearTimeout(askTimer);
  if (!clearButton.classList.contains("ask")) return;
  clearButton.classList.remove("ask");
  clearButton.textContent = t().clear;
}

clearButton.addEventListener("click", () => {
  if (!clearButton.classList.contains("ask")) {
    clearButton.classList.add("ask");
    clearButton.textContent = t().clearSure;
    askTimer = setTimeout(stopAsking, ASK_FOR);
    return;
  }
  stopAsking();
  for (const key of Object.keys(bill)) delete bill[key];
  people = 1;
  emit("bill");
});
$("billSheet").addEventListener("close", stopAsking);
/* the − and + of any quantity control: on a menu row, on an item card, in the bill */
document.addEventListener("click", (e) => {
  const more = e.target.closest("[data-inc]");
  const less = e.target.closest("[data-dec]");
  if (more) change(more.dataset.inc, 1);
  if (less) change(less.dataset.dec, -1);
});
