/* =====================================================================
   RENDU GÉNÉRAL
   ===================================================================== */
function render() {
  const root = $("#root");
  if (!S.ready) { root.innerHTML = `<div class="auth-wrap"><div class="empty" style="border:0"><img src="/assets/logo-full.webp" alt="97 Eagle Team" style="width:140px"><b>Chargement…</b></div></div>`; return; }
  if (!S.access || !S.access.member) { root.innerHTML = renderAuth(); return; }
  if (S.view === "bilan" && S.bilan) { root.innerHTML = renderBilan(); animateIn(); return; }
  root.innerHTML = renderTop() + modeNote() + `<main id="main">${renderView()}</main>`;
  animateIn();
}
function safeRender() {
  if (!S.ready || S.view === "bilan" || S.view === "reglages") return;
  const a = document.activeElement;
  if (a && ["INPUT", "TEXTAREA", "SELECT"].includes(a.tagName)) return;
  if ($("#modal-root").innerHTML) return;
  render();
}
function renderTop() {
  const tabs = [["home", "Accueil", I.home], ["contacts", "Contacts", I.users], ["stats", "Stats", I.chart], ["equipe", "Équipe", I.trophy], ["souffleur", "Souffleur", I.ear]];
  if (isLeader()) tabs.push(["reglages", "Réglages", I.gear]);
  const nb = rappels().length;
  return `<header class="topbar"><a class="brand" href="#" data-act="nav" data-v="home">${logoImg()}<span><b>${esc(S.cfg.equipe.nom)}</b><small>${esc(S.cfg.equipe.slogan)}</small></span></a>
  <nav class="nav" aria-label="Navigation">${tabs.map(([v, l, icn]) => `<button data-act="nav" data-v="${v}" ${S.view === v || (v === "contacts" && S.view === "fiche") ? 'aria-current="page"' : ""}>${icn}<span>${l}</span>${v === "contacts" && nb ? `<span class="badge">${nb}</span>` : ""}</button>`).join("")}</nav></header>`;
}
function modeNote() {
  if (S.store.mode === "demo") return `<p class="mode-note"><b>Mode démo</b> · les données restent sur cet appareil. <button class="linkbtn" data-act="logout">Quitter la démo</button></p>`;
  return "";
}
function renderView() {
  switch (S.view) {
    case "contacts": return viewContacts();
    case "fiche": return viewFiche();
    case "stats": return viewStats();
    case "equipe": return viewEquipe();
    case "souffleur": return viewSouffleur();
    case "reglages": return viewReglages();
    default: return viewHome();
  }
}
let soufTimer = null;
function go(v) {
  if (S.view === "reglages" && v !== "reglages") applyTheme();
  if (v === "reglages" && !S.draft) S.draft = clone(S.cfg);
  S.view = v; render(); scrollTop();
  clearInterval(soufTimer);
  if (v === "souffleur") { const poll = async () => { try { const l = await S.store.getLive(); if (JSON.stringify(l) !== JSON.stringify(S.live)) { S.live = l; safeRender(); } } catch (e) {} }; poll(); soufTimer = setInterval(poll, 4000); }
  if (v === "equipe") loadTeam();
}
async function loadTeam() {
  try { S.team = await S.store.team(); if (isLeader()) S.members = await S.store.members(); if (S.view === "equipe") safeRender(); } catch (e) { console.warn(e); }
}
function profilForm() {
  return `<div class="card stack"><h2>Ton profil de coach</h2><div class="grid2"><label class="field" for="pseudo">Ton prénom (signé dans les messages et affiché dans le classement)<input id="pseudo" type="text" value="${esc(S.profil.pseudo || "")}" placeholder="Ex. : Kévin" autocomplete="given-name"></label>
  <label class="field" for="coach-tel">Ton WhatsApp (bouton « Contacter mon coach » sur les rapports)<input id="coach-tel" type="tel" value="${esc(S.profil.tel || "")}" placeholder="0690 12 34 56" autocomplete="tel"></label></div><div class="row between"><span class="muted small">${S.store.mode === "neon" && S.access ? "Connecté : " + esc(S.access.email || "") : ""}</span><div class="row"><button class="btn btn-ghost btn-sm" data-act="logout">${S.store.mode === "demo" ? "Quitter la démo" : "Se déconnecter"}</button><button class="btn btn-sm" data-act="save-profil">Enregistrer</button></div></div></div>`;
}

