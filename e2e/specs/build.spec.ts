import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __TD__?: {
      ready?: boolean;
      setManualMode(enabled: boolean): void;
      stepTicks(n: number): void;
      getFullState(): {
        towers: { id: string; padId: string; towerType: string }[];
      };
    };
  }
}

test('places, rejects a taken pad, rejects an unaffordable keyboard place, and previews range', async ({
  page,
}) => {
  const errors = trackErrors(page);
  await openManualPlay(page);

  await page.getByTestId('palette-pulse').click();
  await page.getByTestId('pad-01').click();
  await stepOnce(page);
  await expect(page.getByTestId('hud-gold')).toHaveText('80');
  expect(await towers(page)).toEqual([{ id: 't1', padId: 'pad-01', towerType: 'pulse' }]);

  await page.getByTestId('pad-01').click();
  await stepOnce(page);
  await expect(page.getByTestId('hud-gold')).toHaveText('80');
  await expect(page.getByTestId('placement-error')).toHaveText('That pad is already taken.');

  await page.keyboard.press('Escape');
  await page.keyboard.press('3');
  await page.getByTestId('pad-02').focus();
  await page.keyboard.press('Enter');
  await stepOnce(page);
  await expect(page.getByTestId('placement-error')).toHaveText('Not enough gold.');
  await expect(page.getByTestId('hud-gold')).toHaveText('80');
  expect(await towers(page)).toEqual([{ id: 't1', padId: 'pad-01', towerType: 'pulse' }]);

  await page.getByTestId('palette-pulse').click();
  await page.getByTestId('pad-03').hover();
  await expect(page.getByTestId('board-overlay')).toHaveAttribute('data-range-tiles', '3.2');
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

async function stepOnce(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__TD__?.stepTicks(1);
  });
}

async function towers(page: Page): Promise<{ id: string; padId: string; towerType: string }[]> {
  return page.evaluate(() =>
    (window.__TD__?.getFullState().towers ?? []).map((tower) => ({
      id: tower.id,
      padId: tower.padId,
      towerType: tower.towerType,
    })),
  );
}
