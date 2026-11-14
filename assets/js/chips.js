/* The category bar. Tapping a chip scrolls the page to its section; while the page scrolls,
   the chip of the section being read is highlighted. The bar itself only scrolls sideways. */
import { MENU } from "../../data/menu.js";
import { $, scrollStyle } from "./dom.js";
import { whenBuilt } from "./menu.js";
import { travelling } from "./near.js";
import { state, on } from "./state.js";
import { esc } from "./text.js";

const header = $("chipsBar");
const bar = $("chips");

/* each chip is a link to its section */
export function draw() {
  bar.innerHTML = MENU.map(
    (section) =>
      `<a class="chip" href="#${esc(section.id)}" data-go="${esc(section.id)}">${esc(section[state.lang])}</a>`,
  ).join("");
}

/* ---------- the header's height ----------
   As the browser reports it after its own layout (ResizeObserver: no extra measuring), plus its
   sticky offset, which the stylesheet changes with the screen. Sections stop just under it. */
let headerSize = 0;
let headerHeight = 0; // read freely while scrolling
let viewHeight = innerHeight; // read before the menu is built (free then), and on every resize

function syncHeader() {
  headerHeight = headerSize + (parseFloat(getComputedStyle(header).top) || 0);
  document.documentElement.style.setProperty("--bar-h", `${headerHeight}px`);
  watchSections(); // the line under the header moved
}
on("menu:drawn", watchSections); // the sections are new elements
let arrival = null; // a section to go to once the header's height is known
new ResizeObserver(([entry]) => {
  headerSize = entry.borderBoxSize[0].blockSize;
  syncHeader();
  if (arrival) goTo(arrival);
  arrival = null;
}).observe(header);
/* the page was opened at a section's address */
export function arriveAt(id) {
  if (headerSize) goTo(id);
  else arrival = id;
}
addEventListener("resize", () => {
  viewHeight = innerHeight;
  syncHeader();
});

/* ---------- the highlighted chip ---------- */
/* bring a chip to the middle of the bar; measured on the next frame, after the browser's own
   layout, so a freshly built menu is never laid out an extra time just to place a chip */
function centre(chip) {
  requestAnimationFrame(() => {
    const left = chip.offsetLeft - (bar.clientWidth - chip.offsetWidth) / 2;
    bar.scrollTo({ left, behavior: scrollStyle() });
  });
}

function setCurrent(id) {
  for (const chip of bar.querySelectorAll(".chip")) {
    const current = chip.dataset.go === id;
    if (current && !chip.classList.contains("on")) centre(chip);
    chip.classList.toggle("on", current);
    if (current) chip.setAttribute("aria-current", "true");
    else chip.removeAttribute("aria-current");
  }
}

/* ---------- tapping a chip ----------
   The highlight is held on the tapped chip until the page has finished scrolling, so it never
   flickers through the sections in between. */
const HOLD = 1200; // ms: longer than a smooth scroll takes
let heldFor = null;
let holdTimer = 0;

function release() {
  if (!heldFor) return;
  heldFor = null;
  clearTimeout(holdTimer);
  travelling(false);
}

function goTo(id) {
  const section = $(id);
  if (!section) {
    whenBuilt(() => goTo(id)); // tapped while the menu is still being built
    return;
  }
  const top = section.getBoundingClientRect().top + scrollY - headerHeight + 1;
  release();
  heldFor = id;
  holdTimer = setTimeout(release, HOLD);
  travelling(true);
  setCurrent(id);
  scrollTo({ top, behavior: scrollStyle() });
}

/* a plain tap scrolls there without changing the address; opening a chip in a new tab is left
   to the browser, and that tab arrives at the section (see app.js) */
bar.addEventListener("click", (e) => {
  const chip = e.target.closest("[data-go]");
  if (!chip || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  goTo(chip.dataset.go);
});
// the page arrived (where the browser says so; elsewhere the timer does), or the guest took
// over the scrolling
for (const event of ["scrollend", "wheel", "touchstart", "keydown"]) {
  addEventListener(event, release, { passive: true });
}

/* ---------- which section is being read ----------
   The one crossing a line just under the header. The browser reports it (IntersectionObserver),
   so the page is never measured by hand. At the very bottom the last section counts, even if it
   is too short to reach the line. */
const BELOW_HEADER = 24; // px
let observer = null;
let crossing = null;
let atBottom = false;

function watchSections() {
  observer?.disconnect();
  crossing = null;
  const line = headerHeight + BELOW_HEADER;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) crossing = entry.target.id;
        // a section that scrolls up past the line stays current until the next one reaches it;
        // one that drops back below the line hands over to the one above
        else if (crossing === entry.target.id && entry.boundingClientRect.top > line)
          crossing = null;
      }
      pickSection();
    },
    // a 1px band at the line
    { rootMargin: `-${line}px 0px -${Math.max(0, viewHeight - line - 1)}px 0px` },
  );
  for (const section of document.querySelectorAll(".sec")) observer.observe(section);
}

function pickSection() {
  if (heldFor) return;
  if (crossing && $(crossing).hidden) crossing = null; // the search or filters hid it
  const shown = document.querySelectorAll(".sec:not([hidden])");
  const last = shown[shown.length - 1];
  setCurrent((atBottom && last?.id) || crossing || shown[0]?.id || null);
}

addEventListener(
  "scroll",
  () => {
    header.classList.toggle("stuck", scrollY > 4);
    const bottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    if (bottom === atBottom) return;
    atBottom = bottom;
    pickSection();
  },
  { passive: true },
);

/* the menu changed what it shows: sections with nothing to show lose their chip */
on("filtered", ({ shown }) => {
  for (const chip of bar.querySelectorAll("[data-go]")) chip.hidden = !shown.get(chip.dataset.go);
  pickSection();
});
