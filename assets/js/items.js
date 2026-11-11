/* The menu's items, as the rest of the page needs them. */
import { MENU } from "../../data/menu.js";

/* ITEMS: what the bill needs for each thing that can be ordered, by key. An item with options
   (e.g. espresso beans) is ordered per option, keyed "id.option". The menu data itself is never
   changed: which section an item is in is kept here. */
export const ITEMS = {};
const BY_ID = new Map();
const SECTION = new Map(); // item -> its section

for (const section of MENU) {
  for (const it of section.items) {
    SECTION.set(it, section);
    BY_ID.set(it.id, it);
    if (!it.options) {
      ITEMS[it.id] = { fa: it.fa, en: it.en, p: it.price };
      continue;
    }
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
/* an item's photos; the first one is shown in the menu list */
export const pics = (it) => it.photos || [];
