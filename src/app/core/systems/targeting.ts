import { MAP_01, padById, tileCenter } from '../content/map-01';
import { towerDef } from '../content/towers';
import type { TargetingMode, Vec2 } from '../content/types';
import { distanceSquared, tilesToPixels } from '../game/math';
import { samplePath } from '../game/path';
import type { EnemyState, GameState, TowerState } from '../game/state';

type AimedTower = TowerState & { targetId?: string };

export function readTarget(tower: TowerState): string | undefined {
  return (tower as AimedTower).targetId;
}

export function writeTarget(tower: TowerState, targetId: string | undefined): void {
  const aimed = tower as AimedTower;
  if (targetId === undefined) {
    delete aimed.targetId;
    return;
  }
  aimed.targetId = targetId;
}

function enemyPosition(enemy: EnemyState): Vec2 {
  return samplePath(MAP_01.geometry, enemy.distanceAlongPath).position;
}

function inRange(towerPos: Vec2, enemy: EnemyState, rangeTiles: number): boolean {
  const rangePx = tilesToPixels(rangeTiles);
  return distanceSquared(towerPos, enemyPosition(enemy)) <= rangePx * rangePx;
}

function idNumber(id: string): number {
  const parsed = Number(id.slice(1));
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function beats(mode: TargetingMode, towerPos: Vec2, candidate: EnemyState, best: EnemyState): boolean {
  if (mode === 'strongest' && candidate.hp !== best.hp) {
    return candidate.hp > best.hp;
  }
  if (mode === 'closest') {
    const candidateDist = distanceSquared(towerPos, enemyPosition(candidate));
    const bestDist = distanceSquared(towerPos, enemyPosition(best));
    if (candidateDist !== bestDist) {
      return candidateDist < bestDist;
    }
  }
  if (candidate.distanceAlongPath !== best.distanceAlongPath) {
    return candidate.distanceAlongPath > best.distanceAlongPath;
  }
  return idNumber(candidate.id) < idNumber(best.id);
}

export function acquireTargets(state: GameState): void {
  for (const tower of state.towers) {
    const pad = padById(tower.padId);
    if (!pad) {
      writeTarget(tower, undefined);
      continue;
    }
    const towerPos = tileCenter(pad.col, pad.row);
    const range = towerDef(tower.towerType).levels[tower.level - 1].range;
    const currentId = readTarget(tower);
    const current = state.enemies.find((enemy) => enemy.id === currentId);
    if (!current || !current.alive || !inRange(towerPos, current, range)) {
      writeTarget(tower, undefined);
    }

    let best: EnemyState | undefined;
    for (const enemy of state.enemies) {
      if (!enemy.alive || !inRange(towerPos, enemy, range)) {
        continue;
      }
      if (!best || beats(tower.targeting, towerPos, enemy, best)) {
        best = enemy;
      }
    }
    writeTarget(tower, best?.id);
  }
}
