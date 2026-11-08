/* =====================================================================
   PARCOURS BILAN
   ===================================================================== */
function newBilan(from) {
  const dep = {}; for (const d of S.cfg.decouverte.depenses) dep[d.id] = n0(d.defaut);
  return {
    id: newId("b_"), stepIdx: 0, contactId: from ? from.id : null,
    prenom: from ? from.prenom || "" : "", nom: from ? from.nom || "" : "", tel: from ? from.tel || "" : "", email: from ? from.email || "" : "",
    canal: from && from.canal ? from.canal : "whatsapp",
    age: from ? from.age || "" : "", ville: from ? from.ville || "" : "", objectif: from ? from.objectif || "" : "", objectifAutre: "",
    consent: false, reponses: {}, poids: "", taille: "", objectifPoids: "",
    recos: [], recoForm: { prenom: "", nom: "", tel: "", lien: "" },
    motivation: null, motivationPourquoi: "", echeance: "", evenement: "", evenementDate: "",
    depenses: dep, budget: n0(S.cfg.decouverte.budgetDefaut), foyer: 1, decideur: "",
    challengeInteret: false, packId: null, parfums: {}, challenge: true, decision: null, relanceJ: 2, note: "",
    startedAt: Date.now(), savedId: null, rapportToken: null
  };
}
function steps() {
  const st = ["accueil", ...S.cfg.questions.map((q, i) => "q" + i), "mesures", "score", "recos"];
  if (S.cfg.decouverte.actif !== false) { st.push("motivation", "echeance", "depenses", "budget"); if (S.cfg.decouverte.questionDecideur) st.push("decideur"); }
  if (S.cfg.energie.actif !== false) st.push("energie", "comparatif");
  if (S.cfg.challenge.actif) st.push("challenge");
  st.push("solution", "decision", "envoi");
  return st;
}
function currentStepId() { const st = steps(); return st[Math.min(S.bilan.stepIdx, st.length - 1)]; }
const STEP_LABELS = { accueil: "Accueil", mesures: "Repères", score: "Score", recos: "Cadeau aux proches", motivation: "Motivation", echeance: "Échéance", depenses: "Dépenses", budget: "Budget", decideur: "Décision à deux", energie: "L'énergie", comparatif: "Comparatif", challenge: "Bodyfit Challenge", solution: "Programme", decision: "Décision", envoi: "Envoi" };
function stepLabel(id) { if (String(id).startsWith("q")) return "Questions"; return STEP_LABELS[id] || id; }
function saveDraft() { if (S.bilan && !S.bilan.savedId) lsSet(LS.draft, S.bilan); }

function renderBilan() {
  const B = S.bilan; const st = steps(); const idx = Math.min(B.stepIdx, st.length - 1); const id = st[idx];
  const pct = Math.round((100 * idx) / (st.length - 1));
  const top = `<div class="bilan-top"><div class="inner"><span class="brand">${logoImg()}<span><b>Bilan bien-être</b><small>${esc(S.cfg.equipe.nom)}</small></span></span>
    <span class="step-label">${esc(stepLabel(id))}</span>
    <button class="btn btn-ghost btn-sm" data-act="coach" aria-pressed="${S.coach}">${S.coach ? "Masquer le coach" : "Coach"}</button>
    <button class="btn btn-ghost btn-sm" data-act="bilan-quit">${B.savedId ? "Fermer" : "Quitter"}</button></div>
    <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div></div>`;
  const F = { accueil: stepAccueil, mesures: stepMesures, score: stepScore, recos: stepRecos, motivation: stepMotivation, echeance: stepEcheance, depenses: stepDepenses, budget: stepBudget, decideur: stepDecideur, energie: stepEnergie, comparatif: stepComparatif, challenge: stepChallenge, solution: stepSolution, decision: stepDecision, envoi: stepEnvoi };
  const body = id.startsWith("q") ? stepQuestion(+id.slice(1)) : (F[id] || stepEnvoi)();
  const key = id.startsWith("q") ? "questions" : id;
  return top + `<main><div class="bilan-wrap ${S.coach ? "with-coach" : ""}"><div>${body}</div>${S.coach ? `<aside style="position:sticky;top:90px;align-self:start">${coachBody(key, B)}</aside>` : ""}</div></main>`;
}
function bField(k, label, req, type = "text", ac = "", ph = "") {
  const B = S.bilan;
  return `<label class="field" for="b-${k}">${esc(label)}${req ? ' <span class="req">*</span>' : ""}<input id="b-${k}" type="${type}" data-bind="${k}" value="${esc(B[k])}" ${ac ? `autocomplete="${ac}"` : ""} ${ph ? `placeholder="${esc(ph)}"` : ""} ${type === "number" ? 'inputmode="decimal" min="0" step="any"' : ""}></label>`;
}
const nav = (nextLabel = "Suivant →", cls = "btn-primary btn-xl", disabled = false) => `<div class="stepnav"><button class="btn btn-ghost" data-act="prev">← Retour</button><button class="btn ${cls}" data-act="next" ${disabled ? "disabled" : ""}>${nextLabel}</button></div>`;

