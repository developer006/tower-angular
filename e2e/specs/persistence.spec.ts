import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __TD__?: {
      ready?: boolean;
      setManualMode(enabled: boolean): void;
      stepTicks(n: number): void;
      reset(options: { seed: number; integrity?: number; wave?: number; gold?: number }): void;
      getFullState(): { phase: string; score: number };
    };
  }
}

const DEFEAT_CAP = 8000;

test('best score and settings survive reload', async ({ page }) => {
  const errors = trackErrors(page);
  await openManualPlay(page);
  await page.evaluate(() => {
    window.__TD__?.reset({ seed: 1, integrity: 1, wave: 1, gold: 0 });
  });
  await page.getByTestId('deploy-wave').click();
  await stepOnce(page);

  const ended = await page.evaluate((cap) => {
    const td = window.__TD__;
    if (!td) {
      throw new Error('harness is not ready');
    }
    let ticks = 0;
    while (ticks < cap && td.getFullState().phase !== 'defeat' && td.getFullState().phase !== 'victory') {
      td.stepTicks(1);
      ticks += 1;
    }
    const state = td.getFullState();
    return { ticks, phase: state.phase, score: state.score };
  }, DEFEAT_CAP);
  expect(ended.phase, JSON.stringify(ended)).toMatch(/^(defeat|victory)$/);

  await expect(page.getByTestId('best-score')).toBeVisible();
  const bestText = await page.getByTestId('best-score').innerText();
  const bestScore = Number(bestText.replace(/[^\d.-]/g, ''));
  expect(Number.isFinite(bestScore)).toBe(true);

  await page.getByTestId('sound-muted').click();
  await page.getByTestId('reduced-motion').click();
  await page.getByTestId('colorblind').click();
  await expect(page.getByTestId('sound-muted')).toHaveText('Muted');
  await expect(page.getByTestId('reduced-motion')).toHaveText('Reduced');
  await expect(page.getByTestId('colorblind')).toHaveText('Colorblind');

  await page.reload();
  await page.waitForFunction(() => window.__TD__?.ready === true);
  const saved = await page.evaluate(() => {
    const raw = localStorage.getItem('core-defense:v1');
    return raw == null ? null : (JSON.parse(raw) as Record<string, unknown>);
  });
  expect(saved).toMatchObject({
    bestScore,
    soundMuted: true,
    reducedMotion: true,
    colorblind: true,
  });
  expect(saved).not.toHaveProperty('theme');
  expect(errors).toEqual([]);
});

test('corrupt storage falls back and does not throw', async ({ page }) => {
  const errors = trackErrors(page);
  await page.addInitScript(() => {
    localStorage.setItem('core-defense:v1', '{');
    localStorage.setItem('theme', 'deeppurple-amber');
  });
  await page.goto('/play');
  await page.waitForFunction(() => window.__TD__?.ready === true);
  await expect(page.getByTestId('game-canvas')).toBeVisible();
  await expect(page.getByTestId('sound-muted')).toHaveText('Sound');
  await expect(page.locator('#theme-link')).toHaveAttribute('href', /deeppurple-amber\.css$/);
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