/* ---------- Accueil ---------- */
function viewHome() {
  const st = computeStats(); const rem = rappels(); const draft = lsGet(LS.draft, null);
  const obj = n0(S.cfg.objectifSemaine) || 1; const pct = Math.min(100, Math.round((100 * st.semaine) / obj));
  return `<div class="stack" style="gap:24px">
  <div class="hero-home scene">
    <div class="start-card tilt"><img class="emblem" src="/assets/logo-embleme.webp" alt="">
      <p class="slogan">${esc(S.cfg.equipe.slogan)}</p>
      <h1>${S.profil.pseudo ? `Prêt pour ton prochain bilan, ${esc(S.profil.pseudo)} ?` : "Prêt pour ton prochain bilan ?"}</h1>
      <p style="font-size:19px">Lance l'appel WhatsApp, partage ton écran et laisse-toi guider : bilan, score, cadeau, découverte, énergie, challenge, programme et envoi.</p>
      <div class="row"><button class="btn btn-primary btn-xl" data-act="bilan-new">Démarrer un bilan</button>
      ${draft && draft.prenom && !draft.savedId ? `<button class="btn btn-ghost" data-act="bilan-resume">Reprendre le bilan de ${esc(draft.prenom)}</button>` : ""}</div>
    </div>
    <div class="card stack">
      <div class="row between"><h2>Ta semaine</h2><span class="pill tone-gold">Objectif ${obj} bilans</span></div>
      <div><b style="font-family:var(--font-display);font-size:48px;font-weight:900" class="num">${st.semaine}</b><span class="muted" style="font-weight:800"> / ${obj} bilans</span></div>
      <div class="bar" style="height:16px"><i data-w="${pct}" style="width:0;background-color:var(--flame)"></i></div>
      <div class="grid3" style="gap:10px">${tile("Clients", st.clients, "")}${tile("Recos", st.recos, "")}${tile("Invitations", st.invites, "")}</div>
    </div>
  </div>
  ${S.profil.pseudo ? "" : profilForm()}
  <section class="stack" style="gap:10px">
    <div class="row between"><h2>À faire</h2><button class="btn btn-ghost btn-sm" data-act="nav" data-v="contacts">Tous les contacts</button></div>
    ${rem.length ? rem.slice(0, 6).map(reminderHTML).join("") + (rem.length > 6 ? `<p class="muted small">+ ${rem.length - 6} autres rappels dans Contacts</p>` : "") : `<div class="empty"><b>Rien en attente</b><span>Les invitations à envoyer, les relances et les rendez-vous du jour apparaîtront ici.</span></div>`}
  </section></div>`;
}
function reminderHTML(r) {
  const col = { info: "var(--info)", warn: "var(--warn)", bad: "var(--bad)", good: "var(--good)", gold: "var(--gold)" }[r.tone];
  let btn = "";
  if (r.act === "invite") btn = `<button class="btn btn-wa btn-sm" data-act="invite" data-id="${r.c.id}">${I.wa} Inviter</button>`;
  else if (r.act === "msg") btn = `<button class="btn btn-wa btn-sm" data-act="msg" data-id="${r.c.id}" data-tpl="${r.tpl}">${I.wa} ${esc(r.label)}</button>`;
  else if (r.act === "start") btn = `<button class="btn btn-primary btn-sm" data-act="bilan-from" data-id="${r.c.id}">Démarrer le bilan</button>`;
  return `<div class="reminder"><i class="stripe" style="background:${col}"></i><div data-act="fiche" data-id="${r.c.id}" style="cursor:pointer;min-width:0"><div class="t">${esc(r.t)}</div><div class="s">${esc(r.s)}</div></div><div class="row">${btn}</div></div>`;
}

/* =====================================================================
   MESSAGES WHATSAPP
   ===================================================================== */