function stepAccueil() {
  const B = S.bilan;
  return `<section class="step"><div><p class="eyebrow">Étape 1 · Faisons connaissance</p><h1>${B.prenom ? `Bienvenue ${esc(B.prenom)} !` : "Bienvenue ! On commence ton bilan bien-être"}</h1></div>
  <div class="grid2">${bField("prenom", "Prénom", true, "text", "off")}${bField("nom", "Nom", false, "text", "off")}${bField("tel", "Téléphone WhatsApp", true, "tel", "off", "0690 12 34 56")}${bField("email", "E-mail (facultatif)", false, "email", "off", "prenom@exemple.com")}</div>
  <div class="grid2">${bField("age", "Âge", false, "number")}${bField("ville", "Ville", false, "text", "off")}</div>
  <div class="stack" style="gap:8px"><span class="muted small" style="font-weight:700">Tu préfères recevoir ton bilan et ton e-book…</span><div class="seg">${[["whatsapp", "Par WhatsApp"], ["email", "Par e-mail"]].map(([v, l]) => `<button class="${B.canal === v ? "on" : ""}" data-act="canal" data-v="${v}" aria-pressed="${B.canal === v}">${l}</button>`).join("")}</div></div>
  <div class="stack"><h2>Ton objectif principal</h2><div class="choices stagger">${S.cfg.objectifs.map((x) => `<button class="choice ${B.objectif === x.id ? "on" : ""}" data-act="objectif" data-id="${esc(x.id)}" aria-pressed="${B.objectif === x.id}"><span class="ico" aria-hidden="true">${esc(x.icone || "")}</span>${esc(x.label)}</button>`).join("")}</div>
  ${B.objectif === "autre" ? bField("objectifAutre", "Précise ton objectif", false) : ""}</div>
  <label class="check" for="b-consent"><input type="checkbox" id="b-consent" data-bind="consent" ${B.consent ? "checked" : ""}><span>J'accepte que mon coach enregistre mes réponses pour assurer mon suivi et m'envoie mon bilan. Je peux demander leur suppression à tout moment.</span></label>
  <p class="err" id="b-err" role="alert"></p>
  <div class="stepnav"><span></span><button class="btn btn-primary btn-xl" data-act="next">C'est parti →</button></div></section>`;
}
function stepQuestion(qi) {
  const q = S.cfg.questions[qi]; const B = S.bilan; const n = S.cfg.questions.length;
  const cat = S.cfg.categories.find((c) => c.id === q.cat); const sel = B.reponses[q.id];
  return `<section class="step"><div class="stack" style="gap:14px"><div class="row between"><span class="pill" style="color:${safeColor(cat && cat.couleur)}">${esc(cat ? cat.label : "")}</span><div class="dots" aria-hidden="true">${S.cfg.questions.map((x, i) => `<i class="${i < qi ? "done" : i === qi ? "cur" : ""}"></i>`).join("")}</div></div>
  <h1 class="question">${esc(q.texte)}</h1></div>
  <div class="answers stagger" role="radiogroup" aria-label="${esc(q.texte)}">${q.options.map((o, i) => `<button class="answer ${sel === i ? "on" : ""}" role="radio" aria-checked="${sel === i}" data-act="answer" data-q="${esc(q.id)}" data-i="${i}"><kbd>${i + 1}</kbd><span>${esc(o.l)}</span></button>`).join("")}</div>
  <div class="stepnav"><button class="btn btn-ghost" data-act="prev">← Retour</button><span class="muted small">Question ${qi + 1} sur ${n}</span><button class="btn btn-primary" data-act="next" ${sel == null ? "disabled" : ""}>Suivant →</button></div></section>`;
}
function stepMesures() {
  return `<section class="step"><div><p class="eyebrow">Facultatif</p><h1>Quelques repères pour mesurer tes progrès</h1><p class="muted" style="margin-top:10px;font-size:19px">Ces chiffres servent uniquement à suivre ton évolution. Tu peux passer cette étape.</p></div>
  <div class="grid3">${bField("poids", "Poids actuel (kg)", false, "number")}${bField("taille", "Taille (cm)", false, "number")}${bField("objectifPoids", "Poids visé (kg)", false, "number")}</div>
  ${nav("Voir mon score →", "btn-gold btn-xl")}</section>`;
}
function gaugeSVG(s) {
  const L = Math.PI * 100;
  return `<svg viewBox="0 0 240 132" role="img" aria-label="Score ${s} sur 100"><defs><linearGradient id="gtrack" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#E3EBDD"/><stop offset="1" stop-color="#C9D6C1"/></linearGradient><linearGradient id="garc" x1="0" x2="1"><stop offset="0" stop-color="${scoreHex(Math.max(0, s - 30))}"/><stop offset="1" stop-color="${scoreHex(s)}"/></linearGradient></defs>
  <path d="M20 120 A100 100 0 0 1 220 120" fill="none" stroke="url(#gtrack)" stroke-width="22" stroke-linecap="round"/>
  <path class="gauge-arc" id="gauge-arc" d="M20 120 A100 100 0 0 1 220 120" fill="none" stroke="url(#garc)" stroke-width="22" stroke-linecap="round" stroke-dasharray="${L.toFixed(1)}" stroke-dashoffset="${L.toFixed(1)}" data-off="${(L * (1 - s / 100)).toFixed(1)}"/>
  <path d="M28 116 A92 92 0 0 1 212 116" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-linecap="round"/></svg>`;
}
function animateIn() {
  const reduce = reduceMotion();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const arc = $("#gauge-arc"); if (arc) arc.style.strokeDashoffset = arc.dataset.off;
    document.querySelectorAll("[data-w]").forEach((b) => (b.style.width = b.dataset.w + "%"));
    document.querySelectorAll("[data-h]").forEach((b) => (b.style.height = b.dataset.h + "px"));
  }));
  const el = $("#gauge-num"); if (!el) return;
  const to = +el.dataset.to;
  if (reduce) { el.textContent = to; return; }
  el.textContent = "0";
  const t0 = performance.now(); const dur = 1500;
  const tick = (t) => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
