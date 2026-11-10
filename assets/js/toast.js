/* The short message at the bottom of the screen. */
import { $ } from "./dom.js";

const SHORT = 1500;
export const LONG = 4500;
let timer = 0;

export function toast(message, time = SHORT) {
  const box = $("toast");
  box.textContent = message;
  box.classList.add("show");
  clearTimeout(timer);
  timer = setTimeout(hideToast, time);
}

export function hideToast() {
  $("toast").classList.remove("show");
}
