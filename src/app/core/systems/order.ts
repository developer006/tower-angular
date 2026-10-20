import type { GameState } from '../game/state';
import { moveEnemies } from './movement';
import { spawnDue } from './spawn';

export { moveEnemies, spawnDue };

export function tickSlow(state: GameState): void {
  void state;
}

export function acquireTargets(state: GameState): void {
  void state;
}

export function fireTowers(state: GameState): void {
  void state;
}

export function moveProjectiles(state: GameState): void {
  void state;
}

export function applyDamage(state: GameState): void {
  void state;
}

export function advanceWave(state: GameState): void {
  void state;
}

export function tickEffects(state: GameState): void {
  void state;
}

export function runSimulationSystems(state: GameState): void {
  spawnDue(state);
  tickSlow(state);
  moveEnemies(state);
  acquireTargets(state);
  fireTowers(state);
  moveProjectiles(state);
  applyDamage(state);
  advanceWave(state);
  tickEffects(state);
}
