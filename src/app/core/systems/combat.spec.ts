import { enemyDef } from '../content/enemies';
import { MAP_01, tileCenter, padById } from '../content/map-01';
import type { EnemyType, TargetingMode, TowerType } from '../content/types';
import { samplePath } from '../game/path';
import type { EnemyState, GameState, TowerState } from '../game/state';
import { applyDamage } from './damage';
import { fireTowers } from './firing';
import { moveEnemies } from './movement';
import { moveProjectiles, type FlightProjectile } from './projectiles';
import { acquireTargets, readTarget } from './targeting';

function enemy(
  id: string,
  enemyType: EnemyType,
  distance: number,
  extra: Partial<EnemyState> = {},
): EnemyState {
  const def = enemyDef(enemyType);
  return {
    id,
    enemyType,
    hp: def.hp,
    maxHp: def.hp,
    speed: def.speed,
    leakDamage: def.leakDamage,
    distanceAlongPath: distance,
    alive: true,
    slowStrength: 0,
    slowRemaining: 0,
    spawnedAtTick: -1,
    ...extra,
  };
}

function tower(
  towerType: TowerType,
  padId: string,
  targeting: TargetingMode = 'first',
): TowerState {
  return {
    id: 't1',
    towerType,
    padId,
    level: 1,
    invested: 70,
    targeting,
    cooldown: 0,
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
    nextTowerId: 2,
    nextEnemyId: 3,
    nextProjectileId: 1,
    history: [],
    pending: [],
    ...overrides,
  };
}

function point(distance: number): { x: number; y: number } {
  return samplePath(MAP_01.geometry, distance).position;
}

function shot(
  targetId: string,
  distance: number,
  extra: Partial<FlightProjectile> = {},
): FlightProjectile {
  const at = point(distance);
  return {
    id: 'p1',
    towerId: 't1',
    targetId,
    x: at.x,
    y: at.y,
    damage: 12,
    splashRadius: 0,
    ...extra,
  };
}

function land(state: GameState): void {
  const guard = state.projectiles.length + 40;
  for (let i = 0; i < guard && state.projectiles.length > 0; i += 1) {
    moveProjectiles(state);
    applyDamage(state);
  }
}

