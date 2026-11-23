/* Small text helpers. Nothing here touches the page. */
import { uniformPersian } from "./persian.js";

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
/* makes any text safe to place inside HTML */
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESCAPES[c]);

/* the same word however it was typed: Persian from any keyboard, half-spaces, spaces, capitals */
export const norm = (s) =>
  uniformPersian(s || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

/* only expected kinds of link are let through from the settings file (never javascript: etc.) */
export function safeUrl(url, protocols = ["https:"]) {
  try {
    const parsed = new URL(url, location.href);
    return protocols.includes(parsed.protocol) ? parsed.href : "#";
  } catch {
    return "#";
  }
}
