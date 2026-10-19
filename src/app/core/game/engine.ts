import { padById } from '../content/map-01';
import { TOWERS, towerDef } from '../content/towers';
import { DEFAULT_TARGETING, STARTING_GOLD, STARTING_INTEGRITY, sellRefund } from '../content/types';
import type { TargetingMode, TowerType } from '../content/types';
import { runSimulationSystems } from '../systems/order';
import type { Command, CommandResult, GameState, RejectReason, TowerState } from './state';

const TARGETING_MODES: readonly string[] = ['first', 'strongest', 'closest'];

function isKnownTower(type: string): type is TowerType {
  return TOWERS.some((tower) => tower.type === type);
}

function isTargetingMode(mode: string): mode is TargetingMode {
  return TARGETING_MODES.includes(mode);
}

function reject(reason: RejectReason): CommandResult {
  return { ok: false, reason };
}

function createInitialState(seed: number): GameState {
  return {
    tick: 0,
    phase: 'build',
    gold: STARTING_GOLD,
    integrity: STARTING_INTEGRITY,
    wave: 1,
    score: 0,
    towers: [],
    enemies: [],
    projectiles: [],
    effects: [],
    spawnQueue: [],
    rngState: seed >>> 0,
    paused: false,
    speed: 1,
    nextTowerId: 1,
    nextEnemyId: 1,
    nextProjectileId: 1,
    history: [],
    pending: [],
  };
}

function cloneCommand(command: Command): Command {
  switch (command.type) {
    case 'placeTower':
      return { type: 'placeTower', towerType: command.towerType, padId: command.padId };
    case 'upgradeTower':
      return { type: 'upgradeTower', towerId: command.towerId };
    case 'sellTower':
      return { type: 'sellTower', towerId: command.towerId };
    case 'setTargeting':
      return { type: 'setTargeting', towerId: command.towerId, mode: command.mode };
    case 'startWave':
      return { type: 'startWave' };
    case 'reset':
      return { type: 'reset', seed: command.seed };
    default: {
      const unexpected: never = command;
      return unexpected;
    }
  }
}

export class GameEngine {
  private state: GameState;

  constructor(seed: number) {
    this.state = createInitialState(seed);
    this.reset(seed);
  }

  reset(seed: number): void {
    this.state = createInitialState(seed);
  }

  configureScenario(options: {
    seed: number;
    integrity?: number;
    wave?: number;
    gold?: number;
  }): void {
    this.reset(options.seed);
    if (options.integrity !== undefined) {
      this.state.integrity = options.integrity;
    }
    if (options.wave !== undefined) {
      this.state.wave = options.wave;
    }
    if (options.gold !== undefined) {
      this.state.gold = options.gold;
    }
  }

  dispatch(command: Command): CommandResult {
    if (command.type === 'reset') {
      this.reset(command.seed);
      return { ok: true };
    }

    const structural = this.rejectStructural(command);
    if (structural) {
      return structural;
    }

    if (this.state.paused) {
      if (command.type === 'startWave') {
        return reject('paused');
      }
      return this.apply(command);
    }

    this.state.pending.push(cloneCommand(command));
    return { ok: true, queued: true };
  }

  step(): void {
    this.state.tick += 1;
    const queued = this.state.pending;
    this.state.pending = [];
    for (const command of queued) {
      this.apply(command);
    }
    runSimulationSystems(this.state);
  }

  getState(): GameState {
    return structuredClone(this.state);
  }

  getSnapshot(): string {
    const state = this.state;
    return JSON.stringify({
      tick: state.tick,
      phase: state.phase,
      gold: state.gold,
      integrity: state.integrity,
      wave: state.wave,
      score: state.score,
      towers: state.towers,
      enemies: state.enemies,
      projectiles: state.projectiles,
      effects: state.effects,
      spawnQueue: state.spawnQueue,
      rngState: state.rngState,
      paused: state.paused,
      speed: state.speed,
      nextTowerId: state.nextTowerId,
      nextEnemyId: state.nextEnemyId,
      nextProjectileId: state.nextProjectileId,
      history: state.history,
      pending: state.pending,
    });
  }

  setPaused(paused: boolean): void {
    this.state.paused = paused;
  }

