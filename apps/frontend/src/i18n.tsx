import { useEffect } from 'react';
import { useLocaleStore } from './store/locale.store';

type NodeTranslation = { source: string; output: string };

// The application was initially written in French.  Keeping this catalogue in
// one place makes every existing screen bilingual while new screens can reuse
// the same vocabulary instead of introducing one-off translations.
const translations: Record<string, string> = {
  'Accueil': 'Home', 'Inventaire': 'Inventory', 'Enchères en direct': 'Live auctions', 'Comparer': 'Compare',
  'Connexion': 'Sign in', 'Déconnexion': 'Sign out', 'Créer un compte': 'Create an account', 'Mon espace': 'My account',
  'Administration': 'Administration', 'Mes achats': 'My purchases', 'Mes documents': 'My documents', 'Mes paiements': 'My payments', 'Mes alertes': 'My alerts',
  'Courtier québécois': 'Québec broker', 'Chargement...': 'Loading...', 'Chargement…': 'Loading…', 'Enregistrer': 'Save', 'Annuler': 'Cancel',
  'Fermer': 'Close', 'Retour à l’accueil': 'Back to home', "Retour à l'accueil": 'Back to home', 'Oups ! La page que vous cherchez n’existe pas.': 'Oops! The page you are looking for does not exist.',
  'Explorez les véhicules disponibles': 'Browse available vehicles', 'Filtrez par statut SAAQ, lot, état mécanique et prix avant de participer.': 'Filter by SAAQ status, lot, mechanical condition and price before participating.',
  'véhicule': 'vehicle', 'véhicules': 'vehicles', 'Recherche enregistrée dans votre espace.': 'Search saved to your account.', 'Impossible d’enregistrer cette recherche.': 'Unable to save this search.',
  'Filtres': 'Filters', 'Recherche': 'Search', 'Marque, modèle, NIV, lot…': 'Make, model, VIN, lot…', 'Statut SAAQ': 'SAAQ status', 'Tous les statuts': 'All statuses',
  'Propre': 'Clean', 'Irrécupérable': 'Non-repairable', 'Type de véhicule': 'Vehicle type', 'Toutes les catégories': 'All categories',
  'Auto': 'Car', 'VUS': 'SUV', 'Camion': 'Truck', 'Moto': 'Motorcycle', 'Bateau': 'Boat', 'VR': 'RV', 'Remorque': 'Trailer', 'Industriel': 'Industrial', 'Électrique': 'Electric',
  'Année min.': 'Min. year', 'Année max.': 'Max. year', 'Prix min.': 'Min. price', 'Prix max.': 'Max. price', 'Énergie': 'Fuel', 'Toutes': 'All',
  'Essence': 'Gasoline', 'Hybride': 'Hybrid', 'Titre': 'Title', 'Tous': 'All', 'Démarre et roule': 'Runs and drives', 'Clés disponibles': 'Keys available',
  'Trier par': 'Sort by', 'Plus récents': 'Newest', 'Prix croissant': 'Price: low to high', 'Année décroissante': 'Year: newest first', 'Réinitialiser': 'Reset',
  'Aucun véhicule trouvé': 'No vehicles found', 'Essayez de modifier vos filtres de recherche.': 'Try changing your search filters.', 'Lot disponible': 'Available lot',
  'Mise actuelle': 'Current bid', 'Consulter le véhicule →': 'View vehicle →', 'EN DIRECT': 'LIVE', 'Québec, Canada': 'Québec, Canada',
  'État et spécifications': 'Condition and specifications', 'Informations détaillées disponibles avant toute participation.': 'Detailed information is available before you participate.',
  'Aucune image disponible': 'No image available', 'Kilométrage': 'Mileage', 'Carburant': 'Fuel', 'Condition': 'Condition', 'Dommage primaire': 'Primary damage',
  'Dommage secondaire': 'Secondary damage', 'Aucun déclaré': 'None reported', 'Clés': 'Keys', 'Disponibles': 'Available', 'Non confirmées': 'Not confirmed',
  'Mécanique': 'Mechanical', 'À vérifier': 'To be checked', 'Devis de transport simulé': 'Simulated transport quote',
  'Obtenez une estimation pour votre code postal canadien.': 'Get an estimate for your Canadian postal code.', 'Calculer': 'Calculate', 'livraison estimée entre le': 'estimated delivery between', 'et le': 'and',
  'Comparer les véhicules': 'Compare vehicles', 'Comparez vos véhicules': 'Compare your vehicles', 'Aucun véhicule à comparer': 'No vehicles to compare',
  'Ajoutez jusqu’à trois véhicules depuis les fiches de l’inventaire.': 'Add up to three vehicles from inventory listings.', 'Retour à l’inventaire': 'Back to inventory', 'Retirer': 'Remove',
  'Catégorie': 'Category', 'Valeur estimée': 'Estimated value', 'État mécanique': 'Mechanical condition', 'Lieu': 'Location',
  'Votre espace pour suivre chaque encan.': 'Your space to follow every auction.', 'Vos mises, votre caution et votre statut d’identité sont toujours accessibles.': 'Your bids, deposit and identity status are always available.',
  'Connexion sécurisée': 'Secure sign-in', 'Accédez à votre espace AutoBroker QC.': 'Access your AutoBroker QC account.', 'Adresse courriel': 'Email address', 'Mot de passe': 'Password',
  'Se connecter': 'Sign in', 'Nouveau sur AutoBroker QC ?': 'New to AutoBroker QC?', 'Identifiants invalides': 'Invalid credentials',
  'Créez votre accès aux encans.': 'Create your auction access.', 'Après la création, notre équipe vérifie votre identité. Vous pourrez ensuite réserver votre caution et placer vos mises.': 'After you create your account, our team verifies your identity. You can then reserve your deposit and place bids.',
  'Inventaire accessible immédiatement': 'Inventory available immediately', 'Statut SAAQ affiché sur chaque lot': 'SAAQ status shown on every lot', 'Caution et mises après validation KYC': 'Deposit and bidding after KYC validation',
  'Créer mon compte': 'Create my account', 'Toutes les communications sont en français.': 'All communications are available in English.', 'Prénom': 'First name', 'Nom': 'Last name',
  'Au moins 8 caractères.': 'At least 8 characters.', 'J’accepte les conditions d’utilisation et confirme comprendre qu’AutoBroker QC agit comme courtier.': 'I accept the terms of use and understand that AutoBroker QC acts as a broker.',
  'Déjà inscrit ?': 'Already registered?', 'Inscription réussie. Connectez-vous pour poursuivre.': 'Registration successful. Sign in to continue.', 'Erreur lors de l’inscription': 'Registration error',
  'Tableau de bord': 'Dashboard', 'Bienvenue': 'Welcome', 'Voici un aperçu de votre activité et des prochaines étapes.': 'Here is an overview of your activity and next steps.',
  'Mon statut KYC': 'My KYC status', 'Vérifié': 'Verified', 'En attente': 'Pending', 'Refusé': 'Rejected', 'Votre identité est validée. Vous pouvez réserver une caution et participer aux encans.': 'Your identity is verified. You can reserve a deposit and participate in auctions.',
  'Votre dossier est en cours de vérification par notre équipe.': 'Your file is being verified by our team.', 'Votre identité doit être validée avant de pouvoir participer.': 'Your identity must be verified before you can participate.',
  'Ma caution': 'My deposit', 'Voir le détail': 'View details', 'Ajouter': 'Add', 'Préautorisation sécurisée. Elle n’est capturée que si vous remportez un lot.': 'Secure authorization. It is captured only if you win a lot.',
  'Aucune caution active': 'No active deposit', 'Réservez votre caution pour activer les enchères.': 'Reserve your deposit to activate bidding.', 'Votre caution sera disponible une fois votre identité vérifiée.': 'Your deposit will be available once your identity is verified.',
  'Réserver ma caution': 'Reserve my deposit', 'Mes achats, documents et transport': 'My purchases, documents and transport', 'Mes dernières mises': 'My latest bids', 'au total': 'total',
  'Enchère automobile': 'Vehicle auction', 'OFFRE GAGNANTE': 'WINNING BID', 'SURENCHÉRI': 'OUTBID', 'Aucune mise pour le moment.': 'No bids yet.',
  'Caution': 'Deposit', 'Réservez une caution de 600 $ CAD pour pouvoir enchérir.': 'Reserve a $600 CAD deposit to bid.', 'Votre caution est une préautorisation Stripe. Aucun débit n’est effectué tant que vous ne remportez pas un lot.': 'Your deposit is a Stripe authorization. You are not charged unless you win a lot.',
  'Préautorisation Stripe': 'Stripe authorization', 'Activer ma caution': 'Activate my deposit', 'Caution de démonstration activée.': 'Demo deposit activated.', 'Préautorisation Stripe confirmée. Votre caution est active.': 'Stripe authorization confirmed. Your deposit is active.', 'Impossible d’activer la caution.': 'Unable to activate the deposit.',
  'Mes achats et documents': 'My purchases and documents', 'Suivez les lots réservés, paiements, documents et transport au même endroit.': 'Track reserved lots, payments, documents and transport in one place.',
  'Commandes': 'Orders', 'Aucune commande': 'No orders', 'Vos lots gagnés et réservés apparaîtront ici.': 'Your won and reserved lots will appear here.', 'Mes offres': 'My offers', 'Expire le': 'Expires',
  'Aucune offre': 'No offers', 'Vous pouvez transmettre une offre depuis la fiche d’un véhicule.': 'You can submit an offer from a vehicle page.', 'Besoin d’aide ?': 'Need help?',
  'Créez une demande pour être accompagné par notre équipe.': 'Create a request to get help from our team.', 'Sujet de votre demande': 'Request subject', 'Décrivez votre demande': 'Describe your request', 'Envoyer la demande': 'Send request',
  'Documents': 'Documents', 'Document de compte': 'Account document', 'Vos factures et contrats apparaîtront ici.': 'Your invoices and contracts will appear here.', 'Transport': 'Transport', 'Vers': 'To',
  'Demandez un devis depuis la fiche d’un véhicule.': 'Request a quote from a vehicle page.', 'Notifications': 'Notifications', 'Aucune notification récente.': 'No recent notifications.',
  'Paiements et cautions': 'Payments and deposits', 'Réglez vos commandes et consultez vos opérations financières.': 'Pay your orders and view your financial activity.',
  'Commandes à régler': 'Orders to pay', 'Payer': 'Pay', 'Aucune commande en attente de paiement.': 'No orders are awaiting payment.', 'Cautions': 'Deposits', 'Aucune caution.': 'No deposit.',
  'Historique financier': 'Financial history', 'Les opérations apparaîtront ici.': 'Transactions will appear here.', 'Régler votre commande': 'Pay your order', 'Chargement du paiement…': 'Loading payment…',
  'Cette commande est déjà réglée.': 'This order has already been paid.', 'PAIEMENT SÉCURISÉ': 'SECURE PAYMENT', 'Mode démonstration : aucun montant n’est débité.': 'Demo mode: no amount is charged.',
  'Carte Stripe de test': 'Stripe test card', 'Confirmer le paiement simulé': 'Confirm simulated payment', 'Payer avec Stripe test': 'Pay with Stripe test', 'Paiement confirmé.': 'Payment confirmed.', 'Paiement impossible.': 'Payment failed.', 'Configuration Stripe indisponible.': 'Stripe configuration unavailable.',
  'Communications': 'Communications', 'Historique des alertes dans l’application et des courriels/SMS simulés.': 'History of in-app alerts and simulated emails/SMS.',
  'Application envoyée': 'In-app notification sent', 'Courriel simulé': 'Simulated email', 'SMS simulé': 'Simulated SMS', 'Aucune communication récente.': 'No recent communications.',
  'Télécharger': 'Download', 'Téléchargement impossible.': 'Download failed.', 'Impossible de charger vos documents.': 'Unable to load your documents.',
  'Protection contre la fraude': 'Fraud protection', 'Avec votre accord, nous utilisons un identifiant d’appareil pseudonymisé et votre adresse IP lors des mises pour détecter les abus.': 'With your consent, we use a pseudonymized device identifier and your IP address during bidding to detect abuse.',
  'Consulter la politique': 'View the policy', 'Accepter': 'Accept', 'Refuser': 'Decline', 'Politique de confidentialité': 'Privacy policy',
  'Gestion des Enchères': 'Auction management', 'Créer une enchère': 'Create an auction', 'Véhicule': 'Vehicle', 'Sélectionner un véhicule...': 'Select a vehicle...', 'Mise de départ ($ CAD)': 'Starting bid ($ CAD)',
  'Date de début': 'Start date', 'Date de fin': 'End date', 'Créer l’enchère': 'Create auction', 'Statut': 'Status', 'Dates': 'Dates', 'Aucune enchère trouvée': 'No auctions found', 'Véhicule inconnu': 'Unknown vehicle',
  'Active': 'Active', 'Terminée': 'Ended', 'Planifiée': 'Scheduled', 'Début:': 'Start:', 'Fin:': 'End:', 'Veuillez sélectionner un véhicule': 'Please select a vehicle', 'Enchère créée avec succès': 'Auction created successfully', 'Erreur lors de la création': 'Creation failed',
  'CONFORMITÉ': 'COMPLIANCE', 'Journal d’audit': 'Audit log', 'Historique des actions sensibles réalisées sur les offres, commandes et litiges.': 'History of sensitive actions performed on offers, orders and disputes.',
  'Date': 'Date', 'Action': 'Action', 'Élément': 'Item', 'Intervenant': 'Actor', 'Système': 'System', 'Aucune action journalisée pour le moment.': 'No actions have been logged yet.',
  'Vue d’ensemble': 'Overview', 'Les indicateurs clés de l’activité AutoBroker QC.': 'Key AutoBroker QC activity indicators.', 'Mise à jour à l’ouverture': 'Updated when opened',
  'Utilisateurs inscrits': 'Registered users', 'Véhicules en inventaire': 'Vehicles in inventory', 'Enchères actives': 'Active auctions', 'Priorités opérationnelles': 'Operational priorities',
  '1. Vérifier les KYC': '1. Review KYC', 'Approuver ou rejeter les identités en attente.': 'Approve or reject pending identities.', '2. Préparer les lots': '2. Prepare lots', 'Compléter les informations véhicule et SAAQ.': 'Complete vehicle and SAAQ information.', '3. Superviser les enchères': '3. Supervise auctions', 'Suivre les lots actifs et leurs mises.': 'Follow active lots and their bids.',
  'SOUTIEN CLIENT': 'CUSTOMER SUPPORT', 'Litiges et demandes': 'Disputes and requests', 'Centralisez le traitement et conservez une trace de chaque décision.': 'Centralize processing and keep a record of each decision.',
  'Résolution communiquée au client': 'Resolution communicated to customer', 'Lecture seule': 'Read only', 'Aucun litige ouvert.': 'No open dispute.', 'Impossible de charger les demandes.': 'Unable to load requests.', 'Demande mise à jour.': 'Request updated.', 'Mise à jour impossible.': 'Update failed.',
  'Import CSV manuel': 'Manual CSV import', 'Collez un export CSV. Les colonnes requises sont : make, model, year, vin.': 'Paste a CSV export. Required columns: make, model, year, vin.', 'Contenu CSV': 'CSV content',
  'Colonnes optionnelles :': 'Optional columns:', 'Importer les véhicules': 'Import vehicles', 'Résultat :': 'Result:', 'créé(s)': 'created', 'Ligne': 'Line', 'Aucune erreur détectée.': 'No errors detected.', 'Import impossible.': 'Import failed.',
  'VENTES': 'SALES', 'Offres à examiner': 'Offers to review', 'Acceptez ou refusez les propositions des acheteurs vérifiés.': 'Accept or decline offers from verified buyers.',
  'Accepter l’offre': 'Accept offer', 'Refuser l’offre': 'Decline offer', 'Offre acceptée et commande créée.': 'Offer accepted and order created.', 'Offre refusée.': 'Offer declined.', 'Impossible de charger les offres.': 'Unable to load offers.',
  'OPÉRATIONS': 'OPERATIONS', 'Suivi des commandes': 'Order tracking', 'Mettre à jour': 'Update', 'Statut de commande mis à jour.': 'Order status updated.', 'Impossible de charger les commandes.': 'Unable to load orders.',
  'FINANCE': 'FINANCE', 'Cautions et paiements': 'Deposits and payments', 'Historique local des préautorisations, captures, libérations et remboursements Stripe test.': 'Local history of Stripe test authorizations, captures, releases and refunds.',
  'Client': 'Customer', 'Montant': 'Amount', 'Créée': 'Created', 'Capturer': 'Capture', 'Rembourser': 'Refund', 'Caution capturée.': 'Deposit captured.', 'Remboursement demandé.': 'Refund requested.', 'Impossible de charger les cautions.': 'Unable to load deposits.',
  'Utilisateurs': 'Users', 'Gestion des utilisateurs': 'User management', 'Rôle': 'Role', 'KYC': 'KYC', 'Approuver': 'Approve', 'Rejeter': 'Reject', 'Statut KYC mis à jour :': 'KYC status updated:', 'Rôle utilisateur mis à jour.': 'User role updated.',
  'Import SFTP': 'SFTP import', 'Synchronisation SFTP': 'SFTP synchronization', 'Synchroniser maintenant': 'Sync now', 'Synchronisation impossible.': 'Synchronization failed.',
  'Erreur lors du chargement de l’enchère': 'Unable to load auction', 'Mise placée avec succès': 'Bid placed successfully', 'Erreur lors de la mise': 'Bid failed', 'Temps prolongé !': 'Time extended!',
  'Alerte : vous avez été surenchéri !': 'Alert: you have been outbid!', 'Connectez-vous pour utiliser cette fonction.': 'Sign in to use this feature.', 'Connectez-vous pour enregistrer cette recherche.': 'Sign in to save this search.',
  'Retiré de votre liste de suivi.': 'Removed from your watchlist.', 'Ajouté à votre liste de suivi.': 'Added to your watchlist.', 'Impossible de mettre à jour la liste de suivi.': 'Unable to update the watchlist.',
  'Indiquez un montant valide.': 'Enter a valid amount.', 'Votre offre a été transmise.': 'Your offer has been sent.', 'Offre impossible : vérifiez votre KYC et votre caution.': 'Offer failed: check your KYC and deposit.',
  'Achat immédiat impossible.': 'Buy now failed.', 'Devis de transport créé.': 'Transport quote created.', 'Code postal canadien requis.': 'A Canadian postal code is required.',
  'Vous pouvez comparer jusqu’à trois véhicules.': 'You can compare up to three vehicles.', 'Ajouté au comparateur.': 'Added to comparison.', 'Retiré du comparateur.': 'Removed from comparison.',
  'PENDING': 'Pending', 'VERIFIED': 'Verified', 'REJECTED': 'Rejected', 'HOLD': 'On hold', 'CAPTURED': 'Captured', 'RELEASED': 'Released', 'PAID': 'Paid', 'OPEN': 'Open', 'IN_REVIEW': 'In review', 'RESOLVED': 'Resolved', 'CLOSED': 'Closed', 'ACCEPTED': 'Accepted', 'DECLINED': 'Declined', 'AWAITING_PAYMENT': 'Awaiting payment',
  'ACCÈS AUX ENCHÈRES RÉSERVÉES': 'ACCESS TO DEALER-ONLY AUCTIONS', 'L’encan automobile,': 'Vehicle auctions,', 'accessible au Québec.': 'available in Québec.',
  'Trouvez votre prochain véhicule parmi des milliers de lots. AutoBroker QC vous accompagne à chaque étape, de la vérification à l’enchère.': 'Find your next vehicle among thousands of lots. AutoBroker QC supports you at every step, from verification to bidding.',
  'Voir l’inventaire': 'View inventory', 'LA TRANSPARENCE D’ABORD': 'TRANSPARENCY FIRST', 'Le statut de chaque véhicule est affiché avant que vous misiez.': 'Each vehicle’s status is displayed before you bid.',
  'Caution préautorisée, non débitée tant que vous ne remportez pas un lot.': 'Pre-authorized deposit, not charged unless you win a lot.', 'Votre maximum reste confidentiel.': 'Your maximum stays confidential.',
  'Temps réel': 'Real time', 'Suivez chaque enchère seconde par seconde.': 'Follow every auction second by second.', '100 % français': 'Made for Québec', 'Une expérience pensée pour le Québec.': 'An experience designed for Québec.',
  'COMMENT ÇA FONCTIONNE': 'HOW IT WORKS', 'Une façon simple et encadrée d’acheter à l’encan.': 'A simple, guided way to buy at auction.',
  'Créez votre compte': 'Create your account', 'Inscrivez-vous, puis faites vérifier votre identité.': 'Sign up, then have your identity verified.',
  'Réservez votre caution': 'Reserve your deposit', 'Une préautorisation de 600 $ vous donne accès aux enchères.': 'A $600 pre-authorization gives you access to auctions.',
  'Placez votre maximum': 'Set your maximum', 'Notre système d’auto-enchère mise juste assez, jusqu’à votre limite.': 'Our proxy-bidding system bids just enough, up to your limit.',
  'Chargement de l’enchère...': 'Loading auction...', "Chargement de l'enchère...": 'Loading auction...', 'Image non disponible': 'Image unavailable',
  'NIV:': 'VIN:', 'Emplacement:': 'Location:', 'Transport estimé :': 'Estimated transport:', 'Temps restant': 'Time remaining', 'Votre statut': 'Your status', 'Historique des offres': 'Offer history', 'offres': 'offers', 'Sur devis': 'Quote required',
  'CAUTION DE GARANTIE': 'SECURITY DEPOSIT', 'Activez vos enchères en toute sécurité.': 'Activate your auctions securely.', 'La caution est une préautorisation de 600 $ CAD. Elle n’est pas débitée lors de la réservation.': 'The deposit is a $600 CAD pre-authorization. It is not charged when reserved.',
  'Vérification de votre caution…': 'Checking your deposit…', 'Votre caution est active': 'Your deposit is active', 'Vous pouvez participer aux enchères. Aucun paiement supplémentaire n’est requis.': 'You can participate in auctions. No additional payment is required.',
  'Voir les véhicules': 'View vehicles', 'Réservation simulée — aucun débit réel': 'Simulated reservation — no real charge', 'Vérification d’identité requise': 'Identity verification required',
  'La caution devient disponible après l’approbation de votre identité par notre équipe.': 'The deposit becomes available after your identity is approved by our team.', 'Voir mon statut KYC': 'View my KYC status', 'MONTANT': 'AMOUNT',
  'Préautorisation bancaire, non débitée immédiatement.': 'Bank pre-authorization, not charged immediately.', 'Ce que cela permet': 'What this enables', 'Participer à une ou plusieurs enchères.': 'Participate in one or more auctions.',
  'Miser avec votre maximum confidentiel.': 'Bid with your confidential maximum.', 'Libération si vous ne remportez aucun lot.': 'Released if you do not win any lot.',
  'Téléchargez vos factures et contrats en PDF simulé.': 'Download your simulated PDF invoices and contracts.', 'Aucun document disponible.': 'No document available.',
  'CONFIDENTIALITÉ': 'PRIVACY', 'Prévention de la fraude': 'Fraud prevention', 'Pour protéger les enchères, AutoBroker QC peut traiter une adresse IP et un identifiant d’appareil pseudonymisé uniquement lorsque vous acceptez cette option. Ces données servent à signaler des comportements de mise inhabituels et ne sont jamais utilisées à des fins publicitaires.': 'To protect auctions, AutoBroker QC may process an IP address and pseudonymized device identifier only when you accept this option. This data flags unusual bidding behaviour and is never used for advertising.',
  'Vous pouvez refuser ce traitement : les protections de base restent actives, mais certaines mises pourront demander une vérification supplémentaire.': 'You may decline this processing: core protections remain active, but some bids may require additional verification.',
  'Les alertes sont accessibles seulement aux rôles autorisés et sont conservées dans le journal de conformité local.': 'Alerts are available only to authorized roles and are kept in the local compliance log.',
  'INVENTAIRE CANADIEN': 'CANADIAN INVENTORY', 'Parcourez les lots disponibles, leur historique et les estimations de frais avant de participer.': 'Browse available lots, their history and fee estimates before participating.',
  'Véhicules': 'Vehicles', 'Import CSV': 'CSV import', 'Enchères': 'Auctions', 'Offres': 'Offers', 'Cautions & paiements': 'Deposits & payments', 'Centre opérations': 'Operations centre', 'Utilisateurs & KYC': 'Users & KYC',
  'Espace équipe': 'Team workspace', 'Équipe': 'Team', 'Voir le site': 'View site', 'ESPACE ÉQUIPE': 'TEAM WORKSPACE', 'Pilotage de la plateforme': 'Platform management', 'Retour au site': 'Back to site',
  'Commandes et livraison': 'Orders and delivery', 'Gérez les réservations, paiements et étapes de traitement client.': 'Manage reservations, payments and customer processing stages.', 'Consultez les réservations, paiements et étapes de traitement client.': 'View reservations, payments and customer processing stages.',
  'Commande': 'Order', 'Total': 'Total', 'Confirmer': 'Confirm', 'Aucune commande.': 'No orders.', 'Documents, transport et santé': 'Documents, transport and health', 'Suivez les éléments opérationnels et les connecteurs configurés.': 'Track operational items and configured connectors.',
  'État plateforme': 'Platform status', 'Opérationnelle': 'Operational', 'Accès limité': 'Limited access', 'encan(s) actif(s)': 'active auction(s)', 'Réservé aux rôles autorisés': 'Reserved for authorized roles', 'Configuré': 'Configured', 'À configurer': 'To configure', 'Synchroniser': 'Synchronize',
  'Devis transport': 'Transport quotes', 'Demandes enregistrées': 'Recorded requests', 'Documents récents': 'Recent documents', 'Aucun document.': 'No document.', 'Transport récent': 'Recent transport', 'Compte': 'Account', 'Aucun devis.': 'No quote.',
  'La mise doit être d’au moins': 'The bid must be at least', "La mise doit être d'au moins": 'The bid must be at least', 'Veuillez vous': 'Please', 'connecter': 'sign in', 'pour miser.': 'to bid.',
  'Identité non vérifiée.': 'Identity not verified.', 'Vérifier mon identité': 'Verify my identity', 'Vérification du dépôt...': 'Checking deposit...', 'Dépôt de caution requis.': 'Security deposit required.', 'Effectuer un dépôt': 'Make a deposit',
  'Mise Maximum (Auto-Bid) $': 'Maximum bid (auto-bid) $', 'Ex:': 'E.g.:', 'Le système misera juste assez pour battre l’offre actuelle, jusqu’à votre maximum.': 'The system will bid just enough to beat the current offer, up to your maximum.', "Le système misera juste assez pour battre l'offre actuelle, jusqu'à votre maximum.": 'The system will bid just enough to beat the current offer, up to your maximum.',
  'Estimateur de coût total': 'Total cost estimator', 'Mise saisie :': 'Entered bid:', 'Frais Encan (8%) :': 'Auction fee (8%):', 'Frais Courtier :': 'Broker fee:', 'COÛT TOTAL ESTIMÉ :': 'ESTIMATED TOTAL COST:', 'Placer ma mise automatique': 'Place my automatic bid',
  'Gagnant': 'Winner', 'Aucune offre pour le moment': 'No offers yet', 'il y a': 'ago', 'Mode démonstration': 'Demo mode', 'Aucune carte n’est demandée et aucun montant ne sera débité.': 'No card is requested and no amount will be charged.',
  'Carte de test Stripe': 'Stripe test card', 'La caution sera activée immédiatement pour tester les enchères.': 'The deposit will be activated immediately to test auctions.', 'Une préautorisation de 600 $ CAD sera créée. Elle n’est capturée que si vous remportez un lot.': 'A $600 CAD authorization will be created. It is captured only if you win a lot.',
  'Activer la caution de démonstration': 'Activate demo deposit', 'Préautoriser 600 $ CAD': 'Authorize $600 CAD', 'La configuration de paiement est indisponible. Réessayez dans un instant.': 'Payment configuration is unavailable. Try again shortly.', 'Chargement de la configuration de paiement…': 'Loading payment configuration…', 'La clé publique Stripe de test manque dans la configuration serveur.': 'The Stripe test public key is missing from server configuration.',
  'Gestion des Véhicules': 'Vehicle management', 'Ajouter un véhicule': 'Add a vehicle', 'Marque': 'Make', 'Modèle': 'Model', 'Année': 'Year', 'Dommage Primaire': 'Primary damage', 'Valeur estimée ($)': 'Estimated value ($)', 'Valeur': 'Value', 'Actions': 'Actions',
  'Enregistrer le véhicule': 'Save vehicle', 'Modifier': 'Edit', 'Supprimer': 'Delete', 'Véhicule ajouté avec succès': 'Vehicle added successfully', 'Erreur lors de l’ajout': 'Unable to add vehicle', "Erreur lors de l'ajout": 'Unable to add vehicle',
  'IDENTITÉ ET ACCÈS': 'IDENTITY AND ACCESS', 'Email': 'Email', 'Aucun utilisateur trouvé': 'No users found', 'Rôle de': 'Role for',
};

