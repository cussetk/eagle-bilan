

/* =====================================================================
   CONTENU PAR DÉFAUT — tout est modifiable dans l'écran « Réglages »
   (réservé au leader). Ces valeurs ne servent que tant que rien n'a été
   enregistré.
   ===================================================================== */
export const DEFAULT_CONFIG = {
  version: 1,
  equipe: { nom: "97 Eagle Team", slogan: "La tête et non la queue" },
  couleurs: { primaire: "#1F7A2A", accent: "#7AC143", fond: "#FFFFFF" },
  telIndicatif: "590",
  recos: { min: 3, max: 5 },
  prixRepasMoyen: 8,
  suiviJours: 7,
  relanceInviteJours: 3,
  objectifSemaine: 5,
  challenge: {
    actif: true,
    nom: "Bodyfit Challenge 21 jours",
    prix: 19,
    jourDepart: 4,
    texte: "21 jours pour transformer tes habitudes, accompagné(e) par un coach et un groupe motivé. Nouveau groupe chaque jeudi.",
    contenu: ["Coaching et suivi pendant 21 jours", "Séances de sport guidées, adaptées à ton niveau", "Plan alimentaire simple à suivre", "Groupe WhatsApp de motivation", "Défis quotidiens et bilan de fin de challenge"]
  },
  suivi: {
    titre: "Va plus loin : suivi personnalisé + programme",
    texte: "Ton coach construit ton programme autour de ton objectif et te suit chaque semaine. Et le Bodyfit Challenge t'est offert."
  },
  decouverte: {
    actif: true,
    questionDecideur: true,
    depenses: [
      { id: "cafe", label: "Cafés et boissons chaudes", par: "jour", pas: 0.5, defaut: 1.5 },
      { id: "snacks", label: "Viennoiseries, snacks, gâteaux", par: "jour", pas: 0.5, defaut: 2 },
      { id: "sodas", label: "Sodas, jus, boissons sucrées", par: "jour", pas: 0.5, defaut: 1.5 },
      { id: "dehors", label: "Repas à l'extérieur (snack, resto, livraison)", par: "semaine", pas: 5, defaut: 25 }
    ],
    budgetDefaut: 400,
    echeances: ["Le plus vite possible", "D'ici 1 mois", "D'ici 3 mois", "Pour un événement précis"]
  },
  energie: {
    actif: true,
    avant: { titre: "Petit-déjeuner sur le pouce", detail: "Viennoiserie, jus d'orange, café sucré", kcal: 520, proteines: 7, prix: 4.5 },
    apres: { titre: "Shake Formula 1", detail: "Préparé avec 250 ml de lait demi-écrémé", kcal: 220, proteines: 17, prix: 2.9 },
    mention: "Valeurs indicatives, données à titre d'exemple. Elles varient selon les produits et les quantités."
  },
  ebook: { titre: "20 habitudes pour être en top forme", url: "/ebook/", pdf: "/ebook/?pdf=1" },
  objectifs: [
    { id: "perte", label: "Perte de poids", icone: "⚖️", regle: "remplacer" },
    { id: "masse", label: "Prise de masse", icone: "💪", regle: "ajouter" },
    { id: "energie", label: "Plus d'énergie", icone: "⚡", regle: "ajouter" },
    { id: "manger", label: "Mieux manger", icone: "🥗", regle: "remplacer" },
    { id: "autre", label: "Autre", icone: "✨", regle: "ajouter" }
  ],
  regles: {
    remplacer: {
      titre: "Remplacer 1 à 2 repas par jour",
      texte: "On remplace ton petit-déjeuner (et si tu veux aller plus vite, un 2e repas) par une boisson nutritionnelle complète. Tu gardes un repas plaisir équilibré, tu maîtrises tes apports sans compter les calories."
    },
    ajouter: {
      titre: "Ajouter 1 à 2 encas par jour",
      texte: "On garde tes repas et on ajoute 1 à 2 encas riches en protéines aux bons moments de la journée, pour nourrir tes muscles et garder une énergie stable."
    }
  },
  categories: [
    { id: "alimentation", label: "Alimentation", poids: 30, couleur: "#F08A24" },
    { id: "hydratation", label: "Hydratation", poids: 20, couleur: "#2B9FD9" },
    { id: "energie", label: "Énergie", poids: 20, couleur: "#E5B000" },
    { id: "activite", label: "Activité", poids: 15, couleur: "#22A06B" },
    { id: "sommeil", label: "Sommeil & stress", poids: 15, couleur: "#8B6FD6" }
  ],
  questions: [
    { id: "q_petitdej", cat: "alimentation", texte: "Prends-tu un petit-déjeuner le matin ?",
      axe: "Démarrer la journée avec un petit-déjeuner équilibré et riche en protéines", fort: "Tu démarres bien tes journées",
      options: [ { l: "Oui, complet, avec des protéines", p: 3 }, { l: "Oui, mais rapide (café, viennoiserie, pain)", p: 2 }, { l: "De temps en temps", p: 1 }, { l: "Jamais", p: 0 } ] },
    { id: "q_repas", cat: "alimentation", texte: "Combien de repas prends-tu par jour ?",
      axe: "Avoir des repas réguliers pour éviter les fringales", fort: "Tes repas sont réguliers",
      options: [ { l: "3 repas + 1 ou 2 collations", p: 3 }, { l: "3 repas", p: 2 }, { l: "2 repas", p: 1 }, { l: "1 repas, ou ça dépend des jours", p: 0 } ] },
    { id: "q_proteines", cat: "alimentation", texte: "Manges-tu des protéines à chaque repas ? (viande, poisson, œufs, laitages, légumineuses)",
      axe: "Ajouter une source de protéines à chaque repas", fort: "Tu penses aux protéines",
      options: [ { l: "Oui, à chaque repas", p: 3 }, { l: "Une fois par jour", p: 2 }, { l: "Je ne sais pas trop", p: 1 }, { l: "Rarement", p: 0 } ] },
    { id: "q_fruits", cat: "alimentation", texte: "Combien de portions de fruits et légumes manges-tu par jour ?",
      axe: "Manger plus de fruits et légumes (objectif : 5 par jour)", fort: "Tu manges des fruits et légumes",
      options: [ { l: "5 ou plus", p: 3 }, { l: "3 ou 4", p: 2 }, { l: "1 ou 2", p: 1 }, { l: "Presque aucune", p: 0 } ] },
    { id: "q_grignotage", cat: "alimentation", texte: "T'arrive-t-il de grignoter entre les repas ?",
      axe: "Remplacer le grignotage par des encas maîtrisés", fort: "Tu grignotes peu",
      options: [ { l: "Jamais", p: 3 }, { l: "Parfois", p: 2 }, { l: "Tous les jours", p: 1 }, { l: "Plusieurs fois par jour", p: 0 } ] },
    { id: "q_digestion", cat: "alimentation", texte: "Comment te sens-tu après tes repas ?",
      axe: "Alléger tes repas pour te sentir plus léger(e)", fort: "Tu te sens bien après tes repas",
      options: [ { l: "Léger(e) et en forme", p: 3 }, { l: "Parfois lourd(e)", p: 1 }, { l: "Souvent lourd(e) ou ballonné(e)", p: 0 } ] },
    { id: "q_eau", cat: "hydratation", texte: "Quelle quantité d'eau bois-tu par jour ?",
      axe: "Boire 1,5 à 2 litres d'eau par jour", fort: "Tu bois assez d'eau",
      options: [ { l: "2 litres ou plus", p: 3 }, { l: "Environ 1,5 litre", p: 2 }, { l: "Environ 1 litre", p: 1 }, { l: "Moins d'1 litre", p: 0 } ] },
    { id: "q_sucre", cat: "hydratation", texte: "Sodas, jus, boissons sucrées ou alcool : à quelle fréquence ?",
      axe: "Réduire les boissons sucrées", fort: "Tu limites les boissons sucrées",
      options: [ { l: "Jamais ou presque", p: 3 }, { l: "1 à 2 fois par semaine", p: 2 }, { l: "1 par jour", p: 1 }, { l: "Plusieurs par jour", p: 0 } ] },
    { id: "q_energie", cat: "energie", texte: "Comment est ton énergie au cours de la journée ?",
      axe: "Garder une énergie stable du matin au soir", fort: "Ton énergie est stable",
      options: [ { l: "Stable du matin au soir", p: 3 }, { l: "Un petit coup de mou de temps en temps", p: 2 }, { l: "Souvent fatigué(e)", p: 1 }, { l: "Fatigué(e) presque tout le temps", p: 0 } ] },
    { id: "q_coupbarre", cat: "energie", texte: "Quand ressens-tu un coup de barre ?",
      axe: "Éviter le coup de barre grâce à des repas mieux construits", fort: "Pas de coup de barre",
      options: [ { l: "Jamais", p: 3 }, { l: "En fin de journée", p: 2 }, { l: "Après le déjeuner", p: 1 }, { l: "Dès le matin", p: 0 } ] },
    { id: "q_sport", cat: "activite", texte: "Pratiques-tu une activité physique ?",
      axe: "Bouger au moins 3 fois par semaine", fort: "Tu es sportif(ve)",
      options: [ { l: "3 fois par semaine ou plus", p: 3 }, { l: "1 à 2 fois par semaine", p: 2 }, { l: "De temps en temps", p: 1 }, { l: "Jamais", p: 0 } ] },
    { id: "q_quotidien", cat: "activite", texte: "Au quotidien, tu es plutôt…",
      axe: "Ajouter 30 minutes de marche par jour", fort: "Tu bouges au quotidien",
      options: [ { l: "Très actif(ve), toujours en mouvement", p: 3 }, { l: "Je marche un peu chaque jour", p: 2 }, { l: "Assis(e) la plupart du temps", p: 0 } ] },
    { id: "q_sommeil", cat: "sommeil", texte: "Combien d'heures dors-tu par nuit ?",
      axe: "Viser 7 à 8 heures de sommeil", fort: "Tu dors suffisamment",
      options: [ { l: "7 à 8 heures", p: 3 }, { l: "6 à 7 heures", p: 2 }, { l: "Plus de 9 heures", p: 1 }, { l: "Moins de 6 heures", p: 0 } ] },
    { id: "q_reveil", cat: "sommeil", texte: "Le matin, tu te réveilles…",
      axe: "Mieux récupérer pendant la nuit", fort: "Tu te réveilles en forme",
      options: [ { l: "En pleine forme", p: 3 }, { l: "Ça dépend des jours", p: 2 }, { l: "Encore fatigué(e)", p: 0 } ] },
    { id: "q_stress", cat: "sommeil", texte: "Comment évalues-tu ton niveau de stress ?",
      axe: "Prendre des moments pour décompresser", fort: "Tu gères bien ton stress",
      options: [ { l: "Faible", p: 3 }, { l: "Modéré", p: 2 }, { l: "Élevé", p: 1 }, { l: "Très élevé", p: 0 } ] }
  ],
  produits: [
    { id: "f1", nom: "Formula 1 – Boisson nutritionnelle", usage: "repas", actif: true, prix: 56, portions: 21,
      parfums: ["Vanille", "Chocolat", "Fraise", "Cookies & Cream", "Café latte", "Fruits rouges"],
      avantages: ["Un repas complet et équilibré prêt en 2 minutes", "Riche en protéines, vitamines et minéraux", "Remplacer 2 repas par jour par un substitut de repas, dans le cadre d'un régime hypocalorique, contribue à la perte de poids*"] },
    { id: "pdm", nom: "Protein Drink Mix", usage: "encas", actif: true, prix: 54, portions: 21,
      parfums: ["Vanille", "Chocolat"],
      avantages: ["Encas protéiné à boire, prêt en 1 minute", "Les protéines contribuent à l'augmentation et au maintien de la masse musculaire*"] },
    { id: "f3", nom: "Formula 3 – Protéines personnalisées", usage: "complement", actif: true, prix: 45, portions: 40,
      parfums: [],
      avantages: ["Se mélange à ta boisson Formula 1 pour augmenter ton apport en protéines", "Goût neutre"] },
    { id: "the", nom: "Boisson instantanée à base de thé", usage: "complement", actif: true, prix: 36, portions: 50,
      parfums: ["Citron", "Pêche", "Framboise", "Original"],
      avantages: ["Chaude ou glacée, faible en calories", "Une alternative gourmande aux boissons sucrées"] },
    { id: "aloe", nom: "Boisson concentrée Aloe Vera", usage: "complement", actif: true, prix: 42, portions: 50,
      parfums: ["Mangue", "Original"],
      avantages: ["Rend l'eau plus agréable : pratique pour boire davantage", "Un rituel bien-être facile au quotidien"] },
    { id: "barres", nom: "Barres protéinées", usage: "encas", actif: true, prix: 32, portions: 14,
      parfums: ["Vanille-Amande", "Chocolat-Cacahuète"],
      avantages: ["Encas pratique à glisser dans le sac", "Riche en protéines pour tenir jusqu'au repas"] },
    { id: "f2", nom: "Formula 2 – Complexe multivitamines", usage: "complement", actif: true, prix: 25, portions: 30,
      parfums: [],
      avantages: ["Vitamines et minéraux pour compléter ton alimentation"] },
    { id: "rebuild", nom: "Rebuild Strength", usage: "encas", actif: true, prix: 62, portions: 20,
      parfums: ["Chocolat"],
      avantages: ["Boisson de récupération après l'effort", "Les protéines contribuent au maintien de la masse musculaire*"] },
    { id: "cr7", nom: "CR7 Drive", usage: "complement", actif: true, prix: 40, portions: 20,
      parfums: ["Açaï"],
      avantages: ["Boisson pendant l'effort avec glucides et électrolytes"] }
  ],
  mentionLegale: "* Dans le cadre d'une alimentation variée et équilibrée et d'un mode de vie sain. Les produits ne sont pas des médicaments et ne remplacent pas un avis médical.",
  packs: [
    { id: "pk_ess", nom: "Essentiel", objectifs: ["perte", "manger", "autre"], items: { f1: 1, the: 1 }, duree: 21, populaire: false,
      description: "1 repas remplacé par jour : la base pour démarrer." },
    { id: "pk_transfo", nom: "Transformation", objectifs: ["perte", "manger", "autre"], items: { f1: 1, f3: 1, the: 1, aloe: 1 }, duree: 21, populaire: true,
      description: "Le programme complet petit-déjeuner + hydratation. Le choix de la majorité." },
    { id: "pk_premium", nom: "Accéléré", objectifs: ["perte"], items: { f1: 2, f3: 1, the: 1, aloe: 1, f2: 1 }, duree: 21, populaire: false,
      description: "2 repas remplacés par jour pour avancer plus vite vers ton objectif." },
    { id: "pk_energie", nom: "Énergie", objectifs: ["energie", "masse", "autre"], items: { f1: 1, barres: 1 }, duree: 21, populaire: false,
      description: "1 à 2 encas par jour pour une énergie stable." },
    { id: "pk_perf", nom: "Performance", objectifs: ["energie", "masse"], items: { f1: 1, pdm: 1, barres: 1, aloe: 1 }, duree: 21, populaire: true,
      description: "Encas protéinés + hydratation : le pack le plus choisi pour se renforcer." },
    { id: "pk_athlete", nom: "Athlète", objectifs: ["masse"], items: { f1: 1, pdm: 1, f3: 1, rebuild: 1, cr7: 1 }, duree: 21, populaire: false,
      description: "Avant, pendant et après l'entraînement." }
  ],
  messages: {
    invitation: "Bonjour {prenom} 👋 C'est {coach}, coach bien-être de la {equipe}. {client} a pensé à toi et m'a donné ton numéro pour t'offrir un bilan bien-être gratuit (20 min à distance, sans engagement). Ça te dit qu'on fixe un moment cette semaine ?\nSi tu préfères ne pas être recontacté(e), réponds simplement STOP et je supprime ton numéro.",
    relanceInvite: "Re-bonjour {prenom}, c'est {coach}. Je reviens vers toi pour le bilan bien-être offert par {client}. Tu préfères en semaine ou le week-end ?\n(Réponds STOP si tu ne souhaites pas être recontacté(e).)",
    rdv: "Parfait {prenom} ! Ton bilan bien-être est calé le {date}. Je t'appelle sur WhatsApp, prévois 20 minutes au calme. À très vite ! {coach}",
    recap: "Merci {prenom} pour ton bilan bien-être ! 🔥\n\nTon score : {score}/100\nTes priorités :\n{axes}\n\nTon programme : {programme}\n\nOn se retrouve très vite pour ton suivi.\n{coach} – {equipe}",
    relanceReflechit: "Bonjour {prenom}, c'est {coach}. As-tu pu réfléchir à ton programme suite à ton bilan ({score}/100) ? Je suis dispo pour répondre à tes questions 🙂",
    suiviClient: "Hello {prenom} ! C'est {coach}. Comment ça se passe avec ton programme ? Dis-moi ton ressenti et on ajuste ensemble 💪",
    envoiRapport: "Merci {prenom} pour ton bilan bien-être ! 🌿\n\nComme promis, voici ton rapport personnalisé (score {score}/100) et ton e-book offert « 20 habitudes pour être en top forme » :\n{lien}\n\nÀ très vite,\n{coach} – {equipe}",
    emailSujet: "Ton bilan bien-être + ton e-book offert",
    emailCorps: "Bonjour {prenom},\n\nMerci pour ce bilan bien-être ! Comme promis, voici ton rapport personnalisé (score {score}/100) et ton e-book offert « 20 habitudes pour être en top forme » :\n\n{lien}\n\nTu peux le télécharger en PDF depuis cette page.\n\nÀ très vite,\n{coach}\n{equipe}"
  },
  coach: {
    accueil: "Brise la glace : « Merci de prendre ce temps pour toi ! Je vais te poser quelques questions simples sur tes habitudes et à la fin tu auras ton score bien-être. Ça te va ? » Demande ce qui l'a motivé(e) à faire ce bilan aujourd'hui.",
    questions: "Pose la question, laisse répondre, puis creuse une fois : « Et ça, ça te fait quoi au quotidien ? » Le ressenti compte plus que les chiffres. Raccourci : touches 1 à 4 pour répondre.",
    mesures: "Facultatif. Si la personne hésite : « Pas de souci, c'est seulement pour mesurer tes progrès. » Puis : « Si tu atteignais ton objectif, qu'est-ce que ça changerait pour toi ? »",
    score: "Commence TOUJOURS par les points forts. Puis : « Sur une échelle de 1 à 10, à quel point c'est important pour toi d'améliorer ça ? » Laisse le silence travailler.",
    recos: "« Ton rapport et ton e-book te seront envoyés à la fin. J'ai la possibilité d'offrir le même cadeau à 3 à 5 personnes de ton choix. Qui dans ton entourage parle souvent de forme, de poids ou de fatigue ? » Parcours les idées affichées une par une.",
    motivation: "Après la note : « Pourquoi pas plus bas ? » Laisse la personne lister ses raisons : ce sont SES arguments, tu t'en serviras au moment de la décision.",
    echeance: "« Qu'est-ce qui se passe à cette date ? » Un événement crée l'urgence. Note-le, tu le rappelleras à la décision.",
    depenses: "Reste léger et sans jugement : « On fait juste le point, beaucoup de gens sont surpris. » Le total servira à comparer avec le programme.",
    budget: "« Combien de personnes au foyer ? » Le coût d'un repas à la maison sert de repère, ne le commente pas encore.",
    decideur: "Si quelqu'un d'autre décide : « Super ! Tu veux qu'on l'appelle 5 minutes à la fin pour lui montrer ton bilan ? »",
    energie: "Explique simplement : « Ton corps, c'est une balance. » Clique sur les 3 situations l'une après l'autre. Pas de chiffres compliqués.",
    comparatif: "« Regarde la différence sur un simple petit-déjeuner. » Laisse la personne réagir avant de continuer.",
    challenge: "Présente le challenge comme la porte d'entrée : « Pour 19 €, tu n'es plus seul(e) pendant 21 jours. » Puis : « Et si tu veux aller plus vite, regarde ce qui suit. »",
    solution: "Reprends son objectif avec SES mots. Présente d'abord le pack mis en avant. Fais choisir les parfums : on choisit ce qu'on va utiliser.",
    decision: "Question fermée : « On démarre lundi ou dès demain ? » Puis tais-toi. Si « je réfléchis » : « Bien sûr ! Qu'est-ce qui te fait hésiter : le prix, le goût ou le moment ? »",
    fin: "Félicite ! Envoie le rapport et l'e-book tout de suite, puis invite les proches dans les 24 h, tant que l'enthousiasme est là."
  },
  objections: [
    { q: "C'est trop cher", r: "Je comprends. Tout à l'heure, tu m'as dit que tu dépenses déjà environ {depensesJour} par jour en extras. Ton programme revient à {programmeJour} par jour, et ton repas Formula 1 à environ {prixRepas}." },
    { q: "Je dois réfléchir", r: "Bien sûr. À quoi veux-tu réfléchir exactement : le prix, le goût, ou si ça va marcher pour toi ?" },
    { q: "Je dois en parler à mon conjoint", r: "Super réflexe ! À ton avis, qu'est-ce qu'il/elle va te demander ? On peut l'appeler ensemble 5 minutes." },
    { q: "J'ai déjà essayé, ça n'a pas marché", r: "Qu'est-ce qui a manqué la dernière fois ? Ici tu as un coach, un groupe et un suivi chaque semaine : tu n'es plus seul(e)." },
    { q: "Je n'ai pas le temps", r: "Justement : un shake se prépare en 2 minutes. C'est le repas le plus rapide de ta journée." }
  ],
  idees: ["Quelqu'un de ta famille qui veut reprendre la forme", "Un(e) collègue souvent fatigué(e)", "Un(e) ami(e) qui parle de perdre du poids", "Ton/ta partenaire de sport", "Un(e) voisin(e) qui veut mieux manger", "Quelqu'un qui prépare un événement (mariage, vacances)"]
};

export const STATUTS = [
  { id: "a_inviter", label: "À inviter", tone: "info", color: "#2F6FD6" },
  { id: "invite", label: "Invité", tone: "info", color: "#7FA8E8" },
  { id: "bilan_planifie", label: "Bilan planifié", tone: "warn", color: "#E5B000" },
  { id: "bilan_fait", label: "Bilan fait", tone: "gold", color: "#7AC143" },
  { id: "client", label: "Client", tone: "good", color: "#1F7A2A" },
  { id: "pas_interesse", label: "Pas intéressé", tone: "muted", color: "#94A3B8" },
  { id: "ne_plus_contacter", label: "Ne plus contacter", tone: "bad", color: "#D9483B" }
];
export const LIENS = ["Famille", "Ami(e)", "Collègue", "Voisin(e)", "Autre"];
export const USAGES = { repas: "Repas", encas: "Encas", complement: "Complément" };
