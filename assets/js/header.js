/* The top row: the logo, the theme and language buttons, and every fixed piece of text on the
   page that follows the language. */
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

themeBtn.addEventListener("click", () => {
  const theme = root.dataset.theme === "dark" ? "light" : "dark";
  store.set("ro-theme", theme);
  setTheme(theme);
});
/* follow the device's dark or light setting unless the guest picked one */
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
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

export function draw() {
  root.lang = state.lang;
  root.dir = state.lang === "fa" ? "rtl" : "ltr";
  document.title = t().docTitle;
  for (const el of document.querySelectorAll("[data-t]")) el.textContent = t()[el.dataset.t];
  langBtn.textContent = t().lang;
  langBtn.lang = otherLang();
  langBtn.title = t().langName;
  showTheme();
}
