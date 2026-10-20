import { MAP_01 } from '../content/map-01';
import { DT } from '../game/loop';
import { tilesToPixels } from '../game/math';
import type { EnemyState, GameState } from '../game/state';

const PATH_LENGTH = MAP_01.geometry.totalLength;

type TrackedEnemy = EnemyState & { travelFactor?: number };

export function moveEnemies(state: GameState): void {
  if (state.phase === 'defeat') {
    return;
  }
  for (let index = 0; index < state.enemies.length; index += 1) {
    const enemy = state.enemies[index] as TrackedEnemy;
    if (!enemy.alive || enemy.spawnedAtTick === state.tick) {
      continue;
    }
    const factor = 1 - enemy.slowStrength;
    if (enemy.travelOrigin === undefined || enemy.travelFactor !== factor) {
      enemy.travelOrigin = enemy.distanceAlongPath;
      enemy.travelTicks = 0;
      enemy.travelFactor = factor;
    }
    const traveled = (enemy.travelTicks ?? 0) + 1;
    const origin = enemy.travelOrigin ?? enemy.distanceAlongPath;
    enemy.travelTicks = traveled;
    enemy.travelOrigin = origin;
    if (factor === 1) {
      // Product of speed * tilesToPixels(1) * DT * ticks. Sixty adds from 0 are 1 ULP under 48.
      enemy.distanceAlongPath = origin + enemy.speed * tilesToPixels(1) * DT * traveled;
    } else {
      // (tiles * ticks * factor) / (1/DT) is 28.8 at 60% for 60 ticks. * DT * factor is not.
      enemy.distanceAlongPath =
        origin + (enemy.speed * tilesToPixels(1) * traveled * factor) / (1 / DT);
    }
    if (enemy.distanceAlongPath < PATH_LENGTH) {
      continue;
    }
    state.enemies.splice(index, 1);
    index -= 1;
    state.integrity = Math.max(0, state.integrity - enemy.leakDamage);
    if (state.integrity === 0) {
      state.phase = 'defeat';
      return;
    }
  }
}
