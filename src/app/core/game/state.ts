import type { EnemyType, SpawnEvent, TargetingMode, TowerType } from '../content/types';

export type Phase = 'build' | 'wave' | 'victory' | 'defeat';

export interface TowerState {
  id: string;
  towerType: TowerType;
  padId: string;
  level: 1 | 2 | 3;
  invested: number;
  targeting: TargetingMode;
  cooldown: number;
}

export interface EnemyState {
  id: string;
  enemyType: EnemyType;
  hp: number;
  maxHp: number;
  speed: number;
  leakDamage: number;
  distanceAlongPath: number;
  alive: boolean;
  slowStrength: number;
  slowRemaining: number;
  spawnedAtTick: number;
  /** Distance before this enemy's movement steps. Keeps 60 drone ticks at exactly 48. */
  travelOrigin?: number;
  travelTicks?: number;
}

export interface ProjectileState {
  id: string;
  towerId: string;
  targetId: string;
  x: number;
  y: number;
  damage: number;
  splashRadius: number;
}

export interface EffectState {
  id: string;
  kind: string;
  x: number;
  y: number;
  remaining: number;
}

export interface GameState {
  tick: number;
  phase: Phase;
  gold: number;
  integrity: number;
  wave: number;
  score: number;
  /** Kills this run. A kill does not change score. */
  kills?: number;
  /** Fully cleared waves. A defeat during wave N leaves this at N-1. */
  wavesCleared?: number;
  /** Highest 1-based wave started. Reset sets this to 0. */
  bestWave?: number;
  towers: TowerState[];
  enemies: EnemyState[];
  projectiles: ProjectileState[];
  effects: EffectState[];
  spawnQueue: SpawnEvent[];
  waveStartTick: number;
  rngState: number;
  paused: boolean;
  speed: 1 | 2;
  nextTowerId: number;
  nextEnemyId: number;
  nextProjectileId: number;
  history: Command[];
  pending: Command[];
}

export type Command =
  | { type: 'placeTower'; towerType: TowerType; padId: string }
  | { type: 'upgradeTower'; towerId: string }
  | { type: 'sellTower'; towerId: string }
  | { type: 'setTargeting'; towerId: string; mode: TargetingMode }
  | { type: 'startWave' }
  | { type: 'reset'; seed: number };

export type RejectReason =
  | 'unknown-pad'
  | 'unknown-tower'
  | 'occupied'
  | 'insufficient-gold'
  | 'missing-tower'
  | 'max-level'
  | 'bad-targeting'
  | 'paused'
  | 'wave-active'
  | 'ended';

export interface CommandResult {
  ok: boolean;
  reason?: RejectReason;
  queued?: boolean;
}
