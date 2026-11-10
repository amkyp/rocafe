/* Small text helpers. Nothing here touches the page. */

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
export const faDigits = (s) => String(s).replace(/\d/g, (d) => FA_DIGITS[d]);

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
/* makes any text safe to place inside HTML */
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESCAPES[c]);

/* the same word however it was typed: Arabic or Persian letters, half-spaces, capitals */
export const norm = (s) =>
  (s || "")
    .replace(/‌/g, " ")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
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
