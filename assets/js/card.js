/* The item card: large photos, description, price and quantity, and the items before and after. */
import { change, inBill, stepperHTML } from "./bill.js";
import { $ } from "./dom.js";
import { FILES, pictureHTML } from "./files.js";
import * as gallery from "./gallery.js";
import { arrowBack, arrowOn, drawing, icon } from "./icons.js";
import { findItem, billKey, optionOf, priceOf, pics, sectionOf, setOption } from "./items.js";
import { visibleIds } from "./menu.js";
import { optionsHTML, tagsHTML } from "./rows.js";
import { openSheet, setSheetAddress, topSheet } from "./sheets.js";
import { state, t, otherLang, digits, on } from "./state.js";
import { esc } from "./text.js";

const SHEET = "detailSheet";
const panel = $("dPanel");
let shownId = null;

const isOpen = () => $(SHEET).open;

/* ---------- large photos ----------
   Each is downloaded once and kept as a ready <picture>, so reopening an item (or changing its
   quantity) shows the photo instantly. */
const largePhotos = new Map();

function largePhoto(name, lazy = false) {
  if (!largePhotos.has(name)) {
    const holder = document.createElement("div");
    holder.innerHTML = pictureHTML(FILES.card(name), `class="hi"${lazy ? ' loading="lazy"' : ""}`);
    largePhotos.set(name, holder.firstElementChild);
  }
  return largePhotos.get(name);
}

/* start downloading an item's first large photo before its card is opened */
function warm(id) {
  const name = id && pics(findItem(id))[0];
  if (name) largePhoto(name);
}

/* ---------- the items before and after, in the order now showing on the page ---------- */
function neighbour(step) {
  const ids = visibleIds();
  const at = ids.indexOf(shownId);
  return at < 0 ? null : ids[at + step] || null;
}

/* named buttons at the card's foot, so it is clear where each one goes */
function neighbourHTML(step) {
  const id = neighbour(step);
  if (!id) return ""; // at either end the one button takes the whole width
  const it = findItem(id);
  const name = pics(it)[0];
  const back = step < 0;
  return `<button type="button" class="sib ${back ? "prev" : "next"}" data-step="${step}">
    <span class="sib-ic">${back ? arrowBack() : arrowOn()}</span>
    <span class="sib-pic">${name ? pictureHTML(FILES.neighbour(name)) : drawing(it.icon)}</span>
    <span class="sib-t"><small>${back ? t().prev : t().next}</small><b>${esc(it[state.lang])}</b></span>
  </button>`;
}

/* ---------- price and quantity ---------- */
function buyHTML(it) {
  const key = billKey(it);
  const count = inBill(key);
  const price = `<data class="pr num" value="${priceOf(it) * 1000}">${digits(priceOf(it))} <small>${t().unit}</small></data>`;
  if (!count) {
    return `${price}<button type="button" class="btn btn-brand" data-dadd="${key}">${t().add}</button>`;
  }
  // in the bill: the quantity, and a reminder that the bill is not an order
  return `${price}${stepperHTML(key, "lg")}<p class="order-note">${t().orderNote}</p>`;
}

/* the quantity or the option changed: only the price and quantity area is redrawn */
function drawBuy() {
  if (!isOpen()) return;
  const it = findItem(shownId);
  panel.querySelector(".dbuy").innerHTML = buyHTML(it);
  for (const button of panel.querySelectorAll("[data-dbean]")) {
    const on = Number(button.dataset.dbean) === optionOf(it);
    button.classList.toggle("on", on);
    button.setAttribute("aria-pressed", on);
  }
}

/* ---------- the card ---------- */
function photosHTML(names) {
  if (!names.length) return "";
  const many = names.length > 1;
  // the small menu photo shows at once, softened, until the large one has loaded over it
  // (the same file the menu list already downloaded)
  const slides = names.map(
    (name) => `<div class="sl">${pictureHTML(FILES.thumb(name), 'class="lo" alt=""')}</div>`,
  );
  // several photos: a named part of the page that the keyboard can reach and scroll
  if (!many) return `<div class="gal">${slides.join("")}</div>`;
  return `<section class="gal" tabindex="0" aria-label="${t().photos}">${slides.join("")}</section>
    ${gallery.dotsHTML(names.length)}`;
}

function textHTML(it) {
  const description = it.desc?.[state.lang];
  const sub = it.sub?.[state.lang];
  if (sub && sectionOf(it).sub === "ingredients") {
    return `${description ? `<p class="desc">${esc(description)}</p>` : ""}
      <p class="ingr">${t().ingr}: ${esc(sub)}</p>`;
  }
  const text = description || sub;
  return text ? `<p class="desc">${esc(text)}</p>` : "";
}

