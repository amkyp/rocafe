/* The category bar. Tapping a chip scrolls the page to its section; while the page scrolls,
   the chip of the section being read is highlighted. The bar itself only scrolls sideways. */
import { MENU } from "../../data/menu.js";
import { $, scrollStyle } from "./dom.js";
import { state, on } from "./state.js";
import { esc } from "./text.js";

const header = $("chipsBar");
const bar = $("chips");

export function draw() {
  const chips = MENU.map(
    (section) =>
      `<button type="button" class="chip" data-go="${esc(section.id)}">${esc(section[state.lang])}</button>`,
  );
  bar.innerHTML = `${chips.join("")}<span class="chip-ind" aria-hidden="true"></span>`;
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
new ResizeObserver(([entry]) => {
  headerSize = entry.borderBoxSize[0].blockSize;
  syncHeader();
}).observe(header);
addEventListener("resize", () => {
  viewHeight = innerHeight;
  syncHeader();
  moveMarker();
});

/* ---------- the highlighted chip ---------- */
function setCurrent(id) {
  for (const chip of bar.querySelectorAll(".chip")) {
    const current = chip.dataset.go === id;
    if (current && !chip.classList.contains("on")) {
      const left = chip.offsetLeft - (bar.clientWidth - chip.offsetWidth) / 2;
      bar.scrollTo({ left, behavior: scrollStyle() }); // bring it to the middle of the bar
    }
    chip.classList.toggle("on", current);
    chip.setAttribute("aria-current", current);
  }
  moveMarker();
}

/* the dark shape behind the current chip: appears in place the first time, glides after that */
function moveMarker() {
  const marker = bar.querySelector(".chip-ind");
  const current = bar.querySelector(".chip.on");
  if (!marker) return;
  marker.style.opacity = current ? 1 : 0;
  if (!current) return;
  marker.style.width = `${current.offsetWidth}px`;
  marker.style.transform = `translateX(${current.offsetLeft}px)`;
  if (!marker.classList.contains("ready"))
    requestAnimationFrame(() => marker.classList.add("ready"));
}
document.fonts?.ready.then(moveMarker);

/* ---------- tapping a chip ----------
   The highlight is held on the tapped chip until the page has finished scrolling, so it never
   flickers through the sections in between. */
const HOLD = 1200; // ms: longer than a smooth scroll takes
let heldFor = null;
let holdTimer = 0;

function release() {
  heldFor = null;
  clearTimeout(holdTimer);
}

function goTo(id) {
  const section = $(id);
  const top = section.getBoundingClientRect().top + scrollY - headerHeight + 1;
  // load this section's photos now, so they are there when the scroll arrives
  for (const img of section.querySelectorAll('img[loading="lazy"]')) img.loading = "eager";
  release();
  heldFor = id;
  holdTimer = setTimeout(release, HOLD);
  setCurrent(id);
  scrollTo({ top, behavior: scrollStyle() });
}

bar.addEventListener("click", (e) => {
  const chip = e.target.closest("[data-go]");
  if (chip) goTo(chip.dataset.go);
});
// the guest took over the scrolling
for (const event of ["wheel", "touchstart", "keydown"]) {
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
  moveMarker(); // chips beside the current one may have gone
});
