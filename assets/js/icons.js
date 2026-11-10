/* The site's drawings and icons, as SVG text. */
import { state } from "./state.js";

/* ---------- line drawings shown when an item has no photo ---------- */
const DRAWINGS = {
  espresso:
    '<path d="M14 26h22v6a11 11 0 0 1-22 0z"/><path d="M36 28h3a4 4 0 0 1 0 8h-4"/><path d="M10 46h30"/><path d="M20 20c0-2 2-3 2-5M27 20c0-2 2-3 2-5"/>',
  cup: '<path d="M10 22h28l-2 18a6 6 0 0 1-6 5H18a6 6 0 0 1-6-5z"/><path d="M38 26h3a5 5 0 0 1 0 10h-4"/><path d="M15 27c3-3 6 2 9-1s6 2 9-1" /><path d="M8 50h34"/>',
  glass:
    '<path d="M15 10h20l-2 38H17z"/><path d="M15.6 22h18.8"/><path d="M16.2 30h17.6"/><path d="M20 15c2 1 6 1 10 0"/>',
  dripper:
    '<path d="M10 12h30l-9 16H19z"/><path d="M19 28h12v3H19z"/><path d="M14 36h22v10a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2z"/><path d="M36 39h3a3 3 0 0 1 0 6h-3"/><path d="M25 31v4"/>',
  cezve:
    '<path d="M14 18h16l-2 26a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3z"/><path d="M30 22l14-6"/><path d="M12 18h20"/><path d="M19 12c0-2 2-2 2-4M24 12c0-2 2-2 2-4"/>',
  coldbrew:
    '<path d="M16 8h18v6l3 4v28a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V18l3-4z"/><path d="M13 26h24"/><path d="M19 32h4v4h-4zM26 36h4v4h-4z"/>',
  mug: '<path d="M10 18h26v22a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z"/><path d="M36 22h4a5 5 0 0 1 0 10h-4"/><path d="M15 12c0-2 2-3 2-5M23 12c0-2 2-3 2-5M31 12c0-2 2-3 2-5"/>',
  istikan:
    '<path d="M17 14h16c0 6-3 8-3 13s4 7 4 13H16c0-6 4-8 4-13s-3-7-3-13z"/><path d="M12 44h26"/><path d="M20 33h10"/>',
  teapot:
    '<path d="M13 22h22v14a8 8 0 0 1-8 8h-6a8 8 0 0 1-8-8z"/><path d="M35 26h4a4 4 0 0 1 0 8h-4"/><path d="M13 27l-6-5v-3"/><path d="M19 22v-3h10v3"/><path d="M24 19v-3"/><path d="M28 30c-3 0-4 4-7 4"/>',
  shake:
    '<path d="M14 18h22l-3 30H17z"/><path d="M13 18c0-5 5-8 12-8s12 3 12 8"/><path d="M29 10l5-7"/><circle cx="25" cy="8" r="2"/><path d="M15 28h20"/>',
  iced: '<path d="M13 14h24l-3 34H16z"/><path d="M19 22h6v6h-6zM26 27h6v6h-6zM20 33h6v6h-6z"/><path d="M30 14l4-10"/>',
  lemon:
    '<path d="M14 14h22l-3 34H17z"/><circle cx="35" cy="14" r="6"/><path d="M35 8v12M29 14h12"/><path d="M20 24c1 6 0 12 2 18"/><path d="M28 26c-1 5 0 10-1 16"/>',
  matcha:
    '<path d="M8 22h34a17 15 0 0 1-34 0z"/><path d="M12 22c4-3 8 1 13-1s9 2 13-1"/><path d="M18 48h14"/><path d="M38 6l-8 14"/>',
  bottle:
    '<path d="M20 6h10v6l3 4v28a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4V16l3-4z"/><path d="M17 24h16v12H17z"/><path d="M20 6h10"/>',
  bomb: '<path d="M14 16h22l-3 32H17z"/><path d="M14 16c3-4 19-4 22 0"/><path d="M17 28h16M18 36h14"/><path d="M27 8l2-4 2 4"/>',
  affogato:
    '<path d="M10 26h30a15 13 0 0 1-30 0z"/><circle cx="25" cy="20" r="7"/><path d="M14 30c4 2 8 0 11 2s7 0 11-2"/>',
  cake: '<path d="M8 38l34-14v20H8z"/><path d="M8 38v6"/><path d="M8 38l34-14"/><path d="M8 32l20-8 14 0"/><path d="M8 32v6"/><path d="M28 24c0-4 4-5 4-9"/>',
  cookie:
    '<circle cx="25" cy="27" r="16"/><circle cx="19" cy="21" r="1.6"/><circle cx="29" cy="20" r="1.6"/><circle cx="31" cy="31" r="1.6"/><circle cx="20" cy="32" r="1.6"/><circle cx="25" cy="27" r="1"/>',
  croissant:
    '<path d="M5 34c2-12 12-20 20-20s18 8 20 20c-4 0-6-2-8-4-2 4-6 6-12 6s-10-2-12-6c-2 2-4 4-8 4z"/><path d="M17 18l3 12M25 14v16M33 18l-3 12"/>',
  baguette:
    '<path d="M5 30c0-6 8-12 20-12s20 6 20 12-8 6-20 6-20 0-20-6z"/><path d="M8 32c4-2 10-1 17-1s13-1 17 1"/><path d="M14 26c2 1 4 1 6 0M24 26c2 1 4 1 6 0M34 26c2 1 3 1 5 0"/>',
  plus: '<circle cx="25" cy="25" r="16"/><path d="M25 18v14M18 25h14"/>',
  shot: '<path d="M17 14h16l-2 30H19z"/><path d="M18 24h14"/><path d="M25 6v4"/>',
  milk: '<path d="M17 10h16v6l4 6v24a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2V22l4-6z"/><path d="M13 30h24"/>',
  syrup:
    '<path d="M20 4h10v6h-10z"/><path d="M18 10h14l2 6v28a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V16z"/><path d="M16 26h18"/>',
};

export const drawing = (key) =>
  `<svg viewBox="0 0 50 50" aria-hidden="true">${DRAWINGS[key] || DRAWINGS.cup}</svg>`;

/* ---------- Lucide icons (lucide.dev), ISC License, Copyright (c) Lucide Icons and Contributors:
   map-pin, phone, clock, chevron-right ---------- */
const LUCIDE = {
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  phone:
    '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  go: '<path d="m9 18 6-6-6-6"/>',
};

export const icon = (key, cls = "vic") =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${LUCIDE[key]}</svg>`;
/* the pin's outline, drawn over the map with its own colours */
export const PIN = LUCIDE.pin;

/* ---------- arrows that follow the reading direction ---------- */
const TO_RIGHT = "M9 6l6 6-6 6";
const TO_LEFT = "M15 6l-6 6 6 6";
const arrow = (d) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
/* towards where reading starts (previous) and where it ends (next) */
export const arrowBack = () => arrow(state.lang === "fa" ? TO_RIGHT : TO_LEFT);
export const arrowOn = () => arrow(state.lang === "fa" ? TO_LEFT : TO_RIGHT);
