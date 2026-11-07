/* Ro Cafe menu: app logic. Reads CONFIG (data/config.js), T (data/strings.js), MENU/DESC/TAGS/IMG (data/menu.js). */
'use strict';
/* ---------- line illustrations ---------- */
const ICONS = {
  espresso:'<path d="M14 26h22v6a11 11 0 0 1-22 0z"/><path d="M36 28h3a4 4 0 0 1 0 8h-4"/><path d="M10 46h30"/><path d="M20 20c0-2 2-3 2-5M27 20c0-2 2-3 2-5"/>',
  cup:'<path d="M10 22h28l-2 18a6 6 0 0 1-6 5H18a6 6 0 0 1-6-5z"/><path d="M38 26h3a5 5 0 0 1 0 10h-4"/><path d="M15 27c3-3 6 2 9-1s6 2 9-1" /><path d="M8 50h34"/>',
  glass:'<path d="M15 10h20l-2 38H17z"/><path d="M15.6 22h18.8"/><path d="M16.2 30h17.6"/><path d="M20 15c2 1 6 1 10 0"/>',
  dripper:'<path d="M10 12h30l-9 16H19z"/><path d="M19 28h12v3H19z"/><path d="M14 36h22v10a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2z"/><path d="M36 39h3a3 3 0 0 1 0 6h-3"/><path d="M25 31v4"/>',
  cezve:'<path d="M14 18h16l-2 26a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3z"/><path d="M30 22l14-6"/><path d="M12 18h20"/><path d="M19 12c0-2 2-2 2-4M24 12c0-2 2-2 2-4"/>',
  coldbrew:'<path d="M16 8h18v6l3 4v28a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V18l3-4z"/><path d="M13 26h24"/><path d="M19 32h4v4h-4zM26 36h4v4h-4z"/>',
  mug:'<path d="M10 18h26v22a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z"/><path d="M36 22h4a5 5 0 0 1 0 10h-4"/><path d="M15 12c0-2 2-3 2-5M23 12c0-2 2-3 2-5M31 12c0-2 2-3 2-5"/>',
  istikan:'<path d="M17 14h16c0 6-3 8-3 13s4 7 4 13H16c0-6 4-8 4-13s-3-7-3-13z"/><path d="M12 44h26"/><path d="M20 33h10"/>',
  teapot:'<path d="M13 22h22v14a8 8 0 0 1-8 8h-6a8 8 0 0 1-8-8z"/><path d="M35 26h4a4 4 0 0 1 0 8h-4"/><path d="M13 27l-6-5v-3"/><path d="M19 22v-3h10v3"/><path d="M24 19v-3"/><path d="M28 30c-3 0-4 4-7 4"/>',
  shake:'<path d="M14 18h22l-3 30H17z"/><path d="M13 18c0-5 5-8 12-8s12 3 12 8"/><path d="M29 10l5-7"/><circle cx="25" cy="8" r="2"/><path d="M15 28h20"/>',
  iced:'<path d="M13 14h24l-3 34H16z"/><path d="M19 22h6v6h-6zM26 27h6v6h-6zM20 33h6v6h-6z"/><path d="M30 14l4-10"/>',
  lemon:'<path d="M14 14h22l-3 34H17z"/><circle cx="35" cy="14" r="6"/><path d="M35 8v12M29 14h12"/><path d="M20 24c1 6 0 12 2 18"/><path d="M28 26c-1 5 0 10-1 16"/>',
  matcha:'<path d="M8 22h34a17 15 0 0 1-34 0z"/><path d="M12 22c4-3 8 1 13-1s9 2 13-1"/><path d="M18 48h14"/><path d="M38 6l-8 14"/>',
  bottle:'<path d="M20 6h10v6l3 4v28a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4V16l3-4z"/><path d="M17 24h16v12H17z"/><path d="M20 6h10"/>',
  bomb:'<path d="M14 16h22l-3 32H17z"/><path d="M14 16c3-4 19-4 22 0"/><path d="M17 28h16M18 36h14"/><path d="M27 8l2-4 2 4"/>',
  affogato:'<path d="M10 26h30a15 13 0 0 1-30 0z"/><circle cx="25" cy="20" r="7"/><path d="M14 30c4 2 8 0 11 2s7 0 11-2"/>',
  cake:'<path d="M8 38l34-14v20H8z"/><path d="M8 38v6"/><path d="M8 38l34-14"/><path d="M8 32l20-8 14 0"/><path d="M8 32v6"/><path d="M28 24c0-4 4-5 4-9"/>',
  cookie:'<circle cx="25" cy="27" r="16"/><circle cx="19" cy="21" r="1.6"/><circle cx="29" cy="20" r="1.6"/><circle cx="31" cy="31" r="1.6"/><circle cx="20" cy="32" r="1.6"/><circle cx="25" cy="27" r="1"/>',
  croissant:'<path d="M5 34c2-12 12-20 20-20s18 8 20 20c-4 0-6-2-8-4-2 4-6 6-12 6s-10-2-12-6c-2 2-4 4-8 4z"/><path d="M17 18l3 12M25 14v16M33 18l-3 12"/>',
  baguette:'<path d="M5 30c0-6 8-12 20-12s20 6 20 12-8 6-20 6-20 0-20-6z"/><path d="M8 32c4-2 10-1 17-1s13-1 17 1"/><path d="M14 26c2 1 4 1 6 0M24 26c2 1 4 1 6 0M34 26c2 1 3 1 5 0"/>',
  plus:'<circle cx="25" cy="25" r="16"/><path d="M25 18v14M18 25h14"/>',
  shot:'<path d="M17 14h16l-2 30H19z"/><path d="M18 24h14"/><path d="M25 6v4"/>',
  milk:'<path d="M17 10h16v6l4 6v24a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2V22l4-6z"/><path d="M13 30h24"/>',
  syrup:'<path d="M20 4h10v6h-10z"/><path d="M18 10h14l2 6v28a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V16z"/><path d="M16 26h18"/>'
};

