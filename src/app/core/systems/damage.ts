import { MAP_01 } from '../content/map-01';
import { enemyDef } from '../content/enemies';
import { MIN_HIT_DAMAGE, type Vec2 } from '../content/types';
import { distanceSquared, tilesToPixels } from '../game/math';
import { samplePath } from '../game/path';
import type { EnemyState, GameState } from '../game/state';
import { asFlight, type FlightProjectile } from './projectiles';

function enemyPosition(enemy: EnemyState): Vec2 {
  return samplePath(MAP_01.geometry, enemy.distanceAlongPath).position;
}

function hitDamage(damage: number, armor: number): number {
  return Math.max(MIN_HIT_DAMAGE, damage - armor);
}

function applySlow(enemy: EnemyState, strength: number, duration: number): void {
  const effective = strength * (1 - enemyDef(enemy.enemyType).slowResistance);
  if (effective > enemy.slowStrength) {
    enemy.slowStrength = effective;
    enemy.slowRemaining = duration;
    return;
  }
  if (effective === enemy.slowStrength) {
    enemy.slowRemaining = duration;
  }
}

function victimsOf(state: GameState, projectile: FlightProjectile, impact: Vec2): EnemyState[] {
  if (projectile.splashRadius <= 0) {
    const target = state.enemies.find((enemy) => enemy.id === projectile.targetId && enemy.alive);
    return target ? [target] : [];
  }
  const radius = tilesToPixels(projectile.splashRadius);
  const radiusSq = radius * radius;
  return state.enemies.filter(
    (enemy) => enemy.alive && distanceSquared(impact, enemyPosition(enemy)) <= radiusSq,
  );
}

function removeDead(state: GameState): void {
  for (let index = 0; index < state.enemies.length; ) {
    const enemy = state.enemies[index];
    if (enemy.hp > 0) {
      index += 1;
      continue;
    }
    state.kills = (state.kills ?? 0) + 1;
    state.gold += enemyDef(enemy.enemyType).bounty;
    state.enemies.splice(index, 1);
  }
}

function resolveImpact(state: GameState, projectile: FlightProjectile): void {
  const target = state.enemies.find((enemy) => enemy.id === projectile.targetId && enemy.alive);
  if (!target) {
    return;
  }
  const impact = { x: projectile.x, y: projectile.y };
  for (const enemy of victimsOf(state, projectile, impact)) {
    enemy.hp -= hitDamage(projectile.damage, enemyDef(enemy.enemyType).armor);
    if (
      enemy.id === projectile.targetId &&
      projectile.slowStrength !== undefined &&
      projectile.slowDuration !== undefined
    ) {
      applySlow(enemy, projectile.slowStrength, projectile.slowDuration);
    }
  }
  removeDead(state);
}

export function applyDamage(state: GameState): void {
  for (let index = 0; index < state.projectiles.length; ) {
    const projectile = asFlight(state.projectiles[index]);
    if (!projectile.impacted) {
      index += 1;
      continue;
    }
    resolveImpact(state, projectile);
    state.projectiles.splice(index, 1);
  }
}
