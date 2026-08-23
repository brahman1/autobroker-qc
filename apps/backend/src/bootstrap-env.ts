import { config } from 'dotenv';
import { join } from 'path';

// Prisma lit les variables très tôt au démarrage. Charger explicitement le
// fichier du backend évite qu'un .env à la racine du monorepo ne le remplace.
config({
  path: join(__dirname, '..', '.env'),
  override: true,
});
