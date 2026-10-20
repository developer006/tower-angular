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

test('wave 10 with no towers is a victory at score 500', async ({ page }) => {
  const errors = trackErrors(page);
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
        return {
          found: true,
          ticks,
          phase: state.phase,
          tick: state.tick,
          towers: state.towers.length,
        };
      }
      td.stepTicks(1);
      ticks += 1;
    }
    const state = td.getFullState();
    return {
      found: false,
      ticks,
      phase: state.phase,
      tick: state.tick,
      towers: state.towers.length,
      alive: state.enemies.filter((enemy) => enemy.alive).map((enemy) => enemy.enemyType),
    };
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
      ticks,
      phase: state.phase,
      integrity: state.integrity,
      wavesCleared: state.wavesCleared ?? 0,
      kills: state.kills ?? 0,
      score: state.score,
      wave: state.wave,
      gold: state.gold,
      tick: state.tick,
      towers: state.towers.length,
    };
  }, VICTORY_CAP);
  expect(victory.phase, JSON.stringify(victory)).toBe('victory');
  expect(victory.integrity, JSON.stringify(victory)).toBe(16);
  expect(victory.wavesCleared, JSON.stringify(victory)).toBe(1);
  expect(victory.kills, JSON.stringify(victory)).toBe(0);
  expect(victory.score, JSON.stringify(victory)).toBe(500);
  expect(victory.towers, JSON.stringify(victory)).toBe(0);

  await expect(page.getByTestId('results-overlay')).toBeVisible();
  await expect(page.getByTestId('results-overlay')).toContainText('Score 500');
  await expect(page.getByTestId('retry')).toBeVisible();
  await expect(page.getByTestId('hud-score')).toHaveText('0');
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
