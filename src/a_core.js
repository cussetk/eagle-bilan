import { DEFAULT_CONFIG, STATUTS, LIENS, USAGES } from "./config.js";
import { NeonStore, DemoStore, authMessage } from "./store.js";

/* =====================================================================
   OUTILS
   ===================================================================== */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const newId = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clone = (o) => JSON.parse(JSON.stringify(o));
const DAY = 86400000;
const n0 = (v) => Number(v) || 0;
const eur = (n) => n0(n).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const fmtD = (ts) => (ts ? new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "");
const fmtDL = (ts) => (ts ? new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "");
const fmtDT = (ts) => (ts ? new Date(ts).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "");
const daysSince = (ts) => (ts ? Math.floor((Date.now() - ts) / DAY) : 999);
const digits = (s) => String(s || "").replace(/\D/g, "");
const nomC = (c) => `${c.prenom || ""} ${c.nom || ""}`.trim() || "Sans nom";
const initials = (c) => (((c.prenom || "?")[0] || "") + ((c.nom || "")[0] || "")).toUpperCase();
const safeColor = (c) => (/^#[0-9a-f]{3,8}$/i.test(String(c || "")) ? c : "#7AC143");
const canon = (o) => JSON.stringify(Object.keys(o).sort().reduce((a, k) => ((a[k] = o[k]), a), {}));
const scrollTop = () => { try { window.scrollTo(0, 0); } catch (e) {} };
const reduceMotion = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
function tpl(str, vars) { return String(str || "").replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m)); }
function getPath(o, p) { return p.split(".").reduce((a, k) => (a == null ? undefined : a[k]), o); }
function setPath(o, p, v) { const ks = p.split("."); let cur = o; for (let i = 0; i < ks.length - 1; i++) { if (cur[ks[i]] == null) cur[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {}; cur = cur[ks[i]]; } cur[ks[ks.length - 1]] = v; }
function toLocalInput(ts) { const d = new Date(ts); const p = (x) => String(x).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; }
function token() { const a = new Uint8Array(18); crypto.getRandomValues(a); return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join(""); }
const LS = { draft: "eagle2_bilan_draft", coach: "eagle2_coach", demo: "eagle2_mode" };
function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

/* Numéros : 0690… → 590690… (Guadeloupe), 0696 → Martinique, 0694 → Guyane, 0692/0693 → Réunion, 06/07 → métropole */
function waNumber(tel) {
  const raw = String(tel || "").trim(); const d = digits(raw);
  if (!d) return "";
  if (raw.startsWith("+")) return d;
  if (d.startsWith("00")) return d.slice(2);
  if (d.length === 10 && d[0] === "0") {
    const map = { "0690": "590", "0691": "590", "0590": "590", "0696": "596", "0697": "596", "0596": "596", "0694": "594", "0594": "594", "0692": "262", "0693": "262", "0262": "262", "0639": "262", "0269": "262" };
    return (map[d.slice(0, 4)] || "33") + d.slice(1);
  }
  if (d.length === 9) return digits(S.cfg.telIndicatif || "590") + d;
  return d;
}
function waLink(tel, txt) { return `https://wa.me/${waNumber(tel)}${txt ? `?text=${encodeURIComponent(txt)}` : ""}`; }
function mailLink(email, subject, body) { return `mailto:${encodeURIComponent(email || "")}?subject=${encodeURIComponent(subject || "")}&body=${encodeURIComponent(body || "")}`; }

/* =====================================================================
   ÉTAT
   ===================================================================== */
const S = {
  ready: false, store: null, access: null, auth: { screen: "login", email: "", msg: "", busy: false },
  cfg: clone(DEFAULT_CONFIG), contacts: new Map(), profil: { pseudo: "", tel: "" }, team: [], members: [], live: null,
  view: "home", ficheId: null, bilan: null, coach: false, filt: { q: "", statut: "tous" },
  setTab: "produits", draft: null, dirty: false, soufStep: "accueil", energyState: 1
};
const isLeader = () => !!(S.access && S.access.leader);

function mergeCfg(d) {
  const base = clone(DEFAULT_CONFIG);
  if (!d || typeof d !== "object") return base;
  const out = { ...base };
  for (const k of Object.keys(d)) {
    const v = d[k];
    if (v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) out[k] = { ...base[k], ...v };
    else if (v !== undefined) out[k] = v;
  }
  for (const k of ["objectifs", "categories", "questions", "produits", "packs", "objections", "idees"]) if (!Array.isArray(out[k])) out[k] = base[k];
  if (!Array.isArray(out.decouverte.depenses)) out.decouverte.depenses = base.decouverte.depenses;
  if (!Array.isArray(out.challenge.contenu)) out.challenge.contenu = base.challenge.contenu;
  out.questions = out.questions.filter((q) => q && Array.isArray(q.options) && q.options.length);
  return clone(out);
}

/* =====================================================================
   THÈME
   ===================================================================== */
function hexToRgb(h) { h = String(h || "").replace("#", ""); if (h.length === 3) h = h.split("").map((x) => x + x).join(""); const n = parseInt(h, 16); if (h.length !== 6 || isNaN(n)) return null; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgbToHex(r) { return "#" + r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join(""); }
function mix(a, b, t) { const A = hexToRgb(a), B = hexToRgb(b); if (!A || !B) return a; return rgbToHex(A.map((v, i) => v + (B[i] - v) * t)); }
function lum(h) { const c = hexToRgb(h) || [0, 0, 0]; const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); }
function applyTheme(cfg = S.cfg) {
  const c = cfg.couleurs || {};
  const fond = hexToRgb(c.fond) ? c.fond : "#FFFFFF";
  const flame = hexToRgb(c.primaire) ? c.primaire : "#1F7A2A";
  const gold = hexToRgb(c.accent) ? c.accent : "#7AC143";
  const light = lum(fond) > 0.4;
  const r = document.documentElement.style;
  r.setProperty("--night", fond);
  r.setProperty("--panel", light ? mix(fond, gold, 0.07) : mix(fond, "#ffffff", 0.06));
  r.setProperty("--panel-2", light ? mix(fond, gold, 0.14) : mix(fond, "#ffffff", 0.11));
  r.setProperty("--line", light ? mix(mix(fond, gold, 0.18), "#152033", 0.06) : mix(fond, "#ffffff", 0.18));
  r.setProperty("--text", light ? "#152033" : "#F5F1EA");
  r.setProperty("--muted", light ? "#5A6577" : "#A7B3C6");
  r.setProperty("--flame", flame);
  r.setProperty("--gold", gold);
  r.setProperty("--gold-text", light ? (lum(gold) > 0.3 ? mix(gold, "#000000", 0.42) : gold) : gold);
  r.setProperty("--on-flame", lum(flame) > 0.45 ? "#10240F" : "#FFFFFF");
  r.setProperty("--on-gold", lum(gold) > 0.45 ? "#10240F" : "#FFFFFF");
  r.setProperty("color-scheme", light ? "light" : "dark");
}

/* =====================================================================
   ENREGISTREMENTS
   ===================================================================== */
function dbError(e) {
  console.error(e);
  const m = String((e && e.message) || "");
  if (/permission|policy|row-level/i.test(m)) toast("Enregistrement refusé : ton accès n'est pas encore validé par ton leader.", true);
  else toast("Enregistrement impossible pour le moment. Vérifie ta connexion et réessaie.", true);
}
async function saveContact(c) {
  c.updatedAt = Date.now(); S.contacts.set(c.id, c);
  try { await S.store.saveContact(clone(c), [...S.contacts.values()]); } catch (e) { dbError(e); return false; }
  syncStats(); return true;
}
async function deleteContact(id) {
  S.contacts.delete(id);
  try { await S.store.deleteContact(id, [...S.contacts.values()]); } catch (e) { dbError(e); }
  syncStats();
}
async function saveProfil(p) { S.profil = p; lastStatsKey = ""; await syncStats(true); }
async function saveConfig(cfg) {
  const data = clone(cfg); data.majAt = Date.now();
  try { await S.store.saveConfig(data); } catch (e) { dbError(e); return false; }
  S.cfg = mergeCfg(data); applyTheme(); return true;
}
let liveTimer = null;
function pushLive() {
  if (!S.bilan) return;
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => {
    if (!S.bilan) return;
    const B = S.bilan; const st = currentStepId();
    const data = { step: st, label: stepLabel(st), prenom: B.prenom || "", objectif: B.objectif || "", at: Date.now(), motivation: B.motivation || null, depensesJour: depensesJour(B), budgetRepas: budgetRepas(B), decideur: B.decideur || "" };
    if (!["accueil", "mesures"].includes(st) && !st.startsWith("q")) data.score = scoreOf(B.reponses).global;
    S.store.saveLive(data).catch(() => {});
  }, 800);
}
let lastStatsKey = "";
async function syncStats(force) {
  const st = computeStats(); const key = canon({ ...st, pseudo: S.profil.pseudo, tel: S.profil.tel });
  if (key === lastStatsKey && !force) return;
  lastStatsKey = key;
  try { await S.store.saveProfil(S.profil, st); } catch (e) { console.warn(e); }
}

