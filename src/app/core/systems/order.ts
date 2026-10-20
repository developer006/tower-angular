import { DT } from '../game/loop';
import type { GameState } from '../game/state';
import { applyDamage } from './damage';
import { fireTowers } from './firing';
import { moveEnemies } from './movement';
import { moveProjectiles } from './projectiles';
import { spawnDue } from './spawn';
import { acquireTargets } from './targeting';

export { applyDamage, acquireTargets, fireTowers, moveEnemies, moveProjectiles, spawnDue };

export function tickSlow(state: GameState): void {
  for (const enemy of state.enemies) {
    if (enemy.slowRemaining <= 0) {
      enemy.slowStrength = 0;
      enemy.slowRemaining = 0;
      continue;
    }
    enemy.slowRemaining = Math.max(0, enemy.slowRemaining - DT);
    if (enemy.slowRemaining === 0) {
      enemy.slowStrength = 0;
    }
  }
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
