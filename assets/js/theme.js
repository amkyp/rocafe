/* Ro Cafe menu: sets light or dark before the page is drawn, so it never flashes. Loaded in <head>. */
{
  const saved = localStorage.getItem("ro-theme");
  document.documentElement.dataset.theme = ["light", "dark"].includes(saved) ? saved
    : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
