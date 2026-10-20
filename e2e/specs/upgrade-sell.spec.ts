import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __TD__?: {
      ready?: boolean;
      setManualMode(enabled: boolean): void;
      stepTicks(n: number): void;
      getFullState(): {
        towers: { id: string; padId: string; level: number; invested: number }[];
      };
    };
  }
}

test('upgrades a placed Pulse, then sells it for the invested refund', async ({ page }) => {
  const errors = trackErrors(page);
  await openManualPlay(page);
  await placePulse(page);
  await expect(page.getByTestId('hud-gold')).toHaveText('80');

  await page.keyboard.press('Escape');
  await page.getByTestId('pad-01').click();
  await expect(page.getByTestId('tower-inspector')).toBeVisible();
  await expect(page.getByTestId('hud-gold')).toHaveText('80');
  expect(await towers(page)).toEqual([{ id: 't1', padId: 'pad-01', level: 1, invested: 70 }]);

  await page.getByTestId('upgrade-tower').click();
  await stepOnce(page);
  await expect(page.getByTestId('hud-gold')).toHaveText('30');
  expect(await towers(page)).toEqual([{ id: 't1', padId: 'pad-01', level: 2, invested: 120 }]);
  await expect(page.getByTestId('tower-inspector').locator('p').nth(1)).toHaveText('2');
  await expect(page.getByTestId('tower-inspector').locator('p').nth(2)).toHaveText('120');

  await page.getByTestId('sell-tower').click();
  await stepOnce(page);
  await expect(page.getByTestId('hud-gold')).toHaveText('114');
  expect(await towers(page)).toEqual([]);
  await expect(page.getByTestId('tower-inspector')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('sells an unupgraded Pulse for 49, not a nearest-5 refund', async ({ page }) => {
  const errors = trackErrors(page);
  await openManualPlay(page);
  await placePulse(page);

  await page.keyboard.press('Escape');
  await page.getByTestId('pad-01').click();
  await expect(page.getByTestId('tower-inspector')).toBeVisible();
  await page.getByTestId('sell-tower').click();
  await stepOnce(page);

  await expect(page.getByTestId('hud-gold')).toHaveText('129');
  expect(await towers(page)).toEqual([]);
  await expect(page.getByTestId('tower-inspector')).toHaveCount(0);
  expect(errors).toEqual([]);
});

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  return errors;
}

async function openManualPlay(page: Page): Promise<void> {
  await page.goto('/play');
  await page.waitForFunction(() => window.__TD__?.ready === true);
  await page.evaluate(() => {
    window.__TD__?.setManualMode(true);
  });
}

async function placePulse(page: Page): Promise<void> {
  await page.getByTestId('palette-pulse').click();
  await page.getByTestId('pad-01').click();
  await stepOnce(page);
}

async function stepOnce(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__TD__?.stepTicks(1);
  });
}

async function towers(
  page: Page,
): Promise<{ id: string; padId: string; level: number; invested: number }[]> {
  return page.evaluate(() =>
    (window.__TD__?.getFullState().towers ?? []).map((tower) => ({
      id: tower.id,
      padId: tower.padId,
      level: tower.level,
      invested: tower.invested,
    })),
  );
}