/* normalize items + ids */
const ITEMS = {}; let n = 0;
for (const c of MENU) c.items = c.items.map(x=>{
  if (x.espresso){ const it={...x,id:"e",sel:0,cat:c}; it.beans.forEach((b,i)=>{ITEMS["e"+i]={fa:"اسپرسو "+b[0],en:"Espresso, "+b[1],p:b[2]};}); return it; }
  const [fa,en,p,icon,dfa,den]=x, id="i"+(n++); const it={id,fa,en,p,icon,dfa,den,cat:c}; ITEMS[id]={fa,en,p}; return it;
});

/* ---------- state ---------- */
/* localStorage can be missing (private mode) or hold anything: read through these and validate. */
const store = {
  get(k){ try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v){ try { localStorage.setItem(k, v); } catch { /* storage unavailable: setting just isn't remembered */ } }
};
const LANGS = ["fa", "en"];
let lang = LANGS.includes(store.get("ro-lang")) ? store.get("ro-lang") : "fa";
let query = ""; const bill = {}; let people = 1;

const faDigits = s => String(s).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d]);
const D = s => lang==="fa" ? faDigits(s) : String(s);
const money = k => { const v=(k*1000).toLocaleString("en-US"); return lang==="fa" ? faDigits(v).replace(/,/g,"٬")+" تومان" : v+" Toman"; };
const norm = s => (s||"").replace(/‌/g," ").replace(/ي/g,"ی").replace(/ك/g,"ک").replace(/\s+/g," ").trim().toLowerCase();
const PIN = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12z" fill="currentColor"/><circle cx="12" cy="10" r="2.6" fill="var(--bg)"/></svg>`;
/* only allow expected link types from the settings file (never javascript: etc.) */
const safeUrl = (u, protocols = ["https:"]) => { try { const x = new URL(u, location.href); return protocols.includes(x.protocol) ? x.href : "#"; } catch { return "#"; } };
const esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let thumbN = 0;
const seenPics = new Set(); // photo addresses already shown once in this visit
const thumb = it => { const f = IMG[it.en]; const eager = thumbN++ < 6; const src = `img/${encodeURIComponent(f)}.webp`; return f ? `<img src="${src}"${seenPics.has(src)?' class="ld"':""} alt="" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async" width="104" height="104">` : svg(it.icon); };
const tagsHTML = it => { const t=TAGS[it.en]; return t&&t.length ? `<div class="tags">${t.map(x=>`<span class="tag ${esc(x)}">${esc(T[lang]['tag_'+x]||x)}</span>`).join('')}</div>` : ''; };
let filt = new Set();
const svg = k => `<svg viewBox="0 0 50 50" aria-hidden="true">${ICONS[k]||ICONS.cup}</svg>`;
function hl(t){ if(!query) return esc(t); const s=norm(t), i=s.indexOf(query); if(i<0||s.length!==t.length) return esc(t); return esc(t.slice(0,i))+"<mark>"+esc(t.slice(i,i+query.length))+"</mark>"+esc(t.slice(i+query.length)); }

