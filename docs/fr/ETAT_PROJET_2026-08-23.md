# Point de reprise — AutoBroker QC

Dernière mise à jour : 23 août 2026.

Ce document résume l'état du projet et les décisions prises afin de pouvoir reprendre le travail après une interruption.

## Objectif produit

Créer une plateforme canadienne de courtage d'encans automobiles, meilleure que RideSafely pour le marché québécois et canadien : expérience bilingue, titres SAAQ, transparence des frais, enchères en direct, achat immédiat, documents, transport et administration complète.

## Fonctionnalités déjà présentes

- Authentification JWT, profil et KYC simulé, avec rôles `CLIENT`, `PARTNER`, `INSPECTOR`, `SUPPORT`, `FINANCE`, `OPERATIONS` et `ADMIN`.
- Catalogue filtrable, véhicules, enchères, proxy bidding, anti-sniping et WebSocket.
- Favoris, recherches sauvegardées, notifications, offres, achat immédiat, commandes et devis de transport simulés.
- Espace client : tableau de bord, caution, achats, documents, offres, transports et alertes.
- Administration à privilèges : utilisateurs/KYC, véhicules, encans, commandes, offres, litiges et journal d’audit.
- Litiges client : ouverture, suivi, traitement par le soutien/opérations et notification du client.
- Calculateur indicatif de coût d’achat : mise, frais, TPS/TVQ, transport, réparation simulée et risque.
- Comparateur client de jusqu’à trois véhicules.
- Filtres étendus et catégories : auto, VUS, camion, moto, bateau, VR, remorque, industriel et électrique.
- Import CSV manuel contrôlé pour les rôles opérations et administrateur.
- Cautions administrables : liste, capture et remboursement Stripe test selon les droits finance/opérations.
- Endpoint de génération de facture/contrat PDF simulé, protégé par l’authentification.
- Protection locale des enchères contre les rafales de mises et les montants anormalement élevés; incidents enregistrés dans l’audit.
- SEO de base : métadonnées, `robots.txt`, sitemap statique; workflow CI de validation ajouté.
- PostgreSQL/Prisma avec migrations appliquées et jeu de données de démonstration.
- Frontend modernisé, contrastes corrigés et redirection `/vehicule` vers `/vehicules`.

## Démarrage local

- Frontend : `http://localhost:5173`
- Backend API : `http://localhost:3001`
- Swagger : `http://localhost:3001/api/docs`
- Santé : `http://localhost:3001/health`
- Base PostgreSQL Docker : port local `5433`

Commandes utiles depuis la racine :

```powershell
start.bat
npm run build
npm test
npm run seed
```

Le backend doit utiliser `apps/backend/.env`; ce fichier est chargé avant Prisma pour éviter un conflit avec le `.env` de la racine.

## Stripe test — travail en cours

Le projet possède des clés Stripe de test configurées localement, qui ne doivent jamais être copiées dans ce document ou dans Git.

Modifications en cours :

- `USE_MOCK_STRIPE=false` dans `apps/backend/.env` pour utiliser Stripe test.
- `GET /payments/config` retourne seulement la clé publique et le mode (`test` ou `demo`).
- Le frontend charge la clé publique dynamiquement, sans secret côté navigateur.
- `POST /deposits/create-intent` crée une préautorisation Stripe avec capture manuelle.
- `POST /deposits/:id/confirm` vérifie côté serveur que le Payment Intent est capturable avant de passer la caution à `HOLD`.
- Le webhook Stripe reste pris en charge et doit être configuré avec `STRIPE_WEBHOOK_SECRET` pour la confirmation automatique.

Carte Stripe test recommandée : `4242 4242 4242 4242`, date future, CVC quelconque.

Les contrôles lint, build et tests backend, ainsi que lint et build frontend, ont été validés après ces modifications. Les endpoints Stripe de configuration, litiges et audit ont aussi été interrogés avec succès sur l’API locale.

Tester ensuite une caution avec une identité KYC `VERIFIED` qui ne possède pas encore de caution active.

## Matrice de droits actuelle

- `CLIENT` : navigation, caution, offres, achat immédiat, commandes personnelles, transport, documents et litiges personnels.
- `PARTNER` : rôle réservé au futur accès partenaire; il ne reçoit aucun privilège opérationnel automatique.
- `INSPECTOR` : consultation de l’équipe, utilisateurs/KYC et litiges en lecture seule.
- `SUPPORT` : consultation des commandes, gestion des litiges et consultation des utilisateurs/KYC.
- `FINANCE` : consultation des commandes, utilisateurs/KYC, litiges et journal d’audit.
- `OPERATIONS` : gestion des véhicules, encans, offres, commandes, KYC et litiges.
- `ADMIN` : tous les droits ci-dessus, avec attribution des rôles utilisateurs.

Les règles sont appliquées dans l’API et masquent aussi les écrans/actions non autorisés dans le frontend. Un changement de rôle est strictement limité à `ADMIN` et les rôles acceptés sont validés côté serveur.

## Travaux encore réalisables sans intégration externe

1. Finaliser le téléchargement PDF directement depuis l’espace client et enrichir les documents contractuels.
2. Mettre en place la traduction exhaustive français/anglais de toutes les pages.
3. Ajouter une file de communications simulées visible (courriel/SMS) et l’historique de paiement au niveau commande.
4. Ajouter un import SFTP réel dès que les identifiants d’un partenaire sont disponibles.
5. Mettre en place des sauvegardes PostgreSQL planifiées dans l’environnement de déploiement.
6. Générer factures, contrats et reçus PDF localement.
7. Ajouter catégories, filtres avancés, anglais, SEO, sitemaps et données simulées plus riches.
8. Ajouter tests e2e, logs structurés, CI/CD et sauvegardes locales.
9. Ajouter import CSV et connecteur SFTP générique pour inventaires.

## Dépendances externes nécessaires plus tard

- Partenaires encans, assureurs, flottes et concessionnaires.
- API VIN/historique, SAAQ et rapports d'accident/vol.
- Fournisseur KYC/KYB réel.
- Transporteurs réels.
- E-mail/SMS réel et stockage cloud.
- Validation juridique, fiscale et réglementaire canadienne/québécoise.

## Vérifications déjà effectuées

- Les migrations Prisma sont à jour sur la base locale.
- Le backend a démarré avec PostgreSQL local.
- Le frontend affiche les quatre véhicules simulés et les pages véhicule.
- Lint, build et tests backend/frontend sont validés. Les 2 tests E2E Playwright du parcours d’inscription passent également.
