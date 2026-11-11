/* The top row: the logo, the theme and language buttons, and every fixed piece of text on the
   page that follows the language (data-t: an element's text; data-label: its spoken name). */
import { $, scrollStyle } from "./dom.js";
import { state, store, t, otherLang, setLang } from "./state.js";

const root = document.documentElement;
const themeBtn = $("themeBtn");
const langBtn = $("langBtn");
const THEMES = ["light", "dark"];

/* ---------- theme (theme.js chose light or dark before the page was drawn) ---------- */
function showTheme() {
  const dark = root.dataset.theme === "dark";
  themeBtn.setAttribute("aria-label", dark ? t().toLight : t().toDark);
  themeBtn.setAttribute("aria-pressed", dark);
  // the browser's own bar takes the page colour from the stylesheet, so colours live in one place
  // (read on the next frame, once the new colours are in place, so it costs no extra layout)
  requestAnimationFrame(() => {
    $("themeColor").content = getComputedStyle(root).getPropertyValue("--bg").trim();
  });
}

function setTheme(theme) {
  root.dataset.theme = theme;
  showTheme();
}

/* A choice that differs from the device's own setting is remembered; choosing what the device
   already uses is not a choice any more, and the page goes back to following the device. */
const deviceDark = matchMedia("(prefers-color-scheme: dark)");
themeBtn.addEventListener("click", () => {
  const theme = root.dataset.theme === "dark" ? "light" : "dark";
  if (theme === (deviceDark.matches ? "dark" : "light")) store.remove("ro-theme");
  else store.set("ro-theme", theme);
  setTheme(theme);
});
/* follow the device's dark or light setting unless the guest picked one */
deviceDark.addEventListener("change", (e) => {
  if (!THEMES.includes(store.get("ro-theme"))) setTheme(e.matches ? "dark" : "light");
});

/* ---------- language ---------- */
langBtn.addEventListener("click", () => setLang(otherLang()));

/* ---------- the logo links to the site's home; on the menu itself it goes back to the top
   (a new-tab click, with Ctrl/Cmd or the middle button, still opens it as a link) ---------- */
document.querySelector(".appbar .brand").addEventListener("click", (e) => {
  if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  scrollTo({ top: 0, behavior: scrollStyle() });
});

/* ---------- "skip to the menu", the first thing the keyboard reaches: moves there without
   putting #menu in the address (which a later reload would jump back to) ---------- */
document.querySelector(".skip").addEventListener("click", (e) => {
  e.preventDefault();
  $("menu").focus();
});

export function draw() {
  root.lang = state.lang;
  root.dir = state.lang === "fa" ? "rtl" : "ltr";
  document.title = t().docTitle;
  for (const el of document.querySelectorAll("[data-t]")) el.textContent = t()[el.dataset.t];
  for (const el of document.querySelectorAll("[data-label]")) {
    el.setAttribute("aria-label", t()[el.dataset.label]);
  }
  langBtn.textContent = t().lang;
  langBtn.lang = otherLang();
  langBtn.title = t().langName;
  showTheme();
}
