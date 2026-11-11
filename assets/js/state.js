/* What every part of the page shares: the language, saved settings, and messages between parts. */
import { T } from "../../data/strings.js";
import { faDigits } from "./text.js";

/* The browser's storage can be missing (private mode) or hold anything: read through these and
   validate what comes back. If storage is unavailable, things just aren't remembered. */
const storage = (area) => ({
  get(key) {
    try {
      return area().getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      area().setItem(key, value);
    } catch {
      /* not remembered */
    }
  },
  remove(key) {
    try {
      area().removeItem(key);
    } catch {
      /* nothing to forget */
    }
  },
});
export const store = storage(() => localStorage); // kept between visits: language, theme
export const session = storage(() => sessionStorage); // kept while the tab lives: bill, place

const LANGS = ["fa", "en"];
const saved = store.get("ro-lang");
export const state = { lang: LANGS.includes(saved) ? saved : "fa" };

export const t = () => T[state.lang];
export const otherLang = () => (state.lang === "fa" ? "en" : "fa");
export function setLang(lang) {
  state.lang = lang;
  store.set("ro-lang", lang);
  emit("lang");
}

/* numbers in the language's own digits; prices with its thousands separator (made once, reused) */
export const digits = (s) => (state.lang === "fa" ? faDigits(s) : String(s));
const NUMBER = { fa: new Intl.NumberFormat("fa-IR"), en: new Intl.NumberFormat("en-US") };
export const money = (thousands) => `${NUMBER[state.lang].format(thousands * 1000)} ${t().toman}`;

/* Parts of the page tell each other what happened instead of calling into each other:
     lang                   the language changed
     bill                   the bill changed
     option   (item)        an item's option was switched
     search                 the search words or filters changed
     menu:drawn             the menu list was built anew
     filtered ({ total, shown })   the menu now shows these counts (shown: per section id)
     item:open (id)         a menu row was tapped
     item:near (id)         a finger or mouse is on a menu row
     sheet:open (id)        a panel opened */
export const on = (name, fn) => document.addEventListener(`ro:${name}`, (e) => fn(e.detail));
export const emit = (name, detail) =>
  document.dispatchEvent(new CustomEvent(`ro:${name}`, { detail }));
