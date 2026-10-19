import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    __TD__?: { ready?: boolean };
  }
}

test('play page shows the canvas, starting HUD, and an enabled deploy control', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  await page.goto('/play');
  await page.waitForFunction(() => window.__TD__?.ready === true);
  await expect(page.getByTestId('game-canvas')).toBeVisible();
  await expect(page.getByTestId('hud-gold')).toHaveText('150');
  await expect(page.getByTestId('hud-integrity')).toHaveText('20');
  await expect(page.getByTestId('deploy-wave')).toBeEnabled();
  await expect(page.getByTestId('deploy-wave')).toHaveText('Deploy Wave');
  expect(errors).toEqual([]);
});
