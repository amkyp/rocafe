/* The item card: large photos, description, price and quantity, and the items before and after. */
import { change, inBill } from "./bill.js";
import { $ } from "./dom.js";
import { FILES, imgAttrs } from "./files.js";
import * as gallery from "./gallery.js";
import { arrowBack, arrowOn, drawing } from "./icons.js";
import { findItem, billKey, priceOf, pics, setOption } from "./items.js";
import { visibleIds } from "./menu.js";
import { optionsHTML, tagsHTML } from "./rows.js";
import { openSheet, topSheet } from "./sheets.js";
import { state, t, otherLang, digits, on } from "./state.js";
import { esc } from "./text.js";

const SHEET = "detailSheet";
const panel = $("dPanel");
let shownId = null;

const isOpen = () => $(SHEET).open;

/* ---------- large photos ----------
   Each is downloaded once and kept as a ready <img>, so reopening an item (or changing its
   quantity) shows the photo instantly. */
const largePhotos = new Map();

function largePhoto(name, lazy = false) {
  let img = largePhotos.get(name);
  if (img) return img;
  const photo = FILES.card(name);
  img = new Image(photo.side, photo.side); // square: its space is kept before the file arrives
  img.decoding = "async";
  img.className = "hi";
  if (lazy) img.loading = "lazy";
  img.sizes = photo.sizes;
  img.srcset = photo.srcset;
  img.src = photo.src;
  largePhotos.set(name, img);
  return img;
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
  if (!id) return "<span></span>";
  const it = findItem(id);
  const name = pics(it)[0];
  const back = step < 0;
  return `<button type="button" class="sib ${back ? "prev" : "next"}" data-step="${step}">
    <span class="sib-ic">${back ? arrowBack() : arrowOn()}</span>
    <span class="sib-pic">${name ? `<img ${imgAttrs(FILES.neighbour(name))} alt="">` : drawing(it.icon)}</span>
    <span class="sib-t"><small>${back ? t().prev : t().next}</small><b>${esc(it[state.lang])}</b></span>
  </button>`;
}

/* ---------- price and quantity ---------- */
function buyHTML(it) {
  const key = billKey(it);
  const count = inBill(key);
  const price = `<span class="pr num">${digits(priceOf(it))} <small>${t().unit}</small></span>`;
  if (!count) {
    return `${price}<button type="button" class="btn btn-brand" data-dadd="${key}">${t().add}</button>`;
  }
  // in the bill: the quantity, and a reminder that the bill is not an order
  return `${price}
    <div class="stepper lg">
      <button type="button" data-dec="${key}" aria-label="−">−</button>
      <span class="num" aria-live="polite">${digits(count)}</span>
      <button type="button" data-inc="${key}" aria-label="+">+</button>
    </div>
    <p class="order-note">${t().orderNote}</p>`;
}

/* the quantity or the option changed: only the price and quantity area is redrawn */
function drawBuy() {
  if (!isOpen()) return;
  const it = findItem(shownId);
  panel.querySelector(".dbuy").innerHTML = buyHTML(it);
  for (const button of panel.querySelectorAll("[data-dbean]")) {
    const on = Number(button.dataset.dbean) === it.sel;
    button.classList.toggle("on", on);
    button.setAttribute("aria-pressed", on);
  }
}

/* ---------- the card ---------- */
function photosHTML(names) {
  if (!names.length) return "";
  const many = names.length > 1;
  // the small menu photo shows at once, softened, until the large one has loaded over it
  const slides = names.map(
    (name) =>
      `<div class="sl"><img class="lo" src="${FILES.thumb(name).src}" alt="" aria-hidden="true"></div>`,
  );
  const strip = many
    ? `<div class="gal" role="region" tabindex="0" aria-label="${t().photos}">`
    : `<div class="gal">`;
  return `${strip}${slides.join("")}</div>${many ? gallery.dotsHTML(names.length) : ""}`;
}

function textHTML(it) {
  const description = it.desc?.[state.lang];
  const sub = it.sub?.[state.lang];
  if (sub && it.cat.sub === "ingredients") {
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
      <button type="button" class="dclose" data-close aria-label="${t().close}">✕</button>
      ${many ? gallery.arrowsHTML() : ""}
    </div>
    <div class="dbody"><div class="dbin">
      <h2 id="dName" tabindex="-1" autofocus>${esc(name)}</h2>
      <div class="alt">${esc(it[otherLang()])}</div>
      ${tagsHTML(it)}
      ${textHTML(it)}
      ${it.options ? optionsHTML(it, "data-dbean") : ""}
      <div class="dbuy">${buyHTML(it)}</div>
      <p class="ask">${t().ask}</p>
      <nav class="dsib" aria-label="${t().moreItems}">${neighbourHTML(-1)}${neighbourHTML(1)}</nav>
    </div></div>`;

  panel.querySelectorAll(".sl").forEach((slide, i) => {
    const img = largePhoto(names[i], i > 0);
    img.alt = many ? `${name} (${digits(i + 1)})` : name;
    slide.append(img);
  });
  if (many) gallery.start(panel);
  warm(neighbour(-1));
  warm(neighbour(1));
}

function open(id) {
  shownId = id;
  drawCard();
  openSheet(SHEET);
}

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

/* the arrow keys move between items, following the reading direction */
addEventListener("keydown", (e) => {
  if (topSheet() !== SHEET) return;
  const forward = state.lang === "fa" ? "ArrowLeft" : "ArrowRight";
  const back = state.lang === "fa" ? "ArrowRight" : "ArrowLeft";
  if (e.key === forward) step(1);
  if (e.key === back) step(-1);
});

on("item:open", open);
on("item:near", warm);
on("bill", drawBuy);
on("option", drawBuy);