const replacements: Array<[RegExp, string]> = [
  [/\bAucune?\b/g, 'No'], [/\baucune?\b/g, 'no'], [/\bImpossible de\b/g, 'Unable to'], [/\bVotre\b/g, 'Your'], [/\bvos\b/g, 'your'],
  [/\bMes\b/g, 'My'], [/\bmes\b/g, 'my'], [/\bdes\b/g, 'of the'], [/\bune\b/g, 'a'], [/\bun\b/g, 'a'],
  [/\bvéhicule\(s\)\b/g, 'vehicle(s)'], [/\bvéhicules\b/g, 'vehicles'], [/\bvéhicule\b/g, 'vehicle'], [/\benchères\b/g, 'auctions'], [/\benchère\b/g, 'auction'],
  [/\bcaution\b/g, 'deposit'], [/\bCaution\b/g, 'Deposit'], [/\bcommande\b/g, 'order'], [/\bCommandes\b/g, 'Orders'],
  [/\bpaiement\b/g, 'payment'], [/\bPaiement\b/g, 'Payment'], [/\bdocuments\b/g, 'documents'], [/\bDocuments\b/g, 'Documents'],
  [/\boffres\b/g, 'offers'], [/\bOffre\b/g, 'Offer'], [/\bchargement\b/gi, 'loading'], [/\bstatut\b/gi, 'status'],
  [/\bd’occasion\b/gi, 'used'], [/\baux enchères\b/gi, 'at auction'], [/\bautos\b/gi, 'cars'], [/\bcamions\b/gi, 'trucks'], [/\bmotos\b/gi, 'motorcycles'],
];

