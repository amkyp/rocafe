/* Where the site's files live, in one place: menu photos and the apps' icons.
   Every photo is square and comes in several widths and two formats (data/photos.js, made by
   the photo preparation script): AVIF for current browsers, WebP for older ones. The browser
   picks the file that suits it and the screen (<picture>, srcset and sizes). How wide photos
   appear is read from the stylesheet, which is the only place that says so. */
import { THUMB_WIDTHS, CARD_WIDTHS } from "../../data/photos.js";
import { rootPx } from "./dom.js";

const LIST = rootPx("--thumb");
const NEIGHBOUR = rootPx("--sib-thumb");
const CARD = Math.max(rootPx("--pw"), rootPx("--ph-max"));

const file = (dir, name, width, format) => `${dir}${encodeURIComponent(name)}-${width}.${format}`;
const srcset = (dir, name, widths, format) =>
  widths.map((w) => `${file(dir, name, w, format)} ${w}w`).join(", ");

const photo = (dir, name, widths, sizes, side) => ({
  src: file(dir, name, widths[0], "webp"),
  webp: srcset(dir, name, widths, "webp"),
  avif: srcset(dir, name, widths, "avif"),
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

/* A photo as HTML text. attrs: more attributes for the <img> (class, loading, alt ...). */
export function pictureHTML(p, attrs = 'alt=""') {
  return `<picture>
    <source type="image/avif" srcset="${p.avif}" sizes="${p.sizes}">
    <img src="${p.src}" srcset="${p.webp}" sizes="${p.sizes}" width="${p.side}" height="${p.side}" decoding="async" ${attrs}>
  </picture>`;
}
