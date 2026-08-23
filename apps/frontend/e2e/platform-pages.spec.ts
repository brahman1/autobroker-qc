import { test, expect } from '@playwright/test';

test.describe('Pages produit et accès', () => {
  test('catalogue, comparateur et pages SEO sont accessibles', async ({ page }) => {
    await page.goto('/vehicules'); await expect(page.getByRole('heading', { name: /Explorez les véhicules/i })).toBeVisible();
    await page.goto('/comparer'); await expect(page.getByRole('heading', { name: /Comparez vos véhicules/i })).toBeVisible();
    await page.goto('/categorie/car'); await expect(page.getByRole('heading', { name: /autos aux enchères/i })).toBeVisible();
  });

  test('les espaces personnels demandent une connexion', async ({ page }) => {
    await page.goto('/mes-paiements'); await expect(page).toHaveURL(/connexion/);
    await page.goto('/communications'); await expect(page).toHaveURL(/connexion/);
  });
});
