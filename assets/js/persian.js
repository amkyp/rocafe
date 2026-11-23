/* Persian as the site writes and reads it: its alphabet and digits, which way a piece of typed
   text runs (Persian or English), and Persian as different keyboards type it. Nothing here touches
   the page. */

/* the 32 letters of the Persian alphabet, with آ, the hamza forms ء أ ؤ ئ, and ۀ */
const LETTERS = "ءآأؤئابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهیۀ";
const DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/* a number in Persian digits */
export const persianDigits = (s) => String(s).replace(/[0-9]/g, (d) => DIGITS[d]);

/* Persian as different keyboards type it, made one: some keyboards (the older Windows Persian
   layout among them) send other code points for ی and ک, and a half-space is often typed as a
   space. Each character becomes one character, so positions in the text stay where they were. */
const KEYBOARD_YEH = String.fromCodePoint(0x064a);
const KEYBOARD_KAF = String.fromCodePoint(0x0643);
const HALF_SPACE = String.fromCodePoint(0x200c);
export const uniformPersian = (s) =>
  s.replaceAll(KEYBOARD_YEH, "ی").replaceAll(KEYBOARD_KAF, "ک").replaceAll(HALF_SPACE, " ");

/* Which way typed text runs, from its first letter: right to left for Persian, left to right for
   English, null before any letter (empty, or only digits and signs), so it follows the page.
   (dir="auto" alone would make an empty field left to right, even on the Persian page.) */
const FIRST_LETTER = new RegExp(`[A-Za-z${LETTERS}]`);
export function writingDirection(text) {
  const letter = uniformPersian(text).match(FIRST_LETTER)?.[0];
  if (!letter) return null;
  return LETTERS.includes(letter) ? "rtl" : "ltr";
}
