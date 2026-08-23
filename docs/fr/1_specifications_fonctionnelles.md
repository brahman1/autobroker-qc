# Spécifications Fonctionnelles - AutoBroker QC

## 1. Vue d'ensemble du Projet
AutoBroker QC est une plateforme de courtage (proxy bidding) permettant aux acheteurs du Québec de participer à des enchères automobiles fermées (réservées aux concessionnaires, type Copart). La plateforme agit comme intermédiaire légal et financier.

## 2. Rôles et Permissions

### 2.1 Visiteur Anonyme
- Consulter l'inventaire des véhicules.
- Voir les détails d'un véhicule (sans l'historique des mises).
- Créer un compte.

### 2.2 Client (En attente KYC)
- Statut `PENDING`.
- Accéder au tableau de bord.
- **Restriction :** Ne peut pas déposer de caution ni enchérir tant que l'identité n'est pas vérifiée par un administrateur.

### 2.3 Client (Vérifié KYC)
- Statut `VERIFIED`.
- Effectuer un dépôt de garantie (Caution) via carte de crédit (Stripe).
- Participer aux enchères en temps réel.
- Suivre le statut de ses mises.

### 2.4 Administrateur
- Gérer les utilisateurs et approuver les KYC (Know Your Customer).
- Ajouter/Modifier des véhicules.
- Créer et gérer des enchères.
- Superviser les transactions.

## 3. Processus Métier Principaux

### 3.1 Dépôt de Garantie (Caution)
Pour enchérir, un client doit avoir une caution active (ex: 600$ CAD).
- **Empreinte bancaire (Hold) :** Le montant n'est pas débité, mais bloqué sur la carte via Stripe (`PaymentIntent` avec `capture_method: 'manual'`).
- **Validité :** Permet d'enchérir sur une ou plusieurs enchères tant qu'aucune n'est remportée.

### 3.2 Processus d'Enchère (Proxy Bidding)
- **Temps réel :** Les mises sont mises à jour instantanément pour tous les utilisateurs connectés.
- **File d'attente (FIFO) :** Les mises simultanées sont traitées dans l'ordre d'arrivée pour éviter les conflits (race conditions).
- **Fin d'enchère :** Un compte à rebours indique la fin. Dès que le temps est écoulé, le système détermine le gagnant.

### 3.3 Post-Enchère (Règlement)
- **Gagnant :** Si le client remporte l'enchère, la caution de 600$ est **capturée** (débitée) pour couvrir les frais de courtage et sécuriser le véhicule.
- **Perdant :** Si le client perd l'enchère et n'a pas d'autre enchère active, la caution est **relâchée** (Release), libérant les fonds sur sa carte.

## 4. Règles d'Affaires & Conformité (Québec)
- **SAAQ (Société de l'assurance automobile du Québec) :** Les véhicules doivent afficher clairement leur statut :
  - `CLEAN` (Immatriculable) : Vert.
  - `VGA` (Véhicule Gravement Accidenté) : Jaune, nécessite inspection.
  - `SCRAP` (Pièces uniquement) : Rouge, non immatriculable.
- **Loi 96 :** Toute l'interface client, les messages d'erreur et les communications doivent être exclusivement en français.
- **OPC (Office de la protection du consommateur) :** Les mentions de licence de commerçant doivent être affichées dans le pied de page.