/* =====================================================================
   SCORE BIEN-ÊTRE
   Chaque réponse rapporte des points (0 à 3 par défaut).
   Catégorie = points obtenus / points possibles × 100.
   Score global = moyenne des catégories pondérée par leur « poids ».
   ===================================================================== */
function catW(id) { const c = S.cfg.categories.find((x) => x.id === id); return c ? n0(c.poids) : 0; }
function scoreOf(rep, cfg = S.cfg, noPot = false) {
  const cats = {}; const details = [];
  for (const q of cfg.questions) {
    const i = rep ? rep[q.id] : undefined;
    if (i == null || !q.options[i]) continue;
    const max = Math.max(0, ...q.options.map((o) => n0(o.p)));
    const p = n0(q.options[i].p);
    if (!cats[q.cat]) cats[q.cat] = { e: 0, m: 0 };
    cats[q.cat].e += p; cats[q.cat].m += max;
    details.push({ q, i, p, max, ratio: max ? p / max : 1 });
  }
  const catScores = {}; let wsum = 0, acc = 0;
  for (const cat of cfg.categories) {
    const c = cats[cat.id]; if (!c || !c.m) continue;
    const s = Math.round((100 * c.e) / c.m); catScores[cat.id] = s;
    const w = n0(cat.poids); wsum += w; acc += s * w;
  }
  const global = wsum ? Math.round(acc / wsum) : 0;
  const weak = details.filter((d) => d.ratio < 1).sort((a, b) => a.ratio - b.ratio || catW(b.q.cat) - catW(a.q.cat)).slice(0, 3);
  const strong = details.filter((d) => d.ratio === 1).sort((a, b) => catW(b.q.cat) - catW(a.q.cat)).slice(0, 3);
  let potentiel = global;
  if (!noPot && weak.length) {
    const rep2 = { ...rep };
    for (const w of weak) rep2[w.q.id] = w.q.options.reduce((bi, o, ii, arr) => (n0(o.p) > n0(arr[bi].p) ? ii : bi), 0);
    potentiel = scoreOf(rep2, cfg, true).global;
  }
  return { global, catScores, weak, strong, potentiel, answered: details.length };
}
function niveau(s) {
  if (s >= 80) return { t: "Excellente base", s: "Tu as déjà de très bonnes habitudes : on vise l'excellence.", tone: "good" };
  if (s >= 60) return { t: "Bonne base", s: "De bons réflexes. Quelques réglages vont faire une vraie différence.", tone: "gold" };
  if (s >= 40) return { t: "Des bases à renforcer", s: "Ton corps te demande un coup de pouce, et ton potentiel de progrès est énorme.", tone: "warn" };
  return { t: "Grand potentiel de progrès", s: "Bonne nouvelle : chaque petit changement va se voir très vite.", tone: "bad" };
}
const scoreHex = (s) => (s >= 80 ? "#22A06B" : s >= 60 ? "#6FB33A" : s >= 40 ? "#E5A100" : "#D9483B");

