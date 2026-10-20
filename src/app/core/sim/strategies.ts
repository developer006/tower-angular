import { towerDef } from '../content/towers';
import { WAVE_COUNT, type TowerType } from '../content/types';
import { GameEngine } from '../game/engine';

export type StrategyName = 'none' | 'pulse' | 'mortar' | 'cryo' | 'mixed';

export interface StrategyResult {
  strategy: StrategyName;
  outcome: 'victory' | 'defeat';
  bestWave: number;
  wavesCleared: number;
  integrity: number;
  kills: number;
  score: number;
  seed: number;
}

const PADS = [
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
] as const;

const MIXED_ORDERS: readonly (readonly TowerType[])[] = [
  ['pulse', 'mortar', 'cryo'],
  ['mortar', 'pulse', 'cryo'],
  ['cryo', 'pulse', 'mortar'],
  ['pulse', 'cryo', 'mortar'],
  ['mortar', 'cryo', 'pulse'],
  ['cryo', 'mortar', 'pulse'],
];

/** One wave of travel plus spawn slack. A miss throws; it does not invent an outcome. */
const WAVE_TICK_CAP = 60_000;

export function formatStrategyRow(result: StrategyResult): string {
  return [
    result.strategy,
    `seed=${result.seed}`,
    `outcome=${result.outcome}`,
    `bestWave=${result.bestWave}`,
    `wavesCleared=${result.wavesCleared}`,
    `integrity=${result.integrity}`,
    `kills=${result.kills}`,
    `score=${result.score}`,
  ].join(' ');
}

export function none(seed: number): StrategyResult {
  return play('none', seed, () => undefined);
}

export function pulse(seed: number): StrategyResult {
  return play('pulse', seed, (engine) => placeOnly(engine, 'pulse'));
}

export function mortar(seed: number): StrategyResult {
  return play('mortar', seed, (engine) => placeOnly(engine, 'mortar'));
}

export function cryo(seed: number): StrategyResult {
  return play('cryo', seed, (engine) => placeOnly(engine, 'cryo'));
}

export function mixed(seed: number): StrategyResult {
  return play('mixed', seed, placeMixed);
}

export const strategies: Record<StrategyName, (seed: number) => StrategyResult> = {
  none,
  pulse,
  mortar,
  cryo,
  mixed,
};

export function runStrategy(name: StrategyName, seed: number): StrategyResult {
  return strategies[name](seed);
}

function play(
  name: StrategyName,
  seed: number,
  place: (engine: GameEngine, seed: number) => void,
): StrategyResult {
  const engine = new GameEngine(seed);
  engine.reset(seed);

  let wavesStarted = 0;
  while (engine.getState().phase === 'build') {
    wavesStarted += 1;
    if (wavesStarted > WAVE_COUNT) {
      throw new Error(`${name} seed ${seed} stayed in build past wave ${WAVE_COUNT}`);
    }
    engine.setPaused(true);
    place(engine, seed);
    engine.setPaused(false);
    const started = engine.dispatch({ type: 'startWave' });
    if (!started.ok) {
      throw new Error(`${name} seed ${seed} startWave rejected: ${started.reason ?? 'unknown'}`);
    }
    stepWave(engine, name, seed);
  }

  const state = engine.getState();
  if (state.phase !== 'victory' && state.phase !== 'defeat') {
    throw new Error(`${name} seed ${seed} ended in ${state.phase}`);
  }
  return {
    strategy: name,
    outcome: state.phase,
    bestWave: state.bestWave ?? 0,
    wavesCleared: state.wavesCleared ?? 0,
    integrity: state.integrity,
    kills: state.kills ?? 0,
    score: state.score,
    seed,
  };
}

function stepWave(engine: GameEngine, name: StrategyName, seed: number): void {
  let sawWave = false;
  for (let ticks = 0; ticks < WAVE_TICK_CAP; ticks += 1) {
    const phase = engine.getState().phase;
    if (phase === 'victory' || phase === 'defeat') {
      return;
    }
    if (sawWave && phase === 'build') {
      return;
    }
    if (phase === 'wave') {
      sawWave = true;
    }
    engine.step();
  }
  throw new Error(`${name} seed ${seed} exceeded ${WAVE_TICK_CAP} ticks in one wave`);
}

function placeOnly(engine: GameEngine, towerType: TowerType): void {
  const cost = towerDef(towerType).cost;
  for (const padId of PADS) {
    const state = engine.getState();
    if (state.towers.some((tower) => tower.padId === padId)) {
      continue;
    }
    if (state.gold < cost) {
      return;
    }
    placeTower(engine, towerType, padId);
  }
}

function placeMixed(engine: GameEngine, seed: number): void {
  const order = MIXED_ORDERS[Math.abs(Math.trunc(seed)) % MIXED_ORDERS.length];
  let cursor = engine.getState().towers.length;
  for (const padId of PADS) {
    const state = engine.getState();
    if (state.towers.some((tower) => tower.padId === padId)) {
      continue;
    }
    const towerType = affordableType(state.gold, order, cursor);
    if (!towerType) {
      return;
    }
    placeTower(engine, towerType, padId);
    cursor += 1;
  }
}

function affordableType(
  gold: number,
  order: readonly TowerType[],
  cursor: number,
): TowerType | undefined {
  const preferred = order[cursor % order.length];
  if (towerDef(preferred).cost <= gold) {
    return preferred;
  }
  for (const towerType of order) {
    if (towerDef(towerType).cost <= gold) {
      return towerType;
    }
  }
  return undefined;
}

function placeTower(engine: GameEngine, towerType: TowerType, padId: string): void {
  const placed = engine.dispatch({ type: 'placeTower', towerType, padId });
  if (!placed.ok) {
    throw new Error(`place ${towerType} on ${padId}: ${placed.reason ?? 'unknown'}`);
  }
}

