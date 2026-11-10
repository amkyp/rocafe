/* Search and filters: what the guest is looking for, the filter menu under the search field,
   and the message shown when nothing matches. menu.js hides the rows that do not match. */
import { FILTERS } from "../../data/menu.js";
import { $ } from "./dom.js";
import { state, t, digits, on, emit } from "./state.js";
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
    filter.sections?.includes(it.cat.id) ||
    filter.items?.includes(it.id)
  );
}

export function matches(it) {
  for (const id of filters) if (!passes(FILTER.get(id), it)) return false;
  if (!words) return true;
  const options = (it.options || []).flatMap((o) => [o.fa, o.en]);
  const text = [it.fa, it.en, it.sub?.fa, it.sub?.en, it.cat.fa, it.cat.en, ...options];
  return text.map(norm).join(" | ").includes(words);
}

/* the text as safe HTML, with the search words marked */
export function marked(text) {
  const at = words ? norm(text).indexOf(words) : -1;
  // when normalising changed the length, positions no longer line up: leave the text unmarked
  if (at < 0 || norm(text).length !== text.length) return esc(text);
  const end = at + words.length;
  return `${esc(text.slice(0, at))}<mark>${esc(text.slice(at, end))}</mark>${esc(text.slice(end))}`;
}

/* ---------- the search field ---------- */
function setWords(text) {
  input.value = text;
  words = norm(text);
  $("searchBox").classList.toggle("has", !!text);
  emit("search");
}
input.addEventListener("input", () => setWords(input.value));
// Enter closes the phone's keyboard
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") input.blur();
});
$("clearQ").addEventListener("click", () => {
  setWords("");
  input.focus();
});

/* ---------- filters ---------- */
const filterName = (id) => t()[`tag_${id}`];

function drawFilters() {
  $("filters").innerHTML = FILTERS.map(
    ({ id }) =>
      `<button type="button" class="fbtn" data-f="${id}" aria-pressed="${filters.has(id)}">${filterName(id)}</button>`,
  ).join("");
  $("fdot").hidden = filters.size === 0;
}

function toggleFilter(id) {
  if (!filters.delete(id)) filters.add(id);
  drawFilters();
  emit("search");
}

$("filters").addEventListener("click", (e) => {
  const button = e.target.closest("[data-f]");
  if (button) toggleFilter(button.dataset.f);
});

/* with filters on: how many items show, and each filter as a chip that removes it */
function drawFilterState(total) {
  const box = $("fstat");
  box.hidden = filters.size === 0;
  if (box.hidden) {
    box.replaceChildren();
    return;
  }
  const count = `<span class="num">${t().nItems.replace("{n}", digits(total))}</span>`;
  const chips = [...filters].map((id) => {
    const label = esc(t().removeF.replace("{f}", filterName(id)));
    return `<button type="button" class="fchip" data-f="${id}" aria-label="${label}">${filterName(id)}<span aria-hidden="true">✕</span></button>`;
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
  drawFilters();
  setWords("");
  (hadWords ? input : filterBtn).focus();
});

on("filtered", ({ total }) => {
  drawFilterState(total);
  drawEmpty(total);
});

/* ---------- the filter menu ----------
   A small non-modal <dialog> (dialog.show(), which older browsers support too): the page keeps
   scrolling and the list updates underneath. It sits under the search field and closes with its
   button, Escape, or a tap outside; like a phone's own menus, that closing tap does nothing else
   (scrolling is not a tap). */
const GAP = 6; // px between the search field and the menu

function closeFilters() {
  if (filterPop.open) filterPop.close();
}

function placeFilters() {
  const field = $("searchBox").getBoundingClientRect();
  if (field.bottom < 0) return closeFilters(); // the header scrolled away
  filterPop.style.top = `${field.bottom + GAP}px`;
  const fromEnd = state.lang === "fa" ? field.left : innerWidth - field.right;
  filterPop.style.insetInlineEnd = `${fromEnd}px`;
}

function setOpenLook(open) {
  filterBtn.setAttribute("aria-expanded", open);
  filterBtn.classList.toggle("open", open);
}

filterBtn.addEventListener("click", () => {
  if (filterPop.open) return closeFilters();
  placeFilters();
  filterPop.show();
  setOpenLook(true);
});
filterPop.addEventListener("close", () => setOpenLook(false));
addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || !filterPop.open) return;
  closeFilters();
  filterBtn.focus();
});

let closingTap = false; // this tap began outside the open menu
addEventListener(
  "pointerdown",
  (e) => {
    closingTap = filterPop.open && !e.target.closest("#filterPop, #filterBtn");
  },
  true,
);
addEventListener(
  "pointercancel", // the touch became a scroll
  () => {
    closingTap = false;
  },
  true,
);
addEventListener(
  "click",
  (e) => {
    if (!closingTap) return;
    closingTap = false;
    closeFilters();
    e.preventDefault();
    e.stopPropagation();
  },
  true,
);
for (const event of ["scroll", "resize"]) {
  addEventListener(
    event,
    () => {
      if (filterPop.open) placeFilters();
    },
    { passive: true },
  );
}

/* the words that depend on the language */
export function draw() {
  input.placeholder = t().ph;
  $("clearQ").setAttribute("aria-label", t().clearSearch);
  filterBtn.setAttribute("aria-label", t().filter);
  filterPop.setAttribute("aria-label", t().filter);
  drawFilters();
}
