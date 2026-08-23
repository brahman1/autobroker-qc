import { test, expect } from '@playwright/test';

test.describe('Parcours Utilisateur - AutoBroker QC', () => {
  const uniqueEmail = `test.auto.${Date.now()}@example.com`;
  const password = 'Password123!';

  test('1. Inscription d un nouveau client', async ({ page }) => {
    await page.goto('/inscription');
    
    const inputs = page.locator('input');
    await inputs.nth(0).fill('John');
    await inputs.nth(1).fill('Doe');
    await inputs.nth(2).fill(uniqueEmail);
    await inputs.nth(3).fill(password);
    await inputs.nth(4).check();
    
    await page.locator('button[type="submit"]').click();
    
    await expect(page).toHaveURL(/.*connexion/, { timeout: 10000 });
  });

  test('2. Empêcher doublon email', async ({ page }) => {
    await page.goto('/inscription');
    
    const inputs = page.locator('input');
    await inputs.nth(0).fill('John');
    await inputs.nth(1).fill('Doe');
    await inputs.nth(2).fill(uniqueEmail);
    await inputs.nth(3).fill(password);
    await inputs.nth(4).check();
    
    await page.locator('button[type="submit"]').click();
    
    await expect(page.getByRole('status').first()).toContainText('Email', { timeout: 10000 });
  });
});
