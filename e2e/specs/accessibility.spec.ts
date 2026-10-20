import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __TD__?: {
      ready?: boolean;
      setManualMode(enabled: boolean): void;
      stepTicks(n: number): void;
      getFullState(): {
        integrity: number;
        phase: string;
        towers: { padId: string; towerType: string }[];
      };
    };
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

test('Tab and Enter place a Pulse', async ({ page }) => {
  await openManualPlay(page);
  await page.keyboard.press('1');
  const padId = await focusPad(page);
  await page.keyboard.press('Enter');
  await stepOnce(page);
  await expect(page.getByTestId('hud-gold')).toHaveText('80');
  const towers = await page.evaluate(
    () =>
      window.__TD__?.getFullState().towers.map((tower) => ({
        padId: tower.padId,
        towerType: tower.towerType,
      })) ?? [],
  );
  expect(towers).toEqual([{ padId, towerType: 'pulse' }]);
});

test('focused pad shows a 2px solid outline', async ({ page }) => {
  await page.goto('/play');
  await page.waitForFunction(() => window.__TD__?.ready === true);
  await focusPad(page);
  const outline = await page.evaluate(() => {
    const el = document.activeElement;
    if (!(el instanceof HTMLElement) || !el.getAttribute('data-testid')?.startsWith('pad-')) {
      return null;
    }
    const style = getComputedStyle(el);
    return { width: style.outlineWidth, style: style.outlineStyle };
  });
  expect(outline).toEqual({ width: '2px', style: 'solid' });
});

test('live region announces Wave 1 deployed', async ({ page }) => {
  await openManualPlay(page);
  await page.getByTestId('deploy-wave').click();
  await stepOnce(page);
  await expect(page.getByTestId('live-region')).toHaveText('Wave 1 deployed.');
});

test('live region announces a leak as the whole text', async ({ page }) => {
  await openManualPlay(page);
  await page.getByTestId('deploy-wave').click();
  await stepOnce(page);

  const hit = await page.evaluate((cap) => {
    const td = window.__TD__;
    if (!td) {
      throw new Error('harness is not ready');
    }
    let ticks = 0;
    while (ticks < cap) {
      const before = td.getFullState();
      td.stepTicks(1);
      ticks += 1;
      const state = td.getFullState();
      if (state.integrity < before.integrity && state.phase === 'wave') {
        return { ticks, integrity: state.integrity, phase: state.phase };
      }
    }
    const state = td.getFullState();
    return { ticks, integrity: state.integrity, phase: state.phase };
  }, 8000);

  expect(hit.phase, JSON.stringify(hit)).toBe('wave');
  const expected = `Core hit. Integrity ${hit.integrity}.`;
  await expect(page.getByTestId('live-region')).toHaveText(expected);
  const text = await page.getByTestId('live-region').innerText();
  expect(text).toBe(expected);
  expect(text.includes('. ') ? text.split('. ').length : 1).toBeLessThanOrEqual(2);
});

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

async function focusPad(page: Page): Promise<string> {
  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press('Tab');
    const padId = await page.evaluate(() => {
      const id = document.activeElement?.getAttribute('data-testid') ?? '';
      return id.startsWith('pad-') ? id : '';
    });
    if (padId) {
      return padId;
    }
  }
  throw new Error('Tab did not focus a pad');
}
