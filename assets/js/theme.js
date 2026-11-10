/* Ro Cafe menu: sets light or dark before the page is drawn, so it never flashes. Loaded in <head>. */
{
  let saved = null;
  try { saved = localStorage.getItem("ro-theme"); } catch { /* storage unavailable: follow the device's setting */ }
  document.documentElement.dataset.theme = ["light", "dark"].includes(saved) ? saved
    : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
