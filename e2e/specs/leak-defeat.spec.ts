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
      };
    };
  }
}

const DEFEAT_CAP = 6000;

test('a leak defeats the run and Retry restores gold, integrity, and wave', async ({ page }) => {
  const errors = trackErrors(page);
  await openManualPlay(page);
  await page.evaluate(() => {
    window.__TD__?.reset({ seed: 1, integrity: 1, wave: 1, gold: 0 });
  });

  await page.getByTestId('deploy-wave').click();
  await stepOnce(page);

  const defeated = await page.evaluate((cap) => {
    const td = window.__TD__;
    if (!td) {
      throw new Error('harness is not ready');
    }
    let ticks = 0;
    while (ticks < cap && td.getFullState().phase !== 'defeat') {
      td.stepTicks(1);
      ticks += 1;
    }
    const state = td.getFullState();
    return {
      ticks,
      phase: state.phase,
      integrity: state.integrity,
      gold: state.gold,
      wave: state.wave,
      score: state.score,
      tick: state.tick,
    };
  }, DEFEAT_CAP);
  expect(defeated.phase, JSON.stringify(defeated)).toBe('defeat');
  expect(defeated.integrity, JSON.stringify(defeated)).toBe(0);

  await expect(page.getByTestId('results-overlay')).toBeVisible();
  await expect(page.getByTestId('retry')).toBeVisible();
  await expect(page.getByTestId('hud-integrity')).toHaveText('0');
  await expect(page.getByTestId('hud-score')).toHaveText('0');

  await page.getByTestId('retry').click();
  await expect(page.getByTestId('results-overlay')).toBeHidden();
  await expect(page.getByTestId('hud-gold')).toHaveText('150');
  await expect(page.getByTestId('hud-integrity')).toHaveText('20');
  await expect(page.getByTestId('hud-wave')).toHaveText('1');

  const restored = await page.evaluate(() => {
    const state = window.__TD__?.getFullState();
    return {
      gold: state?.gold,
      integrity: state?.integrity,
      wave: state?.wave,
      phase: state?.phase,
    };
  });
  expect(restored.gold).toBe(150);
  expect(restored.integrity).toBe(20);
  expect(restored.wave).toBe(1);
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
