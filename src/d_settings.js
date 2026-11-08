/* =====================================================================
   RÉGLAGES (leader)
   ===================================================================== */
function cf(path, label, type = "text", opts = {}) {
  const v = getPath(S.draft, path); const id = "cf-" + path.replace(/[^\w]/g, "-");
  if (type === "lines" || type === "area") return `<label class="field" for="${id}">${esc(label)}<textarea id="${id}" data-cfg="${esc(path)}" data-type="${type}" style="min-height:${opts.h || 90}px">${esc(type === "lines" ? (v || []).join("\n") : v)}</textarea></label>`;
  if (type === "comma") return `<label class="field" for="${id}">${esc(label)}<input id="${id}" type="text" data-cfg="${esc(path)}" data-type="comma" value="${esc((v || []).join(", "))}"></label>`;
  if (type === "num") return `<label class="field" for="${id}">${esc(label)}<input id="${id}" type="number" step="any" data-cfg="${esc(path)}" data-type="num" value="${esc(v)}"></label>`;
  if (type === "color") return `<label class="field" for="${id}">${esc(label)}<input id="${id}" type="color" data-cfg="${esc(path)}" data-type="text" value="${esc(safeColor(v))}" style="height:52px;padding:4px;width:100%;background:var(--panel);border:2px solid var(--line);border-radius:12px"></label>`;
  if (type === "bool") return `<label class="check" for="${id}"><input type="checkbox" id="${id}" data-cfg="${esc(path)}" data-type="bool" ${v ? "checked" : ""}><span>${esc(label)}</span></label>`;
  if (type === "select") return `<label class="field" for="${id}">${esc(label)}<select id="${id}" data-cfg="${esc(path)}" data-type="text">${opts.options.map(([val, l]) => `<option value="${esc(val)}" ${String(v) === String(val) ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>`;
  return `<label class="field" for="${id}">${esc(label)}<input id="${id}" type="text" data-cfg="${esc(path)}" data-type="text" value="${esc(v)}"></label>`;
}
function parseVal(t) {
  const ty = t.dataset.type;
  if (ty === "bool") return t.checked;
  if (ty === "num") return t.value === "" ? 0 : Number(t.value);
  if (ty === "lines") return t.value.split("\n").map((s) => s.trim()).filter(Boolean);
  if (ty === "comma") return t.value.split(",").map((s) => s.trim()).filter(Boolean);
  return t.value;
}
const moveBtns = (path, i, len) => `${i > 0 ? `<button class="btn btn-ghost btn-sm" data-act="arr-move" data-path="${path}" data-i="${i}" data-d="-1" aria-label="Monter">↑</button>` : ""}${i < len - 1 ? `<button class="btn btn-ghost btn-sm" data-act="arr-move" data-path="${path}" data-i="${i}" data-d="1" aria-label="Descendre">↓</button>` : ""}<button class="btn btn-danger btn-sm" data-act="arr-del" data-path="${path}" data-i="${i}" data-confirm="Confirmer">Supprimer</button>`;
function viewReglages() {
  if (!isLeader()) return `<div class="empty"><b>Réservé au leader</b></div>`;
  if (!S.draft) S.draft = clone(S.cfg);
  const tabs = [["produits", "Produits"], ["packs", "Programmes & objectifs"], ["questions", "Questions & score"], ["parcours", "Découverte, énergie, challenge"], ["messages", "Messages & coach"], ["general", "Équipe & apparence"], ["sauvegarde", "Sauvegarde"]];
  return `<div class="stack" style="gap:18px"><div><h1>Réglages</h1><p class="muted" style="margin-top:6px">${S.store.mode === "neon" ? "Tes modifications s'appliquent à toute l'équipe dès que tu enregistres." : "Mode démo : les réglages sont gardés sur cet appareil."}</p></div>
  <div class="tabs" role="tablist">${tabs.map(([id, l]) => `<button role="tab" aria-selected="${S.setTab === id}" class="${S.setTab === id ? "on" : ""}" data-act="set-tab" data-v="${id}">${l}</button>`).join("")}</div>
  <div id="set-body" class="stack">${setBody()}</div>
  <div class="savebar"><span class="muted small" id="dirty">${S.dirty ? "Modifications non enregistrées" : "Tout est enregistré"}</span><div class="row"><button class="btn btn-ghost btn-sm" data-act="set-cancel">Annuler</button><button class="btn btn-primary" data-act="set-save">Enregistrer</button></div></div></div>`;
}
function setBody() {
  const D = S.draft;
  if (S.setTab === "produits") return `<div class="notice">Prix et nombre de portions indicatifs : remplace-les par ta liste de prix. Les avantages marqués * renvoient à la mention légale (onglet Équipe & apparence). Reste sur des formulations autorisées, sans promesse de santé.</div>
  ${D.produits.map((p, i) => `<div class="edit-card"><div class="head"><h3>${esc(p.nom || "Nouveau produit")}</h3><div class="row">${moveBtns("produits", i, D.produits.length)}</div></div>
  <div class="grid2">${cf(`produits.${i}.nom`, "Nom")}${cf(`produits.${i}.usage`, "Utilisation", "select", { options: Object.entries(USAGES) })}</div>
  <div class="grid3">${cf(`produits.${i}.prix`, "Prix (€)", "num")}${cf(`produits.${i}.portions`, "Nombre de portions", "num")}${cf(`produits.${i}.actif`, "Proposé dans les bilans", "bool")}</div>
  ${cf(`produits.${i}.parfums`, "Parfums (séparés par des virgules)", "comma")}${cf(`produits.${i}.avantages`, "Avantages (un par ligne)", "lines")}</div>`).join("")}
  <div><button class="btn btn-gold" data-act="arr-add" data-path="produits" data-kind="produit">+ Ajouter un produit</button></div>`;
  if (S.setTab === "packs") return `<h2>Programmes proposés</h2><p class="muted">Chaque programme s'affiche pour les objectifs cochés. « Mis en avant » = badge « Le plus choisi » et sélection par défaut.</p>
  ${D.packs.map((pk, i) => { const items = pk.items || {}; const tot = Object.entries(items).reduce((a, [id, q]) => { const p = D.produits.find((x) => x.id === id); return a + (p ? n0(p.prix) * Math.max(1, n0(q)) : 0); }, 0);
    return `<div class="edit-card"><div class="head"><h3>${esc(pk.nom || "Programme")} · <span class="num" style="color:var(--gold-text)">${eur(tot)}</span></h3><div class="row">${moveBtns("packs", i, D.packs.length)}</div></div>
    <div class="grid3">${cf(`packs.${i}.nom`, "Nom")}${cf(`packs.${i}.duree`, "Durée (jours)", "num")}${cf(`packs.${i}.populaire`, "Mis en avant", "bool")}</div>
    ${cf(`packs.${i}.description`, "Phrase d'accroche")}
    <div class="stack" style="gap:6px"><span class="muted small" style="font-weight:700">Objectifs concernés</span><div class="seg">${D.objectifs.map((o) => `<button class="${(pk.objectifs || []).includes(o.id) ? "on" : ""}" data-act="pack-obj" data-i="${i}" data-v="${esc(o.id)}">${esc(o.label)}</button>`).join("")}</div></div>
    <div class="stack" style="gap:6px"><span class="muted small" style="font-weight:700">Produits du programme (quantité)</span>${D.produits.map((p) => { const on = items[p.id] != null; return `<div class="item-row"><input type="checkbox" id="pi-${i}-${esc(p.id)}" ${on ? "checked" : ""} data-act="pack-item" data-i="${i}" data-p="${esc(p.id)}" style="width:22px;height:22px;accent-color:var(--flame)"><label for="pi-${i}-${esc(p.id)}">${esc(p.nom)} <span class="muted">· ${eur(p.prix)}</span></label>${on ? `<input type="number" min="1" aria-label="Quantité ${esc(p.nom)}" data-cfg="packs.${i}.items.${esc(p.id)}" data-type="num" value="${esc(items[p.id])}">` : "<span></span>"}</div>`; }).join("")}</div></div>`; }).join("")}
  <div><button class="btn btn-gold" data-act="arr-add" data-path="packs" data-kind="pack">+ Ajouter un programme</button></div>
  <div class="hr"></div><h2>Règles de recommandation</h2>
  <div class="grid2"><div class="edit-card"><h3>Règle « remplacer »</h3>${cf("regles.remplacer.titre", "Titre")}${cf("regles.remplacer.texte", "Explication au client", "area")}</div><div class="edit-card"><h3>Règle « ajouter »</h3>${cf("regles.ajouter.titre", "Titre")}${cf("regles.ajouter.texte", "Explication au client", "area")}</div></div>
  <h2>Objectifs proposés à l'accueil</h2>
  ${D.objectifs.map((o, i) => `<div class="edit-card"><div class="head"><h3>${esc(o.label)}</h3><div class="row">${moveBtns("objectifs", i, D.objectifs.length)}</div></div><div class="grid3">${cf(`objectifs.${i}.label`, "Nom")}${cf(`objectifs.${i}.icone`, "Icône (emoji)")}${cf(`objectifs.${i}.regle`, "Règle appliquée", "select", { options: [["remplacer", "Remplacer 1 à 2 repas"], ["ajouter", "Ajouter 1 à 2 encas"]] })}</div></div>`).join("")}
  <div><button class="btn btn-gold" data-act="arr-add" data-path="objectifs" data-kind="objectif">+ Ajouter un objectif</button></div>`;
  if (S.setTab === "questions") { const catOpts = D.categories.map((c) => [c.id, c.label]);
    return `<div class="notice"><b>Calcul du score :</b> chaque réponse rapporte des points (0 à 3). Score d'une catégorie = points obtenus ÷ points possibles × 100. Score global = moyenne des catégories, pondérée par leur poids. Les 3 réponses les plus faibles deviennent les « axes d'amélioration ».</div>
    <h2>Catégories et pondération</h2>
    ${D.categories.map((c, i) => `<div class="edit-card"><div class="grid3">${cf(`categories.${i}.label`, "Nom")}${cf(`categories.${i}.poids`, "Poids", "num")}${cf(`categories.${i}.couleur`, "Couleur", "color")}</div><div class="row end">${moveBtns("categories", i, D.categories.length)}</div></div>`).join("")}
    <div><button class="btn btn-gold" data-act="arr-add" data-path="categories" data-kind="categorie">+ Ajouter une catégorie</button></div>
    <div class="hr"></div><h2>Questions (${D.questions.length})</h2>
    ${D.questions.map((q, i) => `<div class="edit-card"><div class="head"><h3>${i + 1}. ${esc(q.texte)}</h3><div class="row">${moveBtns("questions", i, D.questions.length)}</div></div>
    <div class="grid2">${cf(`questions.${i}.texte`, "Question")}${cf(`questions.${i}.cat`, "Catégorie", "select", { options: catOpts })}</div>
    <div class="grid2">${cf(`questions.${i}.axe`, "Axe d'amélioration (si réponse faible)")}${cf(`questions.${i}.fort`, "Point fort (si meilleure réponse)")}</div>
    <div class="stack" style="gap:8px"><span class="muted small" style="font-weight:700">Réponses et points</span>${(q.options || []).map((o, j) => `<div class="opt-row"><input type="text" aria-label="Réponse ${j + 1}" data-cfg="questions.${i}.options.${j}.l" data-type="text" value="${esc(o.l)}"><input type="number" aria-label="Points réponse ${j + 1}" data-cfg="questions.${i}.options.${j}.p" data-type="num" value="${esc(o.p)}"><button class="btn btn-ghost btn-sm" data-act="arr-del" data-path="questions.${i}.options" data-i="${j}" data-confirm="Confirmer" aria-label="Supprimer la réponse">✕</button></div>`).join("")}
    <div><button class="btn btn-ghost btn-sm" data-act="arr-add" data-path="questions.${i}.options" data-kind="option">+ Réponse</button></div></div></div>`).join("")}
    <div><button class="btn btn-gold" data-act="arr-add" data-path="questions" data-kind="question">+ Ajouter une question</button></div>`; }
  if (S.setTab === "parcours") return `<h2>Questions de découverte</h2>
  <div class="edit-card">${cf("decouverte.actif", "Poser les questions de découverte (motivation, échéance, dépenses, budget)", "bool")}${cf("decouverte.questionDecideur", "Ajouter la question « Tu décides seul(e) ? »", "bool")}${cf("decouverte.echeances", "Réponses proposées pour l'échéance (une par ligne, la dernière ouvre le champ « événement »)", "lines", { h: 120 })}${cf("decouverte.budgetDefaut", "Budget courses proposé par défaut (€ / mois)", "num")}</div>
  <h3>Postes de dépenses</h3>
  ${D.decouverte.depenses.map((d, i) => `<div class="edit-card"><div class="grid3">${cf(`decouverte.depenses.${i}.label`, "Libellé")}${cf(`decouverte.depenses.${i}.par`, "Période", "select", { options: [["jour", "Par jour"], ["semaine", "Par semaine"], ["mois", "Par mois"]] })}${cf(`decouverte.depenses.${i}.defaut`, "Valeur de départ (€)", "num")}</div><div class="row between">${cf(`decouverte.depenses.${i}.pas`, "Pas du + / − (€)", "num")}<div class="row">${moveBtns("decouverte.depenses", i, D.decouverte.depenses.length)}</div></div></div>`).join("")}
  <div><button class="btn btn-gold" data-act="arr-add" data-path="decouverte.depenses" data-kind="depense">+ Ajouter un poste</button></div>
  <div class="hr"></div><h2>Comprendre l'énergie</h2>
  <div class="edit-card">${cf("energie.actif", "Afficher la balance énergétique et le comparatif", "bool")}</div>
  <div class="grid2"><div class="edit-card"><h3>Repas « avant »</h3>${cf("energie.avant.titre", "Titre")}${cf("energie.avant.detail", "Détail")}<div class="grid3">${cf("energie.avant.kcal", "Calories", "num")}${cf("energie.avant.proteines", "Protéines (g)", "num")}${cf("energie.avant.prix", "Prix (€)", "num")}</div></div>
  <div class="edit-card"><h3>Repas « après »</h3>${cf("energie.apres.titre", "Titre")}${cf("energie.apres.detail", "Détail")}<div class="grid3">${cf("energie.apres.kcal", "Calories", "num")}${cf("energie.apres.proteines", "Protéines (g)", "num")}${cf("energie.apres.prix", "Prix (€)", "num")}</div></div></div>
  ${cf("energie.mention", "Mention sous le comparatif", "area", { h: 70 })}
  <div class="hr"></div><h2>Bodyfit Challenge</h2>
  <div class="edit-card"><div class="grid3">${cf("challenge.actif", "Proposer le challenge", "bool")}${cf("challenge.nom", "Nom")}${cf("challenge.prix", "Prix sans produits (€)", "num")}</div>${cf("challenge.jourDepart", "Jour de départ", "select", { options: [["1", "Lundi"], ["2", "Mardi"], ["3", "Mercredi"], ["4", "Jeudi"], ["5", "Vendredi"], ["6", "Samedi"], ["0", "Dimanche"]] })}${cf("challenge.texte", "Description", "area")}${cf("challenge.contenu", "Ce qui est inclus (un point par ligne)", "lines", { h: 140 })}</div>
  <h2>Suivi personnalisé</h2><div class="edit-card">${cf("suivi.titre", "Titre")}${cf("suivi.texte", "Texte", "area")}</div>
  <h2>E-book offert</h2><div class="edit-card">${cf("ebook.titre", "Titre affiché")}</div>`;
  if (S.setTab === "messages") return `<div class="notice">Variables disponibles : {prenom} {nom} {client} (qui a recommandé) {coach} {equipe} {score} {axes} {programme} {date} {lien} (lien du rapport). Le message d'invitation doit toujours dire qui a donné le numéro et proposer de répondre STOP.</div>
  <div class="grid2">${cf("messages.envoiRapport", "Envoi du rapport + e-book (WhatsApp)", "area", { h: 170 })}${cf("messages.emailCorps", "Envoi du rapport + e-book (e-mail)", "area", { h: 170 })}${cf("messages.emailSujet", "Objet de l'e-mail")}<span></span>${cf("messages.invitation", "Invitation d'un proche", "area", { h: 170 })}${cf("messages.relanceInvite", "Relance d'un invité", "area", { h: 170 })}${cf("messages.rdv", "Confirmation de rendez-vous", "area", { h: 130 })}${cf("messages.recap", "Récap envoyé au client", "area", { h: 170 })}${cf("messages.relanceReflechit", "Relance « je réfléchis »", "area", { h: 130 })}${cf("messages.suiviClient", "Suivi client", "area", { h: 130 })}</div>
  <div class="hr"></div><h2>Coach : quoi dire à chaque étape</h2>
  <div class="grid2">${["accueil", "questions", "mesures", "score", "recos", "motivation", "echeance", "depenses", "budget", "decideur", "energie", "comparatif", "challenge", "solution", "decision", "fin"].map((k) => cf("coach." + k, k === "fin" ? "Envoi" : stepLabel(k === "questions" ? "q0" : k), "area", { h: 110 })).join("")}</div>
  <h2>Réponses aux objections</h2><p class="muted small">Variables : {prixRepas} (repas Formula 1), {depensesJour} (extras du client), {programmeJour} (programme choisi, par jour).</p>
  ${D.objections.map((o, i) => `<div class="edit-card"><div class="grid2">${cf(`objections.${i}.q`, "Objection")}${cf(`objections.${i}.r`, "Réponse", "area")}</div><div class="row end">${moveBtns("objections", i, D.objections.length)}</div></div>`).join("")}
  <div><button class="btn btn-gold" data-act="arr-add" data-path="objections" data-kind="objection">+ Ajouter une objection</button></div>
  ${cf("idees", "Idées affichées à l'étape « Offrir un bilan » (une par ligne)", "lines", { h: 150 })}`;
  if (S.setTab === "general") return `<div class="grid2">${cf("equipe.nom", "Nom de l'équipe")}${cf("equipe.slogan", "Slogan")}</div>
  <h2>Couleurs</h2><p class="muted small">Aperçu en direct. Par défaut : les verts de ton logo sur fond blanc. Un fond foncé passe automatiquement en thème sombre.</p>
  <div class="grid3">${cf("couleurs.primaire", "Couleur principale (boutons)", "color")}${cf("couleurs.accent", "Couleur d'accent", "color")}${cf("couleurs.fond", "Fond", "color")}</div>
  <h2>Objectifs et suivi</h2><div class="grid3">${cf("recos.min", "Recommandations minimum", "num")}${cf("recos.max", "Recommandations maximum", "num")}${cf("objectifSemaine", "Objectif de bilans par semaine", "num")}${cf("suiviJours", "Relancer un client après (jours)", "num")}${cf("relanceInviteJours", "Relancer un invité après (jours)", "num")}${cf("prixRepasMoyen", "Prix d'un repas « sur le pouce » (€)", "num")}${cf("telIndicatif", "Indicatif par défaut (590, 596, 33…)")}</div>
  ${cf("mentionLegale", "Mention légale sous les produits", "area")}`;
  return `<div class="edit-card"><h3>Exporter</h3><p class="muted small">Copie ce texte et garde-le en lieu sûr : il contient tous tes réglages (pas les contacts).</p><textarea readonly id="cfg-export" style="min-height:160px;font-family:monospace;font-size:13px">${esc(JSON.stringify(D, null, 2))}</textarea><div class="row end"><button class="btn btn-sm" data-act="cfg-copy">Copier</button></div></div>
  <div class="edit-card"><h3>Importer</h3><textarea id="cfg-import" placeholder="Colle ici un export de réglages" style="min-height:120px;font-family:monospace;font-size:13px"></textarea><p class="err" id="imp-err" role="alert"></p><div class="row end"><button class="btn btn-sm" data-act="cfg-import">Charger ces réglages</button></div></div>
  <div class="edit-card"><h3>Valeurs d'origine</h3><p class="muted small">Remet les questions, produits, messages et couleurs proposés au départ.</p><div><button class="btn btn-danger btn-sm" data-act="cfg-reset" data-confirm="Confirmer la remise à zéro">Revenir aux valeurs d'origine</button></div></div>`;
}
function refreshSet() { const b = $("#set-body"); if (b) b.innerHTML = setBody(); markDirty(); }
function markDirty() { S.dirty = true; const d = $("#dirty"); if (d) d.textContent = "Modifications non enregistrées"; }
const NEW_ITEM = {
  produit: () => ({ id: newId("p_"), nom: "", usage: "repas", actif: true, prix: 0, portions: 21, parfums: [], avantages: [] }),
  pack: () => ({ id: newId("pk_"), nom: "Nouveau programme", objectifs: [], items: {}, duree: 21, populaire: false, description: "" }),
  question: () => ({ id: newId("q_"), cat: (S.draft.categories[0] || {}).id || "alimentation", texte: "Nouvelle question", axe: "", fort: "", options: [{ l: "Oui", p: 3 }, { l: "Parfois", p: 1 }, { l: "Non", p: 0 }] }),
  option: () => ({ l: "", p: 0 }),
  objection: () => ({ q: "", r: "" }),
  categorie: () => ({ id: newId("cat_"), label: "Nouvelle catégorie", poids: 10, couleur: "#FFC233" }),
  objectif: () => ({ id: newId("o_"), label: "Nouvel objectif", icone: "", regle: "ajouter" }),
  depense: () => ({ id: newId("d_"), label: "Nouveau poste", par: "jour", pas: 0.5, defaut: 0 })
};

