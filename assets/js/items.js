/* The menu's items, as the rest of the page needs them. */
import { MENU } from "../../data/menu.js";
import { emit } from "./state.js";

/* ITEMS: what the bill needs for each thing that can be ordered, by key. An item with options
   (e.g. espresso beans) is ordered per option, keyed "id.option"; its current option is it.sel.
   Each item also learns its section (it.cat). */
export const ITEMS = {};
const BY_ID = new Map();

for (const section of MENU) {
  for (const it of section.items) {
    it.cat = section;
    BY_ID.set(it.id, it);
    if (!it.options) {
      ITEMS[it.id] = { fa: it.fa, en: it.en, p: it.price };
      continue;
    }
    it.sel = 0;
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
export const billKey = (it) => (it.options ? `${it.id}.${it.sel}` : it.id);
export const priceOf = (it) => (it.options ? it.options[it.sel].price : it.price);
/* an item's photos; the first one is shown in the menu list */
export const pics = (it) => it.photos || [];

export function setOption(id, index) {
  const it = findItem(id);
  it.sel = index;
  emit("option", it);
}