function stepScore() {
  const B = S.bilan; const R = scoreOf(B.reponses); const nv = niveau(R.global);
  const cats = S.cfg.categories.filter((c) => R.catScores[c.id] != null);
  let forts = R.strong.map((d) => d.q.fort || d.q.texte);
  if (!forts.length) { const best = cats.slice().sort((a, b) => R.catScores[b.id] - R.catScores[a.id])[0]; if (best) forts = [`Ta meilleure base : ${best.label} (${R.catScores[best.id]}/100)`]; }
  const ecart = n0(B.poids) && n0(B.objectifPoids) ? Math.round((n0(B.objectifPoids) - n0(B.poids)) * 10) / 10 : 0;
  return `<section class="step" style="max-width:none"><div><p class="eyebrow">Ton résultat</p><h1>${esc(B.prenom)}, voici ton score bien-être</h1></div>
  <div class="score-hero"><div class="scene"><div class="gauge3d tilt pop-in">${gaugeSVG(R.global)}<div class="gauge-val"><b class="num" id="gauge-num" data-to="${R.global}">${R.global}</b><span>/100</span></div></div></div>
  <div class="stack"><div><span class="pill tone-${nv.tone}">${esc(nv.t)}</span><p style="margin-top:10px;font-size:21px;font-weight:600">${esc(nv.s)}</p></div>
  <div class="bars">${cats.map((c) => `<div class="bar-row"><span>${esc(c.label)}</span><div class="bar"><i data-w="${R.catScores[c.id]}" style="width:0;background-color:${safeColor(c.couleur)}"></i></div><b class="num">${R.catScores[c.id]}</b></div>`).join("")}</div></div></div>
  <div class="grid2 scene"><div class="card stack tilt pop-in"><h2>Tes points forts</h2><ul class="list-check">${forts.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
  <div class="card stack tilt pop-in" style="animation-delay:.1s"><h2>Tes axes d'amélioration</h2>${R.weak.length ? `<ul class="list-check axes">${R.weak.map((d) => `<li>${esc(d.q.axe || d.q.texte)}</li>`).join("")}</ul>` : "<p>Rien à signaler : bravo !</p>"}</div></div>
  ${R.potentiel > R.global ? `<div class="potential pop-in" style="animation-delay:.2s"><b class="big num">${R.potentiel}</b><div><b style="font-size:19px">Ton potentiel si on travaille ces ${R.weak.length} points ensemble</b><p class="muted">+${R.potentiel - R.global} points sur ton score bien-être.${ecart ? ` Objectif poids : ${ecart > 0 ? "+" : ""}${String(ecart).replace(".", ",")} kg.` : ""}</p></div></div>` : ""}
  <div class="gift pop-in" style="animation-delay:.3s">${I.gift}<div><b style="font-size:19px">Ton cadeau t'attend à la fin du bilan</b><p class="muted">Ton rapport complet en PDF + l'e-book « ${esc(S.cfg.ebook.titre)} », envoyés ${B.canal === "email" ? "par e-mail" : "sur WhatsApp"}.</p></div></div>
  <p class="disclaimer">Score bien-être indicatif, calculé à partir des habitudes déclarées. Ce n'est pas un diagnostic médical. Pour toute question de santé, parle-en à ton médecin.</p>
  ${nav("Continuer →")}</section>`;
}
function rField(k, label, req, type = "text") {
  const f = S.bilan.recoForm;
  return `<label class="field" for="r-${k}">${esc(label)}${req ? ' <span class="req">*</span>' : ""}<input id="r-${k}" type="${type}" data-rbind="${k}" value="${esc(f[k])}" autocomplete="off"></label>`;
}
function stepRecos() {
  const B = S.bilan; const min = n0(S.cfg.recos.min) || 3; const max = Math.max(min, n0(S.cfg.recos.max) || 5); const n = B.recos.length; const f = B.recoForm;
  return `<section class="step"><div><p class="eyebrow">Offre le même cadeau</p><h1>Qui aimerais-tu faire profiter d'un bilan bien-être offert ?</h1><p class="muted" style="margin-top:10px;font-size:19px">Choisis ${min} à ${max} personnes. Elles recevront le même bilan et le même e-book, et je les contacte de ta part en précisant que c'est toi qui as pensé à elles.</p></div>
  <div class="reco-meter"><div class="stars">${Array.from({ length: max }, (_, i) => `<i class="${i < n ? "on" : ""}">${i + 1}</i>`).join("")}</div><b>${n >= max ? "Objectif atteint, merci !" : n >= min ? `${n} personnes, bravo ! Une de plus ?` : `${n} / ${min} minimum`}</b></div>
  <div class="idea-chips" aria-label="Idées">${S.cfg.idees.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
  ${n < max ? `<div class="card stack"><div class="grid3">${rField("prenom", "Prénom", true)}${rField("nom", "Nom")}${rField("tel", "Téléphone", true, "tel")}</div>
  <div class="stack" style="gap:8px"><span class="muted small" style="font-weight:700">Lien avec ${esc(B.prenom)}</span><div class="seg">${LIENS.map((l) => `<button class="${f.lien === l ? "on" : ""}" data-act="reco-lien" data-v="${esc(l)}">${esc(l)}</button>`).join("")}</div></div>
  <p class="err" id="r-err" role="alert"></p><div class="row end"><button class="btn btn-gold" data-act="reco-add">+ Ajouter cette personne</button></div></div>` : ""}
  ${n ? `<div class="reco-list">${B.recos.map((r, i) => `<div class="reco-item pop-in"><span class="avatar">${esc(initials(r))}</span><div style="flex:1;min-width:0"><b>${esc(r.prenom)} ${esc(r.nom)}</b><div class="muted small">${esc(r.tel)}${r.lien ? " · " + esc(r.lien) : ""}</div></div><button class="btn btn-ghost btn-sm" data-act="reco-del" data-i="${i}">Retirer</button></div>`).join("")}</div>` : ""}
  ${nav(n ? "Continuer →" : "Passer →")}</section>`;
}
function stepMotivation() {
  const B = S.bilan; const v = B.motivation;
  const col = (i) => mix("#D9483B", "#22A06B", (i - 1) / 9);
  return `<section class="step"><div><p class="eyebrow">Parlons de toi</p><h1>Sur une échelle de 1 à 10, à quel point es-tu motivé(e) à atteindre ton objectif ?</h1></div>
  <div class="scale10" role="radiogroup" aria-label="Motivation">${Array.from({ length: 10 }, (_, k) => { const i = k + 1; const on = v === i; return `<button class="${on ? "on" : ""}" role="radio" aria-checked="${on}" data-act="motiv" data-v="${i}" style="${on ? `background:${col(i)}` : `color:${col(i)}`}">${i}</button>`; }).join("")}</div>
  ${v ? `<label class="field pop-in" for="b-motivationPourquoi">Qu'est-ce qui te motive le plus ?<input id="b-motivationPourquoi" type="text" data-bind="motivationPourquoi" value="${esc(B.motivationPourquoi)}" placeholder="Ex. : me sentir bien dans mes vêtements, avoir de l'énergie pour mes enfants…" autocomplete="off"></label>` : ""}
  ${nav("Suivant →", "btn-primary btn-xl", !v)}</section>`;
}
function stepEcheance() {
  const B = S.bilan; const opts = S.cfg.decouverte.echeances || []; const last = opts[opts.length - 1];
  return `<section class="step"><div><p class="eyebrow">Ton objectif</p><h1>Pour quand aimerais-tu voir tes premiers résultats ?</h1></div>
  <div class="answers stagger">${opts.map((o, i) => `<button class="answer ${B.echeance === o ? "on" : ""}" data-act="echeance" data-v="${esc(o)}" role="radio" aria-checked="${B.echeance === o}"><kbd>${i + 1}</kbd><span>${esc(o)}</span></button>`).join("")}</div>
  ${B.echeance && B.echeance === last ? `<div class="grid2 pop-in">${bField("evenement", "Quel événement ?", false, "text", "off", "Mariage, vacances, anniversaire…")}${bField("evenementDate", "Quand ?", false, "date")}</div>` : ""}
  ${nav("Suivant →", "btn-primary btn-xl", !B.echeance)}</section>`;
}
function stepDepenses() {
  const B = S.bilan; const j = depensesJour(B);
  return `<section class="step"><div><p class="eyebrow">On fait le point</p><h1>Combien dépenses-tu en extras au quotidien ?</h1><p class="muted" style="margin-top:10px;font-size:19px">Une estimation suffit, sans jugement : on fait juste le point.</p></div>
  <div class="stack">${S.cfg.decouverte.depenses.map((d) => `<div class="stepper"><div><b>${esc(d.label)}</b><div class="muted small">par ${d.par === "semaine" ? "semaine" : d.par === "mois" ? "mois" : "jour"}</div></div><div class="ctl"><button data-act="dep" data-id="${esc(d.id)}" data-d="-1" aria-label="Moins">−</button><output class="num">${eur(B.depenses[d.id])}</output><button data-act="dep" data-id="${esc(d.id)}" data-d="1" aria-label="Plus">+</button></div></div>`).join("")}</div>
  <div class="bigtotal pop-in"><div><span>Tes extras représentent environ</span><div><b class="num">${eur(j)}</b> <span>par jour</span></div></div><div style="text-align:right"><span>soit</span><div><b class="num" style="font-size:34px;color:#fff">${eur(j * 30)}</b> <span>par mois</span></div></div></div>
  ${nav()}</section>`;
}
function stepBudget() {
  const B = S.bilan; const r = budgetRepas(B);
  return `<section class="step"><div><p class="eyebrow">Ton budget</p><h1>Quel est ton budget courses par mois ?</h1></div>
  <div class="stack"><div class="stepper"><div><b>Budget courses du foyer</b><div class="muted small">par mois</div></div><div class="ctl"><button data-act="budget" data-d="-25" aria-label="Moins">−</button><output class="num">${eur(B.budget)}</output><button data-act="budget" data-d="25" aria-label="Plus">+</button></div></div>
  <div class="stepper"><div><b>Personnes au foyer</b></div><div class="ctl"><button data-act="foyer" data-d="-1" aria-label="Moins">−</button><output class="num">${n0(B.foyer)}</output><button data-act="foyer" data-d="1" aria-label="Plus">+</button></div></div></div>
  ${r ? `<div class="bigtotal pop-in"><div><span>Un repas fait maison te revient à environ</span><div><b class="num">${eur(r)}</b> <span>par personne</span></div></div></div>` : ""}
  ${nav()}</section>`;
}
function stepDecideur() {
  const B = S.bilan; const opts = [["seul", "Je décide seul(e)"], ["conjoint", "J'en parle avec mon/ma conjoint(e)"], ["autre", "Avec une autre personne"]];
  return `<section class="step"><div><p class="eyebrow">Dernière question</p><h1>Pour une décision comme celle-ci, tu décides seul(e) ?</h1></div>
  <div class="answers stagger">${opts.map(([v, l], i) => `<button class="answer ${B.decideur === v ? "on" : ""}" data-act="decideur" data-v="${v}" role="radio" aria-checked="${B.decideur === v}"><kbd>${i + 1}</kbd><span>${esc(l)}</span></button>`).join("")}</div>
  ${nav("Suivant →", "btn-primary btn-xl", !B.decideur)}</section>`;
}
const ENERGY = [
  { t: "Apports > dépenses", s: "Le corps met le surplus en réserve.", tilt: -11, l: [70, 56, 44], r: [40] },
  { t: "Équilibre", s: "Les apports couvrent les dépenses : le poids reste stable.", tilt: 0, l: [52, 40], r: [52, 40] },
  { t: "Léger déficit", s: "Le corps puise dans ses réserves pour compléter.", tilt: 11, l: [44], r: [70, 56, 44] }
];
function stepEnergie() {
  const B = S.bilan; const st = ENERGY[S.energyState] || ENERGY[1];
  const obj = B.objectif;
  const conseil = obj === "perte" ? "Pour ton objectif : un léger déficit, en gardant assez de protéines pour préserver tes muscles et ton énergie."
    : obj === "masse" ? "Pour ton objectif : un léger surplus, riche en protéines, associé à l'entraînement."
    : "Pour ton objectif : des repas équilibrés et réguliers, pour une énergie stable toute la journée.";
  const load = (arr, c) => `<div class="load">${arr.map((h) => `<i style="height:${h}px;--c:${c}"></i>`).join("")}</div>`;
  return `<section class="step" style="max-width:none"><div><p class="eyebrow">Comprendre l'énergie</p><h1>Ton corps fonctionne comme une balance</h1><p class="muted" style="margin-top:10px;font-size:19px">D'un côté, ce que tu manges et bois. De l'autre, ce que ton corps dépense : respirer, digérer, bouger, faire du sport.</p></div>
  <div class="balance-scene"><div class="balance" style="--tilt:${st.tilt}deg"><div class="base"></div><div class="post"></div>
    <div class="beam"><div class="pan l"><div class="cords"></div><div style="position:relative"><div class="dish"></div>${load(st.l, "#F08A24")}</div><div class="label">Apports</div></div><div class="pan r"><div class="cords"></div><div style="position:relative"><div class="dish"></div>${load(st.r, "#22A06B")}</div><div class="label">Dépenses</div></div></div></div></div>
  <div class="energy-cards">${ENERGY.map((e, i) => `<button class="${S.energyState === i ? "on" : ""}" data-act="energy" data-v="${i}" aria-pressed="${S.energyState === i}"><b>${esc(e.t)}</b><span class="muted small">${esc(e.s)}</span></button>`).join("")}</div>
  <div class="card-soft"><b style="font-size:19px">${esc(conseil)}</b></div>
  ${nav()}</section>`;
}
function stepComparatif() {
  const E = S.cfg.energie; const a = E.avant, b = E.apres;
  const mk = Math.max(n0(a.kcal), n0(b.kcal), 1), mp = Math.max(n0(a.proteines), n0(b.proteines), 1), mx = Math.max(n0(a.prix), n0(b.prix), 1);
  const card = (m, good) => `<div class="meal ${good ? "good" : ""} tilt pop-in"><div><h2>${esc(m.titre)}</h2><p class="muted">${esc(m.detail)}</p></div>
    <div class="metric"><span>Calories</span><div class="bar"><i data-w="${Math.round((100 * n0(m.kcal)) / mk)}" style="width:0;background-color:#F08A24"></i></div><b class="num">${n0(m.kcal)}</b></div>
    <div class="metric"><span>Protéines</span><div class="bar"><i data-w="${Math.round((100 * n0(m.proteines)) / mp)}" style="width:0;background-color:#22A06B"></i></div><b class="num">${n0(m.proteines)} g</b></div>
    <div class="metric"><span>Prix</span><div class="bar"><i data-w="${Math.round((100 * n0(m.prix)) / mx)}" style="width:0;background-color:#2F6FD6"></i></div><b class="num">${eur(m.prix)}</b></div></div>`;
  const dk = n0(a.kcal) - n0(b.kcal), dp = n0(b.proteines) - n0(a.proteines);
  return `<section class="step" style="max-width:none"><div><p class="eyebrow">Un exemple concret</p><h1>La différence sur un simple petit-déjeuner</h1></div>
  <div class="vs scene">${card(a, false)}<div class="vsb">VS</div>${card(b, true)}</div>
  ${dk > 0 || dp > 0 ? `<div class="potential pop-in"><div><b style="font-size:21px">Chaque matin : ${dk > 0 ? `${dk} kcal en moins` : ""}${dk > 0 && dp > 0 ? " et " : ""}${dp > 0 ? `${dp} g de protéines en plus` : ""}.</b><p class="muted">Un repas complet, rapide à préparer, qui aide à tenir jusqu'au déjeuner.</p></div></div>` : ""}
  <p class="disclaimer">${esc(E.mention)}</p>
  ${nav()}</section>`;
}
function stepChallenge() {
  const B = S.bilan; const ch = S.cfg.challenge;
  return `<section class="step" style="max-width:none"><div><p class="eyebrow">Passer à l'action</p><h1>Rejoins le ${esc(ch.nom)}</h1></div>
  <div class="challenge-hero"><div class="scene"><div class="ticket float"><span class="date">Prochain départ : ${esc(new Date(nextDepart()).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }))}</span><h2>${esc(ch.nom)}</h2><div class="price num">${n0(ch.prix)}<small> €</small></div><p style="opacity:.92">${esc(ch.texte)}</p></div></div>
  <div class="stack"><ul class="list-check stagger">${(ch.contenu || []).map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
  <button class="challenge-pick btn ${B.challengeInteret ? "btn-primary" : "btn-ghost"} btn-xl" data-act="ch-interet" aria-pressed="${B.challengeInteret}">${B.challengeInteret ? "✓ Ça m'intéresse" : "Ça m'intéresse"}</button></div></div>
  <div class="card-soft"><b style="font-size:19px">Et si tu veux aller plus vite ?</b><p class="muted">Avec un suivi personnalisé et un programme adapté à ton objectif, le challenge t'est offert. On regarde ensemble ?</p></div>
  ${nav("Voir le suivi personnalisé →")}</section>`;
}
function stepSolution() {
  const B = S.bilan; const obj = S.cfg.objectifs.find((o) => o.id === B.objectif) || S.cfg.objectifs[0] || {};
  const regle = S.cfg.regles[obj.regle] || S.cfg.regles.remplacer || { titre: "", texte: "" };
  const packs = packsFor(B.objectif); const dj = depensesJour(B);
  if (!B.packId || !packs.find((p) => p.id === B.packId)) {
    let pick = packs.find((p) => p.populaire) || packs[Math.floor(packs.length / 2)];
    if (B.motivation && B.motivation <= 6 || (dj && pick && packTotal(pick) / (n0(pick.duree) || 21) > dj * 1.5)) pick = packs.slice().sort((a, b) => packTotal(a) - packTotal(b))[0] || pick;
    B.packId = pick ? pick.id : null;
  }
  const pk = packs.find((p) => p.id === B.packId); const R = scoreOf(B.reponses);
  const total = pk ? packTotal(pk) : 0; const jours = (pk && n0(pk.duree)) || 21; const ch = S.cfg.challenge || {};
  return `<section class="step" style="max-width:none"><div><p class="eyebrow">${esc(S.cfg.suivi.titre)} · ${esc(obj.label || "")}</p><h1>${esc(B.prenom)}, voici ce que je te recommande</h1></div>
  <div class="card stack"><h2 style="color:var(--gold-text)">${esc(regle.titre)}</h2><p style="font-size:19px">${esc(regle.texte)}</p><p class="muted">${esc(S.cfg.suivi.texte)}</p>${R.weak.length ? `<p class="muted">Pensé pour tes priorités : ${R.weak.map((d) => esc(d.q.axe || "")).join(" · ")}.</p>` : ""}</div>
  <div class="packs scene" role="radiogroup" aria-label="Programmes">${packs.map((p) => { const t = packTotal(p); const d = n0(p.duree) || 21; return `<button class="pack tilt ${p.id === B.packId ? "on" : ""}" role="radio" aria-checked="${p.id === B.packId}" data-act="pack" data-id="${esc(p.id)}">${p.populaire ? '<span class="flag">Le plus choisi</span>' : ""}<h3>${esc(p.nom)}</h3><span class="muted small">${esc(p.description || "")}</span><span class="price num">${eur(t)}</span><span class="perday">≈ ${eur(t / d)} par jour · ${d} jours</span></button>`; }).join("")}</div>
  ${pk ? `<div class="card"><h2 style="margin-bottom:4px">Dans ton pack ${esc(pk.nom)}</h2>${packLines(pk).map(({ p, q }) => `<div class="prod"><div><h3>${q > 1 ? q + " × " : ""}${esc(p.nom)}</h3><span class="pill tone-muted" style="margin-top:6px">${esc(USAGES[p.usage] || "")}</span><ul>${(p.avantages || []).map((a) => `<li>${esc(a)}</li>`).join("")}</ul></div><div class="p num">${eur(n0(p.prix) * q)}</div>
  ${(p.parfums || []).length ? `<div class="flavors" role="radiogroup" aria-label="Parfum ${esc(p.nom)}">${p.parfums.map((fl) => { const on = (B.parfums[p.id] || p.parfums[0]) === fl; return `<button class="${on ? "on" : ""}" role="radio" aria-checked="${on}" data-act="flavor" data-p="${esc(p.id)}" data-v="${esc(fl)}">${esc(fl)}</button>`; }).join("")}</div>` : ""}</div>`).join("")}</div>` : `<div class="notice">Aucun programme n'est configuré pour cet objectif. Ajoute-en un dans Réglages › Programmes.</div>`}
  <div class="grid2"><div class="totals"><div class="line"><span>Pack ${esc(pk ? pk.nom : "")}</span><span class="num">${eur(total)}</span></div>
  ${ch.actif ? `<div class="line"><span>${esc(ch.nom)}</span><span><span class="strike">${eur(ch.prix)}</span> <b class="tone-good">OFFERT</b></span></div>` : ""}
  <div class="hr"></div><div class="line big"><span>Total</span><span class="num">${eur(total)}</span></div><div class="line"><span class="muted">Soit par jour</span><b class="num" style="color:var(--gold-text)">${eur(total / jours)}</b></div></div>
  ${dj ? `<div class="compare2"><div><span class="muted small">Tes extras aujourd'hui</span><b class="num">${eur(dj)}</b><span class="muted small">par jour</span></div><div style="border-color:var(--flame)"><span class="muted small">Ton programme</span><b class="num" style="color:var(--gold-text)">${eur(total / jours)}</b><span class="muted small">par jour</span></div></div>` : ""}</div>
  <p class="disclaimer">${esc(S.cfg.mentionLegale)}</p>
  ${nav("Valider ce choix →", "btn-primary btn-xl", !pk)}</section>`;
}
function stepDecision() {
  const B = S.bilan; const pk = S.cfg.packs.find((p) => p.id === B.packId); const ch = S.cfg.challenge || {};
  const opts = [["programme", "Je démarre mon programme", pk ? `Pack ${pk.nom} · ${eur(packTotal(pk))}${ch.actif ? " · challenge offert" : ""}` : ""]];
  if (ch.actif) opts.push(["challenge", `Je rejoins le ${ch.nom}`, `${eur(ch.prix)} sans produits`]);
  opts.push(["reflechit", "Je réfléchis", "On fixe une date pour en reparler"], ["pas", "Pas pour le moment", "On reste en contact"]);
  return `<section class="step"><div><p class="eyebrow">Décision</p><h1>Alors ${esc(B.prenom)}, on y va ?</h1>${B.evenement ? `<p class="muted" style="margin-top:8px;font-size:19px">Objectif : ${esc(B.evenement)}${B.evenementDate ? " · " + esc(fmtDL(new Date(B.evenementDate).getTime())) : ""}</p>` : ""}</div>
  <div class="answers stagger" role="radiogroup" aria-label="Décision">${opts.map(([id, t, s]) => `<button class="answer ${B.decision === id ? "on" : ""}" role="radio" aria-checked="${B.decision === id}" data-act="decision" data-v="${id}"><span><b>${esc(t)}</b>${s ? `<br><span class="muted small">${esc(s)}</span>` : ""}</span></button>`).join("")}</div>
  ${B.decision === "reflechit" ? `<div class="stack pop-in" style="gap:8px"><b>Relance prévue</b><div class="seg">${[[1, "Demain"], [2, "Dans 2 jours"], [3, "Dans 3 jours"], [7, "Dans 1 semaine"]].map(([d, l]) => `<button class="${B.relanceJ === d ? "on" : ""}" data-act="relance-j" data-v="${d}">${l}</button>`).join("")}</div></div>` : ""}
  <label class="field" for="b-note">Note pour le suivi (facultatif)<textarea id="b-note" data-bind="note" placeholder="Ex. : préfère être appelée le soir, veut se sentir bien pour le mariage de sa sœur">${esc(B.note)}</textarea></label>
  <p class="err" id="b-err" role="alert"></p>
  <div class="stepnav"><button class="btn btn-ghost" data-act="prev">← Retour</button><button class="btn btn-primary btn-xl" data-act="finalize" ${B.decision ? "" : "disabled"}>Valider et préparer l'envoi ✓</button></div></section>`;
}
function rapportUrl(tok) { return `${location.origin}/r/?t=${tok}${S.store.mode === "demo" ? "&demo=1" : ""}`; }
function stepEnvoi() {
  const B = S.bilan; const c = S.contacts.get(B.savedId);
  const recos = ((c && c.recos) || []).map((id) => S.contacts.get(id)).filter(Boolean);
  const url = B.rapportToken ? rapportUrl(B.rapportToken) : "";
  const vars = c ? { ...msgVars(c), lien: url } : {};
  const wa = c ? waLink(c.tel, tpl(S.cfg.messages.envoiRapport, vars)) : "#";
  const mail = c ? mailLink(c.email, tpl(S.cfg.messages.emailSujet, vars), tpl(S.cfg.messages.emailCorps, vars)) : "#";
  const prefEmail = B.canal === "email" && c && c.email;
  return `<section class="step"><div><p class="eyebrow">Bilan enregistré</p><h1>${B.decision === "programme" || B.decision === "challenge" ? `Bienvenue dans l'aventure, ${esc(B.prenom)} !` : `Merci ${esc(B.prenom)} pour ce bilan !`}</h1>
  <p class="muted" style="margin-top:10px;font-size:19px">Score ${c && c.bilan ? c.bilan.score : ""}/100 · ${esc(decisionLabel(B.decision))}</p></div>
  ${url ? `<div class="card stack pop-in"><div class="row">${I.gift}<div><h2>Envoie le rapport et l'e-book</h2><p class="muted">Un seul lien : le rapport personnalisé, son PDF et l'e-book « ${esc(S.cfg.ebook.titre)} ».</p></div></div>
    <div class="row">${prefEmail ? "" : `<a class="btn btn-wa btn-xl" href="${esc(wa)}" target="_blank" rel="noopener" data-act="sent" data-id="${c.id}" data-k="rapport-wa">${I.wa} Envoyer sur WhatsApp</a>`}
    ${c && c.email ? `<a class="btn ${prefEmail ? "btn-mail btn-xl" : "btn-ghost"}" href="${esc(mail)}" data-act="sent" data-id="${c.id}" data-k="rapport-mail">${I.mail} Envoyer par e-mail</a>` : ""}
    ${prefEmail ? `<a class="btn btn-ghost" href="${esc(wa)}" target="_blank" rel="noopener" data-act="sent" data-id="${c.id}" data-k="rapport-wa">${I.wa} WhatsApp</a>` : ""}
    <button class="btn btn-ghost btn-sm" data-act="copy" data-v="${esc(url)}">${I.link} Copier le lien</button><a class="btn btn-ghost btn-sm" href="${esc(url)}" target="_blank" rel="noopener">Voir le rapport</a></div>
    ${B.canal === "email" && !(c && c.email) ? `<p class="muted small">Pas d'e-mail renseigné : envoie-le sur WhatsApp.</p>` : ""}</div>` : `<div class="notice">Le lien du rapport n'a pas pu être créé. Tu peux réessayer depuis la fiche du client.</div>`}
  ${recos.length ? `<div class="card stack"><h2>Invite les proches maintenant</h2><p class="muted">Le message précise que c'est ${esc(B.prenom)} qui a donné leur numéro.</p><div class="reco-list">${recos.map((r) => `<div class="reco-item"><span class="avatar">${esc(initials(r))}</span><div style="flex:1;min-width:0"><b>${esc(nomC(r))}</b><div class="muted small">${esc(r.tel)} · ${statutPill(r.statut)}</div></div>${r.statut === "a_inviter" ? `<button class="btn btn-wa btn-sm" data-act="invite" data-id="${r.id}">${I.wa} Inviter</button>` : ""}</div>`).join("")}</div></div>` : ""}
  <div class="row"><button class="btn btn-primary" data-act="bilan-new">Nouveau bilan</button>${c ? `<button class="btn btn-ghost" data-act="fiche" data-id="${c.id}">Voir la fiche</button>` : ""}<button class="btn btn-ghost" data-act="bilan-quit">Retour à l'accueil</button></div></section>`;
}
function coachBody(key, B) {
  const txt = (S.cfg.coach || {})[key === "envoi" ? "fin" : key] || "";
  const showObj = ["solution", "decision", "challenge", "envoi"].includes(key);
  const alerts = [];
  if (B) {
    if (B.motivation && B.motivation <= 6 && ["challenge", "solution", "decision"].includes(key)) alerts.push(`Motivation ${B.motivation}/10 : propose d'abord le challenge à ${eur(S.cfg.challenge.prix)}.`);
    if (B.motivationPourquoi && ["solution", "decision"].includes(key)) alerts.push(`Sa raison : « ${B.motivationPourquoi} »`);
    if (B.evenement && ["solution", "decision"].includes(key)) alerts.push(`Son échéance : ${B.evenement}`);
    if (B.decideur && B.decideur !== "seul" && ["solution", "decision"].includes(key)) alerts.push("Décide à deux : propose d'appeler l'autre personne 5 minutes.");
    const dj = depensesJour(B); if (dj && ["solution", "decision"].includes(key)) alerts.push(`Ses extras : ${eur(dj)} par jour.`);
  }
  const pk = B ? S.cfg.packs.find((p) => p.id === B.packId) : null;
  const vars = { prixRepas: eur(prixRepas()), depensesJour: eur(B ? depensesJour(B) : 0), programmeJour: eur(pk ? packTotal(pk) / (n0(pk.duree) || 21) : 0) };
  return `<div class="coach"><h3>À dire maintenant</h3><p style="font-size:18px">${esc(txt)}</p>${alerts.map((a) => `<div class="alert">${esc(a)}</div>`).join("")}${showObj ? `<h3>Objections</h3>${S.cfg.objections.map((o) => `<details><summary>${esc(o.q)}</summary><p>${esc(tpl(o.r, vars))}</p></details>`).join("")}` : ""}</div>`;
}

/* ---------- Navigation dans le bilan ---------- */
function bErr(m) { const x = $("#b-err") || $("#r-err"); if (x) x.textContent = m; return false; }
function goNext() {
  const B = S.bilan; if (!B) return; const id = currentStepId();
  if (id === "accueil") {
    if (!B.prenom.trim()) return bErr("Indique le prénom pour continuer.");
    if (digits(B.tel).length < 9) return bErr("Indique un numéro de téléphone valide.");
    if (B.email && !/^\S+@\S+\.\S+$/.test(B.email.trim())) return bErr("L'adresse e-mail semble incorrecte.");
    if (!B.objectif) return bErr("Choisis l'objectif principal.");
    if (!B.consent) return bErr("Coche la case d'accord pour pouvoir enregistrer le bilan.");
  }
  if (id.startsWith("q")) { const q = S.cfg.questions[+id.slice(1)]; if (!q || B.reponses[q.id] == null) return; }
  if (id === "recos" && (B.recoForm.prenom.trim() || B.recoForm.tel.trim())) { if (!addReco()) return; }
  if (id === "motivation" && !B.motivation) return;
  if (id === "echeance" && !B.echeance) return;
  if (id === "decideur" && !B.decideur) return;
  if (id === "solution" && !B.packId) return;
  if (id === "decision") return finalize();
  if (id === "envoi") return;
  B.stepIdx = Math.min(B.stepIdx + 1, steps().length - 1);
  if (currentStepId() === "energie") S.energyState = B.objectif === "perte" ? 2 : B.objectif === "masse" ? 0 : 1;
  afterStep();
}
function goPrev() { const B = S.bilan; if (!B || B.stepIdx <= 0 || B.savedId) return; B.stepIdx--; afterStep(); }
function afterStep() { saveDraft(); pushLive(); render(); scrollTop(); }
let advTimer = null;
function answer(qid, i) {
  S.bilan.reponses[qid] = i; saveDraft(); render();
  clearTimeout(advTimer);
  advTimer = setTimeout(() => { if (S.view === "bilan" && S.bilan) { const id = currentStepId(); if (id.startsWith("q") && (S.cfg.questions[+id.slice(1)] || {}).id === qid) goNext(); } }, 300);
}
function findByNumber(tel, exceptId) { const n = waNumber(tel); if (!n) return null; for (const c of S.contacts.values()) if (c.id !== exceptId && waNumber(c.tel) === n) return c; return null; }
function addReco() {
  const B = S.bilan; const f = B.recoForm;
  const err = (m) => { const x = $("#r-err"); if (x) x.textContent = m; return false; };
  if (!f.prenom.trim()) return err("Indique au moins le prénom.");
  if (digits(f.tel).length < 9) return err("Indique un numéro de téléphone valide.");
  if (waNumber(f.tel) === waNumber(B.tel)) return err("C'est le numéro de " + B.prenom + ".");
  if (B.recos.some((r) => waNumber(r.tel) === waNumber(f.tel))) return err("Cette personne est déjà dans la liste.");
  const ex = findByNumber(f.tel, B.contactId);
  if (ex && ex.statut === "ne_plus_contacter") return err("Ce numéro a demandé à ne plus être contacté. On ne l'ajoute pas.");
  B.recos.push({ prenom: f.prenom.trim(), nom: f.nom.trim(), tel: f.tel.trim(), lien: f.lien || "" });
  B.recoForm = { prenom: "", nom: "", tel: "", lien: "" };
  saveDraft(); render(); const p = $("#r-prenom"); if (p) p.focus();
  return true;
}
function rapportData(c, R) {
  const pk = c.programme;
  return {
    v: 1, prenom: c.prenom, date: Date.now(), score: R.global, potentiel: R.potentiel, niveau: niveau(R.global),
    cats: S.cfg.categories.filter((x) => R.catScores[x.id] != null).map((x) => ({ label: x.label, score: R.catScores[x.id], couleur: safeColor(x.couleur) })),
    forts: R.strong.map((d) => d.q.fort || d.q.texte), axes: R.weak.map((d) => d.q.axe || d.q.texte),
    objectif: objLabel(c.objectif) + (c.objectifAutre ? " : " + c.objectifAutre : ""),
    decision: c.decision, programme: c.decision === "programme" && pk ? { nom: pk.nom, items: (pk.items || []).map((i) => (i.q > 1 ? i.q + " × " : "") + i.nom + (i.parfum ? " · " + i.parfum : "")) } : null,
    challenge: c.challenge ? { nom: S.cfg.challenge.nom, depart: nextDepart(), offert: c.decision === "programme" } : null,
    coach: S.profil.pseudo || "", coachTel: waNumber(S.profil.tel || ""), equipe: S.cfg.equipe.nom, slogan: S.cfg.equipe.slogan,
    ebook: S.cfg.ebook, mention: "Score bien-être indicatif, calculé à partir des habitudes déclarées. Ce n'est pas un diagnostic médical."
  };
}
let finalizing = false;
async function finalize() {
  const B = S.bilan; if (!B || !B.decision || finalizing || B.savedId) return;
  finalizing = true;
  try {
    const now = Date.now(); const R = scoreOf(B.reponses); const pk = S.cfg.packs.find((p) => p.id === B.packId);
    const ex = B.contactId ? S.contacts.get(B.contactId) : null;
    const c = ex ? clone(ex) : { id: newId("c_"), createdAt: now, historique: [], notes: [] };
    Object.assign(c, { prenom: B.prenom.trim(), nom: B.nom.trim(), tel: B.tel.trim(), email: B.email.trim(), canal: B.canal, age: B.age, ville: B.ville.trim(), objectif: B.objectif, objectifAutre: B.objectifAutre, consent: true, consentAt: now, dernierContact: now });
    c.bilan = {
      at: now, score: R.global, cats: R.catScores, potentiel: R.potentiel,
      axes: R.weak.map((d) => d.q.axe || d.q.texte), forts: R.strong.map((d) => d.q.fort || d.q.texte),
      reponses: S.cfg.questions.filter((q) => B.reponses[q.id] != null && q.options[B.reponses[q.id]]).map((q) => ({ q: q.texte, r: q.options[B.reponses[q.id]].l, p: n0(q.options[B.reponses[q.id]].p), cat: q.cat })),
      poids: B.poids, taille: B.taille, objectifPoids: B.objectifPoids
    };
    c.decouverte = { motivation: B.motivation, pourquoi: B.motivationPourquoi, echeance: B.echeance, evenement: B.evenement, evenementDate: B.evenementDate, depensesJour: depensesJour(B), budget: n0(B.budget), foyer: n0(B.foyer), budgetRepas: budgetRepas(B), decideur: B.decideur };
    c.scores = (c.scores || []).concat([{ at: now, score: R.global }]);
    if (B.decision === "programme" && pk) c.programme = { packId: pk.id, nom: pk.nom, total: packTotal(pk), at: now, items: packLines(pk).map(({ p, q }) => ({ nom: p.nom, q, parfum: (p.parfums || []).length ? B.parfums[p.id] || p.parfums[0] : "", prix: n0(p.prix) })) };
    c.challenge = !!S.cfg.challenge.actif && (B.decision === "programme" || B.decision === "challenge");
    c.challengeInteret = !!B.challengeInteret;
    c.decision = B.decision;
    c.statut = B.decision === "programme" || B.decision === "challenge" ? "client" : B.decision === "reflechit" ? "bilan_fait" : "pas_interesse";
    c.relanceAt = B.decision === "reflechit" ? now + n0(B.relanceJ) * DAY : null;
    c.historique = (c.historique || []).concat([{ at: now, t: `Bilan bien-être : ${R.global}/100 · ${decisionLabel(B.decision)}${B.decision === "programme" && c.programme ? " · pack " + c.programme.nom : ""}${c.challenge ? " · challenge" : ""}` }]);
    if (B.note.trim()) c.notes = (c.notes || []).concat([{ at: now, t: B.note.trim() }]);
    const ids = [];
    for (const r of B.recos) {
      const exist = findByNumber(r.tel, c.id);
      if (exist) {
        if (exist.statut !== "ne_plus_contacter") { const e2 = clone(exist); e2.historique = (e2.historique || []).concat([{ at: now, t: `Recommandé(e) aussi par ${nomC(c)}` }]); await saveContact(e2); }
        ids.push(exist.id); continue;
      }
      const rc = { id: newId("c_"), createdAt: now, prenom: r.prenom, nom: r.nom, tel: r.tel, lien: r.lien, statut: "a_inviter", recommandePar: c.id, recommandeParNom: nomC(c), consent: false, historique: [{ at: now, t: `Recommandé(e) par ${nomC(c)}${r.lien ? " (" + r.lien + ")" : ""}` }], notes: [] };
      await saveContact(rc); ids.push(rc.id);
    }
    c.recos = [...new Set([...(c.recos || []), ...ids])];
    if (c.recommandePar) { const ref = S.contacts.get(c.recommandePar); if (ref) { const r2 = clone(ref); r2.historique = (r2.historique || []).concat([{ at: now, t: `${c.prenom}, que tu as recommandé(e), a fait son bilan : ${decisionLabel(B.decision).toLowerCase()}` }]); await saveContact(r2); } }
    let tok = null;
    try { tok = token(); await S.store.createRapport(tok, c.id, rapportData(c, R)); c.rapports = (c.rapports || []).concat([{ at: now, token: tok }]); } catch (e) { console.error(e); tok = null; }
    const ok = await saveContact(c);
    B.savedId = c.id; B.rapportToken = tok; B.stepIdx = steps().length - 1; lsDel(LS.draft); pushLive(); render(); scrollTop();
    if (B.decision === "programme" || B.decision === "challenge") confetti();
    toast(ok ? "Bilan enregistré dans ton CRM" : "Bilan affiché mais pas enregistré en ligne", !ok);
  } finally { finalizing = false; }
}
async function newRapportFor(id) {
  const c0 = S.contacts.get(id); if (!c0 || !c0.bilan) return null;
  const c = clone(c0); const rep = {};
  const R = { global: c.bilan.score, potentiel: c.bilan.potentiel || c.bilan.score, catScores: c.bilan.cats || {}, strong: (c.bilan.forts || []).map((t) => ({ q: { fort: t } })), weak: (c.bilan.axes || []).map((t) => ({ q: { axe: t } })) };
  const tok = token(); await S.store.createRapport(tok, c.id, rapportData(c, R));
  c.rapports = (c.rapports || []).concat([{ at: Date.now(), token: tok }]); await saveContact(c); return tok;
}

/* ---------- Effets ---------- */
function confetti() {
  if (reduceMotion()) return;
  const cv = document.createElement("canvas"); cv.id = "confetti"; document.body.appendChild(cv);
  const ctx = cv.getContext("2d"); const W = (cv.width = innerWidth), H = (cv.height = innerHeight);
  const cols = ["#7AC143", "#1F7A2A", "#FFD25A", "#9BD86A", "#152033"];
  const P = Array.from({ length: 160 }, () => ({ x: W / 2 + (Math.random() - 0.5) * 200, y: H * 0.35, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4, s: 6 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[(Math.random() * cols.length) | 0] }));
  const t0 = performance.now();
  const tick = (t) => {
    ctx.clearRect(0, 0, W, H);
    for (const p of P) { p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, Math.cos(p.r * 2)); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); }
    if (t - t0 < 3200) requestAnimationFrame(tick); else cv.remove();
  };
  requestAnimationFrame(tick);
}
document.addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse" || reduceMotion()) return;
  const el = e.target.closest && e.target.closest(".tilt"); if (!el) return;
  const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
  el.style.setProperty("--ry", (x * 8).toFixed(2) + "deg"); el.style.setProperty("--rx", (-y * 8).toFixed(2) + "deg");
});
document.addEventListener("pointerout", (e) => { const el = e.target.closest && e.target.closest(".tilt"); if (el && !el.contains(e.relatedTarget)) { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); } });
