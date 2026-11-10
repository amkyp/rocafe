/* Ro Cafe menu: how the page works (menu, search, filters, item card, bill, theme, language). */
import { CONFIG } from "../../data/config.js";
import { T } from "../../data/strings.js";
import { MENU, FILTERS } from "../../data/menu.js";
import { RO, ITEMS, FILES, billKey, priceOf, esc, faDigits, pics, svg, srcAttrs } from "./render.js";

/* ---------- state ---------- */
/* localStorage can be missing (private mode) or hold anything: read through these and validate. */
const store = {
  get(k){ try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v){ try { localStorage.setItem(k, v); } catch { /* storage unavailable: setting just isn't remembered */ } }
};
const LANGS = ["fa", "en"];
let lang = LANGS.includes(store.get("ro-lang")) ? store.get("ro-lang") : "fa";
let query = ""; const bill = {}; let people = 1;

const D = s => lang==="fa" ? faDigits(s) : String(s);
// prices with the language's own digits and thousands separator (made once, reused)
const NUM = { fa: new Intl.NumberFormat("fa-IR"), en: new Intl.NumberFormat("en-US") };
const money = k => `${NUM[lang].format(k * 1000)} ${T[lang].toman}`;
const norm = s => (s||"").replace(/‌/g," ").replace(/ي/g,"ی").replace(/ك/g,"ک").replace(/\s+/g," ").trim().toLowerCase();
/* only allow expected link types from the settings file (never javascript: etc.) */
const safeUrl = (u, protocols = ["https:"]) => { try { const x = new URL(u, location.href); return protocols.includes(x.protocol) ? x.href : "#"; } catch { return "#"; } };
let filt = new Set();
const FILTER = new Map(FILTERS.map(f => [f.id, f]));
function hl(t){ if(!query) return esc(t); const s=norm(t), i=s.indexOf(query); if(i<0||s.length!==t.length) return esc(t); return esc(t.slice(0,i))+"<mark>"+esc(t.slice(i,i+query.length))+"</mark>"+esc(t.slice(i+query.length)); }

function matches(it,c){
  for(const id of filt){ const f = FILTER.get(id); if(!((f.tag && it.tags?.includes(f.tag)) || f.sections?.includes(c.id) || f.items?.includes(it.id))) return false; }
  if(!query) return true;
  const hay=[it.fa,it.en,it.sub?.fa,it.sub?.en,c.fa,c.en,...(it.options||[]).flatMap(o=>[o.fa,o.en])].map(norm).join(" | ");
  return hay.includes(query);
}

const tagsHTML = it => RO.tagsHTML(it, lang);
/* Build the whole menu (on start and when the language changes). */
function render(){
  const menu = document.getElementById("menu");
  menu.innerHTML = RO.menuHTML({ lang, bill });
  rows = new Map([...menu.querySelectorAll(".it")].map(n => [n.dataset.open, n]));
  marked = "";   // freshly built names carry no marks
  document.getElementById("chips").innerHTML = RO.chipsHTML(lang);
  document.getElementById("visit").hidden = false;
  applyFilter();
}/* Search and filters: hide what doesn't match and mark the matching words. Nothing is rebuilt,
   so photos never reload or blink while typing. */
let rows = new Map(), marked = "";   // menu rows by item id; the search words currently marked
function applyFilter(){
  const remark = query !== marked; marked = query;   // rewrite names only when the search words changed
  let total = 0;
  for (const c of MENU) {
    let shown = 0;
    for (const it of c.items) {
      const node = rows.get(it.id); if (!node) continue;
      const ok = matches(it, c); node.hidden = !ok; if (!ok) continue;
      shown++;
      if (remark) {
        node.querySelector(".it-name").innerHTML = hl(lang==="fa"?it.fa:it.en);
        const sub = node.querySelector(".info p"); if (sub) sub.innerHTML = hl(it.sub[lang]);
      }
    }
    total += shown;
    document.getElementById(c.id).hidden = !shown;
    const chip = document.querySelector(`#chips [data-go="${c.id}"]`); if (chip) chip.hidden = !shown;
  }
  document.getElementById("empty").style.display = total ? "none" : "block";
  document.querySelector("#menu .unit-note").hidden = !total;   // no prices shown, no price note
  showFilterState(total);
  if (!total) {   // say what to change: the search words, the filters, or both
    const t = T[lang];
    document.getElementById("noneD").textContent = query ? t.noneD : t.noneF;
    document.getElementById("emptyClear").textContent = !filt.size ? t.clearSearch : query ? t.clearAll : t.clearFilters;
  }
  watchSections(); moveIndicator();
}

