/* A small menu that hangs from its button (the filters, an item's choices): a non-modal <dialog>
   (dialog.show(), which older browsers support too), so the page keeps scrolling underneath and
   the stylesheet places it. One is open at a time. It closes with its button, Escape, or a tap
   outside; like a phone's own menus, that closing tap does nothing else (scrolling is not a tap). */
let open = null; // { dialog, button }

function setOpenLook(button, isOpen) {
  button.setAttribute("aria-expanded", isOpen);
  button.classList.toggle("open", isOpen);
}

export function closePopup() {
  if (!open) return;
  const { dialog, button } = open;
  open = null;
  dialog.close();
  setOpenLook(button, false);
}

/* open the button's menu, or close it if it is the one open */
export function togglePopup(dialog, button) {
  const wasOpen = open?.dialog === dialog;
  closePopup();
  if (wasOpen) return;
  dialog.show();
  setOpenLook(button, true);
  open = { dialog, button };
}

addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || !open) return;
  const { button } = open;
  closePopup();
  button.focus();
});

let closingTap = false; // this tap began outside the open menu
addEventListener(
  "pointerdown",
  (e) => {
    closingTap = !!open && !open.dialog.contains(e.target) && !open.button.contains(e.target);
  },
  true,
);
addEventListener(
  "pointercancel", // the touch became a scroll
  () => {
    closingTap = false;
  },
  true,
);
addEventListener(
  "click",
  (e) => {
    if (!closingTap) return;
    closingTap = false;
    closePopup();
    e.preventDefault();
    e.stopPropagation();
  },
  true,
);