const attributes = ['placeholder', 'aria-label', 'title'];
const textMemory = new WeakMap<Text, NodeTranslation>();
const attributeMemory = new WeakMap<Element, Map<string, NodeTranslation>>();

function preserveWhitespace(value: string, translated: string) {
  const leading = value.match(/^\s*/)?.[0] || '';
  const trailing = value.match(/\s*$/)?.[0] || '';
  return `${leading}${translated}${trailing}`;
}

export function translate(value: string, locale = useLocaleStore.getState().locale) {
  if (locale === 'fr' || !value.trim()) return value;
  const trimmed = value.trim();
  const exact = translations[trimmed];
  if (exact) return preserveWhitespace(value, exact);
  let output = trimmed;
  for (const [pattern, replacement] of replacements) output = output.replace(pattern, replacement);
  output = output.replace(/^(\d+)\s+véhicules?$/i, '$1 vehicles').replace(/^Recherche du\s+/i, 'Search from ');
  return preserveWhitespace(value, output);
}

function shouldSkip(node: Text) {
  const parent = node.parentElement;
  return !parent || parent.closest('[data-no-translate], script, style, textarea, pre, code') !== null;
}

function translateTextNode(node: Text, locale: 'fr' | 'en') {
  if (shouldSkip(node)) return;
  const current = node.data;
  const previous = textMemory.get(node);
  if (!previous || (current !== previous.source && current !== previous.output)) {
    const source = current;
    const output = translate(source, 'en');
    textMemory.set(node, { source, output });
    const desired = locale === 'en' ? output : source;
    if (node.data !== desired) node.data = desired;
    return;
  }
  const desired = locale === 'en' ? previous.output : previous.source;
  if (node.data !== desired) node.data = desired;
}

