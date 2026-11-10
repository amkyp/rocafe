/* Small page helpers. */

export const $ = (id) => document.getElementById(id);

export const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export const scrollStyle = () => (reduceMotion() ? "auto" : "smooth");

/* a size the stylesheet defines on :root in px (for example --thumb), so it lives in one place */
export const rootPx = (name) =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
