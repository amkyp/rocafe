/* An item with options (e.g. espresso beans) is ordered per option. Wherever its options are
   listed (the menu at a row's + button, the item card), the list is one line per option: a
   button with name and price, or the quantity control once that option is in the bill. */
import { choicesHTML } from "./rows.js";

/* (re)draw the lines in their box; the keyboard stays on the line it was on */
export function drawChoices(box, it) {
  const lineOf = (el) => el?.closest(".pick")?.firstChild.textContent;
  const focused = box.contains(document.activeElement) && lineOf(document.activeElement);
  box.innerHTML = choicesHTML(it);
  if (!focused) return;
  const again = [...box.querySelectorAll(".pick")].find((pick) => lineOf(pick) === focused);
  (again.querySelector("[data-inc]") || again).focus();
}
