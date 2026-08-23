import { test, expect } from '@playwright/test';

test.describe('Intégrations externes configurables', () => {
  test.skip(!process.env.STRIPE_E2E_ORDER_ID, 'STRIPE_E2E_ORDER_ID requis pour le parcours Stripe test réel');
  test('paiement Stripe test d’une commande dédiée', async ({ page }) => {
    await page.goto(`/paiement/${process.env.STRIPE_E2E_ORDER_ID}`);
    await expect(page.getByRole('heading', { name: /Régler votre commande/i })).toBeVisible();
  });

  test.skip(!process.env.SFTP_HOST, 'SFTP_HOST requis pour la synchronisation partenaire réelle');
  test('synchronisation SFTP configurée', async ({ page }) => {
    await page.goto('/admin/operations');
    await expect(page.getByText(/Import SFTP/i)).toBeVisible();
  });
});
