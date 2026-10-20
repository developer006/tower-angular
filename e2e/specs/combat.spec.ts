import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __TD__?: {
      ready?: boolean;
      setManualMode(enabled: boolean): void;
      stepTicks(n: number): void;
      getFullState(): {
        gold: number;
        wave: number;
        score: number;
        phase: string;
        tick: number;
        enemies: { id: string; distanceAlongPath: number; alive: boolean }[];
      };
    };
  }
}

const WAVE_CLEAR_CAP = 6000;

test('places a Pulse, collects the bounty, and clears wave 1', async ({ page }) => {
  const errors = trackErrors(page);
  await openManualPlay(page);

  await page.getByTestId('palette-pulse').click();
  await page.getByTestId('pad-01').click();
  await stepOnce(page);
  await expect(page.getByTestId('hud-gold')).toHaveText('80');

  await page.getByTestId('deploy-wave').click();
  await stepOnce(page);
  const spawned = await aliveEnemies(page);
  expect(spawned.length).toBeGreaterThan(0);
  const tracked = spawned[0];

  await stepOnce(page);
  const moved = await enemyById(page, tracked.id);
  if (!moved) {
    throw new Error(`enemy ${tracked.id} disappeared before its distance increased`);
  }
  expect(moved.distanceAlongPath).toBeGreaterThan(tracked.distanceAlongPath);

  const bounty = await page.evaluate(() => {
    const td = window.__TD__;
    if (!td) {
      throw new Error('harness is not ready');
    }
    let ticks = 0;
    let scoreStayedZero = true;
    while (ticks < 6000 && td.getFullState().gold !== 86) {
      if (td.getFullState().score !== 0) {
        scoreStayedZero = false;
      }
      td.stepTicks(1);
      ticks += 1;
    }
    const state = td.getFullState();
    if (state.score !== 0) {
      scoreStayedZero = false;
    }
    return {
      ticks,
      scoreStayedZero,
      gold: state.gold,
      score: state.score,
      phase: state.phase,
      wave: state.wave,
      tick: state.tick,
    };
  });
  expect(bounty.gold, JSON.stringify(bounty)).toBe(86);
  expect(bounty.score, JSON.stringify(bounty)).toBe(0);
  expect(bounty.scoreStayedZero, JSON.stringify(bounty)).toBe(true);

  const cleared = await page.evaluate((cap) => {
    const td = window.__TD__;
    if (!td) {
      throw new Error('harness is not ready');
    }
    let ticks = 0;
    let scoreStayedZero = true;
    while (ticks < cap) {
      const state = td.getFullState();
      if (state.score !== 0) {
        scoreStayedZero = false;
      }
      if (state.phase === 'build' && state.wave === 2) {
        return {
          done: true,
          ticks,
          scoreStayedZero,
          gold: state.gold,
          score: state.score,
          phase: state.phase,
          wave: state.wave,
          tick: state.tick,
          alive: state.enemies.filter((enemy) => enemy.alive).length,
        };
      }
      td.stepTicks(1);
      ticks += 1;
    }
    const state = td.getFullState();
    if (state.score !== 0) {
      scoreStayedZero = false;
    }
    return {
      done: false,
      ticks,
      scoreStayedZero,
      gold: state.gold,
      score: state.score,
      phase: state.phase,
      wave: state.wave,
      tick: state.tick,
      alive: state.enemies.filter((enemy) => enemy.alive).length,
    };
  }, WAVE_CLEAR_CAP);
  expect(cleared.done, JSON.stringify(cleared)).toBe(true);
  expect(cleared.phase, JSON.stringify(cleared)).toBe('build');
  expect(cleared.wave, JSON.stringify(cleared)).toBe(2);
  expect(cleared.score, JSON.stringify(cleared)).toBe(0);
  expect(cleared.scoreStayedZero, JSON.stringify(cleared)).toBe(true);
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

async function aliveEnemies(
  page: Page,
): Promise<{ id: string; distanceAlongPath: number; alive: boolean }[]> {
  return page.evaluate(() =>
    (window.__TD__?.getFullState().enemies ?? []).filter((enemy) => enemy.alive),
  );
}

async function enemyById(
  page: Page,
  id: string,
): Promise<{ id: string; distanceAlongPath: number; alive: boolean } | undefined> {
  return page.evaluate((enemyId) => {
    return window.__TD__?.getFullState().enemies.find((enemy) => enemy.id === enemyId);
  }, id);
}
