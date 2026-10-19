import { expect, test } from '@playwright/test';

test('shell toggles theme, keeps light across reload, and logs no errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  await page.goto('/');
  const link = page.locator('#theme-link');
  await expect(link).toHaveAttribute('href', /purple-green\.css$/);
  await expect(page.locator('html')).toHaveClass(/dark-mode/);

  await page.getByRole('button', { name: 'Toggle color theme' }).click();
  await expect(link).toHaveAttribute('href', /deeppurple-amber\.css$/);
  await expect(page.locator('html')).not.toHaveClass(/dark-mode/);

  await page.reload();
  await expect(link).toHaveAttribute('href', /deeppurple-amber\.css$/);
  await expect(page.locator('html')).not.toHaveClass(/dark-mode/);
  expect(errors).toEqual([]);
});
