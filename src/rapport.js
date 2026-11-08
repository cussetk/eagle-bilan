import { createClient } from "@neon/neon-js";
import { NEON } from "./store.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const n0 = (v) => Number(v) || 0;
const scoreHex = (s) => (s >= 80 ? "#22A06B" : s >= 60 ? "#6FB33A" : s >= 40 ? "#E5A100" : "#D9483B");
const toneHex = { good: "#22A06B", gold: "#2F7D1F", warn: "#B07A00", bad: "#C2392D" };
const app = document.getElementById("app");

function gauge(s) {
  const L = Math.PI * 100;
  return `<svg viewBox="0 0 240 132" role="img" aria-label="Score ${s} sur 100"><path d="M20 120 A100 100 0 0 1 220 120" fill="none" stroke="#E3EBDD" stroke-width="22" stroke-linecap="round"/><path d="M20 120 A100 100 0 0 1 220 120" fill="none" stroke="${scoreHex(s)}" stroke-width="22" stroke-linecap="round" stroke-dasharray="${L.toFixed(1)}" stroke-dashoffset="${(L * (1 - s / 100)).toFixed(1)}"/></svg>`;
}
function view(d, tok) {
  const date = new Date(n0(d.date)).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const nv = d.niveau || {};
  const coachWa = d.coachTel ? `https://wa.me/${encodeURIComponent(d.coachTel)}?text=${encodeURIComponent(`Bonjour ${d.coach || ""} ! C'est ${d.prenom}, j'ai bien reçu mon bilan bien-être.`)}` : "";
  const shareTxt = `Je viens de faire mon bilan bien-être avec ${d.coach || "mon coach"} de la ${d.equipe || "97 Eagle Team"}. Tu veux le faire aussi ? C'est offert.`;
  const ebook = d.ebook || { titre: "20 habitudes pour être en top forme", url: "/ebook/", pdf: "/ebook/?pdf=1" };
  app.innerHTML = `
  <div class="actions"><button class="btn btn-primary" id="dl">Télécharger mon bilan en PDF</button><a class="btn btn-ghost" href="${esc(ebook.pdf)}">Mon e-book offert (PDF)</a></div>
  <article id="rapport">
    <header class="head"><div><p class="eyebrow" style="color:#E8F5DC">Bilan bien-être · ${esc(date)}</p><h1>${esc(d.prenom)}, voici ton bilan</h1><p>Objectif : ${esc(d.objectif || "—")}${d.coach ? ` · Coach : ${esc(d.coach)}` : ""}</p></div><img src="/assets/logo-full.webp" alt="97 Eagle Team"></header>
    <section class="sec"><div class="score"><div class="gauge">${gauge(n0(d.score))}<div class="v"><b>${n0(d.score)}</b><span>/100</span></div></div>
      <div style="display:grid;gap:12px"><div><span class="pill" style="color:${toneHex[nv.tone] || "#2F7D1F"}">${esc(nv.t || "")}</span><p style="margin-top:8px;font-size:18px;font-weight:600">${esc(nv.s || "")}</p></div>
      <div class="bars">${(d.cats || []).map((c) => `<div class="bar-row"><span>${esc(c.label)}</span><div class="bar"><i style="width:${n0(c.score)}%;background:${/^#[0-9a-f]{3,8}$/i.test(c.couleur) ? c.couleur : "#7AC143"}"></i></div><b>${n0(c.score)}</b></div>`).join("")}</div></div></div></section>
    <section class="sec"><div class="two"><div class="box white"><h3>Tes points forts</h3><ul class="l">${(d.forts || []).map((t) => `<li>${esc(t)}</li>`).join("") || "<li>Ta motivation à prendre soin de toi</li>"}</ul></div>
      <div class="box white"><h3>Tes priorités</h3><ul class="l ax">${(d.axes || []).map((t) => `<li>${esc(t)}</li>`).join("") || "<li>Garder tes bonnes habitudes</li>"}</ul></div></div>
      ${n0(d.potentiel) > n0(d.score) ? `<div class="box pot"><b class="big">${n0(d.potentiel)}</b><div><b>Ton potentiel en travaillant ces priorités</b><p style="color:var(--muted)">+${n0(d.potentiel) - n0(d.score)} points sur ton score bien-être.</p></div></div>` : ""}</section>
    ${d.programme || d.challenge ? `<section class="sec"><p class="eyebrow">Ta prochaine étape</p>${d.programme ? `<div class="box"><h3>Programme ${esc(d.programme.nom)}</h3><ul class="l">${(d.programme.items || []).map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>` : ""}${d.challenge ? `<div class="box"><h3>${esc(d.challenge.nom)}${d.challenge.offert ? " · offert" : ""}</h3><p>Prochain départ : <b>${esc(new Date(n0(d.challenge.depart)).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }))}</b>. Ton coach t'ajoute au groupe.</p></div>` : ""}</section>` : ""}
    <section class="sec"><p class="eyebrow">Ton cadeau</p><div class="ebook"><div class="cover">20 habitudes pour être en <span>top forme</span></div><div style="display:grid;gap:10px"><h2 style="font-size:24px">${esc(ebook.titre)}</h2><p style="color:var(--muted)">Des gestes simples à adopter un par un, avec un plan d'action de 7 jours.</p><div class="actions no-pdf" style="justify-content:flex-start"><a class="btn btn-primary" href="${esc(ebook.pdf)}">Télécharger l'e-book</a><a class="btn btn-ghost" href="${esc(ebook.url)}">Le lire en ligne</a></div></div></div></section>
    <section class="sec no-pdf"><p class="eyebrow">Offre-le à tes proches</p><p>Tu connais quelqu'un qui aimerait faire le point sur sa forme ? Partage-lui ce bilan offert.</p><div class="actions" style="justify-content:flex-start"><a class="btn btn-wa" href="https://wa.me/?text=${encodeURIComponent(shareTxt + (coachWa ? "" : ""))}" target="_blank" rel="noopener">Partager sur WhatsApp</a>${coachWa ? `<a class="btn btn-ghost" href="${esc(coachWa)}" target="_blank" rel="noopener">Écrire à mon coach</a>` : ""}</div></section>
    <section class="sec"><p class="legal">${esc(d.mention || "")} Pour toute question de santé, parle-en à ton médecin. ${esc(d.equipe || "")} · ${esc(d.slogan || "")}</p></section>
  </article>`;
  document.getElementById("dl").addEventListener("click", () => downloadPdf(d));
}
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
async function downloadPdf(d) {
  const btn = document.getElementById("dl"); btn.disabled = true; btn.textContent = "Préparation du PDF…";
  try {
    if (!window.html2pdf) await loadScript("/html2pdf.bundle.min.js");
    document.body.classList.add("pdf-mode");
    const el = document.getElementById("rapport");
    await window.html2pdf().set({ margin: [8, 8, 8, 8], filename: `bilan-bien-etre-${String(d.prenom || "").toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.pdf`, image: { type: "jpeg", quality: 0.95 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }, pagebreak: { mode: ["css", "avoid-all"] } }).from(el).save();
  } catch (e) { console.error(e); alertBox("Le PDF n'a pas pu être créé sur cet appareil. Tu peux faire une capture d'écran ou imprimer la page."); }
  document.body.classList.remove("pdf-mode"); btn.disabled = false; btn.textContent = "Télécharger mon bilan en PDF";
}
function alertBox(m) { const p = document.createElement("p"); p.className = "center"; p.style.cssText = "color:#C2392D;font-weight:700"; p.textContent = m; app.prepend(p); }
function notFound() { app.innerHTML = `<div class="empty"><img src="/assets/logo-full.webp" alt="97 Eagle Team" width="120"><h1 style="font-size:26px">Bilan introuvable</h1><p>Ce lien n'est plus valable ou il est incomplet. Demande à ton coach de te le renvoyer.</p></div>`; }

(async () => {
  const q = new URLSearchParams(location.search); const tok = q.get("t") || "";
  if (!/^[a-f0-9]{20,}$/i.test(tok)) return notFound();
  try {
    let d = null;
    if (q.has("demo")) { try { d = JSON.parse(localStorage.getItem("eagle2_demo_rapport_" + tok)); } catch (e) {} }
    else {
      const client = createClient({ auth: { url: NEON.auth, allowAnonymous: true }, dataApi: { url: NEON.data } });
      const r = await client.rpc("get_rapport", { p_token: tok });
      if (r.error) throw r.error;
      d = r.data;
    }
    if (!d) return notFound();
    document.title = `Bilan bien-être de ${d.prenom} · 97 Eagle Team`;
    view(d, tok);
  } catch (e) { console.error(e); app.innerHTML = `<div class="empty"><h1 style="font-size:26px">Connexion impossible</h1><p>Vérifie ta connexion internet puis recharge la page.</p></div>`; }
})();
