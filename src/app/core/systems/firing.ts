import { padById, tileCenter } from '../content/map-01';
import { towerDef } from '../content/towers';
import { DT } from '../game/loop';
import type { GameState } from '../game/state';
import type { FlightProjectile } from './projectiles';
import { readTarget } from './targeting';

export function fireTowers(state: GameState): void {
  for (const tower of state.towers) {
    tower.cooldown = Math.max(0, tower.cooldown - DT);
    const targetId = readTarget(tower);
    if (tower.cooldown !== 0 || targetId === undefined) {
      continue;
    }
    const pad = padById(tower.padId);
    if (!pad) {
      continue;
    }
    const stats = towerDef(tower.towerType).levels[tower.level - 1];
    const origin = tileCenter(pad.col, pad.row);
    const id = state.nextProjectileId;
    state.nextProjectileId += 1;
    const projectile: FlightProjectile = {
      id: `p${id}`,
      towerId: tower.id,
      targetId,
      x: origin.x,
      y: origin.y,
      damage: stats.damage,
      splashRadius: stats.splashRadius ?? 0,
    };
    if (stats.slowStrength !== undefined && stats.slowDuration !== undefined) {
      projectile.slowStrength = stats.slowStrength;
      projectile.slowDuration = stats.slowDuration;
    }
    state.projectiles.push(projectile);
    tower.cooldown += 1 / stats.rate;
  }
}
