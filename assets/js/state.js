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

/* something costly to make (a browser formatter loads its language data): made on first use,
   then reused, so the page's start does not pay for what it may never show */
export const lazy = (make) => {
  let made;
  return () => (made ??= make());
};

/* numbers in the language's own digits; prices with its thousands separator */
export const digits = (s) => (state.lang === "fa" ? faDigits(s) : String(s));
const NUMBER = {
  fa: lazy(() => new Intl.NumberFormat("fa-IR")),
  en: lazy(() => new Intl.NumberFormat("en-US")),
};
/* a price (kept in thousands) as the full amount, and with its unit */
export const amount = (thousands) => NUMBER[state.lang]().format(thousands * 1000);
export const money = (thousands) => `${amount(thousands)} ${t().toman}`;

/* Parts of the page tell each other what happened instead of calling into each other:
     lang                   the language changed
     bill                   the bill changed
     search                 the search words or filters changed
     menu:drawn             the menu list was built anew (all of it)
     filtered ({ total, shown })   the menu now shows these counts (shown: per section id)
     item:open (id)         a menu row was tapped
     sheet:open (id)        a panel opened */
export const on = (name, fn, options) =>
  document.addEventListener(`ro:${name}`, (e) => fn(e.detail), options);
export const emit = (name, detail) =>
  document.dispatchEvent(new CustomEvent(`ro:${name}`, { detail }));
