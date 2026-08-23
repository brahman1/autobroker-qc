# Guide d'Intégration (Onboarding) - Développeurs

Bienvenue sur le projet AutoBroker QC ! Ce document vous guidera pour installer, exécuter et comprendre le projet.

## 1. Prérequis Système
- **Node.js** : v20 ou supérieur (v22 recommandé).
- **NPM** : v10 ou supérieur.
- **Git** : Installé et configuré.
- *(Optionnel pour la prod)* **Docker & Docker Compose**.

## 2. Installation Rapide

1. **Cloner et installer les dépendances (Monorepo)**
   Depuis la racine du projet, installez toutes les dépendances d'un coup grâce aux NPM Workspaces :
   ```bash
   npm install
   ```

2. **Variables d'environnement**
   Copiez le fichier d'exemple pour créer votre configuration locale :
   ```bash
   cp .env.example .env
   ```
   *Note : Le fichier `.env` à la racine est lu par le Backend. Les clés Stripe de test y sont déjà présentes pour faciliter le développement.*

3. **Démarrer le projet**
   Sur Windows, utilisez le script batch fourni à la racine :
   ```cmd
   start.bat
   ```
   *Ce script lancera le backend sur le port 3001 et le frontend sur le port 5173.*
   Pour arrêter tous les processus : `stop.bat`

## 3. Structure du Code

- **Frontend (`apps/frontend/`)**
  - `src/pages/` : Les vues principales associées aux routes (React Router).
  - `src/components/` : Composants réutilisables (UI de base, cartes de véhicules, logique d'enchère).
  - `src/store/` : Stores Zustand pour la gestion globale (utilisateur connecté).
  - `src/lib/` : Utilitaires (Client Axios, Client WebSocket).

- **Backend (`apps/backend/`)**
  - Architecture modulaire NestJS. Chaque domaine a son dossier (ex: `src/auctions/`, `src/bids/`).
  - `src/database/` : En développement local, la DB est émulée en mémoire via des objets `Map` Javascript. Un **seed automatique** crée des véhicules et enchères fictives à chaque redémarrage.

- **Types Partagés (`packages/shared-types/`)**
  - Si vous modifiez une interface (ex: ajouter un champ au `Vehicle`), faites-le ici.
  - Compilez le package (`npm run build` dans ce dossier) pour que le frontend et le backend voient les changements.

## 4. Standards et Bonnes Pratiques

- **Typage Strict :** Évitez le type `any`. Utilisez toujours les interfaces provenant de `@autobroker/shared-types`.
- **Langue :** 
  - **Code (Variables, Fonctions, Commits) :** Anglais obligatoire.
  - **Interface Client (JSX, Messages d'erreur) :** Français Québécois (exigence légale).
- **Git Flow :** 
  - Créez des branches `feature/nom-fonctionnalite` ou `fix/nom-bug`.
  - Pas de push direct sur `main`.

## 5. Comptes de Test Locaux
La base de données en mémoire crée automatiquement ces comptes au démarrage :
- **Admin :** `admin@autobrokerqc.ca` / `Admin123!`
- **Client (Peut enchérir) :** `client@example.com` / `Client123!`
