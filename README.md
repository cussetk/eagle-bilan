# Eagle Bilan · 97 Eagle Team

Outil de bilan bien-être à distance, mini-CRM et rapport client pour la 97 Eagle Team.

- **Hébergement** : Vercel (site statique construit par `npm run build`, dossier `dist/`).
- **Base de données et comptes** : Neon (projet `eagle-bilan`, région Francfort), Managed Better Auth + Data API, sécurité par Row-Level Security.
- **Contenu** (questions, produits, prix, messages, couleurs) : modifiable dans l'appli, onglet Réglages (leader).

## Structure
- `src/config.js` : contenu par défaut.
- `src/a_core.js` … `src/e_main.js` : l'application (assemblées dans cet ordre au build).
- `src/store.js` : connexion à Neon (comptes + données).
- `src/rapport.js` : page publique du rapport client (`/r/?t=…`).
- `static/` : pages HTML, styles, logos, e-book (`/ebook/`).

## Accès
Le leader ajoute l'e-mail d'un distributeur dans l'onglet Équipe ; le distributeur crée son compte avec cette adresse.
