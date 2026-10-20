import { MAP_01 } from '../content/map-01';
import type { EnemyState, GameState } from '../game/state';
import { moveEnemies } from './movement';

function drone(id: string, distance: number, leakDamage = 1): EnemyState {
  return {
    id,
    enemyType: 'drone',
    hp: 55,
    maxHp: 55,
    speed: 1,
    leakDamage,
    distanceAlongPath: distance,
    alive: true,
    slowStrength: 0,
    slowRemaining: 0,
    spawnedAtTick: -1,
  };
}

function baseState(overrides: Partial<GameState> = {}): GameState {
  return {
    tick: 5,
    phase: 'wave',
    gold: 150,
    integrity: 20,
    wave: 1,
    score: 0,
    towers: [],
    enemies: [],
    projectiles: [],
    effects: [],
    spawnQueue: [],
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

describe('path movement and leaks', () => {
  it('moves a drone 0.8 pixels per tick and 48 pixels in 60 ticks', () => {
    expect(MAP_01.geometry.totalLength).toBe(2064);
    const state = baseState({ enemies: [drone('e1', 0)] });
    moveEnemies(state);
    expect(state.enemies[0].distanceAlongPath).toBe(0.8);
    for (let i = 0; i < 59; i += 1) {
      moveEnemies(state);
    }
    expect(state.enemies[0].distanceAlongPath).toBe(48);
    expect(state.gold).toBe(150);
    expect(state.integrity).toBe(20);
  });

  it('leaks a drone at 2063.5, drops integrity by 1, and does not pay bounty', () => {
    const state = baseState({
      gold: 80,
      integrity: 20,
      enemies: [drone('e9', 2063.5)],
    });
    moveEnemies(state);
    expect(state.enemies).toEqual([]);
    expect(state.integrity).toBe(19);
    expect(state.gold).toBe(80);
    expect(state.score).toBe(0);
    expect(state.phase).toBe('wave');
  });

  it('stops at integrity 0 and does not leak a later enemy in that tick', () => {
    const state = baseState({
      gold: 80,
      integrity: 1,
      enemies: [drone('e1', 2063.5), drone('e2', 2063.5)],
    });
    moveEnemies(state);
    expect(state.integrity).toBe(0);
    expect(state.integrity).toBeGreaterThanOrEqual(0);
    expect(state.phase).toBe('defeat');
    expect(state.enemies).toEqual([drone('e2', 2063.5)]);
    expect(state.gold).toBe(80);
    expect(state.score).toBe(0);
  });
});