function applyLang(){
  const t=T[lang];
  document.documentElement.lang=lang; document.documentElement.dir = lang==="fa"?"rtl":"ltr";
  document.title = t.docTitle;
  document.querySelectorAll("[data-t]").forEach(el=>el.textContent=t[el.dataset.t]);
  const lb=document.getElementById("langBtn"); lb.textContent=t.lang; lb.setAttribute("lang", lang==="fa"?"en":"fa"); lb.title = t.langName;
  document.getElementById("q").placeholder=t.ph;
  for (const id of ["visitCard", "visitCard2"]) document.getElementById(id).innerHTML = visitHTML(t);
  renderFilters(); render(); updateBill(); renderCopy();
  document.getElementById("infoBtn").setAttribute("aria-label", t.info); document.getElementById("clearQ").setAttribute("aria-label", t.clearSearch); document.getElementById("filterBtn").setAttribute("aria-label", t.filter); filterPop.setAttribute("aria-label", t.filter); if (detailId && document.getElementById("detailSheet").open) drawDetail();
}

/* ---------- bill ---------- */
function updateBill(){
  const t=T[lang], ids=Object.keys(bill);
  const count=ids.reduce((a,k)=>a+bill[k],0), sum=ids.reduce((a,k)=>a+bill[k]*ITEMS[k].p,0);
  document.getElementById("billbar").classList.toggle("up",count>0);
  const bc=document.getElementById("bCount"); if(bc.textContent!==D(count)){ bc.textContent=D(count); if (count) for (const a of bc.getAnimations()) { a.cancel(); a.play(); } }   // replay the CSS "pop" (only when the bar shows)
  document.getElementById("bTotal").textContent=money(sum);
  document.getElementById("sTotal").textContent=money(sum);
  document.getElementById("pCount").textContent=D(people);
  document.getElementById("perRow").style.display = people>1 ? "flex" : "none";
  document.getElementById("sEach").textContent=money(Math.ceil(sum/people));
  document.getElementById("lines").innerHTML = ids.length ? ids.map(k=>`
    <div class="line"><div class="nm">${esc(ITEMS[k][lang])}<small class="num">${D(ITEMS[k].p)} ${t.unit}</small></div>
      <div class="stepper"><button type="button" data-dec="${k}" aria-label="-">−</button><span class="num">${D(bill[k])}</span><button type="button" data-inc="${k}" aria-label="+">+</button></div>
      <span class="s num">${D(bill[k]*ITEMS[k].p)}</span></div>`).join("") : `<p class="sub">${t.empty}</p>`;
  if(!count) closeSheet("billSheet");
}
function change(k,d){ if(d>0 && navigator.vibrate) navigator.vibrate(8); bill[k]=(bill[k]||0)+d; if(bill[k]<=0) delete bill[k]; updateBill(); refreshAdds(); }
/* switch an item's option (e.g. the espresso bean): only its price, + button and choice buttons change */
function setOption(id, i){
  const it = findItem(id); it.sel = i;
  const row = document.querySelector(`#menu [data-open="${CSS.escape(id)}"]`); if (!row) return;
  const key = billKey(it), add = row.querySelector("[data-add]");
  row.querySelector(".price").textContent = D(priceOf(it));
  add.dataset.add = key; add.setAttribute("aria-label", RO.addLabel(key, bill[key]||0, lang));
  row.querySelectorAll("[data-bean]").forEach(b => { const on = +b.dataset.bean === i; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
  refreshAdds();
}
function refreshAdds(){ document.querySelectorAll("[data-add]").forEach(b=>{ const q=bill[b.dataset.add]||0; b.classList.toggle("has",!!q); b.textContent=q?D(q):"+"; b.setAttribute("aria-label", RO.addLabel(b.dataset.add, q, lang)); }); }

/* ---------- events ---------- */
document.getElementById("menu").addEventListener("click",e=>{
  const bean=e.target.closest("[data-bean]");
  if(bean){ setOption(bean.closest("[data-open]").dataset.open, +bean.dataset.bean); return; }
  const a=e.target.closest("[data-add]");
  if(a){ change(a.dataset.add,1); toast(`${ITEMS[a.dataset.add][lang]} ${T[lang].added}`); return; }
  const o=e.target.closest("[data-open]"); if(o) openDetail(o.dataset.open);
});
document.getElementById("chips").addEventListener("click",e=>{
  const c=e.target.closest("[data-go]"); if(!c) return;
  goTo(c.dataset.go);
});
const qEl=document.getElementById("q");
qEl.addEventListener("input",()=>{ query=norm(qEl.value); document.getElementById("searchBox").classList.toggle("has",!!qEl.value); applyFilter(); });
document.getElementById("clearQ").addEventListener("click",()=>{ qEl.value=""; query=""; document.getElementById("searchBox").classList.remove("has"); applyFilter(); qEl.focus(); });
document.getElementById("langBtn").addEventListener("click",()=>{ lang = lang==="fa"?"en":"fa"; store.set("ro-lang", lang); applyLang(); });

/* ---------- panels (bill, info, item card): modal <dialog> elements ----------
   The browser handles the dimmed background, focus, Escape and the page behind. Added here:
   the phone's Back button closes the top panel, a tap outside closes it, and phones can
   swipe a bottom panel down. */
/* Back button: while any panel is open there is one extra history entry. Back closes the top
   panel; closing the last panel some other way steps back over that entry. history.back() lands
   a moment later, so a panel opened in between keeps its entry instead of being closed by it. */
const openStack = [];
let stepBack = false;   // our own history.back() is on its way
const markOpen = () => { if (!stepBack && !history.state?.sheets) history.pushState({ sheets: true }, ""); };
function openSheet(id){
  const d = document.getElementById(id); if (d.open) return;
  document.getElementById("toast").classList.remove("show");
  d.showModal(); openStack.push(id);   // the browser moves focus to the panel's title (autofocus)
  markOpen();
}
function closeSheet(id){ document.getElementById(id).close(); }
document.querySelectorAll("dialog.sheet").forEach(d => {   // the full panels (not the filter menu)
  d.addEventListener("close", () => {           // closed by a button, Escape, Back or a tap outside
    openStack.splice(openStack.indexOf(d.id), 1);
    const p = d.querySelector(".panel"); if (p) { p.style.transform = ""; p.classList.remove("dragging"); }
    if (!openStack.length && history.state?.sheets && !stepBack) { stepBack = true; history.back(); }
  });
  d.addEventListener("click", e => {
    if (e.target === d || e.target.closest("[data-close]")) return d.close();   // the dialog itself = outside the card
    const i = e.target.closest("[data-inc]"), m = e.target.closest("[data-dec]");
    if (i) change(i.dataset.inc, 1); if (m) change(m.dataset.dec, -1);
  });
});
addEventListener("popstate", () => {
  if (stepBack) stepBack = false;                      // our own step back has landed
  else if (openStack.length) closeSheet(openStack.at(-1));   // the visitor pressed Back
  if (openStack.length) markOpen();                    // panels still open keep their entry
});
// swipe a bottom panel down to close it (phones only: panels are centred from 700px up)
document.querySelectorAll(".sheet .panel").forEach(p => {
  let y0 = null, dy = 0;
  p.addEventListener("touchstart", e => { if (innerWidth >= 700 || p.scrollTop > 0) return; y0 = e.touches[0].clientY; dy = 0; }, { passive: true });
  p.addEventListener("touchmove", e => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); if (dy > 0){ p.classList.add("dragging"); p.style.transform = `translateY(${dy}px)`; } }, { passive: true });
  p.addEventListener("touchend", () => { if (y0 == null) return; p.classList.remove("dragging");
    if (dy > 110) p.closest("dialog").close(); else p.style.transform = ""; y0 = null; });
});
document.getElementById("openBill").addEventListener("click",()=>openSheet("billSheet"));
document.getElementById("infoBtn").addEventListener("click",()=>openSheet("infoSheet"));
document.getElementById("pMinus").addEventListener("click",()=>{ people=Math.max(1,people-1); updateBill(); });
document.getElementById("pPlus").addEventListener("click",()=>{ people=Math.min(20,people+1); updateBill(); });
document.getElementById("clearBill").addEventListener("click",()=>{ for(const k in bill) delete bill[k]; people=1; updateBill(); refreshAdds(); });

