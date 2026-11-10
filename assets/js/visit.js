/* Address and contact: the card in the footer and in the info panel, the opening hours, and the
   cafe's details for search engines. Everything comes from the settings file (data/config.js). */
import { CONFIG } from "../../data/config.js";
import { T } from "../../data/strings.js";
import { $ } from "./dom.js";
import { FILES } from "./files.js";
import { icon, PIN } from "./icons.js";
import { openSheet } from "./sheets.js";
import { state, t, digits, on } from "./state.js";
import { esc, safeUrl } from "./text.js";

/* ---------- opening hours; today is worked out in Iran time ---------- */
const DAYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"];
const DAY_SHORT = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

function todayInTehran() {
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tehran", weekday: "short" });
  return DAY_SHORT.indexOf(weekday.format(new Date()));
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
  const today = todayInTehran();
  const lines = DAYS.map(
    (key, i) =>
      `<span${i === today ? ' class="today"' : ""}><span>${t().days[i]}</span><span>${spans(hours[key])}</span></span>`,
  );
  return `<span class="vdays">${lines.join("")}</span>`;
}

/* ---------- the card ---------- */
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
    <svg class="vpin" viewBox="0 0 24 24" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">${PIN}</svg>
    <small class="osm" lang="en" dir="ltr">© OpenStreetMap contributors</small>`;
  if (!opens) return `<figure class="vmap">${picture}</figure>`;
  return `<a class="vmap" href="${esc(placeUrl(opens.url))}" ${NEW_TAB}>
    ${picture}<span class="sr">${esc(`${t().openIn} ${appName(opens.app)}`)}</span>
  </a>`;
}

const mapButtonHTML = (m) =>
  `<a class="mapgo" href="${esc(placeUrl(m.url))}" ${NEW_TAB}>${m.icon ? brand(m.icon) : ""}<span>${esc(appName(m.app))}</span></a>`;

/* one row: an icon, a small label and the value; rows that link are links over their whole width */
function rowHTML({ mark, label, value, href, attrs = "" }) {
  const text = `${mark}<span class="vtx"><small>${label}</small><b${href ? ' class="ltr"' : ""}>${value}</b></span>`;
  if (!href) return `<div class="vrow">${text}</div>`;
  return `<a class="vrow" href="${esc(href)}" ${attrs}>${text}${icon("go", "vgo")}</a>`;
}

/* Inside <address>: address, the map with directions, phone, Instagram, hours.
   Phones: one column in that order. Wide cards: the text in one column, the map in the other. */
function cardHTML() {
  const { phone, phoneDisplay, instagram, hours } = CONFIG;
  return `<div class="vlist">
    <div class="vrow vaddr">${icon("pin")}<span class="vtx"><small>${t().addr}</small><b>${t().addrV}</b></span></div>
    <div class="vmapbox">
      ${mapHTML()}
      <span class="vdir" role="group" aria-label="${t().map}">${maps().map(mapButtonHTML).join("")}</span>
    </div>
    ${rowHTML({ mark: icon("phone"), label: t().phone, value: esc(phoneDisplay), href: safeUrl(`tel:${phone}`, ["tel:"]) })}
    ${rowHTML({ mark: brand(instagram.icon, "vbrand vic"), label: t().insta, value: `@${esc(instagram.handle)}`, href: safeUrl(instagram.url), attrs: NEW_TAB })}
    ${hours ? rowHTML({ mark: icon("clock"), label: t().hours, value: hoursHTML() }) : ""}
  </div>`;
}

/* the year in the language's own calendar (Persian: the Solar Hijri year) */
function yearNow() {
  const calendar = { fa: "fa-IR-u-ca-persian", en: "en-US" }[state.lang];
  const parts = new Intl.DateTimeFormat(calendar, { year: "numeric" }).formatToParts(new Date());
  return parts.find((part) => part.type === "year").value;
}

/* The footer's card is drawn at once. The info panel's copy is drawn when the panel is first
   opened, so a guest who never opens it never pays for it. */
const inPanel = $("visitCard2");

export function draw() {
  $("visitCard").innerHTML = cardHTML();
  if (inPanel.hasChildNodes()) inPanel.innerHTML = cardHTML();
  $("copy").textContent = `© ${yearNow()} ${t().name}`;
  $("infoBtn").setAttribute("aria-label", t().info);
  $("visit").hidden = false;
}

on("sheet:open", (id) => {
  if (id === "infoSheet" && !inPanel.hasChildNodes()) inPanel.innerHTML = cardHTML();
});
$("infoBtn").addEventListener("click", () => openSheet("infoSheet"));

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
