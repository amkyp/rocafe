// Code checks: mistakes, and features the supported phones (see "browserslist" in package.json) don't have.
import js from "@eslint/js";
import globals from "globals";
import compat from "eslint-plugin-compat";

const data = { CONFIG: "readonly", T: "readonly", MENU: "readonly", DESC: "readonly", TAGS: "readonly", IMG: "readonly" };
// shared by assets/js/render.js with app.js (plain scripts loaded in order)
const shared = { RO: "readonly", ICONS: "readonly", ITEMS: "readonly", esc: "readonly", faDigits: "readonly", pics: "readonly", svg: "readonly" };
export default [
  { ignores: ["node_modules/**", "tools/qrcode.js"] },
  js.configs.recommended,
  {
    files: ["assets/js/**/*.js", "sw.js", "data/*.js"],
    plugins: { compat },
    settings: { polyfills: [] },
    // 2018 is the newest language level every supported phone can read
    languageOptions: { ecmaVersion: 2018, sourceType: "script", globals: { ...globals.browser, ...data } },
    rules: { "compat/compat": "error", "no-unused-vars": ["error", { caughtErrors: "none" }] }
  },
  { files: ["assets/js/app.js"], languageOptions: { globals: shared } },
  { files: ["sw.js"], languageOptions: { globals: globals.serviceworker } },
  { files: ["data/*.js"], languageOptions: { globals: { CONFIG: "off", T: "off", MENU: "off", DESC: "off", TAGS: "off", IMG: "off" } }, rules: { "no-unused-vars": "off" } },
  { files: ["assets/js/render.js"], rules: { "no-unused-vars": "off" } },
  { files: ["tools/**/*.mjs", "eslint.config.mjs"], languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: globals.node } }
];