let tt; function toast(m){ const t=document.getElementById("toast"); t.textContent=m; t.classList.add("show"); clearTimeout(tt); tt=setTimeout(()=>t.classList.remove("show"),1500); }

/* scroll spy + sticky border */
/* Category bar: tapping a chip scrolls the page to its section; the chip bar itself only
   scrolls sideways (never the page), and the highlight is held on the tapped chip until the
   page has finished scrolling, so it never flickers through the sections in between. */
const chipsEl = document.getElementById("chips");
let lockTo = null, lockTimer = 0;
/* the header's height, as the browser reports it after its own layout (ResizeObserver: no extra
   measuring), plus its sticky offset, which changes with the screen height */
const chipsBar = document.getElementById("chipsBar");
let barSize = 0, barHeight = 0;   // read freely while scrolling
function syncBarH(){
  barHeight = barSize + (parseFloat(getComputedStyle(chipsBar).top) || 0);
  document.documentElement.style.setProperty("--bar-h", barHeight + "px");
  watchSections();   // the line under the header moved
}
new ResizeObserver(([e]) => { barSize = e.borderBoxSize[0].blockSize; syncBarH(); }).observe(chipsBar);
addEventListener("resize", () => { viewH = innerHeight; syncBarH(); });
function setActiveChip(id){
  for (const c of chipsEl.querySelectorAll(".chip")){
    const on = c.dataset.go === id;
    if (on && !c.classList.contains("on")){
      const left = c.offsetLeft - (chipsEl.clientWidth - c.offsetWidth) / 2;
      chipsEl.scrollTo({ left, behavior: reduceMotion() ? "auto" : "smooth" });
    }
    if (c.dataset.go){ c.classList.toggle("on", on); c.setAttribute("aria-current", on ? "true" : "false"); }
  }
  moveIndicator();
}
function moveIndicator(){
  const ind = chipsEl.querySelector(".chip-ind"), on = chipsEl.querySelector(".chip.on"); if (!ind) return;
  if (!on){ ind.style.opacity = 0; return; }
  ind.style.opacity = 1; ind.style.width = on.offsetWidth + "px"; ind.style.transform = `translateX(${on.offsetLeft}px)`;
  // it appears in place the first time, and glides from then on
  if (!ind.classList.contains("ready")) requestAnimationFrame(() => ind.classList.add("ready"));
}
addEventListener("resize", moveIndicator);
document.fonts && document.fonts.ready.then(moveIndicator);
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
function goTo(id){
  const sec = document.getElementById(id); if (!sec) return;
  const top = sec.getBoundingClientRect().top + scrollY - barHeight + 1;
  // load this category's photos now, so they are there when the scroll arrives
  sec.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = "eager"; });
  lockTo = id; setActiveChip(id);
  scrollTo({ top, behavior: reduceMotion() ? "auto" : "smooth" });
  clearTimeout(lockTimer); lockTimer = setTimeout(() => { lockTo = null; }, 1200);
}
/* The current section is the one crossing a line just under the header. The browser reports it
   (IntersectionObserver), so the page is never measured by hand. At the very bottom the last
   section counts, even if it is too short to reach the line. */
