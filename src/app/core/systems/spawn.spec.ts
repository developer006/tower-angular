import { GameEngine } from '../game/engine';
import { DT } from '../game/loop';
import type { GameState } from '../game/state';
import { spawnDue } from './spawn';

function baseState(overrides: Partial<GameState> = {}): GameState {
  return {
    tick: 10,
    phase: 'wave',
    gold: 150,
    integrity: 20,
    wave: 1,
    score: 0,
    towers: [],
    enemies: [],
    projectiles: [],
    effects: [],
    spawnQueue: [{ type: 'drone', time: 0 }],
    waveStartTick: 1,
    rngState: 1,
    paused: false,
    speed: 1,
    nextTowerId: 1,
    nextEnemyId: 3,
    nextProjectileId: 1,
    history: [],
    pending: [],
    ...overrides,
  };
}

describe('spawn queue', () => {
  it('spawns e1 at distance 0 on the start step and leaves seven events', () => {
    const engine = new GameEngine(1);
    engine.dispatch({ type: 'startWave' });
    engine.step();

    const state = engine.getState();
    expect(state.tick).toBe(1);
    expect(state.waveStartTick).toBe(1);
    expect(state.phase).toBe('wave');
    expect(state.spawnQueue).toHaveLength(7);
    expect(state.enemies).toEqual([
      {
        id: 'e1',
        enemyType: 'drone',
        hp: 55,
        maxHp: 55,
        speed: 1,
        leakDamage: 1,
        distanceAlongPath: 0,
        alive: true,
        slowStrength: 0,
        slowRemaining: 0,
        spawnedAtTick: 1,
      },
    ]);
    expect(state.nextEnemyId).toBe(2);
    expect(state.gold).toBe(150);
  });

  it('spawns the second wave-1 drone at elapsed tick 48 and no more', () => {
    const engine = new GameEngine(1);
    engine.dispatch({ type: 'startWave' });
    engine.step();

    for (let i = 0; i < 47; i += 1) {
      engine.step();
    }
    expect(engine.getState().tick - engine.getState().waveStartTick).toBe(47);
    expect(engine.getState().enemies).toHaveLength(1);
    expect(engine.getState().spawnQueue).toHaveLength(7);

    engine.step();
    const state = engine.getState();
    expect(state.tick - state.waveStartTick).toBe(48);
    expect(state.enemies).toHaveLength(2);
    expect(state.enemies[1]).toMatchObject({
      id: 'e2',
      enemyType: 'drone',
      hp: 55,
      distanceAlongPath: 0,
      alive: true,
    });
    expect(state.spawnQueue).toHaveLength(6);
  });

  it('spawns the eighth drone at Math.round(5.6 / DT) elapsed ticks', () => {
    const elapsedTarget = Math.round(5.6 / DT);
    const engine = new GameEngine(1);
    engine.dispatch({ type: 'startWave' });
    engine.step();
    while (engine.getState().tick - engine.getState().waveStartTick < elapsedTarget - 1) {
      engine.step();
    }
    expect(engine.getState().enemies).toHaveLength(7);
    expect(engine.getState().spawnQueue).toHaveLength(1);

    engine.step();
    const state = engine.getState();
    expect(state.tick - state.waveStartTick).toBe(elapsedTarget);
    expect(elapsedTarget).toBe(336);
    expect(state.enemies).toHaveLength(8);
    expect(state.enemies[7].id).toBe('e8');
    expect(state.spawnQueue).toEqual([]);
  });

  it('does not spawn after defeat', () => {
    const state = baseState({ phase: 'defeat' });
    spawnDue(state);
    expect(state.enemies).toEqual([]);
    expect(state.spawnQueue).toEqual([{ type: 'drone', time: 0 }]);
    expect(state.nextEnemyId).toBe(3);
  });
});
