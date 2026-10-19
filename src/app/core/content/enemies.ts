import type { EnemyDef, EnemyType } from './types';

export const ENEMIES: readonly EnemyDef[] = [
  { type: 'drone', hp: 55, speed: 1, armor: 0, bounty: 6, leakDamage: 1, slowResistance: 0 },
  { type: 'runner', hp: 40, speed: 1.7, armor: 0, bounty: 8, leakDamage: 1, slowResistance: 0 },
  { type: 'tank', hp: 300, speed: 0.55, armor: 4, bounty: 18, leakDamage: 2, slowResistance: 0 },
  { type: 'swarm', hp: 22, speed: 1.15, armor: 0, bounty: 3, leakDamage: 1, slowResistance: 0 },
  { type: 'overlord', hp: 2200, speed: 0.45, armor: 6, bounty: 150, leakDamage: 10, slowResistance: 0.5 },
];

export function enemyDef(type: EnemyType): EnemyDef {
  const found = ENEMIES.find((enemy) => enemy.type === type);
  if (!found) {
    throw new Error(`unknown enemy ${type}`);
  }
  return found;
}
