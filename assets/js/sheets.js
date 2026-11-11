/* Panels (bill, info, item card): modal <dialog> elements.
   The browser handles the dimmed background, focus, Escape and the page behind. Added here:
   the phone's Back button closes the top panel, a tap outside closes it, and a panel that
   opens from the bottom of the screen can be swiped down. */
import { $ } from "./dom.js";
import { emit } from "./state.js";
import { hideToast } from "./toast.js";

/* Back button: while any panel is open there is one extra history entry. Back closes the top
   panel; closing the last panel some other way steps back over that entry. history.back() lands
   a moment later, so a panel opened in between keeps its entry instead of being closed by it. */
const openStack = [];
let steppingBack = false; // our own history.back() is on its way

function keepHistoryEntry() {
  if (!steppingBack && !history.state?.sheets) history.pushState({ sheets: true }, "");
}

export const topSheet = () => openStack.at(-1);

export function openSheet(id) {
  const dialog = $(id);
  if (dialog.open) return;
  hideToast();
  dialog.showModal(); // the browser moves focus to the panel's title (autofocus)
  openStack.push(id);
  keepHistoryEntry();
  emit("sheet:open", id);
}

export function closeSheet(id) {
  $(id).close();
}

/* The browser hands focus back to whatever opened the panel. Safari then draws the keyboard's
   focus ring there even when the panel was closed by touch; a panel closed by touch or mouse
   lets go of focus instead, so no ring appears. */
let lastInputWasPointer = false;
addEventListener("pointerdown", () => (lastInputWasPointer = true), true);
addEventListener("keydown", () => (lastInputWasPointer = false), true);
const closedByKeyboard = () => (lastInputWasPointer = false); // Escape, where it sends no keydown

/* closed by a button, Escape, Back, a swipe or a tap outside */
function onClose(dialog) {
  if (lastInputWasPointer) document.activeElement?.blur();
  openStack.splice(openStack.indexOf(dialog.id), 1);
  const panel = dialog.querySelector(".panel");
  panel.style.transform = "";
  panel.classList.remove("dragging");
  if (!openStack.length && history.state?.sheets && !steppingBack) {
    steppingBack = true;
    history.back();
  }
}

addEventListener("popstate", () => {
  if (steppingBack)
    steppingBack = false; // our own step back has landed
  else if (openStack.length) closeSheet(topSheet()); // the visitor pressed Back
  if (openStack.length) keepHistoryEntry(); // panels still open keep their entry
});

/* Swipe down to close. The stylesheet says which panels open from the bottom (--swipe: on). */
const SWIPE_TO_CLOSE = 110; // px
function allowSwipe(panel) {
  let startY = null;
  let moved = 0;
  const swipes = () => getComputedStyle(panel).getPropertyValue("--swipe").trim() === "on";

  panel.addEventListener(
    "touchstart",
    (e) => {
      if (panel.scrollTop > 0 || !swipes()) return;
      startY = e.touches[0].clientY;
      moved = 0;
    },
    { passive: true },
  );
  panel.addEventListener(
    "touchmove",
    (e) => {
      if (startY === null) return;
      moved = Math.max(0, e.touches[0].clientY - startY);
      if (!moved) return;
      panel.classList.add("dragging");
      panel.style.transform = `translateY(${moved}px)`;
    },
    { passive: true },
  );
  panel.addEventListener("touchend", () => {
    if (startY === null) return;
    startY = null;
    panel.classList.remove("dragging");
    if (moved > SWIPE_TO_CLOSE) panel.closest("dialog").close();
    else panel.style.transform = "";
  });
}

for (const dialog of document.querySelectorAll("dialog.sheet")) {
  dialog.addEventListener("cancel", closedByKeyboard);
  dialog.addEventListener("close", () => onClose(dialog));
  dialog.addEventListener("click", (e) => {
    // a click on the dialog itself is a click outside the panel
    if (e.target === dialog || e.target.closest("[data-close]")) dialog.close();
  });
  allowSwipe(dialog.querySelector(".panel"));
}