function matches(it,c){
  for(const f of filt){ if(!(TAGS[it.en]||[]).includes(f)) return false; }
  if(!query) return true;
  const hay=[it.fa,it.en,it.dfa,it.den,c.fa,c.en].concat(it.beans?it.beans.flatMap(b=>[b[0],b[1]]):[]).map(norm).join(" | ");
  return hay.includes(query);
}

function itemHTML(it){
  const t=T[lang], name = lang==="fa"?it.fa:it.en, sub = lang==="fa"?it.dfa:it.den;
  if(it.espresso){
    const b=it.beans[it.sel], key="e"+it.sel, q=bill[key]||0;
    return `<div class="it has-beans" data-open="${it.id}" role="button" tabindex="0"><div class="pic">${thumb(it)}</div>
      <div class="info"><h3>${hl(name)}</h3><span class="price num">${D(b[2])} <small>${t.unit}</small></span></div>
      <button type="button" class="add${q?" has":""} num" data-add="${key}" aria-label="${esc(ITEMS[key][lang])}">${q?D(q):"+"}</button>
      <div class="beans" role="radiogroup" aria-label="${t.bean}">${it.beans.map((bb,i)=>`<button type="button" class="bean${i===it.sel?" on":""}" role="radio" aria-checked="${i===it.sel}" data-bean="${i}">${esc(lang==="fa"?bb[0]:bb[1])}</button>`).join("")}</div></div>`;
  }
  const q=bill[it.id]||0;
  return `<div class="it" data-open="${it.id}" role="button" tabindex="0"><div class="pic">${thumb(it)}</div>
    <div class="info"><h3>${hl(name)}</h3>${sub?`<p>${hl(sub)}</p>`:""}${tagsHTML(it)}<span class="price num">${D(it.p)} <small>${t.unit}</small></span></div>
    <button type="button" class="add${q?" has":""} num" data-add="${it.id}" aria-label="${esc(name)}">${q?D(q):"+"}</button></div>`;
}

