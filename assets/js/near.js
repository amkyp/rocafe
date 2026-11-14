/* Photos are fetched only for what is on the screen or about to be: half a screen ahead, and
   only once the page has rested there for a moment, so a fast scroll or a jump to a category
   fetches nothing on the way. (The browser's own loading="lazy" reaches thousands of pixels
   ahead, which on a slow connection puts far-away photos in the way of the ones in view.) */
const DWELL = 120; // ms an element must stay near before it counts
const waiting = new Map(); // element -> { run, timer, seen, near }
let paused = false; // the page is travelling to another place: what it passes does not count

function go(element) {
  const { run } = waiting.get(element);
  waiting.delete(element);
  observer.unobserve(element);
  run();
}

const observer = new IntersectionObserver(
  (entries) => {
    for (const { target, isIntersecting } of entries) {
      const state = waiting.get(target);
      if (!state) continue;
      clearTimeout(state.timer);
      state.near = isIntersecting;
      if (isIntersecting && !paused) {
        if (state.seen) state.timer = setTimeout(go, DWELL, target);
        else go(target); // already near when it was drawn: no waiting
      }
      state.seen = true;
    }
  },
  { rootMargin: "50% 0px" },
);

/* run once, when the element is near the screen */
export function whenNear(element, run) {
  waiting.set(element, { run, timer: 0, seen: false, near: false });
  observer.observe(element);
}

/* what was waiting inside this part of the page is about to be redrawn */
export function forgetIn(root) {
  for (const [element, { timer }] of waiting) {
    if (!root.contains(element)) continue;
    clearTimeout(timer);
    observer.unobserve(element);
    waiting.delete(element);
  }
}

/* The page is being taken somewhere (a tap on a category): nothing is fetched on the way,
   and what is near when it arrives is fetched at once. */
export function travelling(isTravelling) {
  paused = isTravelling;
  for (const [element, state] of waiting) {
    clearTimeout(state.timer);
    if (!paused && state.near) go(element);
  }
}
