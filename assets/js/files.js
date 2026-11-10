/* Where the site's files live, in one place: menu photos and the apps' icons.
   Every photo is square and comes in several widths (data/photos.js, made by the photo
   preparation script); the browser picks the file that suits the screen (srcset + sizes).
   How wide photos appear is read from the stylesheet, which is the only place that says so. */
import { THUMB_WIDTHS, CARD_WIDTHS } from "../../data/photos.js";
import { rootPx } from "./dom.js";

const LIST = rootPx("--thumb");
const NEIGHBOUR = rootPx("--sib-thumb");
const CARD = Math.max(rootPx("--pw"), rootPx("--ph-max"));

const file = (dir, name, width) => `${dir}${encodeURIComponent(name)}-${width}.webp`;
const photo = (dir, name, widths, sizes, side) => ({
  src: file(dir, name, widths[0]),
  srcset: widths.map((w) => `${file(dir, name, w)} ${w}w`).join(", "),
  sizes,
  side, // width and height for the <img>, so its space is kept before the file arrives
});

export const FILES = {
  thumb: (name) => photo("img/", name, THUMB_WIDTHS, `${LIST}px`, LIST),
  neighbour: (name) => photo("img/", name, THUMB_WIDTHS, `${NEIGHBOUR}px`, NEIGHBOUR),
  card: (name) => {
    const widths = CARD_WIDTHS[name];
    return photo("img/lg/", name, widths, `(min-width: ${CARD}px) ${CARD}px, 100vw`, widths.at(-1));
  },
  brand: (key) => `assets/brands/${encodeURIComponent(key)}.webp`,
};

/* a photo's attributes for an <img> written as HTML text */
export const imgAttrs = (p) =>
  `src="${p.src}" srcset="${p.srcset}" sizes="${p.sizes}" width="${p.side}" height="${p.side}"`;