describe('targeting, projectiles, armor, and slow', () => {
  it('targets a drone inside 3.2 tiles and lets a further drone win first', () => {
    const state = baseState({
      towers: [tower('pulse', 'pad-01')],
      enemies: [enemy('e1', 'drone', 48)],
    });
    acquireTargets(state);
    expect(readTarget(state.towers[0])).toBe('e1');

    state.enemies.push(enemy('e2', 'drone', 120));
    acquireTargets(state);
    expect(readTarget(state.towers[0])).toBe('e2');
  });

  it('picks the nearer drone for closest even when it is behind on the path', () => {
    const state = baseState({
      towers: [tower('pulse', 'pad-01', 'closest')],
      enemies: [enemy('e1', 'drone', 120), enemy('e2', 'drone', 48)],
    });
    acquireTargets(state);
    expect(readTarget(state.towers[0])).toBe('e2');
  });

  it('breaks equal distance by further path distance, then lower id', () => {
    const further = baseState({
      towers: [tower('pulse', 'pad-01', 'closest')],
      enemies: [enemy('e1', 'drone', 0), enemy('e2', 'drone', 96)],
    });
    acquireTargets(further);
    expect(readTarget(further.towers[0])).toBe('e2');

    const lowerId = baseState({
      towers: [tower('pulse', 'pad-01', 'closest')],
      enemies: [enemy('e2', 'drone', 48), enemy('e1', 'drone', 48)],
    });
    acquireTargets(lowerId);
    expect(readTarget(lowerId.towers[0])).toBe('e1');
  });

  it('reduces a Tank by 8 on one Pulse shot', () => {
    const tank = enemy('e1', 'tank', 48);
    const state = baseState({
      towers: [tower('pulse', 'pad-01')],
      enemies: [tank],
    });
    acquireTargets(state);
    fireTowers(state);
    expect(state.projectiles).toHaveLength(1);
    expect(state.projectiles[0].id).toBe('p1');
    expect(state.projectiles[0].damage).toBe(12);
    expect(state.projectiles[0].splashRadius).toBe(0);
    land(state);
    expect(tank.hp).toBe(292);
    expect(state.score).toBe(0);
    expect(state.gold).toBe(150);
  });

  it('deals 1 to an Overlord and slows at 0.2 for 1.5s', () => {
    const boss = enemy('e1', 'overlord', 48);
    const state = baseState({
      towers: [tower('cryo', 'pad-01')],
      enemies: [boss],
    });
    acquireTargets(state);
    fireTowers(state);
    expect(state.projectiles[0].damage).toBe(5);
    land(state);
    expect(boss.hp).toBe(2199);
    expect(boss.slowStrength).toBe(0.2);
    expect(boss.slowRemaining).toBe(1.5);
    expect(state.score).toBe(0);
  });

  it('does not replace a stronger slow with a weaker one', () => {
    const drone = enemy('e1', 'drone', 48, { slowStrength: 0.5, slowRemaining: 0.8 });
    const state = baseState({
      projectiles: [shot('e1', 48, { damage: 5, slowStrength: 0.4, slowDuration: 1.5 })],
      enemies: [drone],
    });
    moveProjectiles(state);
    applyDamage(state);
    expect(drone.hp).toBe(50);
    expect(drone.slowStrength).toBe(0.5);
    expect(drone.slowRemaining).toBe(0.8);
  });

  it('refreshes duration when slow strength is equal', () => {
    const drone = enemy('e1', 'drone', 48, { slowStrength: 0.4, slowRemaining: 0.25 });
    const state = baseState({
      projectiles: [shot('e1', 48, { damage: 5, slowStrength: 0.4, slowDuration: 1.5 })],
      enemies: [drone],
    });
    moveProjectiles(state);
    applyDamage(state);
    expect(drone.slowStrength).toBe(0.4);
    expect(drone.slowRemaining).toBe(1.5);
  });

  it('splashes two enemies inside 1 tile and not an enemy 2 tiles away', () => {
    const target = enemy('e1', 'drone', 100);
    const near = enemy('e2', 'drone', 140);
    const far = enemy('e3', 'drone', 196);
    const state = baseState({
      enemies: [target, near, far],
      projectiles: [shot('e1', 100, { damage: 45, splashRadius: 1 })],
    });
    moveProjectiles(state);
    applyDamage(state);
    expect(target.hp).toBe(10);
    expect(near.hp).toBe(10);
    expect(far.hp).toBe(55);
    expect(state.projectiles).toEqual([]);
  });

  it('deals no damage when the target is removed before impact', () => {
    const bystander = enemy('e2', 'drone', 100);
    const at = point(100);
    const state = baseState({
      enemies: [bystander],
      projectiles: [
        {
          id: 'p1',
          towerId: 't1',
          targetId: 'e1',
          x: at.x - 20,
          y: at.y,
          damage: 45,
          splashRadius: 1,
        },
      ],
    });
    moveProjectiles(state);
    applyDamage(state);
    expect(bystander.hp).toBe(55);
    expect(state.projectiles).toEqual([]);
    expect(state.gold).toBe(150);
    expect(state.score).toBe(0);
  });

  it('adds 6 gold for a killed Drone and does not change score', () => {
    const drone = enemy('e1', 'drone', 48, { hp: 12 });
    const state = baseState({
      gold: 80,
      score: 0,
      towers: [tower('pulse', 'pad-01')],
      enemies: [drone],
    });
    acquireTargets(state);
    fireTowers(state);
    land(state);
    expect(state.enemies).toEqual([]);
    expect(state.gold).toBe(86);
    expect(state.score).toBe(0);
    expect(state.integrity).toBe(20);
    expect(state.phase).toBe('wave');
  });

  it('moves a 40% slowed drone 28.8 pixels in 60 ticks, not 48', () => {
    const drone = enemy('e1', 'drone', 0, { slowStrength: 0.4, slowRemaining: 2 });
    const state = baseState({ enemies: [drone] });
    for (let i = 0; i < 60; i += 1) {
      moveEnemies(state);
    }
    expect(drone.distanceAlongPath).toBe(28.8);
    expect(drone.distanceAlongPath).not.toBe(48);
    expect(state.gold).toBe(150);
    expect(state.score).toBe(0);
  });

  it('clears a dead or out-of-range target before choosing another', () => {
    const state = baseState({
      towers: [tower('pulse', 'pad-01')],
      enemies: [enemy('e9', 'drone', 400), enemy('e3', 'drone', 48)],
    });
    state.towers[0] = { ...state.towers[0], targetId: 'e9' } as TowerState;
    acquireTargets(state);
    expect(readTarget(state.towers[0])).toBe('e3');
    expect(padById('pad-01')).toBeDefined();
    expect(tileCenter(1, 0)).toEqual({ x: 72, y: 24 });
  });
});