function msgVars(c) {
  const ref = c.recommandePar ? S.contacts.get(c.recommandePar) : null; const pk = c.programme;
  return {
    prenom: c.prenom || "", nom: c.nom || "",
    client: ref ? nomC(ref) : c.recommandeParNom || "Un(e) de tes proches",
    coach: S.profil.pseudo || "ton coach", equipe: S.cfg.equipe.nom,
    score: c.bilan ? c.bilan.score : "",
    axes: ((c.bilan && c.bilan.axes) || []).filter(Boolean).map((a) => "• " + a).join("\n"),
    programme: pk ? `${pk.nom}${pk.items && pk.items.length ? " (" + pk.items.map((i) => i.nom + (i.parfum ? " " + i.parfum : "")).join(", ") + ")" : ""}` : c.decision === "challenge" ? S.cfg.challenge.nom : c.decision === "reflechit" ? "on en reparle très vite" : "on reste en contact",
    date: c.rdvAt ? fmtDT(c.rdvAt) : "", prixRepas: eur(prixRepas()),
    lien: c.rapports && c.rapports.length ? rapportUrl(c.rapports[c.rapports.length - 1].token) : ""
  };
}
function openMsg(id, key) {
  const c = S.contacts.get(id); if (!c) return;
  if (c.statut === "ne_plus_contacter") { toast("Ce contact a demandé à ne plus être contacté.", true); return; }
  const txt = tpl((S.cfg.messages || {})[key] || "", msgVars(c));
  const titles = { invitation: "Inviter " + c.prenom, relanceInvite: "Relancer " + c.prenom, rdv: "Confirmer le rendez-vous", recap: "Récap pour " + c.prenom, envoiRapport: "Rapport pour " + c.prenom, relanceReflechit: "Relancer " + c.prenom, suiviClient: "Suivi de " + c.prenom };
  openModal(`<h2>${esc(titles[key] || "Message")}</h2><p class="muted small">Numéro : <b>${esc(c.tel || "—")}</b>${key === "invitation" ? ` · recommandé(e) par ${esc(msgVars(c).client)}` : ""}</p>
  ${S.profil.pseudo ? "" : `<div class="notice row" style="gap:8px"><label class="field" for="msg-pseudo" style="flex:1;min-width:180px">Ton prénom n'est pas renseigné : ajoute-le pour signer le message<input id="msg-pseudo" type="text" placeholder="Ex. : Kévin"></label><button class="btn btn-sm" data-act="msg-pseudo" data-id="${c.id}" data-tpl="${key}">Mettre à jour</button></div>`}
  <label class="field" for="msg-txt">Message (modifiable avant l'envoi)<textarea id="msg-txt" style="min-height:220px">${esc(txt)}</textarea></label>
  <div class="row end"><button class="btn btn-ghost" data-act="modal-close">Annuler</button><button class="btn btn-ghost" data-act="msg-copy">Copier</button><a class="btn btn-wa" id="msg-go" href="${esc(waLink(c.tel, txt))}" data-tel="${esc(c.tel)}" target="_blank" rel="noopener" data-act="msg-sent" data-id="${c.id}" data-tpl="${key}">${I.wa} Ouvrir WhatsApp</a></div>
  ${key === "invitation" || key === "relanceInvite" ? `<p class="muted small">Si la personne répond « non » ou « stop », ouvre sa fiche et clique sur « Ne plus contacter ».</p>` : ""}`);
}
async function onMsgSent(id, key) {
  const c0 = S.contacts.get(id); if (!c0) return; const c = clone(c0); const now = Date.now();
  const lab = { invitation: "Invitation envoyée", relanceInvite: "Relance envoyée", rdv: "Confirmation de rendez-vous envoyée", recap: "Récap du bilan envoyé", envoiRapport: "Rapport et e-book envoyés", relanceReflechit: "Relance envoyée", suiviClient: "Message de suivi envoyé" }[key] || "Message envoyé";
  c.historique = (c.historique || []).concat([{ at: now, t: lab + " (WhatsApp)" }]);
  c.dernierContact = now;
  if (key === "invitation") { if (c.statut === "a_inviter") c.statut = "invite"; c.inviteAt = now; }
  if (key === "relanceReflechit") c.relanceAt = now + 3 * DAY;
  setTimeout(async () => { closeModal(); await saveContact(c); render(); toast(lab); }, 150);
}
async function onRapportSent(id, k) {
  const c0 = S.contacts.get(id); if (!c0) return; const c = clone(c0);
  c.historique = (c.historique || []).concat([{ at: Date.now(), t: k === "rapport-mail" ? "Rapport et e-book envoyés par e-mail" : "Rapport et e-book envoyés sur WhatsApp" }]);
  c.rapportEnvoye = Date.now(); c.dernierContact = Date.now();
  setTimeout(async () => { await saveContact(c); toast("Envoi noté dans l'historique"); }, 150);
}
function copyText(s) {
  const fallback = () => openModal(`<h2>Copier</h2><p class="muted small">Sélectionne le texte puis copie-le.</p><textarea readonly style="min-height:240px">${esc(s)}</textarea><div class="row end"><button class="btn" data-act="modal-close">Fermer</button></div>`);
  try { navigator.clipboard.writeText(s).then(() => toast("Copié"), fallback); } catch (e) { fallback(); }
}

/* =====================================================================
   CONTACTS & FICHE
   ===================================================================== */
function contactsFiltered() {
  const q = S.filt.q.trim().toLowerCase();
  let list = [...S.contacts.values()].filter((c) => S.filt.statut === "tous" || c.statut === S.filt.statut);
  if (q) list = list.filter((c) => [c.prenom, c.nom, c.tel, c.ville, c.email, c.recommandeParNom].join(" ").toLowerCase().includes(q) || (digits(q) && digits(c.tel).includes(digits(q))));
  return list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}
function crow(c) {
  const npc = c.statut === "ne_plus_contacter";
  return `<div class="crow" data-act="fiche" data-id="${c.id}" role="button" tabindex="0"><span class="avatar">${esc(initials(c))}</span><div style="min-width:0"><div class="name">${esc(nomC(c))}</div><div class="meta">${statutPill(c.statut)}${c.bilan ? scoreBadge(c.bilan.score) : ""}${c.challenge ? '<span class="pill tone-gold">Challenge</span>' : ""}${c.recommandeParNom ? `<span>par ${esc(c.recommandeParNom)}</span>` : ""}<span>${esc(fmtD(c.updatedAt || c.createdAt))}</span></div></div><div class="acts">${!npc && c.statut === "a_inviter" ? `<button class="btn btn-wa btn-sm" data-act="invite" data-id="${c.id}">${I.wa} Inviter</button>` : ""}</div></div>`;
}
function listHTML() {
  const all = S.contacts.size; const list = contactsFiltered();
  if (list.length) return list.map(crow).join("");
  return `<div class="empty"><b>${all ? "Aucun contact ne correspond" : "Ton CRM est vide pour l'instant"}</b><span>${all ? "Change la recherche ou le filtre." : "Chaque bilan validé ajoute le client et ses proches ici."}</span>${all ? "" : `<button class="btn btn-primary" data-act="bilan-new">Démarrer un bilan</button>`}</div>`;
}
function viewContacts() {
  const all = [...S.contacts.values()]; const counts = {}; for (const c of all) counts[c.statut] = (counts[c.statut] || 0) + 1;
  const rem = rappels();
  return `<div class="stack" style="gap:22px"><div class="row between"><h1>Contacts</h1><div class="row"><button class="btn btn-ghost btn-sm" data-act="csv">Copier en CSV</button><button class="btn btn-gold btn-sm" data-act="add-contact">+ Ajouter un contact</button></div></div>
  ${rem.length ? `<section class="stack" style="gap:10px"><h2>À faire (${rem.length})</h2>${rem.slice(0, 8).map(reminderHTML).join("")}${rem.length > 8 ? `<p class="muted small">+ ${rem.length - 8} autres : filtre la liste ci-dessous par statut.</p>` : ""}</section>` : ""}
  <section class="stack" style="gap:12px"><input type="search" id="crm-q" placeholder="Rechercher un nom, un numéro, une ville…" value="${esc(S.filt.q)}" aria-label="Rechercher un contact">
  <div class="filters">${[["tous", "Tous", all.length], ...STATUTS.map((s) => [s.id, s.label, counts[s.id] || 0])].map(([id, l, n]) => `<button class="${S.filt.statut === id ? "on" : ""}" data-act="filt" data-v="${id}" aria-pressed="${S.filt.statut === id}">${esc(l)} · ${n}</button>`).join("")}</div>
  <div class="contact-list" id="crm-list">${listHTML()}</div></section></div>`;
}
function viewFiche() {
  const c = S.contacts.get(S.ficheId);
  if (!c) return `<div class="empty"><b>Contact introuvable</b><button class="btn" data-act="nav" data-v="contacts">Retour aux contacts</button></div>`;
  const npc = c.statut === "ne_plus_contacter"; const ref = c.recommandePar ? S.contacts.get(c.recommandePar) : null;
  const recos = (c.recos || []).map((id) => S.contacts.get(id)).filter(Boolean); const obj = S.cfg.objectifs.find((o) => o.id === c.objectif);
  const D = c.decouverte || {};
  const kv = [["Téléphone", c.tel || "—"], c.email ? ["E-mail", c.email] : null, c.age ? ["Âge", c.age + " ans"] : null, c.ville ? ["Ville", c.ville] : null, obj ? ["Objectif", obj.label + (c.objectifAutre ? " : " + c.objectifAutre : "")] : null, c.lien ? ["Lien", c.lien] : null, c.rdvAt ? ["Bilan prévu", fmtDT(c.rdvAt)] : null, c.relanceAt && c.statut === "bilan_fait" ? ["Relance", fmtD(c.relanceAt)] : null, ["Accord données", c.consent ? "Oui, le " + fmtD(c.consentAt) : "Non (numéro transmis par un proche)"]].filter(Boolean);
  const lastRap = c.rapports && c.rapports.length ? c.rapports[c.rapports.length - 1] : null;
  return `<div class="stack" style="gap:20px">
  <button class="btn btn-ghost btn-sm" style="justify-self:start" data-act="nav" data-v="contacts">← Contacts</button>
  <div class="row between"><div class="row"><span class="avatar" style="width:62px;height:62px;font-size:22px">${esc(initials(c))}</span><div><h1 style="font-size:clamp(26px,4vw,36px)">${esc(nomC(c))}</h1><div class="row" style="gap:8px;margin-top:6px">${statutPill(c.statut)}${c.bilan ? scoreBadge(c.bilan.score) : ""}${c.challenge ? '<span class="pill tone-gold">Bodyfit Challenge</span>' : ""}</div></div></div>
  <div class="row">${!npc && c.tel ? `<a class="btn btn-wa" href="${esc(waLink(c.tel, ""))}" target="_blank" rel="noopener">${I.wa} WhatsApp</a>` : ""}${!npc && c.statut === "a_inviter" ? `<button class="btn btn-gold" data-act="invite" data-id="${c.id}">Inviter</button>` : ""}${!npc ? `<button class="btn btn-primary" data-act="bilan-from" data-id="${c.id}">${c.bilan ? "Refaire un bilan" : "Démarrer son bilan"}</button>` : ""}</div></div>
  ${npc ? `<div class="notice">Cette personne a demandé à ne plus être contactée. Elle ne sera plus jamais proposée à l'invitation.</div>` : ""}
  <div class="grid2"><div class="card stack"><h2>Infos</h2><dl class="kv">${kv.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}${ref ? `<dt>Recommandé par</dt><dd><a href="#" data-act="fiche" data-id="${ref.id}">${esc(nomC(ref))}</a></dd>` : c.recommandeParNom ? `<dt>Recommandé par</dt><dd>${esc(c.recommandeParNom)}</dd>` : ""}</dl></div>
  <div class="card stack"><h2>Statut</h2><div class="seg">${STATUTS.filter((s) => s.id !== "ne_plus_contacter").map((s) => `<button class="${c.statut === s.id ? "on" : ""}" data-act="set-statut" data-id="${c.id}" data-v="${s.id}" ${npc ? "disabled" : ""}>${esc(s.label)}</button>`).join("")}</div>
  ${!npc ? `<div class="stack" style="gap:8px"><label class="field" for="rdv-at">Planifier le bilan<input id="rdv-at" type="datetime-local" value="${c.rdvAt ? toLocalInput(c.rdvAt) : ""}"></label><div class="row"><button class="btn btn-sm" data-act="rdv-save" data-id="${c.id}">Enregistrer le rendez-vous</button>${c.rdvAt ? `<button class="btn btn-wa btn-sm" data-act="msg" data-id="${c.id}" data-tpl="rdv">${I.wa} Confirmer par WhatsApp</button>` : ""}</div></div>
  <div class="row"><button class="btn btn-sm btn-ghost" data-act="news" data-id="${c.id}">J'ai eu des nouvelles</button><button class="btn btn-danger btn-sm" data-act="npc" data-id="${c.id}" data-confirm="Confirmer : ne plus contacter">Ne plus contacter (STOP)</button></div>` : `<button class="btn btn-sm btn-ghost" data-act="npc-undo" data-id="${c.id}" data-confirm="Confirmer : la personne a redonné son accord">La personne a redonné son accord</button>`}</div></div>
  ${c.bilan ? `<div class="card stack"><div class="row between"><h2>Rapport et e-book</h2>${c.rapportEnvoye ? `<span class="pill tone-good">Envoyé le ${esc(fmtD(c.rapportEnvoye))}</span>` : '<span class="pill tone-warn">Pas encore envoyé</span>'}</div>
    <div class="row">${lastRap ? `<button class="btn btn-wa btn-sm" data-act="msg" data-id="${c.id}" data-tpl="envoiRapport">${I.wa} Envoyer sur WhatsApp</button>${c.email ? `<a class="btn btn-mail btn-sm" href="${esc(mailLink(c.email, tpl(S.cfg.messages.emailSujet, msgVars(c)), tpl(S.cfg.messages.emailCorps, msgVars(c))))}" data-act="sent" data-id="${c.id}" data-k="rapport-mail">${I.mail} Par e-mail</a>` : ""}<button class="btn btn-ghost btn-sm" data-act="copy" data-v="${esc(rapportUrl(lastRap.token))}">${I.link} Copier le lien</button><a class="btn btn-ghost btn-sm" href="${esc(rapportUrl(lastRap.token))}" target="_blank" rel="noopener">Voir</a>` : `<button class="btn btn-sm" data-act="rapport-new" data-id="${c.id}">Créer le lien du rapport</button>`}</div></div>` : ""}
  ${c.bilan ? bilanCard(c) : ""}
  ${D.motivation || D.depensesJour || D.echeance ? `<div class="card stack"><h2>Découverte</h2><dl class="kv">${D.motivation ? `<dt>Motivation</dt><dd>${esc(D.motivation)}/10${D.pourquoi ? " · « " + esc(D.pourquoi) + " »" : ""}</dd>` : ""}${D.echeance ? `<dt>Échéance</dt><dd>${esc(D.echeance)}${D.evenement ? " · " + esc(D.evenement) : ""}${D.evenementDate ? " (" + esc(fmtDL(new Date(D.evenementDate).getTime())) + ")" : ""}</dd>` : ""}${D.depensesJour ? `<dt>Extras</dt><dd>${esc(eur(D.depensesJour))} par jour</dd>` : ""}${D.budget ? `<dt>Budget courses</dt><dd>${esc(eur(D.budget))} / mois · ${esc(D.foyer || 1)} pers. · repas ≈ ${esc(eur(D.budgetRepas))}</dd>` : ""}${D.decideur ? `<dt>Décision</dt><dd>${esc({ seul: "Décide seul(e)", conjoint: "Avec son/sa conjoint(e)", autre: "Avec une autre personne" }[D.decideur] || "")}</dd>` : ""}</dl></div>` : ""}
  ${c.programme ? `<div class="card stack"><div class="row between"><h2>Programme : ${esc(c.programme.nom)}</h2><b class="num">${eur(c.programme.total)}</b></div><ul style="margin:0;padding-left:20px">${(c.programme.items || []).map((i) => `<li>${i.q > 1 ? i.q + " × " : ""}${esc(i.nom)}${i.parfum ? " · " + esc(i.parfum) : ""}</li>`).join("")}</ul><span class="muted small">Démarré le ${esc(fmtD(c.programme.at))}</span></div>` : ""}
  ${recos.length ? `<div class="card stack"><h2>Ses recommandations (${recos.length})</h2><div class="contact-list">${recos.map(crow).join("")}</div></div>` : ""}
  <div class="grid2"><div class="card stack"><h2>Notes</h2><label class="sr" for="note-new">Nouvelle note</label><textarea id="note-new" placeholder="Ajouter une note…"></textarea><div class="row end"><button class="btn btn-sm" data-act="note-add" data-id="${c.id}">Ajouter la note</button></div>${(c.notes || []).slice().reverse().map((n) => `<div style="border:1px solid var(--line);border-radius:10px;padding:10px 12px"><span class="muted small">${esc(fmtD(n.at))}</span><p>${esc(n.t)}</p></div>`).join("")}</div>
  <div class="card stack"><h2>Historique</h2><ul class="timeline">${(c.historique || []).slice().reverse().map((h) => `<li><time>${esc(fmtD(h.at))}</time><span>${esc(h.t)}</span></li>`).join("") || '<li class="muted">Rien pour le moment</li>'}</ul></div></div>
  <div class="row between"><span class="muted small">Créé le ${esc(fmtD(c.createdAt))}</span><button class="btn btn-danger btn-sm" data-act="delete" data-id="${c.id}" data-confirm="Confirmer la suppression définitive">Supprimer ce contact (droit à l'effacement)</button></div></div>`;
}
function bilanCard(c) {
  const b = c.bilan; const cats = S.cfg.categories.filter((x) => b.cats && b.cats[x.id] != null);
  const sc = (c.scores || []).map((s) => n0(s.score));
  return `<div class="card stack"><div class="row between"><h2>Bilan du ${esc(fmtD(b.at))}</h2><div class="row">${sc.length > 1 ? `<span class="muted small">Évolution : ${sc.join(" → ")}</span>` : ""}${scoreBadge(b.score)}</div></div>
  <div class="bars">${cats.map((x) => `<div class="bar-row"><span>${esc(x.label)}</span><div class="bar"><i style="width:${n0(b.cats[x.id])}%;background-color:${safeColor(x.couleur)}"></i></div><b class="num">${n0(b.cats[x.id])}</b></div>`).join("")}</div>
  ${(b.axes || []).length ? `<div><b>Axes d'amélioration</b><ul class="list-check axes" style="margin-top:8px">${b.axes.map((a) => `<li style="font-size:16px">${esc(a)}</li>`).join("")}</ul></div>` : ""}
  ${b.poids || b.taille || b.objectifPoids ? `<p class="muted">${b.poids ? "Poids " + esc(b.poids) + " kg" : ""}${b.taille ? " · Taille " + esc(b.taille) + " cm" : ""}${b.objectifPoids ? " · Poids visé " + esc(b.objectifPoids) + " kg" : ""}</p>` : ""}
  <details><summary style="cursor:pointer;font-weight:800">Voir les ${(b.reponses || []).length} réponses</summary><dl class="kv" style="margin-top:10px">${(b.reponses || []).map((r) => `<dt style="grid-column:1/-1;margin-top:6px">${esc(r.q)}</dt><dd style="grid-column:1/-1">${esc(r.r)}</dd>`).join("")}</dl></details></div>`;
}
function openAddContact() {
  openModal(`<h2>Ajouter un contact</h2><div class="grid2"><label class="field" for="ac-prenom">Prénom <span class="req">*</span><input id="ac-prenom" type="text" autocomplete="off"></label><label class="field" for="ac-nom">Nom<input id="ac-nom" type="text" autocomplete="off"></label><label class="field" for="ac-tel">Téléphone <span class="req">*</span><input id="ac-tel" type="tel" autocomplete="off"></label><label class="field" for="ac-ref">Recommandé par (facultatif)<input id="ac-ref" type="text" placeholder="Prénom Nom" autocomplete="off"></label></div>
  <label class="field" for="ac-statut">Statut<select id="ac-statut">${STATUTS.filter((s) => s.id !== "ne_plus_contacter").map((s) => `<option value="${s.id}">${esc(s.label)}</option>`).join("")}</select></label>
  <p class="err" id="ac-err" role="alert"></p><div class="row end"><button class="btn btn-ghost" data-act="modal-close">Annuler</button><button class="btn btn-primary" data-act="add-contact-save">Ajouter</button></div>`);
}
function toCSV() {
  const head = ["Prénom", "Nom", "Téléphone", "E-mail", "Ville", "Statut", "Score", "Objectif", "Recommandé par", "Lien", "Créé le"];
  const rows = [...S.contacts.values()].map((c) => [c.prenom, c.nom, c.tel, c.email || "", c.ville, statutOf(c.statut).label, c.bilan ? c.bilan.score : "", objLabel(c.objectif), c.recommandeParNom || "", c.lien || "", fmtD(c.createdAt)]);
  return [head, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
}

/* =====================================================================
   STATS, ÉQUIPE, SOUFFLEUR
   ===================================================================== */
function viewStats() {
  const st = computeStats(); const conv = st.bilans ? Math.round((100 * st.convertis) / st.bilans) : 0;
  const rpb = st.bilans ? (st.recos / st.bilans).toFixed(1).replace(".", ",") : "0";
  const all = [...S.contacts.values()]; const counts = STATUTS.map((s) => ({ s, n: all.filter((c) => c.statut === s.id).length })); const tot = all.length || 1;
  const max = Math.max(1, ...st.semaines);
  return `<div class="stack" style="gap:22px"><h1>Tes statistiques</h1>
  <div class="tiles stagger">${tile("Bilans réalisés", st.bilans, `dont ${st.bilansMois} ce mois-ci`)}${tile("Taux de conversion", conv + " %", `${st.convertis} client(s) sur ${st.bilans} bilan(s)`)}${tile("Recos par bilan", rpb, `${st.recos} proche(s) recommandé(s)`)}${tile("Invitations envoyées", st.invites, "via WhatsApp")}${tile("Bodyfit Challenge", st.challenges, "inscrits")}${tile("Score moyen", st.scoreMoyen ? st.scoreMoyen + "/100" : "—", "de tes bilans")}</div>
  <div class="grid2"><div class="card stack"><div class="row between"><h2>Bilans par semaine</h2><span class="pill tone-gold">Objectif ${n0(S.cfg.objectifSemaine)} / sem.</span></div>
  <div class="chart" role="img" aria-label="Bilans des 8 dernières semaines : ${st.semaines.join(", ")}">${st.semaines.map((v) => `<div class="col"><b class="num">${v}</b><i style="height:${Math.round((80 * v) / max)}%"></i></div>`).join("")}</div>
  <div class="chart-x">${st.semaines.map((v, i) => `<span>${i === 7 ? "Cette sem." : "S-" + (7 - i)}</span>`).join("")}</div></div>
  <div class="card stack"><h2>Ton pipeline</h2>${all.length ? `<div class="pipeline">${counts.filter((x) => x.n).map((x) => `<i style="width:${(100 * x.n) / tot}%;background:${x.s.color}" title="${esc(x.s.label)} : ${x.n}"></i>`).join("")}</div>` : '<p class="muted">Aucun contact pour le moment.</p>'}<div class="legend">${counts.map((x) => `<span><i style="background:${x.s.color}"></i>${esc(x.s.label)} · <b>${x.n}</b></span>`).join("")}</div></div></div></div>`;
}
function viewEquipe() {
  let rows = (S.team || []).map((r) => ({ ...(r.stats || {}), pseudo: r.pseudo, majAt: r.updated_at ? new Date(r.updated_at).getTime() : 0, _me: S.access && r.user_id === S.access.user_id }));
  if (!rows.some((r) => r._me)) rows.push({ ...computeStats(), pseudo: S.profil.pseudo || "Moi", _me: true, majAt: Date.now() });
  rows.sort((a, b) => n0(b.bilans) - n0(a.bilans) || n0(b.clients) - n0(a.clients));
  const T = rows.reduce((a, r) => ({ bilans: a.bilans + n0(r.bilans), clients: a.clients + n0(r.clients), convertis: a.convertis + n0(r.convertis), recos: a.recos + n0(r.recos), invites: a.invites + n0(r.invites), semaine: a.semaine + n0(r.semaine), challenges: a.challenges + n0(r.challenges) }), { bilans: 0, clients: 0, convertis: 0, recos: 0, invites: 0, semaine: 0, challenges: 0 });
  const ratio = (a, b) => (b ? (a / b).toFixed(1).replace(".", ",") : "0");
  return `<div class="stack" style="gap:22px"><div><p class="slogan">${esc(S.cfg.equipe.slogan)}</p><h1>Classement ${esc(S.cfg.equipe.nom)}</h1></div>
  <div class="tiles stagger">${tile("Distributeurs", rows.length, "")}${tile("Bilans équipe", T.bilans, `${T.semaine} cette semaine`)}${tile("Conversion équipe", (T.bilans ? Math.round((100 * T.convertis) / T.bilans) : 0) + " %", `${T.clients} clients`)}${tile("Recos par bilan", ratio(T.recos, T.bilans), "")}${tile("Challenge", T.challenges, "inscrits")}${tile("Invitations", T.invites, "")}</div>
  <div class="card scroll-x"><table class="board"><thead><tr><th>#</th><th>Distributeur</th><th>Bilans</th><th>Cette sem.</th><th>Clients</th><th>Conversion</th><th>Recos / bilan</th><th>Invitations</th><th>Mis à jour</th></tr></thead><tbody>
  ${rows.map((r, i) => `<tr class="${r._me ? "me" : ""}"><td class="rank">${i + 1}</td><td>${esc(r.pseudo || "Distributeur " + (i + 1))}${r._me ? ' <span class="muted small">(toi)</span>' : ""}</td><td>${n0(r.bilans)}</td><td>${n0(r.semaine)}</td><td>${n0(r.clients)}</td><td>${n0(r.bilans) ? Math.round((100 * n0(r.convertis)) / n0(r.bilans)) : 0} %</td><td>${ratio(n0(r.recos), n0(r.bilans))}</td><td>${n0(r.invites)}</td><td>${r.majAt ? esc(fmtD(r.majAt)) : "—"}</td></tr>`).join("")}</tbody></table></div>
  <p class="muted small">Seuls ces chiffres sont partagés avec l'équipe. Les contacts de chacun restent privés, même pour le leader.</p>
  ${isLeader() && S.store.mode === "neon" ? membersCard() : ""}
  ${profilForm()}</div>`;
}
function membersCard() {
  return `<div class="card stack"><h2>Membres de l'équipe</h2><p class="muted">Ajoute l'e-mail d'un distributeur : il crée son compte avec cette adresse sur ${esc(location.host)} et accède directement à l'appli. Retire un e-mail pour couper son accès.</p>
  <div class="row"><label class="sr" for="mem-email">E-mail du distributeur</label><input id="mem-email" type="email" placeholder="distributeur@exemple.com" style="flex:1;min-width:220px"><button class="btn btn-primary btn-sm" data-act="mem-add">Ajouter</button></div><p class="err" id="mem-err" role="alert"></p>
  <div class="contact-list">${(S.members || []).map((m) => `<div class="crow" style="cursor:default"><span class="avatar">${esc((m.email[0] || "?").toUpperCase())}</span><div style="min-width:0"><div class="name">${esc(m.email)}</div><div class="meta"><span class="pill ${m.role === "leader" ? "tone-gold" : "tone-muted"}">${m.role === "leader" ? "Leader" : "Distributeur"}</span>${m.actif ? "" : '<span class="pill tone-bad">Accès coupé</span>'}</div></div><div class="acts">${S.access && m.email === S.access.email ? '<span class="muted small">toi</span>' : `<button class="btn btn-ghost btn-sm" data-act="mem-toggle" data-v="${esc(m.email)}">${m.actif ? "Couper l'accès" : "Rétablir"}</button><button class="btn btn-danger btn-sm" data-act="mem-del" data-v="${esc(m.email)}" data-confirm="Confirmer">Retirer</button>`}</div></div>`).join("") || '<p class="muted">Chargement…</p>'}</div></div>`;
}
function viewSouffleur() {
  const L = S.live; const fresh = L && Date.now() - n0(L.at) < 3 * 3600e3 && L.step !== "envoi";
  const step = fresh ? L.step : S.soufStep; const key = String(step).startsWith("q") ? "questions" : step;
  const keys = ["accueil", "questions", "score", "recos", "motivation", "echeance", "depenses", "budget", "decideur", "energie", "comparatif", "challenge", "solution", "decision", "envoi"];
  const pseudoB = fresh ? { motivation: L.motivation, motivationPourquoi: "", evenement: "", decideur: L.decideur, depenses: null, packId: null } : null;
  return `<div class="stack" style="gap:20px"><div><p class="eyebrow">Souffleur</p><h1>${fresh ? `Bilan en cours : ${esc(L.prenom || "client")}` : "Ton antisèche de bilan"}</h1>
  <p class="muted" style="margin-top:8px;max-width:65ch">Ouvre cet onglet sur ton téléphone pendant que tu partages l'écran de ton ordinateur : il suit ton bilan en direct (mise à jour toutes les 4 secondes) et le client ne le voit pas.</p></div>
  ${fresh ? `<div class="row"><span class="pill tone-gold">${esc(L.label || "")}</span>${L.score != null ? scoreBadge(L.score) : ""}${L.objectif ? `<span class="pill tone-muted">${esc(objLabel(L.objectif))}</span>` : ""}${L.motivation ? `<span class="pill tone-info">Motivation ${esc(L.motivation)}/10</span>` : ""}${L.depensesJour ? `<span class="pill tone-muted">Extras ${esc(eur(L.depensesJour))}/j</span>` : ""}</div>` : `<div class="seg">${keys.map((s) => `<button class="${key === s ? "on" : ""}" data-act="souf-step" data-v="${s}">${esc(stepLabel(s === "questions" ? "q0" : s))}</button>`).join("")}</div>`}
  ${coachBody(key, pseudoB)}</div>`;
}
