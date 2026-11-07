/* ============================================================
   RO CAFE SETTINGS: phone, Instagram, opening hours, directions.
   (The site's own address, for link previews, is in index.html.)
   ============================================================ */
export const CONFIG = {
  phone: "+981155226936",            // used for the call link
  phoneDisplay: "011 5522 6936",     // shown on the page
  phoneCopy: "01155226936",          // copied by the Copy button
  instagram: "ro.cafe.ramsar",
  // Opening hours, Saturday first. Each day: [["open","close"], ...] in 24h time, or [] if closed.
  // A close time after midnight is fine, e.g. ["17:00","01:00"]. Leave null to hide the hours block.
  // Example: hours: { sat:[["09:00","23:00"]], sun:[["09:00","23:00"]], mon:[["09:00","23:00"]],
  //   tue:[["09:00","23:00"]], wed:[["09:00","23:00"]], thu:[["08:00","24:00"]], fri:[["16:00","24:00"]] },
  hours: { sat:[["08:00","24:00"]], sun:[["08:00","24:00"]], mon:[["08:00","24:00"]], tue:[["08:00","24:00"]], wed:[["08:00","24:00"]], thu:[["08:00","24:00"]], fri:[["08:00","24:00"]] },
  // Directions buttons, shown in this order. Each must be an https:// link.
  // Best: open the cafe in each app, press Share, and paste that link here.
  // Until then they open a search for the cafe in each app.
  maps: [
    { app: "neshan", url: "https://neshan.org/maps/search/%DA%A9%D8%A7%D9%81%D9%87%20%D8%B1%D9%88%20%D8%B1%D8%A7%D9%85%D8%B3%D8%B1" },
    { app: "balad",  url: "https://balad.ir/search?query=%DA%A9%D8%A7%D9%81%D9%87%20%D8%B1%D9%88%20%D8%B1%D8%A7%D9%85%D8%B3%D8%B1" },
    { app: "google", url: "https://www.google.com/maps/search/?api=1&query=Ro+Cafe+Imam+Blvd+Ramsar" }
  ]
};
