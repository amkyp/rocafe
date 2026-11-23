/* Ro Café menu: sets light or dark before the page is drawn, so it never flashes. Loaded in <head>
   right after the colour-scheme and browser-bar tags, ahead of the stylesheet, so those tags carry
   the guest's choice before any CSS arrives: "light dark" follows the device, "light" or "dark" is
   a choice. */
{
  let saved = null;
  try {
    saved = localStorage.getItem("ro-theme");
  } catch {
    /* storage unavailable: follow the device's setting */
  }
  const chosen = ["light", "dark"].includes(saved) ? saved : null;
  document.querySelector('meta[name="color-scheme"]').content = chosen ?? "light dark";
  document.documentElement.dataset.theme =
    chosen ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  // a choice against the device's setting: the bar takes the chosen theme's colour either way
  const bars = [...document.querySelectorAll('meta[name="theme-color"]')];
  const colour = chosen && bars.find((bar) => bar.media.includes(chosen))?.content;
  if (colour) for (const bar of bars) bar.content = colour;
}
