/* Ro Cafe menu: app logic. Reads CONFIG (data/config.js), T (data/strings.js), MENU/DESC/TAGS/IMG (data/menu.js). */
'use strict';
/* ---------- state ---------- */
/* localStorage can be missing (private mode) or hold anything: read through these and validate. */
const store = {
  get(k){ try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v){ try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable: setting just isn't remembered */ } }
};
const LANGS = ["fa", "en"];
let lang = LANGS.includes(store.get("ro-lang")) ? store.get("ro-lang") : "fa";
let query = ""; const bill = {}; let people = 1;

const D = s => lang==="fa" ? faDigits(s) : String(s);
const money = k => { const v=(k*1000).toLocaleString("en-US"); return lang==="fa" ? faDigits(v).replace(/,/g,"٬")+" تومان" : v+" Toman"; };
const norm = s => (s||"").replace(/‌/g," ").replace(/ي/g,"ی").replace(/ك/g,"ک").replace(/\s+/g," ").trim().toLowerCase();
const PIN = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12z" fill="currentColor"/><circle cx="12" cy="10" r="2.6" fill="var(--bg)"/></svg>`;
/* only allow expected link types from the settings file (never javascript: etc.) */
const safeUrl = (u, protocols = ["https:"]) => { try { const x = new URL(u, location.href); return protocols.includes(x.protocol) ? x.href : "#"; } catch (e) { return "#"; } };
/* add or remove an attribute (Element.toggleAttribute is missing on older phones) */
const setFlag = (el, name, on) => { if (on) el.setAttribute(name, "true"); else el.removeAttribute(name); };
const seenPics = new Set(); // photo addresses already shown once in this visit
let filt = new Set();
function hl(t){ if(!query) return esc(t); const s=norm(t), i=s.indexOf(query); if(i<0||s.length!==t.length) return esc(t); return esc(t.slice(0,i))+"<mark>"+esc(t.slice(i,i+query.length))+"</mark>"+esc(t.slice(i+query.length)); }

function matches(it,c){
  for(const f of filt){ if(!(TAGS[it.en]||[]).includes(f)) return false; }
  if(!query) return true;
  const hay=[it.fa,it.en,it.dfa,it.den,c.fa,c.en].concat(it.beans?it.beans.reduce((all,b)=>all.concat([b[0],b[1]]),[]):[]).map(norm).join(" | ");
  return hay.includes(query);
}

const tagsHTML = it => RO.tagsHTML(it, lang);
/* Build the whole menu (only when the language changes). The page already arrives with the Persian
   menu written in by tools/release.mjs from the same code (assets/js/render.js), so on a normal
   visit nothing is rebuilt at all: the ready-made menu is used as it is. */
function render(){
  const menu = document.getElementById("menu"), chips = document.getElementById("chips");
  const ready = menu.getAttribute("data-lang") === lang && !Object.keys(bill).length;
  if (!ready) {
    menu.innerHTML = RO.menuHTML({ lang, bill, seen: seenPics });
    chips.innerHTML = RO.chipsHTML(lang);
    menu.setAttribute("data-lang", lang);
  }
  markLoaded();
  document.getElementById("visit").hidden=false;
  applyFilter();
}
/* Search and filters: hide what doesn't match and mark the matching words. Nothing is rebuilt,
   so photos never reload or blink while typing. */
function applyFilter(){
  let total = 0;
  for (const c of MENU) {
    let shown = 0;
    for (const it of c.items) {
      const node = document.querySelector(`#menu [data-open="${it.id}"]`); if (!node) continue;
      const ok = matches(it, c); node.hidden = !ok; if (!ok) continue;
      shown++;
      const h = node.querySelector(".it-name"), sub = node.querySelector(".info p");
      h.innerHTML = hl(lang==="fa"?it.fa:it.en);
      if (sub) sub.innerHTML = hl(lang==="fa"?it.dfa:it.den);
    }
    total += shown;
    document.getElementById(c.id).hidden = !shown;
    const chip = document.querySelector(`#chips [data-go="${c.id}"]`); if (chip) chip.hidden = !shown;
  }
  document.getElementById("empty").style.display = total ? "none" : "block";
  spy(); moveIndicator();
}

function applyLang(){
  const t=T[lang];
  document.documentElement.lang=lang; document.documentElement.dir = lang==="fa"?"rtl":"ltr";
  document.title = lang==="fa" ? "کافه رو | منو" : "Ro Cafe | Menu";
  document.querySelectorAll("[data-t]").forEach(el=>el.textContent=t[el.dataset.t]);
  const lb=document.getElementById("langBtn"); lb.textContent=t.lang; lb.setAttribute("lang", lang==="fa"?"en":"fa"); lb.title = lang==="fa" ? "English" : "فارسی";
  document.getElementById("q").placeholder=t.ph;
  const v = `
   <div class="mapcard card">
     <div class="mapart" aria-hidden="true">
       <svg class="streets" viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice" fill="none" stroke-linecap="round">
         <path d="M-10 118 C60 104 120 96 190 70 S280 30 320 24" stroke="var(--bg)" stroke-width="14"/>
         <path d="M-10 118 C60 104 120 96 190 70 S280 30 320 24" stroke="#f2c230" stroke-width="3" opacity=".9"/>
         <path d="M40 -10 L80 170M150 -10 L130 170M230 -10 L250 170M-10 40 L320 60M-10 150 L320 140" stroke="var(--bg)" stroke-width="7" opacity=".9"/>
         <path d="M0 0 L300 0" stroke="none"/>
       </svg>
       <svg class="pinm" viewBox="0 0 24 24"><path d="M12 23s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13z" fill="#18181b"/><circle cx="12" cy="10" r="3.2" fill="#f2c230"/></svg>
     </div>
     <div class="mapinfo"><small>${t.addr}</small><b>${t.addrV}</b>
       <small class="maplbl">${t.map}</small>
       <div class="maplinks">${(CONFIG.maps||[]).map(m=>`<a class="mapgo" href="${esc(safeUrl(m.url))}" target="_blank" rel="noopener noreferrer">${PIN}<span>${esc(t["app_"+m.app]||m.app)}</span></a>`).join("")}</div>
     </div>
   </div>
   <div class="vcard card"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg><div class="grow"><small>${t.phone}</small><a href="${esc(safeUrl("tel:"+CONFIG.phone,["tel:"]))}"><b class="ltr">${esc(CONFIG.phoneDisplay)}</b></a></div><button type="button" class="pill" data-copy="${esc(CONFIG.phoneCopy)}">${lang==="fa"?"کپی":"Copy"}</button></div>
   <a class="vcard card" href="${esc(safeUrl("https://instagram.com/"+encodeURIComponent(CONFIG.instagram)+"/"))}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg><div><small>${t.insta}</small><b class="ltr">@${esc(CONFIG.instagram)}</b></div></a>`;
  document.getElementById("vgrid").innerHTML=v; document.getElementById("vgrid2").innerHTML=v;
  renderFilters(); render(); updateBill(); renderHours(); renderCopy(); syncBarH();
  document.getElementById("infoBtn").setAttribute("aria-label", t.info); document.getElementById("clearQ").setAttribute("aria-label", t.clearSearch); document.getElementById("filterBtn").setAttribute("aria-label", t.filter); if(detailId && document.getElementById('detailSheet').classList.contains('open')) drawDetail();
}

/* ---------- bill ---------- */
function updateBill(){
  const t=T[lang], ids=Object.keys(bill);
  const count=ids.reduce((a,k)=>a+bill[k],0), sum=ids.reduce((a,k)=>a+bill[k]*ITEMS[k].p,0);
  document.getElementById("billbar").classList.toggle("up",count>0);
  const bc=document.getElementById("bCount"); if(bc.textContent!==D(count)){ bc.textContent=D(count); bc.classList.remove("bump"); void bc.offsetWidth; bc.classList.add("bump"); }
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
function change(k,d){ if(d>0 && navigator.vibrate) try{ navigator.vibrate(8); }catch (e) { /* optional feature */ } bill[k]=(bill[k]||0)+d; if(bill[k]<=0) delete bill[k]; updateBill(); refreshAdds(); }
/* switch the espresso bean: only its price, + button and choice buttons change */
function setBean(i){
  const it = findItem("e"); it.sel = i;
  const row = document.querySelector('#menu [data-open="e"]'); if (!row) return;
  const key = "e"+i, add = row.querySelector("[data-add]");
  row.querySelector(".price").innerHTML = `${D(it.beans[i][2])} <small>${T[lang].unit}</small>`;
  add.dataset.add = key; add.setAttribute("aria-label", ITEMS[key][lang]);
  row.querySelectorAll("[data-bean]").forEach(b => { const on = +b.dataset.bean === i; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
  refreshAdds();
}
function refreshAdds(){ document.querySelectorAll("[data-add]").forEach(b=>{ const q=bill[b.dataset.add]||0; b.classList.toggle("has",!!q); b.textContent=q?D(q):"+"; }); }

/* ---------- events ---------- */
document.getElementById("menu").addEventListener("click",e=>{
  const bean=e.target.closest("[data-bean]");
  if(bean){ setBean(+bean.dataset.bean); return; }
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

/* ---------- sheets: open/close with focus handling, Back button and swipe-down ---------- */
const openStack = []; let lastFocus = null;
const focusables = el => [...el.querySelectorAll('button,[href],input,[tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled && x.offsetParent !== null);
function openSheet(id){
  const s = document.getElementById(id); if (s.classList.contains("open")) return;
  document.getElementById("toast").classList.remove("show");
  if (!openStack.length) lastFocus = document.activeElement;
  s.classList.add("open"); openStack.push(id); document.body.style.overflow = "hidden";
  try { history.pushState({ sheet: id }, ""); } catch (e) { /* optional feature */ }
  const f = focusables(s.querySelector(".panel")); (s.querySelector(".btn-dark,.btn-brand") || f[0] || s).focus({ preventScroll: true });
}
function closeSheet(id, fromHistory){
  const s = document.getElementById(id); if (!s.classList.contains("open")) return;
  s.classList.remove("open"); openStack.splice(openStack.indexOf(id), 1);
  const p = s.querySelector(".panel"); p.style.transform = ""; p.classList.remove("dragging");
  if (!openStack.length){ document.body.style.overflow = ""; if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
  if (!fromHistory){ try { if (history.state && history.state.sheet === id) history.back(); } catch (e) { /* optional feature */ } }
}
addEventListener("popstate", () => { const id = openStack[openStack.length - 1]; if (id) closeSheet(id, true); });
document.addEventListener("keydown", e => {
  if (e.key !== "Tab" || !openStack.length) return;
  const f = focusables(document.getElementById(openStack[openStack.length - 1]).querySelector(".panel")); if (!f.length) return;
  if (e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length-1].focus(); }
  else if (!e.shiftKey && document.activeElement === f[f.length-1]){ e.preventDefault(); f[0].focus(); }
});
// swipe a bottom sheet down to close it (phones only: sheets are centred from 700px up)
document.querySelectorAll(".sheet .panel").forEach(p => {
  let y0 = null, dy = 0;
  p.addEventListener("touchstart", e => { if (innerWidth >= 700 || p.scrollTop > 0) return; y0 = e.touches[0].clientY; dy = 0; }, { passive: true });
  p.addEventListener("touchmove", e => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); if (dy > 0){ p.classList.add("dragging"); p.style.transform = `translateY(${dy}px)`; } }, { passive: true });
  p.addEventListener("touchend", () => { if (y0 == null) return; const id = p.closest(".sheet").id; p.classList.remove("dragging");
    if (dy > 110) closeSheet(id); else p.style.transform = ""; y0 = null; });
});
document.getElementById("openBill").addEventListener("click",()=>openSheet("billSheet"));
document.getElementById("infoBtn").addEventListener("click",()=>openSheet("infoSheet"));
document.querySelectorAll(".sheet").forEach(s=>s.addEventListener("click",e=>{
  if(e.target.closest("[data-close]")) return closeSheet(s.id);
  const i=e.target.closest("[data-inc]"), d=e.target.closest("[data-dec]");
  if(i) change(i.dataset.inc,1); if(d) change(d.dataset.dec,-1);
}));
addEventListener("keydown",e=>{ if(e.key==="Escape" && openStack.length && filterPop.hidden) closeSheet(openStack[openStack.length-1]); });
document.getElementById("pMinus").addEventListener("click",()=>{ people=Math.max(1,people-1); updateBill(); });
document.getElementById("pPlus").addEventListener("click",()=>{ people=Math.min(20,people+1); updateBill(); });
document.getElementById("clearBill").addEventListener("click",()=>{ for(const k in bill) delete bill[k]; people=1; updateBill(); refreshAdds(); });
document.addEventListener("click",async e=>{
  const c=e.target.closest("[data-copy]"); if(!c) return;
  try { await copyText(c.dataset.copy); toast(T[lang].copied); } catch (e) { toast(CONFIG.phoneDisplay); }
});

/* copy to the clipboard; older phones without the clipboard API use a hidden text box */
function copyText(s){
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(s);
  return new Promise((ok, fail) => {
    const ta = document.createElement("textarea"); ta.value = s; ta.setAttribute("readonly", "");
    ta.className = "sr"; document.body.appendChild(ta); ta.select();
    const done = document.execCommand && document.execCommand("copy"); ta.remove();
    if (done) ok(); else fail(new Error("copy"));
  });
}
let tt; function toast(m){ const t=document.getElementById("toast"); t.textContent=m; t.classList.add("show"); clearTimeout(tt); tt=setTimeout(()=>t.classList.remove("show"),1500); }

/* scroll spy + sticky border */
/* Category bar: tapping a chip scrolls the page to its section; the chip bar itself only
   scrolls sideways (never the page), and the highlight is held on the tapped chip until the
   page has finished scrolling, so it never flickers through the sections in between. */
const chipsEl = document.getElementById("chips");
let lockTo = null, lockTimer = 0;
const barH = () => { const ab = document.getElementById("chipsBar"); return ab.offsetHeight + (parseFloat(getComputedStyle(ab).top) || 0); };
function syncBarH(){ document.documentElement.style.setProperty("--bar-h", barH() + "px"); }
addEventListener("resize", syncBarH);
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
  const first = !ind.style.width;
  if (first) ind.style.transition = "none";
  ind.style.opacity = 1; ind.style.width = on.offsetWidth + "px"; ind.style.transform = `translateX(${on.offsetLeft}px)`;
  if (first){ void ind.offsetWidth; ind.style.transition = ""; }
}
addEventListener("resize", moveIndicator);
document.fonts && document.fonts.ready.then(moveIndicator);
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
function goTo(id){
  const sec = document.getElementById(id); if (!sec) return;
  const top = sec.getBoundingClientRect().top + scrollY - barH() + 1;
  lockTo = id; setActiveChip(id);
  scrollTo({ top, behavior: reduceMotion() ? "auto" : "smooth" });
  clearTimeout(lockTimer); lockTimer = setTimeout(() => { lockTo = null; }, 1200);
}
addEventListener("scrollend", e => { if (e.target !== document && e.target !== window) return; if (lockTo) { clearTimeout(lockTimer); lockTimer = setTimeout(() => { lockTo = null; }, 80); } });
function spy(){
  document.getElementById("chipsBar").classList.toggle("stuck", scrollY > 4);
  if (lockTo) return;
  const line = barH() + 24; let cur = null;
  for (const s of document.querySelectorAll(".sec:not([hidden])")) if (s.getBoundingClientRect().top <= line) cur = s.id;
  if (!cur){ const f = document.querySelector(".sec:not([hidden])"); cur = f && f.id; }
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2){ const all = document.querySelectorAll(".sec:not([hidden])"); cur = all.length ? all[all.length-1].id : cur; }
  setActiveChip(cur);
}
addEventListener("scroll",spy,{passive:true});
for (const ev of ["wheel","touchstart","keydown"]) addEventListener(ev, () => { if (lockTo){ lockTo = null; clearTimeout(lockTimer); } }, {passive:true});

/* ---------- filters ---------- */
function renderFilters(){
  const t=T[lang];
  document.getElementById("filters").innerHTML=["cf","pm"].map(f=>`<button type="button" class="fbtn" data-f="${f}" aria-pressed="${filt.has(f)}">${t['tag_'+f]}</button>`).join("");
  document.getElementById("fdot").hidden = filt.size === 0;
}
document.getElementById("filters").addEventListener("click",e=>{
  const b=e.target.closest("[data-f]"); if(!b) return;
  const f=b.dataset.f; filt.has(f)?filt.delete(f):filt.add(f); renderFilters(); applyFilter();
});

/* ---------- detail card ---------- */
let detailId=null;
function findItem(id){ for(const c of MENU) for(const it of c.items) if(it.id===id) return it; }
/* Large photos: each is downloaded once and kept as a ready <img>, so reopening an item
   (or tapping + / − inside it) shows the photo instantly instead of fading it in again. */
const bigPics = new Map();
/* does this browser show .webp? The menu photos tell us: the browser picked one source for them */
const webpOK = () => { const i = document.querySelector("#menu picture img"); return !i || !i.currentSrc || /\.webp(\?|$)/.test(i.currentSrc); };
function bigPic(f, lazy = false){
  let im = bigPics.get(f);
  if (!im) {
    im = new Image(); im.decoding = "async"; im.className = "hi"; if (lazy) im.loading = "lazy";
    im.addEventListener("load", () => im.classList.add("ld"), { once: true });
    im.src = webpOK() ? `img/lg/${encodeURIComponent(f)}.webp` : `img/lg/jpg/${encodeURIComponent(f)}.jpg`;
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
  const d = DESC[it.en], desc = d ? d[lang==="fa"?0:1] : "";
  const ingr = lang==="fa"?it.dfa:it.den;
  const ps = pics(it), many = ps.length > 1, own = Array.isArray(IMG[it.en]);
  document.getElementById("dPanel").innerHTML = `
    <div class="grab" aria-hidden="true"></div><div class="dimg${own?" own":""}${many?" multi":""}">${ps.length?`<div class="gal"${many?` role="group" aria-label="${t.photos}"`:""}>${ps.map(f=>`<div class="sl">${RO.picHTML(f, 'class="lo ld" alt="" aria-hidden="true"')}</div>`).join("")}</div>`:""}${many?`<div class="gdots">${ps.map((_,i)=>`<button type="button" data-pic="${i}" aria-label="${t.photo} ${D(i+1)} / ${D(ps.length)}"${i?"":' aria-current="true"'}></button>`).join("")}</div>`:""}<button type="button" class="dclose" data-close aria-label="${t.close}">✕</button>${many?galNavHTML(t):""}</div>
    <div class="dbody"><div class="dbin">
      <h2 id="dName">${esc(name)}</h2><div class="alt">${esc(alt)}</div>
      ${tagsHTML(it)}
      ${desc?`<p class="desc">${esc(desc)}</p>`:""}
      ${ingr && it.cat.id==="infusion"?`<p class="ingr">${t.ingr}: ${esc(ingr)}</p>`:(ingr&&!desc?`<p class="desc">${esc(ingr)}</p>`:"")}
      ${it.espresso?`<div class="beans">${it.beans.map((bb,i)=>`<button type="button" class="bean${i===it.sel?" on":""}" aria-pressed="${i===it.sel}" data-dbean="${i}">${esc(lang==="fa"?bb[0]:bb[1])}</button>`).join("")}</div>`:""}
      <div class="dbuy">${buyHTML(it)}</div>
      <p class="ask">${t.ask}</p>
      ${sibHTML(t)}
    </div></div>`;
  document.querySelectorAll("#dPanel .sl").forEach((sl, i) => {
    const hi = bigPic(ps[i], i > 0);
    hi.alt = many ? `${name} (${D(i+1)})` : name;
    if (hi.complete && hi.naturalWidth) hi.classList.add("ld", "now"); else hi.classList.remove("now");
    sl.appendChild(hi);
  });
  const gal = document.querySelector("#dPanel .gal");
  if (many) { gal.addEventListener("scroll", galSync, { passive: true }); galSync(); }
  [-1, 1].forEach(s => warm(neighbour(s)));
}
function buyHTML(it){
  const t = T[lang], key = it.espresso ? "e"+it.sel : it.id;
  const price = it.espresso ? it.beans[it.sel][2] : it.p, q = bill[key]||0;
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
    // "previous" reads arrow, photo, name; "next" mirrors it: name, photo, arrow
    const parts = [`<span class="sib-ic">${step < 0 ? BACK() : FWD()}</span>`,
      `<span class="sib-pic">${f ? RO.picHTML(f, 'alt="" class="ld"') : svg(it.icon)}</span>`,
      `<span class="sib-t"><small>${step < 0 ? t.prev : t.next}</small><b>${esc(it[lang])}</b></span>`];
    return `<button type="button" class="sib ${step < 0 ? "prev" : "next"}" data-step="${step}" aria-label="${step < 0 ? t.prevItem : t.nextItem}: ${esc(it[lang])}">${(step < 0 ? parts : parts.reverse()).join("")}</button>`;
  };
  return `<nav class="dsib" aria-label="${t.moreItems}">${btn(neighbour(-1), -1)}${btn(neighbour(1), 1)}</nav>`;
}
/* photo arrows for galleries: only on computers (on phones the photos are swiped) */
function galNavHTML(t){
  return `<button type="button" class="gnav gprev" data-gal="-1" aria-label="${t.prevPhoto}">${BACK()}</button><button type="button" class="gnav gnext" data-gal="1" aria-label="${t.nextPhoto}">${FWD()}</button>`;
}
function galTo(i){
  const g = document.querySelector("#dPanel .gal"); if (!g) return;
  const n = g.children.length; i = Math.max(0, Math.min(n - 1, i));
  // move by the on-screen distance to the wanted photo: correct in every browser's right-to-left scroll model
  const delta = g.children[i].getBoundingClientRect().left - g.getBoundingClientRect().left;
  // an absolute target (not scrollBy): a relative scroll would be stopped at every photo by scroll-snap-stop
  const to = g.scrollLeft + delta;
  if ("scrollBehavior" in document.documentElement.style && !reduceMotion()) g.scrollTo({ left: to, behavior: "smooth" });
  else g.scrollLeft = to;
}
/* which photo is showing: the one whose left edge is nearest the strip's left edge */
function galIndex(){
  const g = document.querySelector("#dPanel .gal"); if (!g || !g.clientWidth) return 0;
  const x = g.getBoundingClientRect().left; let best = 0, gap = Infinity;
  [].forEach.call(g.children, (s, i) => { const d = Math.abs(s.getBoundingClientRect().left - x); if (d < gap) { gap = d; best = i; } });
  return best;
}
function galSync(){
  const g = document.querySelector("#dPanel .gal"); if (!g) return;
  const i = galIndex(), n = g.children.length;
  document.querySelectorAll("#dPanel [data-pic]").forEach(d => setFlag(d, "aria-current", +d.dataset.pic === i));
  const pv = document.querySelector("#dPanel .gprev"), nx = document.querySelector("#dPanel .gnext");
  if (pv) pv.disabled = i === 0; if (nx) nx.disabled = i === n - 1;
}
function stepDetail(step){
  const id = neighbour(step); if (!id) return;
  detailId = id; const panel = document.getElementById("dPanel");
  panel.classList.remove("slide-next","slide-prev"); void panel.offsetWidth;
  const hadFocus = document.activeElement && document.activeElement.closest(".sib");
  drawDetail(); panel.classList.add(step > 0 ? "slide-next" : "slide-prev");
  if (hadFocus) (panel.querySelector(step > 0 ? ".sib.next" : ".sib.prev") || panel.querySelector(".sib")).focus({ preventScroll: true });
  else panel.scrollTop = 0;
}
addEventListener("keydown", e => {
  if (openStack[openStack.length-1] !== "detailSheet") return;
  if (e.key === "ArrowLeft") stepDetail(lang === "fa" ? 1 : -1);
  if (e.key === "ArrowRight") stepDetail(lang === "fa" ? -1 : 1);
});
document.getElementById("dPanel").addEventListener("click",e=>{
  const sb=e.target.closest("[data-step]"); if(sb){ stepDetail(+sb.dataset.step); return; }
  const dot=e.target.closest("[data-pic]"); if(dot){ galTo(+dot.dataset.pic); return; }
  const ga=e.target.closest("[data-gal]"); if(ga){ galTo(galIndex() + +ga.dataset.gal); return; }
  const a=e.target.closest("[data-dadd]"); if(a){ change(a.dataset.dadd,1); refreshBuy(); return; }
  const b=e.target.closest("[data-dbean]"); if(b){ setBean(+b.dataset.dbean); refreshBuy(); return; }
  if(e.target.closest("[data-inc]")||e.target.closest("[data-dec]")) setTimeout(refreshBuy,0);
});

/* ---------- theme ---------- */
const themeBtn=document.getElementById("themeBtn");
function setTheme(t,save){
  document.documentElement.setAttribute("data-theme",t);
  document.getElementById("themeColor").setAttribute("content", t==="dark"?"#121214":"#ffffff");
  themeBtn.setAttribute("aria-label", lang==="fa" ? (t==="dark"?"حالت روز":"حالت شب") : (t==="dark"?"Light mode":"Dark mode"));
  themeBtn.setAttribute("aria-pressed", t==="dark");
  if(save) store.set("ro-theme", t);
}
themeBtn.addEventListener("click",()=>setTheme(document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark",true));
(() => { // follow the phone's dark/light setting unless the guest picked one (old Safari only has addListener)
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const follow = e => { const saved = store.get("ro-theme"); if (saved !== "light" && saved !== "dark") setTheme(e.matches ? "dark" : "light", false); };
  if (mq.addEventListener) mq.addEventListener("change", follow); else if (mq.addListener) mq.addListener(follow);
})();

/* ---------- filter popover ---------- */
const filterBtn = document.getElementById("filterBtn"), filterPop = document.getElementById("filterPop");
function setFilterPop(open){ filterPop.hidden = !open; filterBtn.setAttribute("aria-expanded", open); }
filterBtn.addEventListener("click", e => { e.stopPropagation(); setFilterPop(filterPop.hidden); });
// a tap outside the open filter box only closes it (it does not also open an item underneath)
document.addEventListener("click", e => { if (!filterPop.hidden && !e.target.closest("#filterPop") && !e.target.closest("#filterBtn")){ e.stopPropagation(); e.preventDefault(); setFilterPop(false); } }, true);
addEventListener("keydown", e => { if (e.key === "Escape" && !filterPop.hidden){ setFilterPop(false); filterBtn.focus(); } });

/* ---------- opening hours (CONFIG.hours); today is worked out in Iran time ---------- */
const DAY_KEYS = ["sat","sun","mon","tue","wed","thu","fri"];
function tehranNow(){
  try {
    const p = {};
    new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Tehran",weekday:"short",hour:"2-digit",minute:"2-digit",hour12:false})
      .formatToParts(new Date()).forEach(x => { p[x.type] = x.value; });
    const idx = {Sat:0,Sun:1,Mon:2,Tue:3,Wed:4,Thu:5,Fri:6}[p.weekday];
    if (idx !== undefined) return { day: idx, min: (+p.hour % 24)*60 + (+p.minute) };
  } catch (e) { /* older phones without time zone data: work it out below */ }
  const d = new Date(Date.now() + 3.5 * 3600e3);   // Iran is UTC+3:30 all year (no daylight saving since 2022)
  return { day: (d.getUTCDay() + 1) % 7, min: d.getUTCHours() * 60 + d.getUTCMinutes() };
}
function renderHours(){
  for (const id of ["hours","hours2"]) renderHoursInto(document.getElementById(id));
}
function renderHoursInto(box){
  const H = CONFIG.hours, t = T[lang];
  if (!box) return;
  if (!H){ box.hidden = true; return; }
  const today = tehranNow().day;
  box.innerHTML = `<div class="hours-head"><b>${t.hours}</b></div>
    <table>${hoursRows(H, today, t)}</table>`;
  box.hidden = false;
}
function hoursRows(H, today, t){
  const fmt = d => (d && d.length) ? d.map(([o,c]) => lang==="fa" ? `${D(o)} تا ${D(c)}` : `${o}–${c}`).join(lang==="fa"?"، ":", ") : t.closedDay;
  const all = DAY_KEYS.map(k => JSON.stringify(H[k] || []));
  if (all.every(x => x === all[0])) return `<tr class="today"><td>${t.everyDay}</td><td>${fmt(H[DAY_KEYS[0]])}</td></tr>`;
  return DAY_KEYS.map((k,i) => `<tr${i===today?' class="today"':''}><td>${t.days[i]}</td><td>${fmt(H[k])}</td></tr>`).join("");
}
/* Persian (solar) year, also on phones whose browser has no Persian calendar */
function persianYear(){
  try {
    const s = new Intl.DateTimeFormat("fa-IR-u-ca-persian",{year:"numeric"}).format(new Date()).replace(/\s*ه\.ش\.?/,"");
    const n = +s.replace(/[۰-۹]/g, c => "۰۱۲۳۴۵۶۷۸۹".indexOf(c));
    if (n > 1300 && n < 1600) return D(n);
  } catch (e) { /* fall through */ }
  const now = new Date(), g = now.getFullYear();
  const nowruz = new Date(g, 2, 21);              // the solar year starts on about 21 March
  return D(now >= nowruz ? g - 621 : g - 622);
}
function renderCopy(){
  const y = lang==="fa" ? persianYear() : new Date().getFullYear();
  document.getElementById("copy").textContent = `© ${y} ${T[lang].brandCopy}`;
}

/* ---------- offline + home screen (service worker on real hosts only) ---------- */
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => {}); });
}
addEventListener("offline", () => toast(T[lang].offline));

/* photos fade in when loaded (no layout change: their boxes already have a size) */
const picName = i => { const m = /([^/]+)\.(?:webp|jpg)$/.exec(i.currentSrc || i.getAttribute("src") || ""); return m ? decodeURIComponent(m[1]) : ""; };
document.addEventListener("load", e => { if (e.target.tagName === "IMG") { e.target.classList.add("ld"); seenPics.add(picName(e.target)); } }, true);
["pointerdown", "mouseover"].forEach(ev => document.getElementById("menu").addEventListener(ev, e => {
  const card = e.target.closest("[data-open]"); if (card) warm(card.dataset.open);
}, { passive: true }));
function markLoaded(){ document.querySelectorAll("img").forEach(i => { if (i.complete && i.naturalWidth) { i.classList.add("ld"); seenPics.add(picName(i)); } }); }

/* small comforts: Enter closes the phone keyboard; tapping the logo returns to the top */
qEl.addEventListener("keydown", e => { if (e.key === "Enter") qEl.blur(); });
document.querySelector(".appbar .brand").addEventListener("click", e => { e.preventDefault(); scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" }); });
document.getElementById("empty").addEventListener("click", e => { if (e.target.closest("#emptyClear")) document.getElementById("clearQ").click(); });

applyLang();
setTheme(document.documentElement.getAttribute("data-theme"),false);
