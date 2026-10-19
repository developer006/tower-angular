export type TowerType = 'pulse' | 'mortar' | 'cryo';
export type EnemyType = 'drone' | 'runner' | 'tank' | 'swarm' | 'overlord';
export type TargetingMode = 'first' | 'strongest' | 'closest';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Tile {
  col: number;
  row: number;
}

export interface TowerLevelStats {
  damage: number;
  rate: number;
  range: number;
  splashRadius?: number;
  slowStrength?: number;
  slowDuration?: number;
}

export interface TowerDef {
  type: TowerType;
  cost: number;
  levels: [TowerLevelStats, TowerLevelStats, TowerLevelStats];
  upgradeCosts: [number, number];
}

export interface EnemyDef {
  type: EnemyType;
  hp: number;
  speed: number;
  armor: number;
  bounty: number;
  leakDamage: number;
  slowResistance: number;
}

export interface WaveGroup {
  type: EnemyType;
  count: number;
}

export interface WaveDef {
  wave: number;
  groups: WaveGroup[];
}

export interface SpawnEvent {
  type: EnemyType;
  time: number;
}

export const TILE_SIZE = 48;
export const GRID_COLS = 20;
export const GRID_ROWS = 12;
export const CANVAS_WIDTH = GRID_COLS * TILE_SIZE;
export const CANVAS_HEIGHT = GRID_ROWS * TILE_SIZE;
export const STARTING_GOLD = 150;
export const STARTING_INTEGRITY = 20;
export const WAVE_COUNT = 10;
export const SELL_REFUND_RATIO = 0.7;
export const MIN_HIT_DAMAGE = 1;
export const DEFAULT_TARGETING: TargetingMode = 'first';
export const SPAWN_INTERVAL = 0.8;
export const GROUP_DELAY = 4;

export function sellRefund(invested: number): number {
  return Math.floor(invested * SELL_REFUND_RATIO);
}

export function waveClearBonus(wave: number): number {
  return 25 + 5 * wave;
}

export function computeScore(kills: number, wavesCleared: number, remainingIntegrity: number): number {
  return kills * 10 + wavesCleared * 100 + remainingIntegrity * 25;
}