let spyIO = null, crossing = null, atBottom = false;
let viewH = innerHeight;   // read before the menu is built (free then), and on every resize
function watchSections(){
  spyIO?.disconnect(); crossing = null;
  const line = barHeight + 24;
  spyIO = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) crossing = e.target.id;
      // a section that scrolls up past the line stays current until the next one reaches it;
      // one that drops back below the line hands over to the one above
      else if (crossing === e.target.id && e.boundingClientRect.top > line) crossing = null;
    }
    pickSection();
  }, { rootMargin: `-${line}px 0px -${Math.max(0, viewH - line - 1)}px 0px` });   // a 1px band at the line
  for (const s of document.querySelectorAll(".sec")) spyIO.observe(s);
}
function pickSection(){
  if (lockTo) return;
  const shown = document.querySelectorAll(".sec:not([hidden])");
  setActiveChip((atBottom && shown[shown.length - 1]?.id) || crossing || shown[0]?.id || null);
}
addEventListener("scroll", () => {
  chipsBar.classList.toggle("stuck", scrollY > 4);
  const bottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
  if (bottom !== atBottom) { atBottom = bottom; pickSection(); }
}, { passive: true });
for (const ev of ["wheel","touchstart","keydown"]) addEventListener(ev, () => { if (lockTo){ lockTo = null; clearTimeout(lockTimer); } }, {passive:true});

/* ---------- filters ---------- */
function renderFilters(){
  const t=T[lang];
  document.getElementById("filters").innerHTML=FILTERS.map(({id})=>`<button type="button" class="fbtn" data-f="${id}" aria-pressed="${filt.has(id)}">${t["tag_"+id]}</button>`).join("");
  document.getElementById("fdot").hidden = filt.size === 0;
}
/* with filters on: how many items show, and each filter as a chip that removes it */
function showFilterState(total){
  const t=T[lang], box=document.getElementById("fstat");
  box.hidden = filt.size === 0;
  if (box.hidden) { box.replaceChildren(); return; }
  box.innerHTML = `<span class="num">${t.nItems.replace("{n}", D(total))}</span>` + [...filt].map(id => `<button type="button" class="fchip" data-f="${id}" aria-label="${esc(t.removeF.replace("{f}", t["tag_"+id]))}">${t["tag_"+id]}<span aria-hidden="true">✕</span></button>`).join("");
}
function toggleFilter(e){
  const b=e.target.closest("[data-f]"); if(!b) return;
  const f=b.dataset.f; filt.has(f)?filt.delete(f):filt.add(f); renderFilters(); applyFilter();
}
document.getElementById("filters").addEventListener("click", toggleFilter);
document.getElementById("fstat").addEventListener("click", e => { toggleFilter(e); if (e.target.closest("[data-f]")) filterBtn.focus(); });

/* ---------- detail card ---------- */
let detailId=null;
function findItem(id){ for(const c of MENU) for(const it of c.items) if(it.id===id) return it; }
/* Large photos: each is downloaded once and kept as a ready <img>, so reopening an item
   (or tapping + / − inside it) shows the photo instantly. */
