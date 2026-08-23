import { test, expect } from '@playwright/test';

test('l’email est insensible à la casse et un client connecté ne voit plus l’inscription', async ({ page }) => {
  const email = `case.${Date.now()}@Example.FR`;
  const password = 'Password123!';

  await page.goto('/inscription');
  const registrationInputs = page.locator('input');
  await registrationInputs.nth(0).fill('Client');
  await registrationInputs.nth(1).fill('Test');
  await registrationInputs.nth(2).fill(email);
  await registrationInputs.nth(3).fill(password);
  await registrationInputs.nth(4).check();
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/connexion/);

  const loginInputs = page.locator('input');
  await loginInputs.nth(0).fill(email.toLowerCase());
  await loginInputs.nth(1).fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/tableau-de-bord/);

  await page.goto('/inscription');
  await expect(page).toHaveURL(/tableau-de-bord/);
  await expect(page.getByRole('link', { name: /créer un compte/i })).toHaveCount(0);
});
