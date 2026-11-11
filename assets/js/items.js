/* The menu's items, as the rest of the page needs them. */
import { MENU } from "../../data/menu.js";
import { emit } from "./state.js";

/* ITEMS: what the bill needs for each thing that can be ordered, by key. An item with options
   (e.g. espresso beans) is ordered per option, keyed "id.option". The menu data itself is never
   changed: which section an item is in and which option is chosen are kept here. */
export const ITEMS = {};
const BY_ID = new Map();
const SECTION = new Map(); // item -> its section
const chosen = new Map(); // item -> the index of its chosen option

for (const section of MENU) {
  for (const it of section.items) {
    SECTION.set(it, section);
    BY_ID.set(it.id, it);
    if (!it.options) {
      ITEMS[it.id] = { fa: it.fa, en: it.en, p: it.price };
      continue;
    }
    chosen.set(it, 0);
    it.options.forEach((option, i) => {
      ITEMS[`${it.id}.${i}`] = {
        fa: `${it.fa} ${option.fa}`,
        en: `${it.en}, ${option.en}`,
        p: option.price,
      };
    });
  }
}

export const findItem = (id) => BY_ID.get(id);
export const sectionOf = (it) => SECTION.get(it);
export const optionOf = (it) => chosen.get(it);
export const billKey = (it) => (it.options ? `${it.id}.${optionOf(it)}` : it.id);
export const priceOf = (it) => (it.options ? it.options[optionOf(it)].price : it.price);
/* an item's photos; the first one is shown in the menu list */
export const pics = (it) => it.photos || [];

export function setOption(id, index) {
  const it = findItem(id);
  chosen.set(it, index);
  emit("option", it);
}
