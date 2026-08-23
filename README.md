# AutoBroker QC 🚗
## Plateforme de Courtage en Enchères Automobiles — Marché Québécois

> Plateforme permettant aux particuliers québécois d'accéder aux enchères Copart/IAA via notre licence de commerçant de véhicules.

---

## 🚀 Démarrage local

### Prérequis
- Node.js v20+
- npm v9+
- Docker Desktop (PostgreSQL et Redis)

### Installation & Démarrage

```bash
# Cloner le projet
git clone <url> autobroker-qc
cd autobroker-qc

# Préparer la configuration locale (secrets de test uniquement)
cp .env.example .env

# Démarrer PostgreSQL et Redis
docker compose -f infra/docker-compose.yml up -d postgres redis

# Installer toutes les dépendances et appliquer le schéma
npm install
npx prisma migrate deploy --schema apps/backend/prisma/schema.prisma

# Optionnel : charger les comptes et véhicules de démonstration
npm run seed

# Lancer le backend ET le frontend en une commande
npm run dev
```

L'application sera disponible sur :
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3001
- **Documentation Swagger** : http://localhost:3001/api/docs

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@autobrokerqc.ca | Admin123! |
| Client (KYC vérifié) | client@example.com | Client123! |
| Client (KYC en attente) | newclient@example.com | Client123! |

---

## 🏗️ Architecture

```
autobroker-qc/                    # Monorepo racine
├── apps/
│   ├── backend/                  # NestJS API (port 3001)
│   └── frontend/                 # React/Vite UI (port 5173)
├── packages/
│   └── shared-types/             # Types TypeScript partagés
├── infra/
│   ├── docker-compose.yml        # Stack production (Docker)
│   ├── nginx.conf                # Reverse proxy production
│   └── init.sql                  # Schéma PostgreSQL production
├── .env                          # Variables d'environnement locales
└── package.json                  # Workspaces npm
```

### Stack Technique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend | React 18 + Vite + Tailwind CSS | Interface utilisateur |
| État | Zustand | State management |
| Backend | NestJS (Node.js) | API REST + WebSockets |
| Temps réel | Socket.io | Enchères live |
| Auth | JWT (local) / Auth0 (prod) | Authentification |
| Paiements | Stripe (test/prod) | Dépôts de caution |
| Cache/Queue | Redis mock (local) / Redis (prod) | File d'attente des offres |
| Base de données | In-memory (local) / PostgreSQL (prod) | Persistance |
| Déploiement | Docker + Nginx | Infrastructure production |

---

## 🔧 Configuration

### Variables d'environnement (`.env`)

```env
# Mode local
USE_IN_MEMORY_DB=false
USE_MOCK_REDIS=false
USE_MOCK_COPART=true       # Données Copart fictives

# Stripe (test — aucun argent réel) ; USE_MOCK_STRIPE=true pour une démo sans Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🚢 Déploiement Production

### Avec Docker

```bash
# Copier les variables d'environnement
cp .env.example .env
# Remplir les vraies valeurs (PostgreSQL, Redis, Stripe prod, etc.)

# Lancer la stack complète
cd infra
docker-compose up -d

# Initialiser la base de données
docker-compose exec backend npm run seed
```

### Passage du mode local au mode production

| Variable | Local | Production |
|----------|-------|------------|
| `USE_IN_MEMORY_DB` | `true` | `false` |
| `USE_MOCK_REDIS` | `true` | `false` |
| `USE_MOCK_COPART` | `true` | `false` |
| `DATABASE_URL` | (ignoré) | `postgresql://...` |
| `REDIS_URL` | (ignoré) | `redis://...` |
| `JWT_SECRET` | dev-secret | Secret fort aléatoire |
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` |

---

## 📋 Fonctionnalités

### Pour les clients
- ✅ Inscription et connexion sécurisée
- ✅ Vérification d'identité KYC (permis de conduire)
- ✅ Navigation de l'inventaire avec filtres (statut SAAQ, prix, marque, année)
- ✅ Badge coloré SAAQ (🟢 Titre Propre, 🟡 VGA, 🔴 Irrécupérable)
- ✅ Enchères en temps réel (WebSocket)
- ✅ Chronomètre autonome (continue même si connexion perdue)
- ✅ Dépôt de caution sécurisé (Stripe — aucun débit sans confirmation)
- ✅ Dashboard personnel (enchères actives, dépôts, statut)

### Pour les administrateurs
- ✅ Gestion de l'inventaire véhicules
- ✅ Création et gestion des enchères
- ✅ Validation des KYC
- ✅ Vue des dépôts et paiements

---

## ⚖️ Mentions Légales (Québec)

Cette plateforme opère sous licence de commerçant de véhicules (OPC Québec).
Les véhicules sont vendus **tels quels**, sans garantie légale de bon fonctionnement.
Les clients sont informés du statut SAAQ avant toute enchère.
Tous les dépôts de garantie sont gérés via Stripe (conformité PCI-DSS).

---

## 📞 Contact
- **Site** : https://autobrokerqc.ca
- **Email** : info@autobrokerqc.ca
- **Téléphone** : 514-XXX-XXXX

*Développé avec ❤️ pour le marché québécois*