  setSpeed(speed: 1 | 2): void {
    if (speed !== 1 && speed !== 2) {
      return;
    }
    this.state.speed = speed;
  }

  isPaused(): boolean {
    return this.state.paused;
  }

  getSpeed(): 1 | 2 {
    return this.state.speed;
  }

  private rejectStructural(command: Command): CommandResult | undefined {
    if (command.type === 'placeTower') {
      if (!padById(command.padId)) {
        return reject('unknown-pad');
      }
      if (!isKnownTower(command.towerType)) {
        return reject('unknown-tower');
      }
    }
    if (command.type === 'setTargeting' && !isTargetingMode(command.mode)) {
      return reject('bad-targeting');
    }
    return undefined;
  }

  private apply(command: Command): CommandResult {
    const recorded = cloneCommand(command);
    switch (recorded.type) {
      case 'placeTower':
        return this.applyPlace(recorded);
      case 'upgradeTower':
        return this.applyUpgrade(recorded);
      case 'sellTower':
        return this.applySell(recorded);
      case 'setTargeting':
        return this.applyTargeting(recorded);
      case 'startWave':
        return this.applyStartWave(recorded);
      case 'reset':
        this.reset(recorded.seed);
        return { ok: true };
      default: {
        const unexpected: never = recorded;
        return unexpected;
      }
    }
  }

  private applyPlace(command: Extract<Command, { type: 'placeTower' }>): CommandResult {
    if (!padById(command.padId)) {
      return reject('unknown-pad');
    }
    if (!isKnownTower(command.towerType)) {
      return reject('unknown-tower');
    }
    const def = towerDef(command.towerType);
    if (this.state.towers.some((tower) => tower.padId === command.padId)) {
      return reject('occupied');
    }
    if (this.state.gold < def.cost) {
      return reject('insufficient-gold');
    }
    const tower: TowerState = {
      id: `t${this.state.nextTowerId}`,
      towerType: command.towerType,
      padId: command.padId,
      level: 1,
      invested: def.cost,
      targeting: DEFAULT_TARGETING,
      cooldown: 0,
    };
    this.state.gold -= def.cost;
    this.state.nextTowerId += 1;
    this.state.towers.push(tower);
    this.state.history.push(command);
    return { ok: true };
  }

  private applyUpgrade(command: Extract<Command, { type: 'upgradeTower' }>): CommandResult {
    const tower = this.state.towers.find((item) => item.id === command.towerId);
    if (!tower) {
      return reject('missing-tower');
    }
    if (tower.level === 3) {
      return reject('max-level');
    }
    const cost = towerDef(tower.towerType).upgradeCosts[tower.level - 1];
    if (this.state.gold < cost) {
      return reject('insufficient-gold');
    }
    this.state.gold -= cost;
    tower.invested += cost;
    tower.level = tower.level === 1 ? 2 : 3;
    this.state.history.push(command);
    return { ok: true };
  }

  private applySell(command: Extract<Command, { type: 'sellTower' }>): CommandResult {
    const index = this.state.towers.findIndex((item) => item.id === command.towerId);
    if (index < 0) {
      return reject('missing-tower');
    }
    const tower = this.state.towers[index];
    this.state.gold += sellRefund(tower.invested);
    this.state.towers.splice(index, 1);
    this.state.history.push(command);
    return { ok: true };
  }

  private applyTargeting(command: Extract<Command, { type: 'setTargeting' }>): CommandResult {
    if (!isTargetingMode(command.mode)) {
      return reject('bad-targeting');
    }
    const tower = this.state.towers.find((item) => item.id === command.towerId);
    if (!tower) {
      return reject('missing-tower');
    }
    tower.targeting = command.mode;
    this.state.history.push(command);
    return { ok: true };
  }

  private applyStartWave(command: Extract<Command, { type: 'startWave' }>): CommandResult {
    if (this.state.phase === 'wave') {
      return reject('wave-active');
    }
    if (this.state.phase === 'victory' || this.state.phase === 'defeat') {
      return reject('ended');
    }
    this.state.phase = 'wave';
    this.state.history.push(command);
    return { ok: true };
  }
}
