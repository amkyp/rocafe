/* Address and contact: the card in the footer, the opening hours, and the
   cafe's details for search engines. Everything comes from the settings file (data/config.js). */
import { CONFIG } from "../../data/config.js";
import { T } from "../../data/strings.js";
import { $, scrollStyle } from "./dom.js";
import { FILES } from "./files.js";
import { arrowOn, icon } from "./icons.js";
import { state, t, digits } from "./state.js";
import { esc, safeUrl } from "./text.js";

/* ---------- opening hours; today is worked out in Iran time ---------- */
const DAYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"];
const DAY_SHORT = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

const TEHRAN = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Tehran",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const minutesOf = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

/* the day of the week and the minutes since midnight, in Tehran */
function nowInTehran() {
  const parts = Object.fromEntries(TEHRAN.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return {
    day: DAY_SHORT.indexOf(parts.weekday),
    minutes: minutesOf(`${parts.hour}:${parts.minute}`),
  };
}

function isOpenNow() {
  const { day, minutes } = nowInTehran();
  const spans = CONFIG.hours[DAYS[day]] || [];
  return spans.some(
    ([opens, closes]) => minutesOf(opens) <= minutes && minutes < minutesOf(closes),
  );
}

/* the Persian name for the part of the day an hour falls in */
function dayPart(hour) {
  const parts = t().dayPart;
  if (hour >= 1 && hour < 5) return parts.late;
  if (hour >= 5 && hour < 12) return parts.morning;
  if (hour === 12) return parts.noon;
  if (hour > 12 && hour < 17) return parts.afternoon;
  if (hour >= 17 && hour < 20) return parts.evening;
  return parts.night;
}

/* "8:00" -> "۸ صبح" / "8 AM"; "24:00" -> "۱۲ شب" / "midnight" */
function clock(time) {
  const [hour, minute] = time.split(":").map(Number);
  const minutes = minute ? `:${String(minute).padStart(2, "0")}` : "";
  const onDial = (hour % 12 || 12) + minutes;
  if (state.lang === "fa") return `${digits(onDial)} ${dayPart(hour)}`;
  const parts = t().dayPart;
  if (hour % 24 === 0 && !minute) return parts.midnight;
  if (hour === 12 && !minute) return parts.noon;
  return `${onDial} ${hour % 24 < 12 ? parts.am : parts.pm}`;
}

/* one line when every day is the same, otherwise one line per day (today in bold) */
function hoursHTML() {
  const hours = CONFIG.hours;
  const spans = (day) =>
    day?.length
      ? day.map(([opens, closes]) => `${clock(opens)} ${t().to} ${clock(closes)}`).join(t().sep)
      : t().closedDay;
  const perDay = DAYS.map((key) => JSON.stringify(hours[key] || []));
  if (perDay.every((day) => day === perDay[0])) {
    return `${t().everyDay}${t().sep}${spans(hours[DAYS[0]])}`;
  }
  const today = nowInTehran().day;
  const lines = DAYS.map(
    (key, i) =>
      `<span${i === today ? ' class="today"' : ""}><span>${t().days[i]}</span><span>${spans(hours[key])}</span></span>`,
  );
  return `<span class="vdays">${lines.join("")}</span>`;
}

/* open or closed at this moment, in words and colour */
function openNowHTML() {
  const open = isOpenNow();
  return `<span class="open-now ${open ? "yes" : "no"}">${open ? t().openNow : t().closedNow}</span>`;
}

/* ---------- the card ---------- */
/* a phone number's spaces become non-breaking ones, so it wraps only if it cannot fit at all */
const inOnePiece = (text) => text.replaceAll(" ", "\u00a0");
/* the apps' own icons, from their app-store listings */
const brand = (key, cls = "vbrand") =>
  `<img class="${cls}" src="${FILES.brand(key)}" alt="" width="24" height="24" loading="lazy" decoding="async">`;
const placeUrl = (url) =>
  safeUrl(url.replaceAll("{lat}", CONFIG.place.lat).replaceAll("{lng}", CONFIG.place.lng));
const NEW_TAB = 'target="_blank" rel="noopener noreferrer"';
const maps = () => CONFIG.maps || [];
const appName = (app) => t()[`app_${app}`] || app;

/* the map picture: a link to the app named in the settings (CONFIG.place.mapOpens), or a picture */
function mapHTML() {
  const { map } = CONFIG.place;
  const opens = maps().find((m) => m.app === CONFIG.place.mapOpens);
  const picture = `<img src="${esc(map.src)}" width="${map.width}" height="${map.height}" alt="${esc(t().mapAlt)}" loading="lazy" decoding="async">
    ${icon("pin", "vpin")}
    <small class="osm" lang="en" dir="ltr">© OpenStreetMap contributors</small>`;
  if (!opens) return `<figure class="vmap">${picture}</figure>`;
  return `<a class="vmap" href="${esc(placeUrl(opens.url))}" ${NEW_TAB}>
    ${picture}<span class="sr">${esc(`${t().openIn} ${appName(opens.app)}`)}</span>
  </a>`;
}

const mapButtonHTML = (m) =>
  `<a class="mapgo" href="${esc(placeUrl(m.url))}" ${NEW_TAB}>${m.icon ? brand(m.icon) : ""}<span>${esc(appName(m.app))}</span></a>`;

/* One row of the card: a label (with its icon) and its value, as a term and its description.
   A value that links somewhere is a link whose tap area is the whole row. */
function rowHTML({ mark, label, value, href, attrs = "", note = "", cls = "" }) {
  const shown = href
    ? `<a href="${esc(href)}" ${attrs}><span class="ltr">${value}</span>${arrowOn("vgo")}</a>`
    : value;
  return `<div class="vrow${cls ? ` ${cls}` : ""}"><dt>${mark}${label}</dt><dd>${shown}${note}</dd></div>`;
}

/* Inside <address>: the address, the map with directions, then phone, Instagram and hours.
   Phones: one column in that order. Wide cards: the text in one column, the map in the other. */
function cardHTML() {
  const { phone, phoneDisplay, instagram, hours } = CONFIG;
  const address = rowHTML({ mark: icon("pin", "vic"), label: t().addr, value: t().addrV });
  const contacts = [
    rowHTML({
      mark: icon("phone", "vic"),
      label: t().phone,
      value: esc(inOnePiece(digits(phoneDisplay))),
      href: safeUrl(`tel:${phone}`, ["tel:"]),
    }),
    rowHTML({
      mark: brand(instagram.icon, "vbrand vic"),
      label: t().insta,
      value: `@${esc(instagram.handle)}`,
      href: safeUrl(instagram.url),
      attrs: NEW_TAB,
    }),
    hours
      ? rowHTML({
          mark: icon("clock", "vic"),
          label: t().hours,
          value: hoursHTML(),
          note: openNowHTML(),
        })
      : "",
  ];
  return `<div class="vbody">
    <dl class="vlist">${address}</dl>
    <div class="vmapbox">
      ${mapHTML()}
      <span class="vdir" role="group" aria-label="${t().map}">${maps().map(mapButtonHTML).join("")}</span>
    </div>
    <dl class="vlist">${contacts.join("")}</dl>
  </div>`;
}

/* the year in the language's own calendar (Persian: the Solar Hijri year) */
function yearNow() {
  const calendar = { fa: "fa-IR-u-ca-persian", en: "en-US" }[state.lang];
  const parts = new Intl.DateTimeFormat(calendar, { year: "numeric" }).formatToParts(new Date());
  return parts.find((part) => part.type === "year").value;
}

/* the header's welcome line says whether the cafe is open; it links to the hours in the footer */
function drawOpenNow() {
  const open = isOpenNow();
  const link = $("openNow");
  link.className = `open-now ${open ? "yes" : "no"}`;
  link.textContent = open ? t().openNow : t().closedNow;
  link.hidden = false;
  for (const label of document.querySelectorAll("#visitCard .open-now"))
    label.outerHTML = openNowHTML();
}

export function draw() {
  $("visitCard").innerHTML = cardHTML();
  drawOpenNow();
  $("copy").textContent = `© ${yearNow()} ${t().name}`;
  $("visit").hidden = false;
}

/* a tab left open comes back with the right "open now": only those labels are replaced */
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) drawOpenNow();
});

