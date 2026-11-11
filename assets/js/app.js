/* Ro Cafe menu: starts the page. Each part lives in its own file:
     header    logo, theme, language      chips    category bar
     search    search field and filters   menu     the list of items
     card      item card (with gallery)   bill     the table's bill
     visit     address and contact        sheets   the panels all of these open in */
import { MENU } from "../../data/menu.js";
import * as bill from "./bill.js";
import * as card from "./card.js";
import * as chips from "./chips.js";
import * as header from "./header.js";
import * as menu from "./menu.js";
import * as search from "./search.js";
import { on, session, t } from "./state.js";
import { toast } from "./toast.js";
import * as visit from "./visit.js";

/* everything that shows text, in the order the parts depend on each other
   (the category chips must exist before the menu says which sections show) */
function drawAll() {
  header.draw();
  chips.draw();
  visit.draw();
  search.draw();
  menu.draw();
  bill.draw();
  card.draw();
}

on("lang", drawAll);
drawAll();
card.openFromAddress();
/* arriving at a section's address (a category opened in a new tab) */
const section = MENU.find(({ id }) => `#${id}` === location.hash);
if (section) chips.arriveAt(section.id);

/* A reload (phones reload background tabs) returns to the same place in the menu. The menu is
   built by script, after the moment a browser restores the scroll position by itself, so the
   page does it: the position is saved when the page is left and used when it comes back. */
const PLACE = "ro-place";
history.scrollRestoration = "manual";
addEventListener("pagehide", () => session.set(PLACE, String(Math.round(scrollY))));
const arrival = performance.getEntriesByType("navigation")[0]?.type;
if (arrival === "reload" || arrival === "back_forward") {
  scrollTo({ top: Number(session.get(PLACE)) || 0, behavior: "instant" });
}
visit.describeForSearchEngines();

/* works offline and from the home screen */
navigator.serviceWorker?.register("sw.js");
addEventListener("offline", () => toast(t().offline));
