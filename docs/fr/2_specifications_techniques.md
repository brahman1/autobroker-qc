# Architecture et Spécifications Techniques

## 1. Stack Technologique

### 1.1 Front-End (Client)
- **Framework :** React 18 avec TypeScript.
- **Build Tool :** Vite (HMR rapide, build optimisé).
- **Stylisation :** Tailwind CSS.
- **Gestion d'état :** Zustand (léger, adapté pour Auth et UI locales).
- **Communication réseau :** Axios (REST) et Socket.io-client (WebSockets).
- **Paiements :** Stripe Elements (React Stripe.js).

### 1.2 Back-End (Serveur)
- **Framework :** NestJS (Node.js).
- **Langage :** TypeScript.
- **Temps réel :** @nestjs/websockets avec Socket.io.
- **Sécurité :** Helmet (Headers HTTP), Throttler (Rate limiting), Bcrypt (Hashage mots de passe).
- **Authentification :** Passport-JWT.
- **Paiements :** Stripe Node SDK.

### 1.3 Infrastructure (Prévue pour la production)
- **Base de données :** PostgreSQL (garantit l'intégrité ACID). *Note: mocké en mémoire pour le dev local*.
- **Cache / File d'attente :** Redis. *Note: mocké en mémoire (FIFO array) pour le dev local*.
- **Reverse Proxy :** Nginx.
- **Conteneurisation :** Docker & Docker Compose.

## 2. Architecture du Projet (Monorepo)
Le projet utilise les **NPM Workspaces** pour partager du code entre le back-end et le front-end.
- `apps/backend/` : Application NestJS.
- `apps/frontend/` : Application React.
- `packages/shared-types/` : DTOs, Enums et Interfaces partagés pour garantir la cohérence des types de bout en bout.

## 3. Modèle de Données (Entités Principales)

- **User :** Stocke les informations de connexion, le rôle (ADMIN/CLIENT), le statut KYC, et l'ID client Stripe (`stripeCustomerId`).
- **Vehicle :** Contient le VIN, marque, modèle, statut SAAQ (CLEAN/VGA/SCRAP), condition, et images.
- **Auction :** Représente une vente (Date de début, de fin, prix de départ, plus haute mise actuelle). Lie un Véhicule.
- **Bid :** Historique immuable des mises. Lie un User, une Auction, un montant, et un timestamp.
- **Deposit :** Trace les paiements Stripe. Statuts : `HOLD` (Bloqué), `CAPTURED` (Débité), `RELEASED` (Annulé).

## 4. Architecture Temps Réel & Concurrence

### 4.1 WebSockets (Socket.io)
Le serveur maintient des "Rooms" par ID d'enchère.
- Lorsqu'un utilisateur ouvre la page d'une enchère, il rejoint la room (`join:auction`).
- Les nouvelles mises déclenchent un événement `bid:new` diffusé à tous les clients de la room.
- Le backend émet un `auction:tick` chaque seconde avec le temps restant exact (évite la désynchronisation des horloges locales).

### 4.2 Gestion de la Concurrence (Race Conditions)
Pour éviter que deux utilisateurs ne placent une mise en même temps et corrompent le prix :
1. Les requêtes de mise (POST `/bids`) ne modifient pas directement la DB.
2. Elles sont poussées dans une file d'attente (Redis en prod, FIFO Array en dev).
3. Un Worker traite la file séquentiellement (1 par 1 pour une même enchère).
4. Si la mise est inférieure au prix actuel (suite à une mise traitée juste avant), elle est rejetée (`OUTBID`).

## 5. Sécurité
- **Authentification Stateless :** Tokens JWT signés, valides 24h.
- **PCI-DSS :** Le backend ne touche jamais aux numéros de carte de crédit. Le frontend utilise Stripe Elements.
- **Rate Limiting :** 100 requêtes/minute par IP en global, strict à 10 requêtes/minute sur les endpoints de mise pour bloquer les bots (Sniping bots).
