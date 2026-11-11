/* The item card's photo strip. The browser reports which photo is in view (IntersectionObserver)
   and scrolls to a photo (scrollIntoView), so nothing depends on the reading direction or on how
   an engine counts sideways scrolling in right-to-left pages. */
import { scrollStyle } from "./dom.js";
import { arrowBack, arrowOn } from "./icons.js";
import { t, digits } from "./state.js";

const IN_VIEW = 0.6; // share of a photo that must show for it to count as the current one
let strip = null;
let dots = [];
let previous = null;
let next = null;
let current = 0;
let observer = null;

/* one dot per photo */
export function dotsHTML(count) {
  const buttons = Array.from({ length: count }, (_, i) => {
    const label = `${t().photo} ${digits(i + 1)} / ${digits(count)}`;
    return `<button type="button" data-pic="${i}" aria-label="${label}"></button>`;
  });
  return `<div class="gdots">${buttons.join("")}</div>`;
}

/* arrows, which the stylesheet shows only where there is a mouse (phones swipe) */
export function arrowsHTML() {
  return `<button type="button" class="gnav gprev" data-gal="-1" aria-label="${t().prevPhoto}">${arrowBack()}</button>
    <button type="button" class="gnav gnext" data-gal="1" aria-label="${t().nextPhoto}">${arrowOn()}</button>`;
}

function showCurrent() {
  dots.forEach((dot, i) => {
    if (i === current) dot.setAttribute("aria-current", "true");
    else dot.removeAttribute("aria-current");
  });
  previous.disabled = current === 0;
  next.disabled = current === strip.children.length - 1;
}

/* a card with several photos was drawn inside this panel */
export function start(panel) {
  observer?.disconnect();
  strip = panel.querySelector(".gal");
  dots = [...panel.querySelectorAll("[data-pic]")];
  previous = panel.querySelector(".gprev");
  next = panel.querySelector(".gnext");
  current = 0;
  showCurrent();
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        current = [...strip.children].indexOf(entry.target);
        showCurrent();
      }
    },
    { root: strip, threshold: IN_VIEW },
  );
  for (const slide of strip.children) observer.observe(slide);
}

export function go(index) {
  const last = strip.children.length - 1;
  const slide = strip.children[Math.max(0, Math.min(last, index))];
  slide.scrollIntoView({ block: "nearest", inline: "start", behavior: scrollStyle() });
}

export const move = (step) => go(current + step);