function drawCard() {
  const it = findItem(shownId);
  const names = pics(it);
  const many = names.length > 1;
  const name = it[state.lang];

  panel.innerHTML = `
    <div class="grab" aria-hidden="true"></div>
    <div class="dimg">
      ${photosHTML(names)}
      <button type="button" class="dclose" data-close aria-label="${t().close}">${icon("x")}</button>
      ${many ? gallery.arrowsHTML() : ""}
    </div>
    <div class="dbody"><div class="dbin">
      <h2 id="dName" tabindex="-1" autofocus>${esc(name)}</h2>
      <div class="alt" lang="${otherLang()}">${esc(it[otherLang()])}</div>
      ${tagsHTML(it)}
      ${textHTML(it)}
      ${it.options ? optionsHTML(it, "data-dbean") : ""}
      <div class="dbuy">${buyHTML(it)}</div>
      <p class="ask">${icon("info")}${t().ask}</p>
      <nav class="dsib" aria-label="${t().moreItems}">${neighbourHTML(-1)}${neighbourHTML(1)}</nav>
    </div></div>`;

  panel.querySelectorAll(".sl").forEach((slide, i) => {
    const picture = largePhoto(names[i], i > 0);
    picture.querySelector("img").alt = many ? `${name} (${digits(i + 1)})` : name;
    slide.append(picture);
  });
  if (many) gallery.start(panel);
  warm(neighbour(-1));
  warm(neighbour(1));
}

/* The open item is in the address (…?item=latte), so it can be shared and a reload reopens it. */
const ADDRESS_KEY = "item";
const itemInAddress = () => findItem(new URLSearchParams(location.search).get(ADDRESS_KEY))?.id;
const addressOf = (id) => `?${ADDRESS_KEY}=${encodeURIComponent(id)}`;

function open(id) {
  shownId = id;
  drawCard();
  openSheet(SHEET);
  setSheetAddress(addressOf(id));
}

/* Arriving with an item in the address. A reload of an open card is already on the card's own
   history entry. A fresh arrival (a shared link) is not: the page first takes the plain address,
   so that closing the card leads back to the menu and not away from the site. */
export function openFromAddress() {
  const id = itemInAddress();
  if (!id) return;
  if (!history.state?.sheets) history.replaceState(null, "", location.pathname);
  open(id);
}
/* Forward, or back to an entry that holds an item: show it again */
addEventListener("popstate", () => {
  const id = itemInAddress();
  if (id && !isOpen()) open(id);
});

/* move to the item before or after */
function step(by) {
  const id = neighbour(by);
  if (!id) return;
  shownId = id;
  const fromButton = document.activeElement?.closest(".sib");
  // the card is built anew, and new elements play the slide animation on their own
  panel.classList.remove("slide-next", "slide-prev");
  panel.classList.add(by > 0 ? "slide-next" : "slide-prev");
  drawCard();
  setSheetAddress(addressOf(id));
  if (!fromButton) {
    panel.scrollTop = 0;
    return;
  }
  // keep the keyboard on the same button, or on the only one left at either end
  const button =
    panel.querySelector(by > 0 ? ".sib.next" : ".sib.prev") || panel.querySelector(".sib");
  button.focus({ preventScroll: true });
}

/* the language changed while the card is open */
export function draw() {
  if (isOpen()) drawCard();
}

panel.addEventListener("click", (e) => {
  const target = (selector) => e.target.closest(selector);
  if (target("[data-step]")) step(Number(target("[data-step]").dataset.step));
  else if (target("[data-pic]")) gallery.go(Number(target("[data-pic]").dataset.pic));
  else if (target("[data-gal]")) gallery.move(Number(target("[data-gal]").dataset.gal));
  else if (target("[data-dadd]")) change(target("[data-dadd]").dataset.dadd, 1);
  else if (target("[data-dbean]")) setOption(shownId, Number(target("[data-dbean]").dataset.dbean));
});

/* the arrow keys move between items, following the reading direction; inside the photo strip
   they belong to the photos */
addEventListener("keydown", (e) => {
  if (topSheet() !== SHEET || e.target.closest?.(".gal")) return;
  const forward = state.lang === "fa" ? "ArrowLeft" : "ArrowRight";
  const back = state.lang === "fa" ? "ArrowRight" : "ArrowLeft";
  if (e.key === forward) step(1);
  if (e.key === back) step(-1);
});

on("item:open", open);
on("item:near", warm);
on("bill", drawBuy);
on("option", drawBuy);
