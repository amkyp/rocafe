/* Search and filters: what the guest is looking for, the filter menu under the search field,
   and the message shown when nothing matches. menu.js hides the rows that do not match. */
import { FILTERS } from "../../data/menu.js";
import { $ } from "./dom.js";
import { icon } from "./icons.js";
import { sectionOf } from "./items.js";
import { togglePopup } from "./popup.js";
import { state, t, otherLang, digits, on, emit } from "./state.js";
import { writingDirection } from "./persian.js";
import { esc, norm } from "./text.js";

const FILTER = new Map(FILTERS.map((f) => [f.id, f]));
const filters = new Set(); // ids of the filters that are on
let words = ""; // the search words, normalised

const input = $("q");
const filterBtn = $("filterBtn");
const filterPop = $("filterPop");

/* ---------- matching ---------- */
export const searchWords = () => words;

function passes(filter, it) {
  return (
    (filter.tag && it.tags?.includes(filter.tag)) ||
    filter.sections?.includes(sectionOf(it).id) ||
    filter.items?.includes(it.id)
  );
}

/* everything an item can be found by, in both languages; prepared once per item */
const searchText = new Map();
function textOf(it) {
  if (!searchText.has(it)) {
    const section = sectionOf(it);
    const options = (it.options || []).flatMap((o) => [o.fa, o.en]);
    const text = [it.fa, it.en, it.sub?.fa, it.sub?.en, section.fa, section.en, ...options];
    searchText.set(it, text.map(norm).join(" | "));
  }
  return searchText.get(it);
}

export function matches(it) {
  for (const id of filters) if (!passes(FILTER.get(id), it)) return false;
  return !words || textOf(it).includes(words);
}

/* Why an item is showing when its name does not contain the search words: the text that does
   (its name in the other language, its ingredients, one of its options), or nothing when it
   matched through its section's name, which is on the page already. Returns { text, lang } or "". */
export function matchedText(it) {
  if (!words) return "";
  const found = (lang) =>
    [it.sub?.[lang], it[lang], ...(it.options || []).map((o) => o[lang])].find(
      (text) => text && norm(text).includes(words),
    );
  const shown = [it[state.lang], ...(it.tags || []).map((tag) => t()[`tag_${tag}`])];
  if (shown.some((text) => norm(text).includes(words))) return ""; // marked where it shows
  for (const lang of [state.lang, otherLang()]) {
    const text = found(lang);
    if (text) return { text, lang };
  }
  return "";
}

/* the text as safe HTML, with the search words marked */
export function marked(text) {
  const plain = norm(text);
  const at = words ? plain.indexOf(words) : -1;
  // when normalising changed the length, positions no longer line up: leave the text unmarked
  if (at < 0 || plain.length !== text.length) return esc(text);
  const end = at + words.length;
  return `${esc(text.slice(0, at))}<mark>${esc(text.slice(at, end))}</mark>${esc(text.slice(end))}`;
}

/* ---------- the search field ---------- */
function setWords(text) {
  input.value = text;
  // Persian typed on the English page runs right to left, English on the Persian page left to right
  const direction = writingDirection(text);
  if (direction) input.dir = direction;
  else input.removeAttribute("dir");
  words = norm(text);
  $("searchBox").classList.toggle("has", !!text);
  emit("search");
}
input.addEventListener("input", () => setWords(input.value));
// Enter closes the phone's keyboard, but not the Enter that confirms a word in an input method
// (Chinese, Japanese, Korean). keyCode is otherwise retired, but Safari has no isComposing and
// marks that Enter only by keyCode 229 (WebKit bug 165004)
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.isComposing && e.keyCode !== 229) input.blur();
});
$("clearQ").addEventListener("click", () => {
  setWords("");
  input.focus();
});

/* ---------- filters ---------- */
const filterName = (id) => t()[`tag_${id}`];

/* the filter buttons, in the current language */
function drawFilters() {
  $("filters").innerHTML = FILTERS.map(
    ({ id }) => `<button type="button" class="fbtn" data-f="${id}">${filterName(id)}</button>`,
  ).join("");
  showFilters();
}

/* which filters are on: the buttons stay, so the keyboard stays on the one pressed */
function showFilters() {
  for (const button of $("filters").querySelectorAll("[data-f]")) {
    button.setAttribute("aria-pressed", filters.has(button.dataset.f));
  }
  filterBtn.classList.toggle("on", filters.size > 0);
}

function toggleFilter(id) {
  if (!filters.delete(id)) filters.add(id);
  showFilters();
  emit("search");
}

$("filters").addEventListener("click", (e) => {
  const button = e.target.closest("[data-f]");
  if (button) toggleFilter(button.dataset.f);
});

/* while searching or filtering: how many items show, and each filter as a chip that removes it */
function drawFilterState(total) {
  const box = $("fstat");
  box.hidden = filters.size === 0 && !(words && total);
  if (box.hidden) {
    box.replaceChildren();
    return;
  }
  // "nothing found" is said by the message below, not by a count of zero
  const count = total ? `<span class="num">${t().nItems.replace("{n}", digits(total))}</span>` : "";
  const chips = [...filters].map((id) => {
    const label = esc(t().removeF.replace("{f}", filterName(id)));
    return `<button type="button" class="fchip" data-f="${id}" aria-label="${label}">${filterName(id)}${icon("x")}</button>`;
  });
  box.innerHTML = count + chips.join("");
}

$("fstat").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-f]");
  if (!chip) return;
  toggleFilter(chip.dataset.f);
  filterBtn.focus(); // the chip is gone; keep the keyboard's place
});

/* ---------- nothing found: say what to change (the words, the filters, or both) ---------- */
function drawEmpty(total) {
  $("empty").hidden = total > 0;
  if (total) return;
  $("noneD").textContent = words ? t().noneD : t().noneF;
  $("emptyClear").textContent = !filters.size
    ? t().clearSearch
    : words
      ? t().clearAll
      : t().clearFilters;
}

$("emptyClear").addEventListener("click", () => {
  const hadWords = !!words;
  filters.clear();
  showFilters();
  setWords("");
  (hadWords ? input : filterBtn).focus();
});

/* Read out for screen readers: how many items the search or filters found, or that nothing was
   found (shown only as the message in the page), once typing pauses, not at every keystroke. */
const ANNOUNCE_AFTER = 700; // ms
let announceTimer = 0;
function announce(total) {
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => {
    const looking = words || filters.size;
    $("found").textContent = !looking ? "" : total ? t().nItems.replace("{n}", digits(total)) : t().noneT;
  }, ANNOUNCE_AFTER);
}

on("filtered", ({ total }) => {
  drawFilterState(total);
  drawEmpty(total);
  announce(total);
});

/* ---------- the filter menu: the list updates underneath while it is open ---------- */
filterBtn.addEventListener("click", () => togglePopup(filterPop, filterBtn));

/* "/" from anywhere on the page goes to the search field */
addEventListener("keydown", (e) => {
  if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
  if (document.activeElement.matches("input, textarea, select")) return;
  e.preventDefault();
  input.focus();
});

/* the words that depend on the language */
export function draw() {
  input.placeholder = t().ph;
  drawFilters();
}
