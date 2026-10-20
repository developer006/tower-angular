import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __TD__?: {
      ready?: boolean;
      reset(options: { seed: number }): void;
      getState(): { tick: number };
      getFullState(): { speed: 1 | 2 };
      getLoop(): { accumulator: number };
    };
  }
}

const SLICE_MS = 16;
const SPEED_SLICES = 24;

test('pause freezes tick and does not dump paused time on resume', async ({ page }) => {
  await openClockPlay(page);

  let sample = await readLoop(page);
  for (let i = 0; i < 80 && sample.tick < 10; i += 1) {
    await page.clock.runFor(SLICE_MS);
    sample = await readLoop(page);
  }
  expect(sample.tick, JSON.stringify(sample)).toBeGreaterThanOrEqual(10);

  const frozen = sample;
  await page.getByTestId('pause').click();
  for (let i = 0; i < 20; i += 1) {
    await page.clock.runFor(SLICE_MS);
  }
  const paused = await readLoop(page);
  expect(paused.tick).toBe(frozen.tick);
  expect(paused.accumulator).toBe(frozen.accumulator);
  await expect(page.getByTestId('deploy-wave')).toBeDisabled();

  await page.getByTestId('pause').click();
  await page.clock.runFor(SLICE_MS);
  const resumed = await readLoop(page);
  expect(resumed.tick - frozen.tick).toBeLessThanOrEqual(1);
  expect(resumed.tick).toBeGreaterThanOrEqual(frozen.tick);
  expect(resumed.accumulator).toBeLessThan(0.2);
});

test('2x advances about twice as far', async ({ page }) => {
  await openClockPlay(page);
  const slow = await measureTickDelta(page, 1, SPEED_SLICES);
  const fast = await measureTickDelta(page, 2, SPEED_SLICES);
  expect(slow, `1x=${slow} 2x=${fast}`).toBeGreaterThan(0);
  expect(fast, `1x=${slow} 2x=${fast}`).toBeGreaterThan(0);
  expect(fast, `1x=${slow} 2x=${fast}`).toBeGreaterThanOrEqual(slow * 1.7);
  expect(fast, `1x=${slow} 2x=${fast}`).toBeLessThanOrEqual(slow * 2.3);
});

async function openClockPlay(page: Page): Promise<void> {
  await page.clock.install();
  await page.clock.pauseAt(Date.now());
  await page.goto('/play');
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    const ready = await page.evaluate(() => window.__TD__?.ready === true);
    if (ready) {
      return;
    }
    await page.clock.runFor(SLICE_MS);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('harness did not become ready');
}

async function readLoop(page: Page): Promise<{ tick: number; accumulator: number }> {
  return page.evaluate(() => {
    const td = window.__TD__;
    if (!td) {
      throw new Error('harness is not ready');
    }
    return {
      tick: td.getState().tick,
      accumulator: td.getLoop().accumulator,
    };
  });
}

async function measureTickDelta(page: Page, speed: 1 | 2, slices: number): Promise<number> {
  await page.evaluate(() => {
    window.__TD__?.reset({ seed: 1 });
  });
  const current = await page.evaluate(() => window.__TD__?.getFullState().speed);
  if (current !== speed) {
    await page.getByTestId('speed').click();
  }
  const applied = await page.evaluate(() => window.__TD__?.getFullState().speed);
  expect(applied).toBe(speed);
  const before = await page.evaluate(() => window.__TD__?.getState().tick ?? 0);
  for (let i = 0; i < slices; i += 1) {
    await page.clock.runFor(SLICE_MS);
  }
  const after = await page.evaluate(() => window.__TD__?.getState().tick ?? 0);
  return after - before;
}
