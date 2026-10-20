import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __TD__?: {
      ready?: boolean;
      setManualMode(enabled: boolean): void;
      stepTicks(n: number): void;
      reset(options: { seed: number; integrity?: number; wave?: number; gold?: number }): void;
      getFullState(): {
        gold: number;
        integrity: number;
        wave: number;
        score: number;
        phase: string;
        tick: number;
        kills?: number;
        wavesCleared?: number;
        towers: { id: string }[];
        enemies: { enemyType: string; alive: boolean }[];
      };
    };
  }
}

const OVERLORD_CAP = 4000;
const VICTORY_CAP = 12000;
const TICK_CAP = 120;

test('build phase canvas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openManualPlay(page);
  await page.evaluate(() => {
    window.__TD__?.reset({ seed: 1 });
  });
  await setReducedMotion(page);
  await paint(page);
  const tick = await page.evaluate(() => window.__TD__?.getFullState().tick);
  expect(tick).toBe(0);
  await expect(page.getByTestId('game-canvas')).toHaveScreenshot({
    maxDiffPixelRatio: 0.01,
  });
});

test('mid-combat canvas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openManualPlay(page);
  await page.evaluate(() => {
    window.__TD__?.reset({ seed: 1 });
  });
  await page.getByTestId('palette-pulse').click();
  await page.getByTestId('pad-01').click();
  await page.getByTestId('deploy-wave').click();
  const combat = await page.evaluate((cap) => {
    const td = window.__TD__;
    if (!td) {
      throw new Error('harness is not ready');
    }
    let steps = 0;
    while (steps < cap && td.getFullState().tick < 60) {
      td.stepTicks(1);
      steps += 1;
    }
    const state = td.getFullState();
    return {
      steps,
      tick: state.tick,
      towers: state.towers.length,
      alive: state.enemies.filter((enemy) => enemy.alive).length,
    };
  }, TICK_CAP);
  expect(combat.tick, JSON.stringify(combat)).toBe(60);
  expect(combat.towers, JSON.stringify(combat)).toBe(1);
  await setReducedMotion(page);
  await paint(page);
  const tick = await page.evaluate(() => window.__TD__?.getFullState().tick);
  expect(tick).toBe(60);
  await expect(page.getByTestId('game-canvas')).toHaveScreenshot({
    maxDiffPixelRatio: 0.01,
  });
});

test('victory overlay', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openManualPlay(page);
  await page.evaluate(() => {
    window.__TD__?.reset({ seed: 1, integrity: 50, wave: 10, gold: 0 });
  });

  await page.getByTestId('deploy-wave').click();
  await stepOnce(page);

  const overlord = await page.evaluate((cap) => {
    const td = window.__TD__;
    if (!td) {
      throw new Error('harness is not ready');
    }
    let ticks = 0;
    while (ticks < cap) {
      const state = td.getFullState();
      if (state.enemies.some((enemy) => enemy.enemyType === 'overlord')) {
        return { found: true, ticks, towers: state.towers.length };
      }
      td.stepTicks(1);
      ticks += 1;
    }
    return { found: false, ticks, towers: td.getFullState().towers.length };
  }, OVERLORD_CAP);
  expect(overlord.found, JSON.stringify(overlord)).toBe(true);
  expect(overlord.towers, JSON.stringify(overlord)).toBe(0);

  const victory = await page.evaluate((cap) => {
    const td = window.__TD__;
    if (!td) {
      throw new Error('harness is not ready');
    }
    let ticks = 0;
    while (ticks < cap && td.getFullState().phase !== 'victory') {
      td.stepTicks(1);
      ticks += 1;
    }
    const state = td.getFullState();
    return {
      phase: state.phase,
      score: state.score,
      towers: state.towers.length,
    };
  }, VICTORY_CAP);
  expect(victory.phase, JSON.stringify(victory)).toBe('victory');
  expect(victory.score, JSON.stringify(victory)).toBe(500);
  expect(victory.towers, JSON.stringify(victory)).toBe(0);

  await setReducedMotion(page);
  await expect(page.getByTestId('results-overlay')).toBeVisible();
  await expect(page.getByTestId('results-overlay')).toContainText('Score 500');
  const score = await page.evaluate(() => window.__TD__?.getFullState().score);
  expect(score).toBe(500);
  await expect(page.getByTestId('results-overlay')).toHaveScreenshot({
    maxDiffPixelRatio: 0.01,
  });
});

async function setReducedMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const control = page.getByTestId('reduced-motion');
  if ((await control.textContent())?.trim() !== 'Reduced') {
    await control.click();
  }
  await expect(control).toHaveText('Reduced');
}

async function openManualPlay(page: Page): Promise<void> {
  await page.goto('/play');
  await page.waitForFunction(() => window.__TD__?.ready === true);
  await page.evaluate(() => {
    window.__TD__?.setManualMode(true);
  });
}

async function paint(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__TD__?.stepTicks(0);
  });
}

async function stepOnce(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__TD__?.stepTicks(1);
  });
}
