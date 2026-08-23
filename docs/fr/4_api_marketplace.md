# API Marketplace simulée

Le backend contient une couche de courtage automobile complète fonctionnant avec les données de démonstration. Elle est conçue pour recevoir ultérieurement des connecteurs d’inventaire (encans, transporteurs, KYC et paiements) sans modifier les parcours clients.

## Parcours client

- `GET /vehicles` : catalogue paginé et filtrable (`q`, `category`, `make`, `model`, `saaqStatus`, `titleType`, `minYear`, `maxYear`, `minPrice`, `maxPrice`, `runAndDrive`, `hasKeys`, `sort`, `page`, `limit`).
- `GET|POST|DELETE /watchlist` : véhicules surveillés.
- `GET|POST|DELETE /saved-searches` : recherches et alertes sauvegardées.
- `GET|PATCH /notifications` : centre de notifications.
- `POST /offers` et `GET /offers/my` : offre sur un véhicule; seules les identités KYC vérifiées avec caution active peuvent soumettre une offre.
- `POST /buy-now/:vehicleId` : réservation d’un véhicule avec prix d’achat immédiat.
- `GET /orders/my` : commande, montant, échéance, véhicule, documents et devis.
- `GET /documents/my` : facture et contrat générés dans le mode démo.
- `POST /transport/quotes` et `GET /transport/quotes/my` : devis Canada simulé, selon code postal et niveau de service.

## Parcours administration

- `PATCH /offers/:id` avec `status=ACCEPTED|DECLINED`.
- `GET /orders` et `PATCH /orders/:id/status`.
- Les écrans existants d’administration continuent de gérer les utilisateurs/KYC, véhicules et enchères.

## Données de démonstration

Exécuter `npm run seed` avec PostgreSQL configuré. Le jeu de données crée des clients KYC vérifié et en attente, un dépôt actif, des véhicules avec catégories et titres, des enchères, un favori, une recherche sauvegardée, des notifications, une commande, des documents et un devis de transport.

## Cycle post-enchère

À la fermeture d’une enchère, le cron termine l’enchère, capture/libère les cautions selon le résultat et crée une commande avec documents simulés pour le gagnant. Les vraies intégrations Stripe, transport et fournisseurs d’encans pourront remplacer les simulations au niveau des services concernés.