/* Build the whole menu once (and again only when the language changes). */
function render(){
  thumbN = 0;
  document.getElementById("menu").innerHTML = MENU.map(c =>
    `<section class="sec" id="${esc(c.id)}" data-tint="${esc(c.tint.replace(/^--t-/,""))}"><div class="sec-h"><h2>${esc(lang==="fa"?c.fa:c.en)}</h2></div><div class="grid">${c.items.map(itemHTML).join("")}</div></section>`).join("");
  markLoaded();
  document.getElementById("visit").hidden=false;
  document.getElementById("chips").innerHTML=MENU.map(c=>`<button type="button" class="chip" data-go="${esc(c.id)}">${esc(lang==="fa"?c.fa:c.en)}</button>`).join("")+`<span class="chip-ind" aria-hidden="true"></span>`;
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
      const h = node.querySelector("h3"), sub = node.querySelector(".info p");
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
function change(k,d){ if(d>0 && navigator.vibrate) try{ navigator.vibrate(8); }catch { /* optional feature */ } bill[k]=(bill[k]||0)+d; if(bill[k]<=0) delete bill[k]; updateBill(); refreshAdds(); }
/* switch the espresso bean: only its price, + button and choice buttons change */
function setBean(i){
  const it = findItem("e"); it.sel = i;
  const row = document.querySelector('#menu [data-open="e"]'); if (!row) return;
  const key = "e"+i, add = row.querySelector("[data-add]");
  row.querySelector(".price").innerHTML = `${D(it.beans[i][2])} <small>${T[lang].unit}</small>`;
  add.dataset.add = key; add.setAttribute("aria-label", ITEMS[key][lang]);
  row.querySelectorAll("[data-bean]").forEach(b => { const on = +b.dataset.bean === i; b.classList.toggle("on", on); b.setAttribute("aria-checked", on); });
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
  try { history.pushState({ sheet: id }, ""); } catch { /* optional feature */ }
  const f = focusables(s.querySelector(".panel")); (s.querySelector(".btn-dark,.btn-brand") || f[0] || s).focus({ preventScroll: true });
}
function closeSheet(id, fromHistory){
  const s = document.getElementById(id); if (!s.classList.contains("open")) return;
  s.classList.remove("open"); openStack.splice(openStack.indexOf(id), 1);
  const p = s.querySelector(".panel"); p.style.transform = ""; p.classList.remove("dragging");
  if (!openStack.length){ document.body.style.overflow = ""; if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
  if (!fromHistory){ try { if (history.state && history.state.sheet === id) history.back(); } catch { /* optional feature */ } }
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
document.getElementById("menu").addEventListener("keydown",e=>{ if((e.key==="Enter"||e.key===" ")&&e.target.matches(".it")){ e.preventDefault(); openDetail(e.target.dataset.open); } });
addEventListener("keydown",e=>{ if(e.key==="Escape" && openStack.length && filterPop.hidden) closeSheet(openStack[openStack.length-1]); });
document.getElementById("pMinus").addEventListener("click",()=>{ people=Math.max(1,people-1); updateBill(); });
document.getElementById("pPlus").addEventListener("click",()=>{ people=Math.min(20,people+1); updateBill(); });
document.getElementById("clearBill").addEventListener("click",()=>{ for(const k in bill) delete bill[k]; people=1; updateBill(); refreshAdds(); });
document.addEventListener("click",async e=>{
  const c=e.target.closest("[data-copy]"); if(!c) return;
  try{ await navigator.clipboard.writeText(c.dataset.copy); toast(T[lang].copied); }catch { toast(CONFIG.phoneDisplay); }
});

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
function bigPic(f){
  let im = bigPics.get(f);
  if (!im) {
    im = new Image(); im.decoding = "async"; im.className = "hi";
    im.addEventListener("load", () => im.classList.add("ld"), { once: true });
    im.src = `img/lg/${encodeURIComponent(f)}.webp`;
    bigPics.set(f, im);
  }
  return im;
}
const warm = id => { const it = id && findItem(id), f = it && IMG[it.en]; if (f) bigPic(f); };
function openDetail(id){ detailId=id; drawDetail(); openSheet("detailSheet"); }
function drawDetail(){
  const it=findItem(detailId); if(!it) return;
  const t=T[lang], other = lang==="fa"?"en":"fa";
  const name = it[lang], alt = it[other];
  const d = DESC[it.en], desc = d ? d[lang==="fa"?0:1] : "";
  const ingr = lang==="fa"?it.dfa:it.den;
  const f = IMG[it.en];
  document.getElementById("dPanel").innerHTML = `
    <div class="grab" aria-hidden="true"></div><div class="dimg">${f?`<img class="lo ld" src="img/${encodeURIComponent(f)}.webp" alt="" aria-hidden="true">`:""}<button type="button" class="dclose" data-close aria-label="${t.close}">✕</button>${navHTML(t)}</div>
    <div class="dbody">
      <h2 id="dName">${esc(name)}</h2><div class="alt">${esc(alt)}</div>
      ${tagsHTML(it)}
      ${desc?`<p class="desc">${esc(desc)}</p>`:""}
      ${ingr && it.cat.id==="infusion"?`<p class="ingr">${t.ingr}: ${esc(ingr)}</p>`:(ingr&&!desc?`<p class="desc">${esc(ingr)}</p>`:"")}
      ${it.espresso?`<div class="beans">${it.beans.map((bb,i)=>`<button type="button" class="bean${i===it.sel?" on":""}" data-dbean="${i}">${esc(lang==="fa"?bb[0]:bb[1])}</button>`).join("")}</div>`:""}
      <div class="dbuy">${buyHTML(it)}</div>
      <p class="ask">${t.ask}</p>
    </div>`;
  if (f) {
    const hi = bigPic(f), box = document.querySelector("#dPanel .dimg");
    hi.alt = name;
    if (hi.complete && hi.naturalWidth) hi.classList.add("ld", "now"); else hi.classList.remove("now");
    box.insertBefore(hi, box.querySelector(".dclose"));
  }
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
  document.querySelectorAll("#dPanel [data-dbean]").forEach(b => b.classList.toggle("on", +b.dataset.dbean === it.sel));
}
/* move between items inside the open card: in the order shown on the page (current filters/search) */
const orderIds = () => [...document.querySelectorAll("#menu .sec:not([hidden]) .it:not([hidden])")].map(e => e.dataset.open);
function neighbour(step){ const ids = orderIds(), i = ids.indexOf(detailId); return i < 0 ? null : ids[i + step] || null; }
const CHEV = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
function navHTML(t){
  const prev = neighbour(-1), next = neighbour(1);
  // physical sides follow reading direction: in Persian "next" sits on the left
  return `<div class="dnav">${prev?`<button type="button" class="dprev" data-step="-1" aria-label="${t.prevItem}">${CHEV(lang==="fa"?"M9 6l6 6-6 6":"M15 6l-6 6 6 6")}</button>`:""}${next?`<button type="button" class="dnext" data-step="1" aria-label="${t.nextItem}">${CHEV(lang==="fa"?"M15 6l-6 6 6 6":"M9 6l6 6-6 6")}</button>`:""}</div>`;
}
function stepDetail(step){
  const id = neighbour(step); if (!id) return;
  detailId = id; const panel = document.getElementById("dPanel");
  panel.classList.remove("slide-next","slide-prev"); void panel.offsetWidth;
  drawDetail(); panel.classList.add(step > 0 ? "slide-next" : "slide-prev"); panel.scrollTop = 0;
}
addEventListener("keydown", e => {
  if (openStack[openStack.length-1] !== "detailSheet") return;
  if (e.key === "ArrowLeft") stepDetail(lang === "fa" ? 1 : -1);
  if (e.key === "ArrowRight") stepDetail(lang === "fa" ? -1 : 1);
});
(() => { // horizontal swipe on the photo
  const p = document.getElementById("dPanel"); let x0 = null, y0 = 0;
  p.addEventListener("touchstart", e => { if (!e.target.closest(".dimg")) return; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  p.addEventListener("touchend", e => { if (x0 == null) return; const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5){ const forward = lang === "fa" ? dx > 0 : dx < 0; stepDetail(forward ? 1 : -1); } }, { passive: true });
})();
document.getElementById("dPanel").addEventListener("click",e=>{
  const sb=e.target.closest("[data-step]"); if(sb){ stepDetail(+sb.dataset.step); return; }
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
matchMedia("(prefers-color-scheme: dark)").addEventListener("change",e=>{
  const saved = store.get("ro-theme");
  if(saved!=="light"&&saved!=="dark") setTheme(e.matches?"dark":"light",false);
});

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
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Tehran",weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date()).map(x=>[x.type,x.value]));
  const idx = {Sat:0,Sun:1,Mon:2,Tue:3,Wed:4,Thu:5,Fri:6}[p.weekday];
  return { day: idx, min: (+p.hour % 24)*60 + (+p.minute) };
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
function renderCopy(){
  const y = lang==="fa" ? new Intl.DateTimeFormat("fa-IR-u-ca-persian",{year:"numeric"}).format(new Date()).replace(/\s*ه\.ش\.?/,"") : new Date().getFullYear();
  document.getElementById("copy").textContent = `© ${y} ${T[lang].brandCopy}`;
}

/* ---------- offline + home screen (service worker on real hosts only) ---------- */
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => {}); });
}
addEventListener("offline", () => toast(T[lang].offline));

/* photos fade in when loaded (no layout change: their boxes already have a size) */
document.addEventListener("load", e => { if (e.target.tagName === "IMG") { e.target.classList.add("ld"); seenPics.add(e.target.getAttribute("src")); } }, true);
["pointerdown", "mouseover"].forEach(ev => document.getElementById("menu").addEventListener(ev, e => {
  const card = e.target.closest("[data-open]"); if (card) warm(card.dataset.open);
}, { passive: true }));
function markLoaded(){ document.querySelectorAll("img").forEach(i => { if (i.complete && i.naturalWidth) { i.classList.add("ld"); seenPics.add(i.getAttribute("src")); } }); }

/* small comforts: Enter closes the phone keyboard; tapping the logo returns to the top */
qEl.addEventListener("keydown", e => { if (e.key === "Enter") qEl.blur(); });
document.querySelector(".appbar .brand").addEventListener("click", e => { e.preventDefault(); scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" }); });
document.getElementById("empty").addEventListener("click", e => { if (e.target.closest("#emptyClear")) document.getElementById("clearQ").click(); });

applyLang();
setTheme(document.documentElement.getAttribute("data-theme"),false);