/* The header's links to the address go there without putting #visit in the address bar (which a
   later reload would jump back to); focus moves to the section's heading. */
for (const link of document.querySelectorAll('.appbar a[href="#visit"]')) {
  link.addEventListener("click", (e) => {
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    $("visit").scrollIntoView({ behavior: scrollStyle() });
    $("visitTitle").focus({ preventScroll: true });
  });
}

/* ---------- search engines: the cafe as schema.org data ---------- */
const DAY_NAME = {
  sat: "Saturday",
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
};

export function describeForSearchEngines() {
  const site = document.querySelector('link[rel="canonical"]').href;
  const { place } = CONFIG;
  const openingHours = Object.entries(CONFIG.hours || {}).flatMap(([day, spans]) =>
    spans.map(([opens, closes]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_NAME[day],
      opens,
      closes: closes === "24:00" ? "23:59" : closes,
    })),
  );
  const data = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: T.fa.name,
    alternateName: T.en.name,
    url: site,
    hasMenu: site,
    image: document.querySelector('meta[property="og:image"]')?.content,
    telephone: CONFIG.phone,
    servesCuisine: "Coffee",
    sameAs: [CONFIG.instagram.url],
    address: {
      "@type": "PostalAddress",
      streetAddress: T.fa.addrV,
      addressLocality: place.locality,
      addressRegion: place.region,
      addressCountry: place.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: place.lat, longitude: place.lng },
    openingHoursSpecification: openingHours,
  };
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.append(script);
}
