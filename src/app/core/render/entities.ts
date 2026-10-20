import { MAP_01, padById, tileCenter } from '../content/map-01';
import type { EnemyType, TowerType } from '../content/types';
import { samplePath } from '../game/path';
import type { DrawContext } from './background';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './layout';

export interface ActorFrame {
  towers: readonly {
    towerType: TowerType;
    padId: string;
    level: number;
  }[];
  enemies: readonly {
    enemyType: EnemyType;
    distanceAlongPath: number;
    alive: boolean;
  }[];
  projectiles: readonly {
    x: number;
    y: number;
  }[];
}

const TOWER_FILL: Record<TowerType, string> = {
  pulse: '#3ec6ff',
  mortar: '#ffb703',
  cryo: '#7cffb2',
};

const ENEMY_FILL: Record<EnemyType, string> = {
  drone: '#ff4d6d',
  runner: '#ff8c42',
  tank: '#c77dff',
  swarm: '#f72585',
  overlord: '#ffd166',
};

const MARK_STROKE = '#f4f7fb';
const PROJECTILE_FILL = '#fff4c8';
const PROJECTILE_STROKE = '#ff4d6d';

interface Mark {
  x: number;
  y: number;
  paint: () => void;
}

export function drawActors(
  ctx: DrawContext,
  width: number,
  height: number,
  frame: ActorFrame,
): void {
  if (!(width > 0) || !(height > 0)) {
    return;
  }
  const scaleX = width / LOGICAL_WIDTH;
  const scaleY = height / LOGICAL_HEIGHT;
  const marks: Mark[] = [];

  for (const tower of frame.towers) {
    const pad = padById(tower.padId);
    if (!pad) {
      continue;
    }
    const center = tileCenter(pad.col, pad.row);
    const x = center.x * scaleX;
    const y = center.y * scaleY;
    const radius = (12 + Math.max(0, tower.level - 1) * 2) * scaleX;
    marks.push({
      x: center.x,
      y: center.y,
      paint: () => {
        paintTower(ctx, tower.towerType, x, y, radius, scaleX, scaleY);
      },
    });
  }

  for (const enemy of frame.enemies) {
    if (!enemy.alive) {
      continue;
    }
    const position = samplePath(MAP_01.geometry, enemy.distanceAlongPath).position;
    const x = position.x * scaleX;
    const y = position.y * scaleY;
    const radius = enemyRadius(enemy.enemyType) * scaleX;
    marks.push({
      x: position.x,
      y: position.y,
      paint: () => {
        paintEnemy(ctx, enemy.enemyType, x, y, radius, scaleX, scaleY);
      },
    });
  }

  for (const projectile of frame.projectiles) {
    const x = projectile.x * scaleX;
    const y = projectile.y * scaleY;
    const radius = 4 * scaleX;
    marks.push({
      x: projectile.x,
      y: projectile.y,
      paint: () => {
        paintCircle(ctx, x, y, radius, PROJECTILE_FILL, PROJECTILE_STROKE, scaleX);
      },
    });
  }

  marks.sort((left, right) => left.y - right.y || left.x - right.x);
  for (const mark of marks) {
    mark.paint();
  }
}

function paintTower(
  ctx: DrawContext,
  towerType: TowerType,
  x: number,
  y: number,
  radius: number,
  scaleX: number,
  scaleY: number,
): void {
  const fill = TOWER_FILL[towerType];
  if (towerType === 'mortar') {
    paintRect(ctx, x, y, radius * 2, radius * 2 * (scaleY / scaleX), fill, scaleX);
    return;
  }
  if (towerType === 'cryo') {
    paintDiamond(ctx, x, y, radius, radius * (scaleY / scaleX), fill, scaleX);
    return;
  }
  paintCircle(ctx, x, y, radius, fill, MARK_STROKE, scaleX);
}

function paintEnemy(
  ctx: DrawContext,
  enemyType: EnemyType,
  x: number,
  y: number,
  radius: number,
  scaleX: number,
  scaleY: number,
): void {
  const fill = ENEMY_FILL[enemyType];
  if (enemyType === 'runner') {
    paintTriangle(ctx, x, y, radius, radius * (scaleY / scaleX), fill, scaleX);
    return;
  }
  if (enemyType === 'tank') {
    paintRect(ctx, x, y, radius * 2, radius * 2 * (scaleY / scaleX), fill, scaleX);
    return;
  }
  paintCircle(ctx, x, y, radius, fill, MARK_STROKE, scaleX);
}

function enemyRadius(enemyType: EnemyType): number {
  switch (enemyType) {
    case 'runner':
      return 8;
    case 'tank':
      return 12;
    case 'swarm':
      return 5;
    case 'overlord':
      return 16;
    default:
      return 8;
  }
}

function paintCircle(
  ctx: DrawContext,
  x: number,
  y: number,
  radius: number,
  fill: string,
  stroke: string,
  scaleX: number,
): void {
  ctx.beginPath();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2 * scaleX;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function paintRect(
  ctx: DrawContext,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  scaleX: number,
): void {
  const left = x - width / 2;
  const top = y - height / 2;
  ctx.fillStyle = fill;
  ctx.strokeStyle = MARK_STROKE;
  ctx.lineWidth = 2 * scaleX;
  ctx.fillRect(left, top, width, height);
  ctx.strokeRect(left, top, width, height);
}

function paintDiamond(
  ctx: DrawContext,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  fill: string,
  scaleX: number,
): void {
  ctx.beginPath();
  ctx.fillStyle = fill;
  ctx.strokeStyle = MARK_STROKE;
  ctx.lineWidth = 2 * scaleX;
  ctx.moveTo(x, y - radiusY);
  ctx.lineTo(x + radiusX, y);
  ctx.lineTo(x, y + radiusY);
  ctx.lineTo(x - radiusX, y);
  ctx.lineTo(x, y - radiusY);
  ctx.fill();
  ctx.stroke();
}

function paintTriangle(
  ctx: DrawContext,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  fill: string,
  scaleX: number,
): void {
  ctx.beginPath();
  ctx.fillStyle = fill;
  ctx.strokeStyle = MARK_STROKE;
  ctx.lineWidth = 2 * scaleX;
  ctx.moveTo(x, y - radiusY);
  ctx.lineTo(x + radiusX, y + radiusY);
  ctx.lineTo(x - radiusX, y + radiusY);
  ctx.lineTo(x, y - radiusY);
  ctx.fill();
  ctx.stroke();
}
