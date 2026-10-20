import type { TowerDef, TowerLevelStats, TowerType } from './types';

function level(
  base: TowerLevelStats,
  damageScale: number,
  rateScale: number,
  rangeScale: number,
  extra: Partial<TowerLevelStats> = {},
): TowerLevelStats {
  return {
    damage: base.damage * damageScale,
    rate: base.rate * rateScale,
    range: base.range * rangeScale,
    ...extra,
  };
}

const pulseBase: TowerLevelStats = { damage: 12, rate: 1.8, range: 3.2 };
const mortarBase: TowerLevelStats = { damage: 34, rate: 0.55, range: 4, splashRadius: 1 };
const cryoBase: TowerLevelStats = {
  damage: 5,
  rate: 4.8,
  range: 3,
  slowStrength: 0.4,
  slowDuration: 1.5,
};

export const TOWERS: readonly TowerDef[] = [
  {
    type: 'pulse',
    cost: 70,
    upgradeCosts: [50, 70],
    levels: [
      pulseBase,
      level(pulseBase, 1.3, 1.1, 1.08),
      level(pulseBase, 1.6, 1.2, 1.16),
    ],
  },
  {
    type: 'mortar',
    cost: 110,
    upgradeCosts: [75, 110],
    levels: [
      mortarBase,
      level(mortarBase, 1.3, 1.1, 1.08, { splashRadius: 1.15 }),
      level(mortarBase, 1.6, 1.2, 1.16, { splashRadius: 1.3 }),
    ],
  },
  {
    type: 'cryo',
    cost: 90,
    upgradeCosts: [65, 90],
    levels: [
      cryoBase,
      level(cryoBase, 1.3, 1.1, 1.08, { slowStrength: 0.45, slowDuration: 1.7 }),
      level(cryoBase, 1.6, 1.2, 1.16, { slowStrength: 0.5, slowDuration: 1.9 }),
    ],
  },
];

export function towerDef(type: TowerType): TowerDef {
  const found = TOWERS.find((tower) => tower.type === type);
  if (!found) {
    throw new Error(`unknown tower ${type}`);
  }
  return found;
}
