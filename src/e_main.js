/* =====================================================================
   CONNEXION
   ===================================================================== */
function renderAuth() {
  const A = S.auth; const s = A.screen;
  const head = `<img class="logo" src="/assets/logo-full.webp" alt="97 Eagle Team" width="150" height="135">`;
  const msg = A.msg ? `<p class="${A.msgOk ? "tone-good" : "err"}" role="alert" style="font-weight:700">${esc(A.msg)}</p>` : "";
  const busy = A.busy ? "disabled" : "";
  let body = "";
  if (S.access && !S.access.member) {
    body = `<h1 style="font-size:28px;text-align:center">Ton compte est prêt</h1><p class="muted" style="text-align:center">Pour accéder à l'appli, ton leader doit ajouter ton e-mail <b>${esc(S.access.email || A.email || "")}</b> dans l'équipe (onglet Équipe).</p>${msg}
    <button class="btn btn-primary btn-block" data-act="auth-recheck" ${busy}>J'ai été ajouté(e), vérifier</button><button class="btn btn-ghost btn-block" data-act="logout">Se déconnecter</button>`;
  } else if (s === "signup") {
    body = `<h1 style="font-size:28px;text-align:center">Créer mon compte</h1>
    <label class="field" for="au-name">Prénom<input id="au-name" type="text" autocomplete="given-name" value="${esc(A.name || "")}"></label>
    <label class="field" for="au-email">E-mail<input id="au-email" type="email" autocomplete="email" value="${esc(A.email)}"></label>
    <label class="field" for="au-pw">Mot de passe (8 caractères minimum)<input id="au-pw" type="password" autocomplete="new-password"></label>${msg}
    <button class="btn btn-primary btn-block" data-act="auth-signup" ${busy}>Créer mon compte</button>
    <p class="small muted" style="text-align:center">Déjà un compte ? <button class="linkbtn" data-act="auth-screen" data-v="login">Se connecter</button></p>`;
  } else if (s === "code") {
    body = `<h1 style="font-size:28px;text-align:center">Confirme ton e-mail</h1><p class="muted" style="text-align:center">Saisis le code à 6 chiffres envoyé à <b>${esc(A.email)}</b>. Pense à regarder dans les spams.</p>
    <label class="field" for="au-otp">Code<input id="au-otp" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" style="letter-spacing:.4em;text-align:center;font-size:26px"></label>${msg}
    <button class="btn btn-primary btn-block" data-act="auth-verify" ${busy}>Valider</button>
    <p class="small muted" style="text-align:center"><button class="linkbtn" data-act="auth-resend">Renvoyer un code</button> · <button class="linkbtn" data-act="auth-screen" data-v="login">Retour</button></p>`;
  } else if (s === "forgot") {
    body = `<h1 style="font-size:28px;text-align:center">Mot de passe oublié</h1><p class="muted" style="text-align:center">Reçois un code par e-mail pour choisir un nouveau mot de passe.</p>
    <label class="field" for="au-email">E-mail<input id="au-email" type="email" autocomplete="email" value="${esc(A.email)}"></label>${msg}
    <button class="btn btn-primary btn-block" data-act="auth-forgot" ${busy}>Recevoir un code</button>
    <p class="small muted" style="text-align:center"><button class="linkbtn" data-act="auth-screen" data-v="login">Retour</button></p>`;
  } else if (s === "reset") {
    body = `<h1 style="font-size:28px;text-align:center">Nouveau mot de passe</h1><p class="muted" style="text-align:center">Code envoyé à <b>${esc(A.email)}</b>.</p>
    <label class="field" for="au-otp">Code<input id="au-otp" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" style="letter-spacing:.4em;text-align:center;font-size:26px"></label>
    <label class="field" for="au-pw">Nouveau mot de passe<input id="au-pw" type="password" autocomplete="new-password"></label>${msg}
    <button class="btn btn-primary btn-block" data-act="auth-reset" ${busy}>Enregistrer</button>
    <p class="small muted" style="text-align:center"><button class="linkbtn" data-act="auth-screen" data-v="login">Retour</button></p>`;
  } else {
    body = `<h1 style="font-size:28px;text-align:center">Connexion</h1>
    <label class="field" for="au-email">E-mail<input id="au-email" type="email" autocomplete="email" value="${esc(A.email)}"></label>
    <label class="field" for="au-pw">Mot de passe<input id="au-pw" type="password" autocomplete="current-password"></label>${msg}
    <button class="btn btn-primary btn-block" data-act="auth-login" ${busy}>Se connecter</button>
    <p class="small muted" style="text-align:center"><button class="linkbtn" data-act="auth-screen" data-v="forgot">Mot de passe oublié</button> · <button class="linkbtn" data-act="auth-screen" data-v="signup">Créer mon compte</button></p>
    <div class="hr"></div><button class="btn btn-ghost btn-block" data-act="demo">Essayer en mode démo (sans compte)</button>`;
  }
  return `<div class="auth-wrap"><form class="auth-card pop-in" onsubmit="return false">${head}${body}</form></div>`;
}
const fv = (id) => (($("#" + id) || {}).value || "").trim();
async function authRun(fn) {
  /* On lit les champs AVANT de redessiner le formulaire (sinon ils seraient vides). */
  const F = { name: fv("au-name"), email: fv("au-email").toLowerCase(), pw: ($("#au-pw") || {}).value || "", otp: fv("au-otp").replace(/\s/g, "") };
  if (F.name) S.auth.name = F.name;
  if (F.email) S.auth.email = F.email;
  S.auth.busy = true; S.auth.msg = ""; S.auth.msgOk = false; render();
  try { await fn(F); } catch (e) { console.error(e); S.auth.msg = authMessage(e) || "Connexion impossible. Vérifie ta connexion internet."; }
  S.auth.busy = false; render();
}
async function afterSignIn() {
  const acc = await S.store.myAccess(); S.access = acc;
  if (acc && acc.member) await loadData();
}
async function loadData() {
  const d = await S.store.loadAll();
  S.cfg = mergeCfg(d.cfg); applyTheme();
  S.contacts = new Map((d.contacts || []).filter((c) => c && c.id).map((c) => [c.id, c]));
  S.profil = { pseudo: "", tel: "", ...(d.profil || {}) }; S.live = d.live || null;
  S.view = "home"; lastStatsKey = ""; syncStats();
}

