import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    __TD__?: { ready?: boolean };
  }
}

test('home page has no axe violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Core Defense' })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('play page has no axe violations', async ({ page }) => {
  await page.goto('/play');
  await page.waitForFunction(() => window.__TD__?.ready === true);
  await expect(page.getByTestId('game-canvas')).toBeVisible();
  await expect(page.getByTestId('theme-toggle')).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
