# Ro Cafe menu (کافه رو)

The QR menu for Ro Cafe, Ramsar. It is a plain static website: HTML, CSS and JavaScript only,
with no server code or database. Any host that can serve files can run it, from a free static
host to your own domain. The folder is always ready to upload as it is; the small release step
below only prepares it after you edit something.

## What's in the folder

```
index.html            the page (the Persian menu is written into it by the release step)
src/style.css         design: colors, layout, dark mode                <- edit this one
assets/css/style.css  the design as browsers get it (built from src/style.css, don't edit)
assets/css/fonts.css  the Persian/English font, embedded
assets/js/render.js   turns the menu data into the menu (used by the page and the release)
assets/js/app.js      how the menu works (search, filters, item card, bill)
assets/icon.svg       browser tab icon
data/config.js        cafe settings: phone, Instagram, map link   <- edit
data/menu.js          items, prices, descriptions, tags, photos   <- edit
data/strings.js       interface wording in Persian and English    <- edit
img/                  item photos (small, used in the list), .webp
img/lg/               item photos (large, used on the item card), .webp
img/jpg/, img/lg/jpg/ the same photos as .jpg, for older iPhones (iOS 12-13)
tools/qr-card.html    makes the printable QR card for any address
tools/release.mjs     prepares a new version (see below), then runs the check
tools/check.mjs       checks the menu data and the release before publishing
tools/build-css.mjs   builds the design for all supported phones (run by the release)
tools/prerender.mjs   writes the menu into index.html (run by the release)
package.json          the supported browsers, and the developer tools (not needed to host)
```

All links inside the site are relative, so the same folder works at
`https://rocafe.ir/`, at `https://something.example/menu/`, or opened straight from disk.

## Changing the menu

Open `data/menu.js` in any text editor.

- **Change a price:** find the item and change the number. Prices are in thousand toman,
  so `265` means 265,000 toman.
  ```js
  ["لاته","Latte",265,"glass"],
  ```
- **Add an item:** copy a line in the same category and change the names and price.
  To give it a photo, add its English name and the photo's file name to `IMG`; for several
  photos give a list, `["name-1", "name-2"]` (the first is the one in the list). Each photo needs
  `NAME.webp` in `img/` and `img/lg/`, and `NAME.jpg` in `img/jpg/` and `img/lg/jpg/`.
- **Remove an item:** delete its line (keep the commas tidy).
- **Tags:** add the English name to `TAGS` with `pm` (plant milk), `cf` (caffeine-free) or `n` (contains nuts).

After editing, run this in the site folder (needs [Node.js](https://nodejs.org); the first time,
run `npm install` once to get the tools):

```
node tools/release.mjs
```

It builds the design from `src/style.css`, writes the menu into `index.html`, gives each changed
file a new version (unchanged files keep theirs, so phones download only what changed), and then
checks the menu: prices are numbers, every photo exists, no name is used twice, Persian
and English texts match, links are valid. If something is wrong it says what and where, and you
fix it before publishing. `node tools/check.mjs` runs only the check. Menu data is kept on phones
for 5 minutes at most anyway, so a forgotten release fixes itself quickly.

## Changing the cafe details

Edit `data/config.js`: phone number, Instagram handle, opening hours and the directions buttons
(`maps`: Neshan, Balad, Google Maps, in that order). Each button opens a search for the cafe until
you paste the real place link: open the cafe in that app, press Share, copy the link into `url`.

## Photos

Items marked with a list in `IMG` show the cafe's own photos (file names starting `ro-`), with
a gallery when there are several. The rest are free stock photos from Unsplash (Unsplash License:
free to use, including commercially) until they are replaced. Sizes: `img/` 200×200 px, `img/lg/`
up to 1200 px on the long side; any shape works on the item card. The checker warns if a photo
or its .jpg copy is missing, or if a photo file is no longer used.

## Phones and browsers

The design is the same on every supported browser: iPhone and iPad from iOS 12, Android Chrome
and in-app browsers from version 64 (2018), Samsung Internet 8 and Firefox 68 (the list is in
`package.json`). Write `src/style.css` the modern way; the release adds what older phones need
(left/right versions of right-to-left rules, spacing fallbacks, browser prefixes). `npm run lint`
checks the scripts against the same list, so a feature an older phone lacks is caught before
publishing. Even where the script cannot run at all, the page still shows the whole menu.

## Putting it online

The steps are the same everywhere: upload the whole folder so that `index.html` sits at the
address you want.

**Free static host** (for example Cloudflare Pages, Netlify or GitHub Pages): create a site,
upload or drag in this folder, and you get an address. Note that foreign hosts can be slow or
blocked for visitors in Iran, so test it on a few customers' phones on mobile data first.

**Your own domain on an Iranian host** (recommended for customers in Iran): buy the domain
(e.g. `rocafe.ir`) and a basic host. In the host's file manager, upload the folder's contents
into `public_html` (or the folder the host names for your site). Turn on HTTPS (SSL) in the
host's panel; most offer a free certificate.

**Server settings** are included: `.htaccess` (Apache hosts such as cPanel/DirectAdmin) and
`_headers` (Netlify, Cloudflare Pages). They turn on compression and caching and force HTTPS.
Upload them with the rest; hidden files like `.htaccess` must be uploaded too.

**Link preview image:** messengers need a full address for it. Once the domain is set, change
`assets/og.png` in the `og:image` line of `index.html` to the full address, e.g.
`https://rocafe.ir/assets/og.png`.

**Moving from one to the other** needs no code change. Upload the same folder to the new place,
then make a new QR card with the new address.

## Offline and home screen

On a real host (HTTPS), the menu saves itself on the phone after the first visit (`sw.js`):
it then opens instantly and still works with no internet, and customers can add it to their
home screen like an app (`manifest.webmanifest`). Prices and the page are always checked online
first, so they stay current. `tools/release.mjs` keeps `VERSION` in `sw.js` in step with the page.

## Security

The site collects nothing: no forms, accounts, cookies, trackers or outside scripts. Phones
remember only the chosen language and light/dark mode. The page also carries a strict security
policy (in `index.html`) that lets only the site's own files run, so even a mistake in the menu
data cannot turn into running code, and every value from the data files is escaped before it is
shown. Links from `config.js` are accepted only as `https://` (and `tel:` for the phone).

- Keep it this way: no `onclick="…"` or `style="…"` in the HTML, and no scripts from other sites.
  `tools/check.mjs` warns if one slips in.
- On GitHub Pages the policy works from the page itself. On Netlify, Cloudflare Pages or an Apache
  host (your own domain), `_headers` or `.htaccess` also sends it as a real header, adding
  protection against the menu being framed inside another site.
- Use HTTPS on your own domain (free with Cloudflare or Let's Encrypt); `.htaccess` redirects to it.

## Making the QR card

Open `tools/qr-card.html` from the live site (for example `https://rocafe.ir/tools/qr-card.html`).
It fills in the site's address by itself; you can also type any address. Press the print button:
four A6 cards fit on one A4 sheet. Scan one card with a phone before printing them all.

## Credits

- Font: IBM Plex Sans Arabic, SIL Open Font License 1.1.
- QR library (`tools/qrcode.js`): qrcode-generator by Kazuhiko Arase, MIT License.
- Photos: Unsplash, Unsplash License.
