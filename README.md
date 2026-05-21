# AJRN — Association des Jeunes Ressortissants du Nonwolo

Application de gestion des adhérents accessible partout dans le monde.

## Fonctionnalités

- **Tableau de bord** : statistiques en temps réel, répartition mondiale, cotisations en retard
- **Adhérents** : liste complète, ajout, modification, suppression, filtres par continent/cotisation
- **Villages** : gestion des villages avec compteur d'adhérents
- **Messagerie** : messages groupés et individuels, modèles prédéfinis, rappels de cotisation
- **Cotisations** : suivi des paiements, instructions Orange Money / Moov Money / Wave

## Déploiement sur Vercel

### Option 1 — Via GitHub (recommandé)

1. Créer un dépôt GitHub et pousser ce projet :
```bash
git init
git add .
git commit -m "Initial commit AJRN"
git remote add origin https://github.com/VOTRE_NOM/ajrn.git
git push -u origin main
```

2. Aller sur [vercel.com](https://vercel.com) → "New Project"
3. Importer le dépôt GitHub
4. Cliquer sur **Deploy** — Vercel détecte automatiquement Next.js

### Option 2 — Via CLI Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

## Développement local

```bash
npm install
npm run dev
# Ouvrir http://localhost:3000
```

## Technologies

- **Next.js 16** + TypeScript
- **Zustand** (état global, persisté dans localStorage)
- **Tailwind CSS**
- Zéro base de données requise — données stockées localement dans le navigateur

## Numéro de dépôt AJRN

**0707070707** — Utilisé pour toutes les cotisations (1 000 FCFA)