/* =====================================================================
   ACTIONS
   ===================================================================== */
const A = {
  nav: (el) => go(el.dataset.v),
  "auth-screen": (el) => { const e = fv("au-email"); if (e) S.auth.email = e; S.auth.screen = el.dataset.v; S.auth.msg = ""; render(); },
  "auth-login": () => authRun(async (F) => {
    const email = F.email, pw = F.pw;
    if (!email || !pw) throw new Error("Indique ton e-mail et ton mot de passe.");
    const r = await S.store.signIn(email, pw);
    if (r && r.error) { if ((r.error.code || "") === "EMAIL_NOT_VERIFIED" || r.error.status === 403) { S.auth.screen = "code"; S.auth.msg = "Un code vient d'être envoyé à ton e-mail."; S.auth.msgOk = true; return; } throw r.error; }
    await afterSignIn();
  }),
  "auth-signup": () => authRun(async (F) => {
    const name = F.name, email = F.email, pw = F.pw;
    if (!name || !email || pw.length < 8) throw new Error("Remplis ton prénom, ton e-mail et un mot de passe de 8 caractères minimum.");
    const r = await S.store.signUp(name, email, pw); if (r && r.error) throw r.error;
    S.auth.pendingName = name; S.auth.screen = "code"; S.auth.msg = "Compte créé : saisis le code reçu par e-mail."; S.auth.msgOk = true;
  }),
  "auth-verify": () => authRun(async (F) => {
    const otp = F.otp; if (otp.length < 6) throw new Error("Le code contient 6 chiffres.");
    const r = await S.store.verify(S.auth.email, otp); if (r && r.error) throw r.error;
    const sess = await S.store.session();
    if (!sess) { S.auth.screen = "login"; S.auth.msg = "E-mail confirmé ! Connecte-toi."; S.auth.msgOk = true; return; }
    await afterSignIn();
    if (S.auth.pendingName && S.access && S.access.member && !S.profil.pseudo) { S.profil.pseudo = S.auth.pendingName; saveProfil(S.profil); }
  }),
  "auth-resend": () => authRun(async () => { const r = await S.store.resend(S.auth.email); if (r && r.error) throw r.error; S.auth.msg = "Nouveau code envoyé."; S.auth.msgOk = true; }),
  "auth-forgot": () => authRun(async (F) => { const email = F.email; if (!email) throw new Error("Indique ton e-mail."); const r = await S.store.forgot(email); if (r && r.error) throw r.error; S.auth.screen = "reset"; S.auth.msg = "Code envoyé si un compte existe avec cet e-mail."; S.auth.msgOk = true; }),
  "auth-reset": () => authRun(async (F) => { const otp = F.otp, pw = F.pw; if (otp.length < 6 || pw.length < 8) throw new Error("Saisis le code et un mot de passe de 8 caractères minimum."); const r = await S.store.reset(S.auth.email, otp, pw); if (r && r.error) throw r.error; S.auth.screen = "login"; S.auth.msg = "Mot de passe modifié : connecte-toi."; S.auth.msgOk = true; }),
  "auth-recheck": () => authRun(afterSignIn),
  logout: async () => { await S.store.signOut(); lsDel(LS.demo); location.reload(); },
  demo: async () => { lsSet(LS.demo, "demo"); S.store = new DemoStore(); S.access = await S.store.myAccess(); await loadData(); if (!S.contacts.size) demoData(); render(); },
  "bilan-new": () => { S.bilan = newBilan(); S.view = "bilan"; saveDraft(); pushLive(); render(); scrollTop(); },
  "bilan-resume": () => { const d = lsGet(LS.draft, null); if (d) { S.bilan = { ...newBilan(), ...d }; S.view = "bilan"; render(); scrollTop(); } },
  "bilan-from": (el) => { const c = S.contacts.get(el.dataset.id); if (!c) return; S.bilan = newBilan(c); S.view = "bilan"; saveDraft(); pushLive(); render(); scrollTop(); },
  "bilan-quit": () => { if (S.bilan && S.bilan.savedId) S.bilan = null; S.view = "home"; render(); scrollTop(); },
  coach: () => { S.coach = !S.coach; lsSet(LS.coach, S.coach); render(); },
  next: () => goNext(),
  prev: () => goPrev(),
  canal: (el) => { S.bilan.canal = el.dataset.v; saveDraft(); render(); },
  objectif: (el) => { S.bilan.objectif = el.dataset.id; saveDraft(); render(); },
  answer: (el) => answer(el.dataset.q, +el.dataset.i),
  "reco-lien": (el) => { S.bilan.recoForm.lien = el.dataset.v; render(); },
  "reco-add": () => addReco(),
  "reco-del": (el) => { S.bilan.recos.splice(+el.dataset.i, 1); saveDraft(); render(); },
  motiv: (el) => { S.bilan.motivation = +el.dataset.v; saveDraft(); pushLive(); render(); const i = $("#b-motivationPourquoi"); if (i) i.focus(); },
  echeance: (el) => { S.bilan.echeance = el.dataset.v; saveDraft(); render(); },
  dep: (el) => { const d = S.cfg.decouverte.depenses.find((x) => x.id === el.dataset.id); if (!d) return; const v = Math.max(0, n0(S.bilan.depenses[d.id]) + n0(el.dataset.d) * (n0(d.pas) || 0.5)); S.bilan.depenses[d.id] = Math.round(v * 100) / 100; saveDraft(); render(); },
  budget: (el) => { S.bilan.budget = Math.max(0, n0(S.bilan.budget) + n0(el.dataset.d)); saveDraft(); render(); },
  foyer: (el) => { S.bilan.foyer = Math.min(15, Math.max(1, n0(S.bilan.foyer) + n0(el.dataset.d))); saveDraft(); render(); },
  decideur: (el) => { S.bilan.decideur = el.dataset.v; saveDraft(); render(); },
  energy: (el) => { S.energyState = +el.dataset.v; const b = $(".balance"); if (b) { b.style.setProperty("--tilt", ENERGY[S.energyState].tilt + "deg"); } render(); },
  "ch-interet": () => { S.bilan.challengeInteret = !S.bilan.challengeInteret; saveDraft(); render(); },
  pack: (el) => { S.bilan.packId = el.dataset.id; saveDraft(); render(); },
  flavor: (el) => { S.bilan.parfums[el.dataset.p] = el.dataset.v; saveDraft(); render(); },
  decision: (el) => { S.bilan.decision = el.dataset.v; saveDraft(); pushLive(); render(); },
  "relance-j": (el) => { S.bilan.relanceJ = +el.dataset.v; saveDraft(); render(); },
  finalize: () => finalize(),
  sent: (el) => onRapportSent(el.dataset.id, el.dataset.k),
  copy: (el) => copyText(el.dataset.v),
  "rapport-new": async (el) => { try { const t = await newRapportFor(el.dataset.id); if (t) { toast("Lien créé"); render(); } } catch (e) { dbError(e); } },
  fiche: (el) => { S.ficheId = el.dataset.id; if (S.bilan && S.bilan.savedId) S.bilan = null; S.view = "fiche"; render(); scrollTop(); },
  invite: (el) => openMsg(el.dataset.id, "invitation"),
  msg: (el) => openMsg(el.dataset.id, el.dataset.tpl),
  "msg-sent": (el) => onMsgSent(el.dataset.id, el.dataset.tpl),
  "msg-copy": () => copyText(($("#msg-txt") || {}).value || ""),
  "msg-pseudo": async (el) => { const v = fv("msg-pseudo").slice(0, 40); if (!v) return; await saveProfil({ ...S.profil, pseudo: v }); openMsg(el.dataset.id, el.dataset.tpl); },
  "modal-close": () => closeModal(),
  "modal-bg": (el, e) => { if (e.target === el) closeModal(); },
  filt: (el) => { S.filt.statut = el.dataset.v; render(); },
  "set-statut": async (el) => { const c = clone(S.contacts.get(el.dataset.id)); const v = el.dataset.v; if (c.statut === v) return; c.statut = v; c.historique = (c.historique || []).concat([{ at: Date.now(), t: "Statut : " + statutOf(v).label }]); if (v === "client") c.dernierContact = Date.now(); await saveContact(c); render(); },
  "rdv-save": async (el) => { const c = clone(S.contacts.get(el.dataset.id)); const v = ($("#rdv-at") || {}).value; if (!v) { c.rdvAt = null; } else { c.rdvAt = new Date(v).getTime(); if (["a_inviter", "invite"].includes(c.statut)) c.statut = "bilan_planifie"; c.historique = (c.historique || []).concat([{ at: Date.now(), t: "Bilan planifié : " + fmtDT(c.rdvAt) }]); c.dernierContact = Date.now(); } await saveContact(c); render(); toast(v ? "Rendez-vous enregistré" : "Rendez-vous retiré"); },
  news: async (el) => { const c = clone(S.contacts.get(el.dataset.id)); c.dernierContact = Date.now(); c.historique = (c.historique || []).concat([{ at: Date.now(), t: "Nouvelles reçues" }]); await saveContact(c); render(); toast("Noté"); },
  npc: async (el) => { const c = clone(S.contacts.get(el.dataset.id)); c.statut = "ne_plus_contacter"; c.npcAt = Date.now(); c.rdvAt = null; c.relanceAt = null; c.historique = (c.historique || []).concat([{ at: Date.now(), t: "A demandé à ne plus être contacté(e)" }]); await saveContact(c); render(); toast("Ce contact ne sera plus jamais proposé à l'invitation"); },
  "npc-undo": async (el) => { const c = clone(S.contacts.get(el.dataset.id)); c.statut = c.bilan ? "bilan_fait" : "invite"; c.historique = (c.historique || []).concat([{ at: Date.now(), t: "A redonné son accord pour être contacté(e)" }]); await saveContact(c); render(); },
  delete: async (el) => { await deleteContact(el.dataset.id); S.view = "contacts"; render(); toast("Contact et rapports supprimés"); },
  "note-add": async (el) => { const t = fv("note-new"); if (!t) return; const c = clone(S.contacts.get(el.dataset.id)); c.notes = (c.notes || []).concat([{ at: Date.now(), t }]); await saveContact(c); render(); },
  "add-contact": () => openAddContact(),
  "add-contact-save": async () => {
    const err = (m) => { $("#ac-err").textContent = m; };
    if (!fv("ac-prenom")) return err("Indique le prénom."); if (digits(fv("ac-tel")).length < 9) return err("Indique un numéro valide.");
    const ex = findByNumber(fv("ac-tel")); if (ex) return err(ex.statut === "ne_plus_contacter" ? "Ce numéro a demandé à ne plus être contacté." : `Ce numéro existe déjà : ${nomC(ex)}.`);
    const now = Date.now(); const c = { id: newId("c_"), createdAt: now, prenom: fv("ac-prenom"), nom: fv("ac-nom"), tel: fv("ac-tel"), statut: fv("ac-statut") || "a_inviter", recommandeParNom: fv("ac-ref"), consent: false, historique: [{ at: now, t: "Contact ajouté à la main" }], notes: [] };
    await saveContact(c); closeModal(); S.ficheId = c.id; S.view = "fiche"; render();
  },
  csv: () => copyText(toCSV()),
  "save-profil": async () => { await saveProfil({ ...S.profil, pseudo: fv("pseudo").slice(0, 40), tel: fv("coach-tel").slice(0, 30) }); render(); toast("Profil enregistré"); },
  "souf-step": (el) => { S.soufStep = el.dataset.v; render(); },
  "mem-add": async () => { const e = fv("mem-email").toLowerCase(); const er = $("#mem-err"); if (!/^\S+@\S+\.\S+$/.test(e)) { er.textContent = "Adresse e-mail invalide."; return; } try { await S.store.addMember(e, "distributeur"); toast("Distributeur ajouté"); await loadTeam(); render(); } catch (x) { er.textContent = /duplicate|unique/i.test(x.message) ? "Cet e-mail est déjà dans l'équipe." : "Ajout impossible : " + x.message; } },
  "mem-toggle": async (el) => { const m = S.members.find((x) => x.email === el.dataset.v); if (!m) return; try { await S.store.updateMember(m.email, { actif: !m.actif }); await loadTeam(); render(); } catch (x) { dbError(x); } },
  "mem-del": async (el) => { try { await S.store.deleteMember(el.dataset.v); await loadTeam(); render(); toast("Accès retiré"); } catch (x) { dbError(x); } },
  "set-tab": (el) => { S.setTab = el.dataset.v; render(); },
  "set-cancel": () => { S.draft = clone(S.cfg); S.dirty = false; applyTheme(); render(); toast("Modifications annulées"); },
  "set-save": async () => {
    const D = S.draft;
    if (!D.questions.length) return toast("Il faut au moins une question.", true);
    if (D.questions.some((q) => !q.options || q.options.length < 2)) return toast("Chaque question doit avoir au moins 2 réponses.", true);
    if (n0(D.recos.min) > n0(D.recos.max)) return toast("Le minimum de recommandations dépasse le maximum.", true);
    const ok = await saveConfig(D); if (ok) { S.draft = clone(S.cfg); S.dirty = false; render(); toast(S.store.mode === "neon" ? "Réglages enregistrés pour toute l'équipe" : "Réglages enregistrés"); }
  },
  "arr-add": (el) => { const arr = getPath(S.draft, el.dataset.path); if (!Array.isArray(arr)) return; arr.push(NEW_ITEM[el.dataset.kind]()); refreshSet(); },
  "arr-del": (el) => { const arr = getPath(S.draft, el.dataset.path); if (!Array.isArray(arr)) return; arr.splice(+el.dataset.i, 1); refreshSet(); },
  "arr-move": (el) => { const arr = getPath(S.draft, el.dataset.path); const i = +el.dataset.i, j = i + +el.dataset.d; if (!Array.isArray(arr) || j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; refreshSet(); },
  "pack-obj": (el) => { const pk = S.draft.packs[+el.dataset.i]; pk.objectifs = pk.objectifs || []; const v = el.dataset.v; pk.objectifs = pk.objectifs.includes(v) ? pk.objectifs.filter((x) => x !== v) : pk.objectifs.concat([v]); refreshSet(); },
  "pack-item": (el) => { const pk = S.draft.packs[+el.dataset.i]; pk.items = pk.items || {}; const p = el.dataset.p; if (pk.items[p] != null) delete pk.items[p]; else pk.items[p] = 1; refreshSet(); },
  "cfg-copy": () => copyText(JSON.stringify(S.draft, null, 2)),
  "cfg-import": () => { try { const d = JSON.parse(($("#cfg-import") || {}).value || ""); if (!d || !Array.isArray(d.questions) || !Array.isArray(d.produits)) throw new Error("format"); S.draft = mergeCfg(d); applyTheme(S.draft); refreshSet(); toast("Réglages chargés : pense à enregistrer"); } catch (e) { $("#imp-err").textContent = "Ce texte n'est pas un export de réglages valide."; } },
  "cfg-reset": () => { S.draft = clone(DEFAULT_CONFIG); applyTheme(S.draft); refreshSet(); toast("Valeurs d'origine chargées : pense à enregistrer"); }
};

/* ---------- Données d'exemple (mode démo) ---------- */
function demoData() {
  const now = Date.now(); const R = (o) => ({ ...o, historique: o.historique || [{ at: o.createdAt, t: "Contact d'exemple" }], notes: [] });
  const marie = R({ id: newId("c_"), prenom: "Marie", nom: "Exemple", tel: "0690 11 22 33", ville: "Les Abymes", objectif: "perte", statut: "client", consent: true, consentAt: now - 9 * DAY, createdAt: now - 9 * DAY, dernierContact: now - 8 * DAY, challenge: true,
    bilan: { at: now - 9 * DAY, score: 54, cats: { alimentation: 47, hydratation: 50, energie: 50, activite: 50, sommeil: 78 }, axes: ["Démarrer la journée avec un petit-déjeuner équilibré et riche en protéines", "Boire 1,5 à 2 litres d'eau par jour", "Remplacer le grignotage par des encas maîtrisés"], reponses: [] }, scores: [{ at: now - 9 * DAY, score: 54 }],
    decouverte: { motivation: 8, pourquoi: "Me sentir bien pour le mariage de ma sœur", echeance: "Pour un événement précis", evenement: "Mariage de ma sœur", depensesJour: 6.6, budget: 450, foyer: 3, budgetRepas: 1.67, decideur: "seul" },
    programme: { nom: "Transformation", total: 179, at: now - 9 * DAY, items: [{ nom: "Formula 1 – Boisson nutritionnelle", q: 1, parfum: "Vanille" }] } });
  const r1 = R({ id: newId("c_"), prenom: "Joël", nom: "Exemple", tel: "0690 44 55 66", lien: "Famille", statut: "a_inviter", recommandePar: marie.id, recommandeParNom: "Marie Exemple", createdAt: now - 9 * DAY });
  const r2 = R({ id: newId("c_"), prenom: "Sandra", nom: "Exemple", tel: "0691 77 88 99", lien: "Collègue", statut: "invite", inviteAt: now - 4 * DAY, recommandePar: marie.id, recommandeParNom: "Marie Exemple", createdAt: now - 9 * DAY });
  const r3 = R({ id: newId("c_"), prenom: "Teddy", nom: "Exemple", tel: "0690 12 12 12", lien: "Ami(e)", statut: "bilan_planifie", rdvAt: now + 3 * 3600e3, recommandePar: marie.id, recommandeParNom: "Marie Exemple", createdAt: now - 9 * DAY });
  marie.recos = [r1.id, r2.id, r3.id];
  for (const c of [marie, r1, r2, r3]) { c.updatedAt = c.createdAt; S.contacts.set(c.id, c); }
  S.store.saveContact(null, [...S.contacts.values()]);
}

/* ---------- Modale & toast ---------- */
function openModal(html) { $("#modal-root").innerHTML = `<div class="modal-bg" data-act="modal-bg"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`; const f = $("#modal-root textarea:not([readonly]), #modal-root input"); if (f) f.focus(); }
function closeModal() { $("#modal-root").innerHTML = ""; }
let toastT = null;
function toast(m, bad) { let t = $("#toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); } t.className = "toast" + (bad ? " bad" : ""); t.textContent = m; clearTimeout(toastT); toastT = setTimeout(() => t.remove(), bad ? 5500 : 2600); }
function arm(el) { el.dataset.orig = el.innerHTML; el.textContent = el.dataset.confirm; el.classList.add("armed", "btn-danger"); setTimeout(() => { if (el.isConnected && el.classList.contains("armed")) { el.classList.remove("armed"); el.innerHTML = el.dataset.orig; } }, 4000); }

/* ---------- Écouteurs ---------- */
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  if (el.tagName === "A" && el.getAttribute("href") === "#") e.preventDefault();
  if (el.disabled) return;
  if (el.dataset.confirm && !el.classList.contains("armed")) { e.preventDefault(); arm(el); return; }
  const fn = A[el.dataset.act];
  if (fn) { try { await fn(el, e); } catch (err) { console.error(err); toast("Oups, une erreur est survenue.", true); } }
});
function onField(e) {
  const t = e.target;
  if (t.dataset.bind && S.bilan) { S.bilan[t.dataset.bind] = t.type === "checkbox" ? t.checked : t.value; saveDraft(); const er = $("#b-err"); if (er) er.textContent = ""; return; }
  if (t.dataset.rbind && S.bilan) { S.bilan.recoForm[t.dataset.rbind] = t.value; return; }
  if (t.dataset.cfg && S.draft) { setPath(S.draft, t.dataset.cfg, parseVal(t)); markDirty(); if (t.dataset.cfg.startsWith("couleurs.")) applyTheme(S.draft); return; }
  if (t.id === "crm-q") { S.filt.q = t.value; const l = $("#crm-list"); if (l) l.innerHTML = listHTML(); return; }
  if (t.id === "msg-txt") { const a = $("#msg-go"); if (a) a.href = waLink(a.dataset.tel, t.value); }
}
document.addEventListener("input", onField);
document.addEventListener("change", (e) => { if (e.target.type === "checkbox" || e.target.tagName === "SELECT") onField(e); });
document.addEventListener("keydown", (e) => {
  const modalOpen = !!$("#modal-root").innerHTML;
  if (e.key === "Escape" && modalOpen) { closeModal(); return; }
  const t = e.target; const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName);
  if (e.key === "Enter" && t.closest && t.closest(".auth-card")) { e.preventDefault(); const b = $(".auth-card .btn-primary"); if (b) b.click(); return; }
  if (e.key === "Enter" && t.dataset && t.dataset.rbind) { e.preventDefault(); addReco(); return; }
  if (e.key === "Enter" && !typing && t.matches && t.matches('[role="button"][data-act]')) { e.preventDefault(); t.click(); return; }
  if (S.view !== "bilan" || !S.bilan || typing || modalOpen || e.ctrlKey || e.metaKey || e.altKey) return;
  const id = currentStepId();
  if (id.startsWith("q") && /^[1-9]$/.test(e.key)) { const q = S.cfg.questions[+id.slice(1)]; const i = +e.key - 1; if (q && q.options[i]) { e.preventDefault(); answer(q.id, i); } return; }
  if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
});

/* =====================================================================
   DÉMARRAGE
   ===================================================================== */
async function boot() {
  S.coach = !!lsGet(LS.coach, false);
  applyTheme(); render();
  const demo = lsGet(LS.demo, null) === "demo" || new URLSearchParams(location.search).has("demo");
  S.store = demo ? new DemoStore() : new NeonStore();
  try {
    const sess = await S.store.session();
    if (sess) await afterSignIn();
  } catch (e) { console.warn(e); S.auth.msg = "Connexion au serveur impossible pour le moment. Vérifie ta connexion internet."; }
  S.ready = true; render();
}
boot();