function translateAttributes(element: Element, locale: 'fr' | 'en') {
  if (element.closest('[data-no-translate]')) return;
  let memory = attributeMemory.get(element);
  if (!memory) { memory = new Map(); attributeMemory.set(element, memory); }
  for (const name of attributes) {
    const current = element.getAttribute(name);
    if (!current) continue;
    const previous = memory.get(name);
    if (!previous || (current !== previous.source && current !== previous.output)) {
      const source = current;
      const output = translate(source, 'en');
      memory.set(name, { source, output });
      element.setAttribute(name, locale === 'en' ? output : source);
    } else {
      element.setAttribute(name, locale === 'en' ? previous.output : previous.source);
    }
  }
}

function translateTree(root: Node, locale: 'fr' | 'en') {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  texts.forEach((node) => translateTextNode(node, locale));
  if (root instanceof Element) translateAttributes(root, locale);
  root.parentElement?.querySelectorAll?.('[placeholder], [aria-label], [title]').forEach((element) => translateAttributes(element, locale));
}

/** Applies the catalogue to every route, modal, notification and admin page. */
export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    translateTree(document.body, locale);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') translateTextNode(mutation.target as Text, locale);
        mutation.addedNodes.forEach((node) => translateTree(node, locale));
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [locale]);

  // Locale-sensitive dates, prices and page-level data are recalculated when
  // the language changes, instead of retaining a French browser format.
  return <div key={locale}>{children}</div>;
}

export const formatLocale = () => useLocaleStore.getState().locale === 'en' ? 'en-CA' : 'fr-CA';
export const formatNumber = (value?: number | null) => value == null ? '—' : Number(value).toLocaleString(formatLocale());
export const formatDate = (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => new Date(value).toLocaleDateString(formatLocale(), options);
export const formatDateTime = (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => new Date(value).toLocaleString(formatLocale(), options);
