import { MAP_01 } from '../content/map-01';
import { DT } from '../game/loop';
import { tilesToPixels } from '../game/math';
import { samplePath } from '../game/path';
import type { GameState, ProjectileState } from '../game/state';

export const PROJECTILE_TILES_PER_SECOND = 8;

export interface FlightProjectile extends ProjectileState {
  impacted?: boolean;
  slowStrength?: number;
  slowDuration?: number;
}

export function asFlight(projectile: ProjectileState): FlightProjectile {
  return projectile;
}

export function moveProjectiles(state: GameState): void {
  const step = tilesToPixels(PROJECTILE_TILES_PER_SECOND) * DT;
  const stepSq = step * step;
  for (let index = 0; index < state.projectiles.length; ) {
    const projectile = asFlight(state.projectiles[index]);
    if (projectile.impacted) {
      index += 1;
      continue;
    }
    const target = state.enemies.find((enemy) => enemy.id === projectile.targetId && enemy.alive);
    if (!target) {
      state.projectiles.splice(index, 1);
      continue;
    }
    const position = samplePath(MAP_01.geometry, target.distanceAlongPath).position;
    const dx = position.x - projectile.x;
    const dy = position.y - projectile.y;
    const distSq = dx * dx + dy * dy;
    if (distSq <= stepSq) {
      projectile.x = position.x;
      projectile.y = position.y;
      projectile.impacted = true;
      index += 1;
      continue;
    }
    const dist = Math.sqrt(distSq);
    projectile.x += (dx / dist) * step;
    projectile.y += (dy / dist) * step;
    index += 1;
  }
}