/* Découverte : dépenses et budget */
function depensesJour(B) {
  if (!B || !B.depenses) return 0;
  let t = 0;
  for (const d of S.cfg.decouverte.depenses) { const v = n0(B.depenses[d.id]); t += d.par === "semaine" ? v / 7 : d.par === "mois" ? v / 30 : v; }
  return Math.round(t * 100) / 100;
}
function budgetRepas(B) { if (!B || !n0(B.budget)) return 0; const pers = Math.max(1, n0(B.foyer) || 1); return Math.round((n0(B.budget) / pers / 30 / 3) * 100) / 100; }
function nextDepart() { const jd = S.cfg.challenge.jourDepart; const j = jd === "" || jd == null || isNaN(+jd) ? 4 : +jd; const d = new Date(); d.setHours(0, 0, 0, 0); let add = (j - d.getDay() + 7) % 7; if (add === 0) add = 7; d.setDate(d.getDate() + add); return d.getTime(); }

/* =====================================================================
   STATISTIQUES & RAPPELS
   ===================================================================== */
function startOfWeek(ts) { const d = new Date(ts); const day = (d.getDay() + 6) % 7; d.setHours(0, 0, 0, 0); return d.getTime() - day * DAY; }
function computeStats() {
  const all = [...S.contacts.values()]; const now = Date.now();
  const bilans = all.filter((c) => c.bilan && c.bilan.at);
  const convertis = bilans.filter((c) => c.statut === "client").length;
  const debMois = new Date(); debMois.setDate(1); debMois.setHours(0, 0, 0, 0);
  const ws = startOfWeek(now); const semaines = [];
  for (let i = 7; i >= 0; i--) { const s = ws - i * 7 * DAY, e = s + 7 * DAY; semaines.push(bilans.filter((c) => c.bilan.at >= s && c.bilan.at < e).length); }
  return {
    bilans: bilans.length, clients: all.filter((c) => c.statut === "client").length, convertis,
    challenges: all.filter((c) => c.challenge).length,
    recos: all.filter((c) => c.recommandePar).length, invites: all.filter((c) => c.inviteAt).length,
    scoreMoyen: bilans.length ? Math.round(bilans.reduce((a, c) => a + n0(c.bilan.score), 0) / bilans.length) : 0,
    bilansMois: bilans.filter((c) => c.bilan.at >= debMois.getTime()).length,
    semaine: semaines[7], semaines, contacts: all.length
  };
}
function rappels() {
  const out = []; const now = Date.now();
  const endToday = new Date(); endToday.setHours(23, 59, 59, 999);
  for (const c of S.contacts.values()) {
    if (c.statut === "ne_plus_contacter") continue;
    if (c.statut === "a_inviter") out.push({ c, prio: 2, tone: "info", t: `Inviter ${nomC(c)}`, s: `Recommandé(e) par ${c.recommandeParNom || "—"}${c.lien ? " · " + c.lien : ""}`, act: "invite" });
    else if (c.statut === "invite" && daysSince(c.dernierContact || c.inviteAt) >= n0(S.cfg.relanceInviteJours)) out.push({ c, prio: 3, tone: "warn", t: `Relancer ${nomC(c)}`, s: `Invité(e) il y a ${daysSince(c.inviteAt)} j, pas encore de rendez-vous`, act: "msg", tpl: "relanceInvite", label: "Relancer" });
    else if (c.statut === "bilan_planifie" && c.rdvAt && c.rdvAt <= endToday.getTime()) out.push({ c, prio: 1, tone: c.rdvAt < now - 2 * 3600e3 ? "bad" : "good", t: c.rdvAt < now - 2 * 3600e3 ? `Bilan de ${nomC(c)} en retard` : `Bilan de ${nomC(c)} aujourd'hui`, s: fmtDT(c.rdvAt), act: "start" });
    else if (c.statut === "bilan_fait" && c.relanceAt && c.relanceAt <= now) out.push({ c, prio: 2, tone: "warn", t: `${nomC(c)} réfléchit : relance prévue`, s: `Score ${c.bilan ? c.bilan.score : "—"}/100${c.decouverte && c.decouverte.motivation ? " · motivation " + c.decouverte.motivation + "/10" : ""}`, act: "msg", tpl: "relanceReflechit", label: "Relancer" });
    else if (c.statut === "client" && daysSince(c.dernierContact || c.updatedAt) >= n0(S.cfg.suiviJours)) out.push({ c, prio: 3, tone: "gold", t: `Suivi de ${nomC(c)}`, s: `Sans nouvelle depuis ${daysSince(c.dernierContact || c.updatedAt)} jours`, act: "msg", tpl: "suiviClient", label: "Prendre des nouvelles" });
  }
  return out.sort((a, b) => a.prio - b.prio);
}

