import { test, expect } from '@playwright/test';

test('la langue anglaise traduit les écrans client et la navigation', async ({ page }) => {
  await page.goto('/vehicules');
  await page.getByRole('button', { name: 'Switch to English' }).click();

  await expect(page.getByRole('heading', { name: 'Browse available vehicles' })).toBeVisible();
  await expect(page.getByText('Live auctions', { exact: true })).toBeVisible();
  await expect(page.getByText('Filters', { exact: true })).toBeVisible();

  await page.goto('/connexion');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByText('Email address', { exact: true })).toBeVisible();

  await page.goto('/inscription');
  await expect(page.getByRole('heading', { name: 'Create your auction access.' })).toBeVisible();
  await expect(page.getByText('First name', { exact: true })).toBeVisible();

  await page.goto('/categorie/car');
  await expect(page.getByRole('heading', { name: 'cars at auction' })).toBeVisible();
  await expect(page).toHaveTitle(/cars at auction/i);
});
