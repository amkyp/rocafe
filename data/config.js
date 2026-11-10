/* ============================================================
   RO CAFE SETTINGS: phone, Instagram, opening hours, location.
   Search engines get these too (built from this file). The site's own web
   address, for link previews, is in index.html.
   ============================================================ */
export const CONFIG = {
  phone: "+981155226936", // used for the call link
  phoneDisplay: "011 5522 6936", // shown on the page
  instagram: {
    handle: "ro.cafe.ramsar",
    url: "https://www.instagram.com/ro.cafe.ramsar/",
    icon: "instagram",
  },
  // Opening hours, Saturday first. Each day: [["open","close"], ...] in 24h time, or [] if closed.
  // A close time after midnight is fine, e.g. ["17:00","01:00"]. Leave null to hide the hours block.
  // Example: hours: { sat:[["09:00","23:00"]], sun:[["09:00","23:00"]], mon:[["09:00","23:00"]],
  //   tue:[["09:00","23:00"]], wed:[["09:00","23:00"]], thu:[["08:00","24:00"]], fri:[["16:00","24:00"]] },
  hours: {
    sat: [["08:00", "24:00"]],
    sun: [["08:00", "24:00"]],
    mon: [["08:00", "24:00"]],
    tue: [["08:00", "24:00"]],
    wed: [["08:00", "24:00"]],
    thu: [["08:00", "24:00"]],
    fri: [["08:00", "24:00"]],
  },
  // The cafe's entrance on the map (west side of Imam Khomeini Blvd, Ramak).
  // The footer map image is centred on this point (redraw it if the point moves).
  place: {
    lat: 36.9009192,
    lng: 50.6720273, // from the cafe's Google Maps listing
    locality: "رامسر",
    region: "مازندران",
    country: "IR",
    mapOpens: "google", // tapping the map opens this app (one of "maps" below); null: the map is only a picture
    map: { src: "assets/map.webp", width: 1280, height: 640 },
  },
  // Directions buttons, in this order: each opens the app at the place above
  // ({lat} and {lng} are filled in), or at the cafe's own listing where the app has one.
  // icon: a file name in assets/brands/ (the app's own icon).
  maps: [
    { app: "neshan", icon: "neshan", url: "https://neshan.org/maps/@{lat},{lng},17z,0p" },
    {
      app: "balad",
      icon: "balad",
      url: "https://balad.ir/location?latitude={lat}&longitude={lng}&zoom=17",
    },
    { app: "google", icon: "googlemaps", url: "https://maps.app.goo.gl/TcnBVHmKP3Rib1nt7" }, // the cafe's own listing
  ],
};
