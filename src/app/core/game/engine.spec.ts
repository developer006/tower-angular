import { GameEngine } from './engine';
import { advanceFrame, createLoop, DT } from './loop';
import { nextUnit } from './rng';

const SNAPSHOT_KEYS = [
  'tick',
  'phase',
  'gold',
  'integrity',
  'wave',
  'score',
  'towers',
  'enemies',
  'projectiles',
  'effects',
  'spawnQueue',
  'rngState',
  'paused',
  'speed',
  'nextTowerId',
  'nextEnemyId',
  'nextProjectileId',
  'history',
  'pending',
];

describe('fixed-step engine', () => {
  it('uses DT of 1/60, not 0.016', () => {
    expect(DT).toBe(1 / 60);
    expect(DT).not.toBe(0.016);
  });

  it('starts a fresh run at build with the locked resources', () => {
    const engine = new GameEngine(1);
    const state = engine.getState();
    expect(state.gold).toBe(150);
    expect(state.integrity).toBe(20);
    expect(state.wave).toBe(1);
    expect(state.phase).toBe('build');
    expect(state.tick).toBe(0);
    expect(state.rngState).toBe(1);
    expect(state.paused).toBe(false);
    expect(state.speed).toBe(1);
    expect(state.nextTowerId).toBe(1);
    expect(Object.keys(JSON.parse(engine.getSnapshot()))).toEqual(SNAPSHOT_KEYS);
  });

  it('does not let getState mutate the engine', () => {
    const engine = new GameEngine(1);
    const state = engine.getState();
    state.gold = 0;
    state.towers.push({
      id: 't9',
      towerType: 'pulse',
      padId: 'pad-01',
      level: 1,
      invested: 70,
      targeting: 'first',
      cooldown: 0,
    });
    expect(engine.getState().gold).toBe(150);
    expect(engine.getState().towers).toEqual([]);
  });

  it('places, upgrades, and sells Pulse immediately while paused', () => {
    const engine = new GameEngine(1);
    engine.setPaused(true);

    const placed = engine.dispatch({ type: 'placeTower', towerType: 'pulse', padId: 'pad-01' });
    expect(placed).toEqual({ ok: true });
    let state = engine.getState();
    expect(state.gold).toBe(80);
    expect(state.tick).toBe(0);
    expect(state.pending).toEqual([]);
    expect(state.towers).toEqual([
      {
        id: 't1',
        towerType: 'pulse',
        padId: 'pad-01',
        level: 1,
        invested: 70,
        targeting: 'first',
        cooldown: 0,
      },
    ]);

    const upgraded = engine.dispatch({ type: 'upgradeTower', towerId: 't1' });
    expect(upgraded.ok).toBe(true);
    state = engine.getState();
    expect(state.gold).toBe(30);
    expect(state.towers[0].level).toBe(2);
    expect(state.towers[0].invested).toBe(120);
    expect(state.tick).toBe(0);

    const sold = engine.dispatch({ type: 'sellTower', towerId: 't1' });
    expect(sold.ok).toBe(true);
    state = engine.getState();
    expect(state.gold).toBe(30 + 84);
    expect(state.towers).toEqual([]);
    expect(state.tick).toBe(0);

    const again = engine.dispatch({ type: 'sellTower', towerId: 't1' });
    expect(again).toEqual({ ok: false, reason: 'missing-tower' });
    expect(engine.getState().gold).toBe(30 + 84);
    expect(engine.getState().history).toHaveLength(3);
  });

  it('rejects an unknown pad immediately and does not queue', () => {
    const engine = new GameEngine(1);
    const result = engine.dispatch({ type: 'placeTower', towerType: 'pulse', padId: 'pad-99' });
    expect(result).toEqual({ ok: false, reason: 'unknown-pad' });
    const state = engine.getState();
    expect(state.gold).toBe(150);
    expect(state.towers).toEqual([]);
    expect(state.pending).toEqual([]);
    expect(state.history).toEqual([]);
    expect(state.tick).toBe(0);
    expect(state.integrity).toBe(20);
  });

  it('rejects an unknown tower immediately', () => {
    const engine = new GameEngine(1);
    const result = engine.dispatch({
      type: 'placeTower',
      towerType: 'laser' as 'pulse',
      padId: 'pad-01',
    });
    expect(result).toEqual({ ok: false, reason: 'unknown-tower' });
    expect(engine.getState().gold).toBe(150);
    expect(engine.getState().pending).toEqual([]);
  });

  it('does not clear gold, towers, tick, integrity, or history on reject', () => {
    const engine = new GameEngine(1);
    engine.setPaused(true);
    engine.dispatch({ type: 'placeTower', towerType: 'pulse', padId: 'pad-01' });
    const before = engine.getState();
    const result = engine.dispatch({ type: 'placeTower', towerType: 'pulse', padId: 'pad-99' });
    expect(result.reason).toBe('unknown-pad');
    const after = engine.getState();
    expect(after.gold).toBe(before.gold);
    expect(after.towers).toEqual(before.towers);
    expect(after.tick).toBe(before.tick);
    expect(after.integrity).toBe(before.integrity);
    expect(after.history).toEqual(before.history);
  });

  it('spends queued gold only when step runs', () => {
    const engine = new GameEngine(1);
    const queued = engine.dispatch({ type: 'placeTower', towerType: 'pulse', padId: 'pad-01' });
    expect(queued).toEqual({ ok: true, queued: true });
    expect(engine.getState().gold).toBe(150);
    expect(engine.getState().tick).toBe(0);
    expect(engine.getState().towers).toEqual([]);

    engine.step();
    const state = engine.getState();
    expect(state.gold).toBe(80);
    expect(state.tick).toBe(1);
    expect(state.towers[0].id).toBe('t1');
    expect(state.pending).toEqual([]);
    expect(state.history).toEqual([{ type: 'placeTower', towerType: 'pulse', padId: 'pad-01' }]);
  });

  it('applies only the first of two queued Mortars on pad-02', () => {
    const engine = new GameEngine(1);
    expect(engine.dispatch({ type: 'placeTower', towerType: 'mortar', padId: 'pad-02' })).toEqual({
      ok: true,
      queued: true,
    });
    expect(engine.dispatch({ type: 'placeTower', towerType: 'mortar', padId: 'pad-02' })).toEqual({
      ok: true,
      queued: true,
    });
    expect(engine.getState().gold).toBe(150);

    engine.step();
    const state = engine.getState();
    expect(state.towers).toHaveLength(1);
    expect(state.towers[0].id).toBe('t1');
    expect(state.towers[0].padId).toBe('pad-02');
    expect(state.gold).toBe(40);
    expect(state.history).toHaveLength(1);
    expect(state.tick).toBe(1);
    expect(state.pending).toEqual([]);
    expect(state.nextTowerId).toBe(2);
  });

  it('rejects an occupied pad and insufficient gold without a second spend', () => {
    const engine = new GameEngine(1);
    engine.setPaused(true);
    engine.dispatch({ type: 'placeTower', towerType: 'pulse', padId: 'pad-01' });
    const occupied = engine.dispatch({ type: 'placeTower', towerType: 'pulse', padId: 'pad-01' });
    expect(occupied).toEqual({ ok: false, reason: 'occupied' });
    expect(engine.getState().gold).toBe(80);
    expect(engine.getState().towers).toHaveLength(1);

    engine.dispatch({ type: 'sellTower', towerId: 't1' });
    engine.dispatch({ type: 'placeTower', towerType: 'mortar', padId: 'pad-02' });
    const broke = engine.dispatch({ type: 'placeTower', towerType: 'mortar', padId: 'pad-03' });
    expect(broke).toEqual({ ok: false, reason: 'insufficient-gold' });
    expect(engine.getState().towers).toHaveLength(1);
    expect(engine.getState().gold).toBe(80 + 49 - 110);
  });

  it('keeps closest targeting and rejects a bad mode or missing tower', () => {
    const engine = new GameEngine(1);
    engine.setPaused(true);
    const missing = engine.dispatch({ type: 'setTargeting', towerId: 't1', mode: 'first' });
    expect(missing).toEqual({ ok: false, reason: 'missing-tower' });

    const bad = engine.dispatch({
      type: 'setTargeting',
      towerId: 't1',
      mode: 'last' as 'first',
    });
    expect(bad).toEqual({ ok: false, reason: 'bad-targeting' });
    expect(engine.getState().pending).toEqual([]);
    expect(engine.getState().tick).toBe(0);

    engine.dispatch({ type: 'placeTower', towerType: 'pulse', padId: 'pad-01' });
    const set = engine.dispatch({ type: 'setTargeting', towerId: 't1', mode: 'closest' });
    expect(set).toEqual({ ok: true });
    expect(engine.getState().towers[0].targeting).toBe('closest');
    expect(engine.getState().tick).toBe(0);
  });

  it('returns paused for startWave and does not change phase', () => {
    const engine = new GameEngine(1);
    engine.setPaused(true);
    const result = engine.dispatch({ type: 'startWave' });
    expect(result).toEqual({ ok: false, reason: 'paused' });
    expect(engine.getState().phase).toBe('build');
    expect(engine.getState().wave).toBe(1);
    expect(engine.getState().tick).toBe(0);
    expect(engine.getState().pending).toEqual([]);
  });

  it('starts a wave without advancing the wave number', () => {
    const engine = new GameEngine(1);
    expect(engine.dispatch({ type: 'startWave' })).toEqual({ ok: true, queued: true });
    expect(engine.getState().phase).toBe('build');
    engine.step();
    expect(engine.getState().phase).toBe('wave');
    expect(engine.getState().wave).toBe(1);
    expect(engine.getState().tick).toBe(1);

    expect(engine.dispatch({ type: 'startWave' })).toEqual({ ok: true, queued: true });
    const before = engine.getState();
    engine.step();
    const after = engine.getState();
    expect(after.phase).toBe('wave');
    expect(after.wave).toBe(1);
    expect(after.gold).toBe(before.gold);
    expect(after.history).toEqual(before.history);
    expect(after.integrity).toBe(before.integrity);
    expect(after.tick).toBe(2);
  });

  it('resets immediately, clears pending, and restores the seed', () => {
    const engine = new GameEngine(1);
    engine.setPaused(true);
    engine.setSpeed(2);
    engine.dispatch({ type: 'placeTower', towerType: 'pulse', padId: 'pad-01' });
    engine.setPaused(false);
    engine.dispatch({ type: 'startWave' });
    expect(engine.getState().pending).toHaveLength(1);

    expect(engine.dispatch({ type: 'reset', seed: 7 })).toEqual({ ok: true });
    const state = engine.getState();
    expect(state.gold).toBe(150);
    expect(state.integrity).toBe(20);
    expect(state.wave).toBe(1);
    expect(state.phase).toBe('build');
    expect(state.tick).toBe(0);
    expect(state.score).toBe(0);
    expect(state.towers).toEqual([]);
    expect(state.pending).toEqual([]);
    expect(state.history).toEqual([]);
    expect(state.rngState).toBe(7);
    expect(state.paused).toBe(false);
    expect(state.speed).toBe(1);
    expect(state.nextTowerId).toBe(1);
    expect(engine.isPaused()).toBe(false);
    expect(engine.getSpeed()).toBe(1);
  });

  it('discards a paused frame and steps by speed', () => {
    const paused = new GameEngine(1);
    paused.setPaused(true);
    const pausedLoop = createLoop();
    expect(advanceFrame(paused, pausedLoop, 1)).toBe(0);
    expect(paused.getState().tick).toBe(0);
    expect(pausedLoop.accumulator).toBe(0);

    const once = new GameEngine(1);
    expect(advanceFrame(once, createLoop(), DT)).toBe(1);
    expect(once.getState().tick).toBe(1);

    const twice = new GameEngine(1);
    twice.setSpeed(2);
    const fast = createLoop();
    expect(advanceFrame(twice, fast, DT)).toBe(2);
    expect(twice.getState().tick).toBe(2);
    expect(twice.getSpeed()).toBe(2);
    expect(fast.accumulator).toBe(0);
  });

  it('caps a long frame at 10 steps and keeps the oracle remainder', () => {
    const engine = new GameEngine(1);
    const loop = createLoop();
    expect(advanceFrame(engine, loop, 10)).toBe(10);
    expect(engine.getState().tick).toBe(10);
    expect(loop.accumulator).toBe(0.25 - 10 / 60);
  });

  it('matches snapshots for the same seed, place, startWave, and 600 steps', () => {
    const run = (seed: number): GameEngine => {
      const engine = new GameEngine(seed);
      engine.dispatch({ type: 'placeTower', towerType: 'pulse', padId: 'pad-01' });
      engine.dispatch({ type: 'startWave' });
      for (let i = 0; i < 600; i += 1) {
        engine.step();
      }
      return engine;
    };

    const left = run(7);
    const right = run(7);
    expect(left.getSnapshot()).toBe(right.getSnapshot());
    expect(left.getState().tick).toBe(600);
    expect(right.getState().tick).toBe(600);

    const state = left.getState();
    expect(state.gold).toBe(80);
    expect(state.phase).toBe('wave');
    expect(state.wave).toBe(1);
    expect(state.integrity).toBe(20);
    expect(state.score).toBe(0);
    expect(state.enemies).toEqual([]);
    expect(state.projectiles).toEqual([]);
    expect(state.effects).toEqual([]);
    expect(state.spawnQueue).toEqual([]);
    expect(state.rngState).toBe(7);
    expect(state.towers).toHaveLength(1);
    expect(state.history).toHaveLength(2);
    expect(state.pending).toEqual([]);
  });

  it('repeats nextUnit for the same seed and differs for seed 2', () => {
    expect(nextUnit(1)).toEqual(nextUnit(1));
    expect(nextUnit(1)).not.toEqual(nextUnit(2));
  });
});