const bigPics = new Map();
function bigPic(f, lazy = false){
  let im = bigPics.get(f);
  if (!im) {
    const p = FILES.card(f);
    im = new Image(); im.decoding = "async"; im.className = "hi"; if (lazy) im.loading = "lazy";
    im.width = im.height = p.side;   // square: the browser knows the shape before the file arrives
    im.sizes = p.sizes; im.srcset = p.srcset; im.src = p.src;
    bigPics.set(f, im);
  }
  return im;
}
const warm = id => { const it = id && findItem(id), f = it && pics(it)[0]; if (f) bigPic(f); };
function openDetail(id){ detailId=id; drawDetail(); openSheet("detailSheet"); }
function drawDetail(){
  const it=findItem(detailId); if(!it) return;
  const t=T[lang], other = lang==="fa"?"en":"fa";
  const name = it[lang], alt = it[other];
  const desc = it.desc?.[lang] || "", sub = it.sub?.[lang] || "";
  const ps = pics(it), many = ps.length > 1;
  document.getElementById("dPanel").innerHTML = `
    <div class="grab" aria-hidden="true"></div><div class="dimg${many?" multi":""}">${ps.length?`<div class="gal"${many?` role="region" tabindex="0" aria-label="${t.photos}"`:""}>${ps.map(f=>`<div class="sl"><img class="lo" src="${FILES.thumb(f).src}" alt="" aria-hidden="true"></div>`).join("")}</div>`:""}${many?`<div class="gdots">${ps.map((_,i)=>`<button type="button" data-pic="${i}" aria-label="${t.photo} ${D(i+1)} / ${D(ps.length)}"${i?"":' aria-current="true"'}></button>`).join("")}</div>`:""}<button type="button" class="dclose" data-close aria-label="${t.close}">✕</button>${many?galNavHTML(t):""}</div>
    <div class="dbody"><div class="dbin">
      <h2 id="dName" tabindex="-1" autofocus>${esc(name)}</h2><div class="alt">${esc(alt)}</div>
      ${tagsHTML(it)}
      ${desc?`<p class="desc">${esc(desc)}</p>`:""}
      ${sub && it.cat.sub==="ingredients"?`<p class="ingr">${t.ingr}: ${esc(sub)}</p>`:(sub&&!desc?`<p class="desc">${esc(sub)}</p>`:"")}
      ${it.options?RO.optionsHTML(it, lang, "data-dbean"):""}
      <div class="dbuy">${buyHTML(it)}</div>
      <p class="ask">${t.ask}</p>
      ${sibHTML(t)}
    </div></div>`;
  document.querySelectorAll("#dPanel .sl").forEach((sl, i) => {
    const hi = bigPic(ps[i], i > 0);
    hi.alt = many ? `${name} (${D(i+1)})` : name;
    sl.appendChild(hi);
  });
  const gal = document.querySelector("#dPanel .gal");
  if (many) { galWatch(gal); galSync(); }
  [-1, 1].forEach(s => warm(neighbour(s)));
}
function buyHTML(it){
  const t = T[lang], key = billKey(it), price = priceOf(it), q = bill[key]||0;
  return `<span class="pr num">${D(price)} <small>${t.unit}</small></span>
        ${q?`<div class="stepper lg"><button type="button" data-dec="${key}" aria-label="−">−</button><span class="num" aria-live="polite">${D(q)}</span><button type="button" data-inc="${key}" aria-label="+">+</button></div>`
           :`<button type="button" class="btn btn-brand" data-dadd="${key}">${t.add}</button>`}`;
}
/* quantity or bean changed inside the open card: update only the price/quantity area */
function refreshBuy(){
  const it = findItem(detailId), box = document.querySelector("#dPanel .dbuy"); if (!it || !box) return;
  box.innerHTML = buyHTML(it);
  document.querySelectorAll("#dPanel [data-dbean]").forEach(b => { const on = +b.dataset.dbean === it.sel; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
}
/* move between items inside the open card: in the order shown on the page (current filters/search) */
const orderIds = () => [...document.querySelectorAll("#menu .sec:not([hidden]) .it:not([hidden])")].map(e => e.dataset.open);
function neighbour(step){ const ids = orderIds(), i = ids.indexOf(detailId); return i < 0 ? null : ids[i + step] || null; }
const CHEV = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
const BACK = () => CHEV(lang==="fa" ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6");   // points to the reading start
const FWD  = () => CHEV(lang==="fa" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6");   // points to the reading end
/* previous / next item: named buttons under the card, so it is clear where each one goes */
function sibHTML(t){
  const btn = (id, step) => {
    if (!id) return `<span></span>`;
    const it = findItem(id), f = pics(it)[0];
    return `<button type="button" class="sib ${step < 0 ? "prev" : "next"}" data-step="${step}">
      <span class="sib-ic">${step < 0 ? BACK() : FWD()}</span>
      <span class="sib-pic">${f ? `<img ${srcAttrs(FILES.thumb(f, "40px"))} alt="" width="40" height="40">` : svg(it.icon)}</span>
      <span class="sib-t"><small>${step < 0 ? t.prev : t.next}</small><b>${esc(it[lang])}</b></span></button>`;
  };
  return `<nav class="dsib" aria-label="${t.moreItems}">${btn(neighbour(-1), -1)}${btn(neighbour(1), 1)}</nav>`;
}
/* photo arrows for galleries: only on computers (on phones the photos are swiped) */
function galNavHTML(t){
  return `<button type="button" class="gnav gprev" data-gal="-1" aria-label="${t.prevPhoto}">${BACK()}</button><button type="button" class="gnav gnext" data-gal="1" aria-label="${t.nextPhoto}">${FWD()}</button>`;
}
/* The card's photo strip. The browser reports which photo is in view (IntersectionObserver) and
   scrolls to a photo (scrollIntoView), so nothing depends on the reading direction or on how an
   engine counts sideways scrolling in right-to-left pages. */
let galAt = 0, galIO = null;
function galWatch(g){
  galIO?.disconnect(); galAt = 0;
  galIO = new IntersectionObserver(es => {
    for (const e of es) if (e.isIntersecting) { galAt = [...g.children].indexOf(e.target); galSync(); }
  }, { root: g, threshold: 0.6 });
  for (const s of g.children) galIO.observe(s);
}
function galTo(i){
  const g = document.querySelector("#dPanel .gal"); if (!g) return;
  g.children[Math.max(0, Math.min(g.children.length - 1, i))]
    .scrollIntoView({ block: "nearest", inline: "start", behavior: reduceMotion() ? "auto" : "smooth" });
}
function galSync(){
  const g = document.querySelector("#dPanel .gal"); if (!g) return;
  const i = galAt, n = g.children.length;
  document.querySelectorAll("#dPanel [data-pic]").forEach(d => d.toggleAttribute("aria-current", +d.dataset.pic === i));
  const pv = document.querySelector("#dPanel .gprev"), nx = document.querySelector("#dPanel .gnext");
  if (pv) pv.disabled = i === 0; if (nx) nx.disabled = i === n - 1;
}
function stepDetail(step){
  const id = neighbour(step); if (!id) return;
  detailId = id; const panel = document.getElementById("dPanel");
  const hadFocus = document.activeElement?.closest(".sib");
  // drawDetail() builds the card anew, and new elements play the slide animation on their own
  panel.classList.remove("slide-next","slide-prev"); panel.classList.add(step > 0 ? "slide-next" : "slide-prev");
  drawDetail();
  if (hadFocus) (panel.querySelector(step > 0 ? ".sib.next" : ".sib.prev") || panel.querySelector(".sib")).focus({ preventScroll: true });
  else panel.scrollTop = 0;
}
addEventListener("keydown", e => {
  if (openStack.at(-1) !== "detailSheet") return;
  if (e.key === "ArrowLeft") stepDetail(lang === "fa" ? 1 : -1);
  if (e.key === "ArrowRight") stepDetail(lang === "fa" ? -1 : 1);
});
document.getElementById("dPanel").addEventListener("click",e=>{
  const sb=e.target.closest("[data-step]"); if(sb){ stepDetail(+sb.dataset.step); return; }
  const dot=e.target.closest("[data-pic]"); if(dot){ galTo(+dot.dataset.pic); return; }
  const ga=e.target.closest("[data-gal]"); if(ga){ galTo(galAt + +ga.dataset.gal); return; }
  const a=e.target.closest("[data-dadd]"); if(a){ change(a.dataset.dadd,1); refreshBuy(); return; }
  const b=e.target.closest("[data-dbean]"); if(b){ setOption(detailId, +b.dataset.dbean); refreshBuy(); return; }
  if(e.target.closest("[data-inc]")||e.target.closest("[data-dec]")) setTimeout(refreshBuy,0);
});

/* ---------- theme ---------- */
const themeBtn=document.getElementById("themeBtn");
function setTheme(t,save){
  document.documentElement.setAttribute("data-theme",t);
  // the browser bar takes the page colour from the stylesheet, so the colours live in one place
  // (read on the next frame, once the new colours are in place, so it costs no extra layout)
  requestAnimationFrame(() => document.getElementById("themeColor").setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()));
  themeBtn.setAttribute("aria-label", t==="dark" ? T[lang].toLight : T[lang].toDark);
  themeBtn.setAttribute("aria-pressed", t==="dark");
  if(save) store.set("ro-theme", t);
}
themeBtn.addEventListener("click",()=>setTheme(document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark",true));
// follow the phone's dark/light setting unless the guest picked one
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
  if (!["light", "dark"].includes(store.get("ro-theme"))) setTheme(e.matches ? "dark" : "light", false);
});

/* ---------- filters: a small dialog under its button (a tap outside closes it, nothing else) ---------- */
const filterBtn = document.getElementById("filterBtn"), filterPop = document.getElementById("filterPop");
/* The filter menu is a small non-modal <dialog> (dialog.show(), which older browsers support too):
   the page keeps scrolling and the list updates underneath. It sits under the search field, and
   closes with its button, Escape, or a tap outside; like a phone's own menus, that closing tap
   does nothing else (scrolling is not a tap). */
function placeFilters(){
  const r = filterBtn.closest(".search").getBoundingClientRect();
  if (r.bottom < 0) return closeFilters();   // the header scrolled away (phones held sideways)
  filterPop.style.top = `${r.bottom + 6}px`;
  filterPop.style.insetInlineEnd = `${lang === "fa" ? r.left : innerWidth - r.right}px`;
}
function openFilters(){ placeFilters(); filterPop.show(); filterBtn.setAttribute("aria-expanded", "true"); filterBtn.classList.add("open"); }
function closeFilters(){ if (filterPop.open) filterPop.close(); }
filterPop.addEventListener("close", () => { filterBtn.setAttribute("aria-expanded", "false"); filterBtn.classList.remove("open"); });
filterBtn.addEventListener("click", () => filterPop.open ? closeFilters() : openFilters());
addEventListener("keydown", e => { if (e.key === "Escape" && filterPop.open) { closeFilters(); filterBtn.focus(); } });
let closingTap = false;
addEventListener("pointerdown", e => { closingTap = filterPop.open && !e.target.closest("#filterPop, #filterBtn"); }, true);
addEventListener("pointercancel", () => { closingTap = false; }, true);
addEventListener("click", e => { if (closingTap) { closingTap = false; closeFilters(); e.preventDefault(); e.stopPropagation(); } }, true);
for (const ev of ["scroll", "resize"]) addEventListener(ev, () => { if (filterPop.open) placeFilters(); }, { passive: true });

/* ---------- opening hours (CONFIG.hours); today is worked out in Iran time ---------- */
const DAY_KEYS = ["sat","sun","mon","tue","wed","thu","fri"];
function tehranNow(){
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tehran", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(new Date()).map(x => [x.type, x.value]));
  return { day: ["Sat","Sun","Mon","Tue","Wed","Thu","Fri"].indexOf(p.weekday), min: +p.hour * 60 + +p.minute };
}/* "8:00" -> "۸ صبح" / "8 AM"; "24:00" -> "۱۲ شب" / "midnight" */
function clock(hm){
  const [h, m] = hm.split(":").map(Number), mm = m ? `:${String(m).padStart(2, "0")}` : "", w = T[lang].dayPart;
  if (lang === "fa") {   // Persian names the part of the day
    const part = h >= 1 && h < 5 ? w.late : h < 12 && h >= 5 ? w.morning : h === 12 ? w.noon : h > 12 && h < 17 ? w.afternoon : h >= 17 && h < 20 ? w.evening : w.night;
    return `${D((h % 12 || 12) + mm)} ${part}`;
  }
  if (h % 24 === 0 && !m) return w.midnight;
  if (h === 12 && !m) return w.noon;
  return `${(h % 12 || 12) + mm} ${h % 24 < 12 ? w.am : w.pm}`;
}
/* opening hours as one line when every day is the same, otherwise one line per day (today in bold) */
function hoursHTML(t){
  const H = CONFIG.hours; if (!H) return "";
  const span = d => d?.length ? d.map(([o, c]) => `${clock(o)} ${t.to} ${clock(c)}`).join(t.sep) : t.closedDay;
  const all = DAY_KEYS.map(k => JSON.stringify(H[k] || []));
  if (all.every(x => x === all[0])) return `${t.everyDay}${t.sep}${span(H[DAY_KEYS[0]])}`;
  const today = tehranNow().day;
  return `<span class="vdays">${DAY_KEYS.map((k, i) => `<span${i === today ? ' class="today"' : ""}><span>${t.days[i]}</span><span>${span(H[k])}</span></span>`).join("")}</span>`;
}
/* Lucide icons (lucide.dev), ISC License, Copyright (c) Lucide Icons and Contributors:
   map-pin, phone, clock, chevron-right */
const IC = {
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  phone: '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  go: '<path d="m9 18 6-6-6-6"/>'
};
const icon = (k, cls = "vic") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;
/* the apps' own icons, from their app-store listings */
const brand = (k, cls = "vbrand") => `<img class="${cls}" src="${FILES.brand(k)}" alt="" width="24" height="24" decoding="async">`;
const placeUrl = u => u.replaceAll("{lat}", CONFIG.place.lat).replaceAll("{lng}", CONFIG.place.lng);
const mapApp = () => (CONFIG.maps || []).find(m => m.app === CONFIG.place.mapOpens);
/* the map picture: a link to the app named in the settings (CONFIG.place.mapOpens), or just a picture */
function mapHTML(t){
  const p = CONFIG.place, app = mapApp();
  const inner = `<img src="${esc(p.map.src)}" width="${p.map.width}" height="${p.map.height}" alt="${esc(t.mapAlt)}" loading="lazy" decoding="async"><svg class="vpin" viewBox="0 0 24 24" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">${IC.pin}</svg><small class="osm" lang="en" dir="ltr">© OpenStreetMap contributors</small>`;
  return app
    ? `<a class="vmap" href="${esc(safeUrl(placeUrl(app.url)))}" target="_blank" rel="noopener noreferrer">${inner}<span class="sr">${esc(`${t.openIn} ${t["app_" + app.app]}`)}</span></a>`
    : `<figure class="vmap">${inner}</figure>`;
}
/* the visit card, inside <address>: address, the map with directions, phone, Instagram, hours.
   Phones: one column in that order. Wide cards: the text in one column, the map in the other.
   Rows that link are links over their whole width. */
function visitHTML(t){
  const ig = safeUrl(CONFIG.instagram.url);
  return `<div class="vlist">
    <div class="vrow vaddr">${icon("pin")}<span class="vtx"><small>${t.addr}</small><b>${t.addrV}</b></span></div>
    <div class="vmapbox">${mapHTML(t)}
      <span class="vdir" role="group" aria-label="${t.map}">${(CONFIG.maps || []).map(m => `<a class="mapgo" href="${esc(safeUrl(placeUrl(m.url)))}" target="_blank" rel="noopener noreferrer">${m.icon ? brand(m.icon) : ""}<span>${esc(t["app_" + m.app] || m.app)}</span></a>`).join("")}</span></div>
    <a class="vrow" href="${esc(safeUrl("tel:" + CONFIG.phone, ["tel:"]))}">${icon("phone")}<span class="vtx"><small>${t.phone}</small><b class="ltr">${esc(CONFIG.phoneDisplay)}</b></span>${icon("go", "vgo")}</a>
    <a class="vrow" href="${esc(ig)}" target="_blank" rel="noopener noreferrer">${brand(CONFIG.instagram.icon, "vbrand vic")}<span class="vtx"><small>${t.insta}</small><b class="ltr">@${esc(CONFIG.instagram.handle)}</b></span>${icon("go", "vgo")}</a>
    ${CONFIG.hours ? `<div class="vrow">${icon("clock")}<span class="vtx"><small>${t.hours}</small><b>${hoursHTML(t)}</b></span></div>` : ""}</div>`;
}

function renderCopy(){
  // the year in the language's own calendar (Persian: the Solar Hijri year)
  const cal = { fa: "fa-IR-u-ca-persian", en: "en-US" }[lang];
  const y = new Intl.DateTimeFormat(cal, { year: "numeric" }).formatToParts(new Date()).find(x => x.type === "year").value;
  document.getElementById("copy").textContent = `© ${y} ${T[lang].name}`;
}

/* ---------- offline + home screen ---------- */
navigator.serviceWorker?.register("sw.js");
addEventListener("offline", () => toast(T[lang].offline));

/* start downloading an item's large photo as soon as a finger or mouse is on it */
["pointerdown", "mouseover"].forEach(ev => document.getElementById("menu").addEventListener(ev, e => {
  const card = e.target.closest("[data-open]"); if (card) warm(card.dataset.open);
}, { passive: true }));

/* small comforts: Enter closes the phone keyboard; tapping the logo returns to the top */
qEl.addEventListener("keydown", e => { if (e.key === "Enter") qEl.blur(); });
// the logo is a link to the site's home; on the menu itself it just goes back to the top
// (a new-tab click, with Ctrl/Cmd or the middle button, still opens it as a link)
document.querySelector(".appbar .brand").addEventListener("click", e => {
  if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault(); scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" });
});
document.getElementById("empty").addEventListener("click", e => {
  if (!e.target.closest("#emptyClear")) return;
  const hadQuery = !!query; filt.clear(); renderFilters();
  if (hadQuery) document.getElementById("clearQ").click(); else { applyFilter(); filterBtn.focus(); }
});

/* ---------- search engines: the cafe as schema.org data, from the settings file ---------- */
function structuredData(){
  const DAY = { sat:"Saturday", sun:"Sunday", mon:"Monday", tue:"Tuesday", wed:"Wednesday", thu:"Thursday", fri:"Friday" };
  const meta = p => document.querySelector(`meta[property="${p}"]`)?.content;
  const site = document.querySelector('link[rel="canonical"]').href, p = CONFIG.place;
  const data = {
    "@context": "https://schema.org", "@type": "CafeOrCoffeeShop",
    name: T.fa.name, alternateName: T.en.name, url: site, hasMenu: site, image: meta("og:image"),
    telephone: CONFIG.phone, servesCuisine: "Coffee", sameAs: [CONFIG.instagram.url],
    address: { "@type": "PostalAddress", streetAddress: T.fa.addrV, addressLocality: p.locality, addressRegion: p.region, addressCountry: p.country },
    geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng },
    openingHoursSpecification: Object.entries(CONFIG.hours || {}).flatMap(([d, spans]) => spans.map(([opens, closes]) =>
      ({ "@type": "OpeningHoursSpecification", dayOfWeek: DAY[d], opens, closes: closes === "24:00" ? "23:59" : closes })))
  };
  const s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(data);
  document.head.append(s);
}
structuredData();
applyLang();
setTheme(document.documentElement.getAttribute("data-theme"),false);