/* =====================================================================
   PETITS COMPOSANTS
   ===================================================================== */
const ic = (d) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  home: ic('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>'),
  users: ic('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.4 0 4 1.5 4.5 4.5"/>'),
  chart: ic('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  trophy: ic('<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8"/>'),
  ear: ic('<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2" y="14" width="5" height="7" rx="2"/><rect x="17" y="14" width="5" height="7" rx="2"/>'),
  gear: ic('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>'),
  wa: ic('<path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.8-5.3A8.5 8.5 0 1 1 21 11.5z"/>'),
  mail: ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  link: ic('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  gift: `<svg class="box3d" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="gb" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9BD86A"/><stop offset="1" stop-color="#1F7A2A"/></linearGradient></defs><path d="M10 28h44v28a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4z" fill="url(#gb)"/><path d="M6 20h52v10H6z" fill="#7AC143"/><path d="M29 20h6v40h-6z" fill="#FFD25A"/><path d="M32 20c-6-10-16-10-14-3 1 3 8 3 14 3zm0 0c6-10 16-10 14-3-1 3-8 3-14 3z" fill="#FFD25A"/></svg>`
};
const logoImg = (cls = "") => `<img class="${cls}" src="/assets/logo-embleme.webp" alt="" width="54" height="48">`;
const statutOf = (id) => STATUTS.find((s) => s.id === id) || STATUTS[0];
const statutPill = (id) => { const s = statutOf(id); return `<span class="pill tone-${s.tone}">${esc(s.label)}</span>`; };
const scoreBadge = (s) => `<span class="score-badge num" style="background:${scoreHex(n0(s))}" title="Score bien-être">${n0(s)}</span>`;
const objLabel = (id) => (S.cfg.objectifs.find((o) => o.id === id) || {}).label || "";
const tile = (l, v, s) => `<div class="tile"><span>${esc(l)}</span><b class="num">${esc(v)}</b>${s ? `<small>${esc(s)}</small>` : ""}</div>`;
const decisionLabel = (d) => ({ programme: "Démarre son programme", challenge: "Rejoint le Bodyfit Challenge", reflechit: "Réfléchit", pas: "Pas intéressé pour le moment" }[d] || "");
function prodById(id) { return S.cfg.produits.find((p) => p.id === id); }
function packLines(pk) { return Object.entries((pk && pk.items) || {}).map(([id, q]) => ({ p: prodById(id), q: Math.max(1, n0(q) || 1) })).filter((x) => x.p && x.p.actif !== false); }
function packTotal(pk) { return packLines(pk).reduce((a, x) => a + n0(x.p.prix) * x.q, 0); }
function packsFor(obj) { const all = S.cfg.packs.filter((p) => p && p.items); const f = all.filter((p) => (p.objectifs || []).includes(obj)); return f.length ? f : all; }
function prixRepas() { const f = S.cfg.produits.find((p) => p.usage === "repas" && p.actif !== false); return f && n0(f.portions) ? n0(f.prix) / n0(f.portions) : 0; }
