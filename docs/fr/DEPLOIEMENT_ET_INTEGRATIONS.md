# Déploiement et intégrations externes

## CI/CD

Le workflow `.github/workflows/ci.yml` valide lint, build et tests à chaque push. Pour un déploiement réel, créez un dépôt Git distant, ajoutez les secrets d’environnement dans le fournisseur CI et configurez la cible (Docker, VPS ou plateforme cloud). Aucun secret Stripe, SFTP ou JWT ne doit être commité.

## Stripe test et production

Les E2E Stripe réels sont volontairement conditionnels : définissez `STRIPE_E2E_ORDER_ID` sur une commande de test dédiée. En production, renseignez aussi `STRIPE_WEBHOOK_SECRET` et configurez l’URL publique `/payments/webhook` dans Stripe.

## SFTP partenaire

Renseignez `SFTP_HOST`, `SFTP_PORT`, `SFTP_USERNAME`, `SFTP_PASSWORD` et `SFTP_REMOTE_PATH`. Le compte doit être en lecture seule et le fichier doit respecter l’import CSV. Les tests SFTP ne s’exécutent que lorsque `SFTP_HOST` est présent.

## Confidentialité et fraude

L’adresse IP et l’identifiant appareil pseudonymisé ne sont transmis qu’après consentement dans l’interface. Avant mise en production, faites valider cette politique par un conseil juridique québécois/canadien et définissez la durée de conservation des alertes.
