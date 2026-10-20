import { MAP_01 } from '../core/content/map-01';
import { GameEngine } from '../core/game/engine';
import { installHarness } from '../core/testing/harness-loader';
import { GameFacade } from './game-facade';

const PAD_IDS = [
  'pad-01',
  'pad-02',
  'pad-03',
  'pad-04',
  'pad-05',
  'pad-06',
  'pad-07',
  'pad-08',
  'pad-09',
  'pad-10',
  'pad-11',
  'pad-12',
  'pad-13',
  'pad-14',
];

describe('GameFacade', () => {
  it('installs the production harness without throwing', () => {
    expect(() => installHarness()).not.toThrow();
    expect(() => installHarness(undefined)).not.toThrow();
  });

  it('configureScenario leaves the provided resources and tick 0', () => {
    const engine = new GameEngine(1);
    engine.step();
    engine.configureScenario({ seed: 3, integrity: 9, wave: 10, gold: 40 });
    const state = engine.getState();
    expect(state.gold).toBe(40);
    expect(state.integrity).toBe(9);
    expect(state.wave).toBe(10);
    expect(state.tick).toBe(0);
    expect(state.rngState).toBe(3);
  });

  it('copies engine state into signals and steps before rendering', () => {
    const facade = new GameFacade();
    const rendered: number[] = [];
    facade.registerRender(() => rendered.push(facade.getState().tick));

    expect(facade.gold()).toBe(150);
    expect(facade.integrity()).toBe(20);
    expect(facade.wave()).toBe(1);
    expect(facade.score()).toBe(0);
    expect(facade.paused()).toBe(false);

    facade.stepTicks(3);
    expect(facade.getState().tick).toBe(3);
    expect(facade.getFullState().tick).toBe(3);
    expect(facade.getFullState()).not.toBe(facade.getFullState());
    expect(rendered).toEqual([3]);
  });

  it('forwards dispatch and reset, then refreshes the HUD signals', () => {
    const facade = new GameFacade();
    const queued = facade.dispatch({ type: 'startWave' });
    expect(queued).toEqual({ ok: true, queued: true });
    expect(facade.getState().phase).toBe('build');

    facade.stepTicks(1);
    expect(facade.getState().phase).toBe('wave');

    facade.reset({ seed: 3, integrity: 9, wave: 10, gold: 40 });
    expect(facade.getState()).toEqual({
      gold: 40,
      integrity: 9,
      wave: 10,
      score: 0,
      phase: 'build',
      tick: 0,
    });
    expect(facade.gold()).toBe(40);
    expect(facade.integrity()).toBe(9);
    expect(facade.wave()).toBe(10);
    expect(facade.score()).toBe(0);
  });

  it('returns map 01 pad ids, waypoints, entry, and core', () => {
    const map = new GameFacade().getMap();
    expect(map.padIds).toEqual(PAD_IDS);
    expect(map.padIds).toEqual(MAP_01.pads.map((pad) => pad.id));
    expect(map.waypoints).toEqual(MAP_01.waypoints.map((point) => ({ x: point.x, y: point.y })));
    expect(map.entry).toEqual({ col: MAP_01.entry.col, row: MAP_01.entry.row });
    expect(map.core).toEqual({ col: MAP_01.core.col, row: MAP_01.core.row });
  });

  it('getLoop returns a copy of the accumulator', () => {
    const frames: FrameRequestCallback[] = [];
    const originalRaf = globalThis.requestAnimationFrame;
    const originalCancel = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => {
      frames.push(callback);
      return frames.length;
    };
    globalThis.cancelAnimationFrame = () => undefined;

    const facade = new GameFacade();
    try {
      expect(facade.getLoop()).toEqual({ accumulator: 0 });
      facade.start();
      frames[0](0);
      frames[1](16);
      const accumulator = facade.getLoop().accumulator;
      expect(accumulator).toBeGreaterThan(0);
      expect(accumulator).toBeLessThan(1 / 60);
      facade.getLoop().accumulator = 1;
      expect(facade.getLoop().accumulator).toBe(accumulator);
    } finally {
      facade.stop();
      globalThis.requestAnimationFrame = originalRaf;
      globalThis.cancelAnimationFrame = originalCancel;
    }
  });

  it('skips the first frame and later frames while manual mode is on', () => {
    const frames: FrameRequestCallback[] = [];
    const originalRaf = globalThis.requestAnimationFrame;
    const originalCancel = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => {
      frames.push(callback);
      return frames.length;
    };
    globalThis.cancelAnimationFrame = () => undefined;

    const facade = new GameFacade();
    try {
      facade.start();
      expect(frames).toHaveLength(1);
      frames[0](0);
      expect(facade.getState().tick).toBe(0);

      frames[1](1000);
      expect(facade.getState().tick).toBeGreaterThan(0);
      const stepped = facade.getState().tick;

      facade.setManualMode(true);
      frames[2](2000);
      expect(facade.getState().tick).toBe(stepped);

      facade.stop();
      const scheduled = frames.length;
      frames[scheduled - 1](3000);
      expect(frames).toHaveLength(scheduled);
      expect(facade.getState().tick).toBe(stepped);
    } finally {
      facade.stop();
      globalThis.requestAnimationFrame = originalRaf;
      globalThis.cancelAnimationFrame = originalCancel;
    }
  });
});
