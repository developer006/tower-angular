import { enemyDef } from '../src/app/core/content/enemies';
import { MAP_01 } from '../src/app/core/content/map-01';
import type { TowerType } from '../src/app/core/content/types';
import { GameEngine } from '../src/app/core/game/engine';
import type { EnemyState, GameState, TowerState } from '../src/app/core/game/state';

const TOWER_COUNT = 20;
const ENEMY_COUNT = 100;
const WARMUP_STEPS = 20;
const MEASURED_STEPS = 300;
const BUDGET_MS = 4;
const SURVIVE_HP = 1_000_000;
const TYPES: readonly TowerType[] = ['pulse', 'mortar', 'cryo'];

function engineState(engine: GameEngine): GameState {
  return (engine as unknown as { state: GameState }).state;
}

function buildLoadedState(state: GameState): void {
  state.phase = 'wave';
  state.integrity = 10_000;
  state.paused = false;
  state.speed = 1;
  state.spawnQueue = [];
  state.projectiles = [];
  state.effects = [];
  state.pending = [];
  state.towers = [];
  state.enemies = [];

  const pads = MAP_01.pads;
  for (let index = 0; index < TOWER_COUNT; index += 1) {
    const pad = pads[index % pads.length];
    const tower: TowerState = {
      id: `t${index + 1}`,
      towerType: TYPES[index % TYPES.length],
      padId: pad.id,
      level: 1,
      invested: 70,
      targeting: 'first',
      cooldown: 0,
    };
    state.towers.push(tower);
  }

  const span = Math.min(MAP_01.geometry.totalLength * 0.5, MAP_01.geometry.totalLength - 48);
  for (let index = 0; index < ENEMY_COUNT; index += 1) {
    const def = enemyDef('drone');
    const enemy: EnemyState = {
      id: `e${index + 1}`,
      enemyType: 'drone',
      hp: SURVIVE_HP,
      maxHp: SURVIVE_HP,
      speed: def.speed,
      leakDamage: def.leakDamage,
      distanceAlongPath: (span * index) / ENEMY_COUNT,
      alive: true,
      slowStrength: 0,
      slowRemaining: 0,
      spawnedAtTick: -1,
    };
    state.enemies.push(enemy);
  }

  state.nextTowerId = TOWER_COUNT + 1;
  state.nextEnemyId = ENEMY_COUNT + 1;
  state.nextProjectileId = 1;
}

function aliveCount(state: GameState): number {
  return state.enemies.filter((enemy) => enemy.alive).length;
}

function main(): void {
  const engine = new GameEngine(1);
  const state = engineState(engine);
  buildLoadedState(state);

  if (state.towers.length !== TOWER_COUNT || aliveCount(state) !== ENEMY_COUNT) {
    throw new Error(
      `scenario was not loaded: towers=${state.towers.length} enemies=${aliveCount(state)}`,
    );
  }

  for (let step = 0; step < WARMUP_STEPS; step += 1) {
    engine.step();
  }

  const warmed = engineState(engine);
  if (warmed.towers.length !== TOWER_COUNT || aliveCount(warmed) !== ENEMY_COUNT) {
    throw new Error(
      `loaded scenario collapsed before measure: towers=${warmed.towers.length} alive=${aliveCount(warmed)}`,
    );
  }

  const started = performance.now();
  for (let step = 0; step < MEASURED_STEPS; step += 1) {
    engine.step();
  }
  const average = (performance.now() - started) / MEASURED_STEPS;

  const after = engineState(engine);
  const towers = after.towers.length;
  const enemies = aliveCount(after);
  console.log(`towers=${towers}`);
  console.log(`enemies=${enemies}`);
  console.log(`steps=${MEASURED_STEPS}`);
  console.log(`average_ms=${average.toFixed(4)}`);
  console.log(`budget_ms=${BUDGET_MS}`);

  if (towers !== TOWER_COUNT || enemies !== ENEMY_COUNT) {
    console.log('PERF_INVALID');
    process.exit(1);
  }
  if (!(average < BUDGET_MS)) {
    console.log('PERF_BLOCKED');
    process.exit(2);
  }
  console.log('PERF_OK');
}

main();
