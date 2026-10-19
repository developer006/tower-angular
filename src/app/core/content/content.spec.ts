import { enemyDef, ENEMIES } from './enemies';
import { isPathTile, MAP_01 } from './map-01';
import { towerDef } from './towers';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  computeScore,
  GRID_COLS,
  GRID_ROWS,
  sellRefund,
  STARTING_GOLD,
  STARTING_INTEGRITY,
  TILE_SIZE,
  waveClearBonus,
} from './types';
import { expandWave, getWave, WAVES } from './waves';
import { samplePath } from '../game/path';

describe('content tables', () => {
  it('locks canvas, grid, and starting resources', () => {
    expect(CANVAS_WIDTH).toBe(960);
    expect(CANVAS_HEIGHT).toBe(576);
    expect(TILE_SIZE).toBe(48);
    expect(GRID_COLS).toBe(20);
    expect(GRID_ROWS).toBe(12);
    expect(STARTING_GOLD).toBe(150);
    expect(STARTING_INTEGRITY).toBe(20);
  });

  it('refunds 70% rounded down, not to the nearest 5', () => {
    expect(sellRefund(70)).toBe(49);
    expect(sellRefund(120)).toBe(84);
  });

  it('locks wave-clear bonus and score', () => {
    expect(waveClearBonus(1)).toBe(30);
    expect(waveClearBonus(10)).toBe(75);
    expect(computeScore(3, 2, 8)).toBe(3 * 10 + 2 * 100 + 8 * 25);
  });

  it('locks pulse costs and level growth', () => {
    const pulse = towerDef('pulse');
    expect(pulse.cost).toBe(70);
    expect(pulse.upgradeCosts).toEqual([50, 70]);
    expect(pulse.levels[0].damage).toBe(12);
    expect(pulse.levels[0].rate).toBe(1.8);
    expect(pulse.levels[0].range).toBe(3.2);
    expect(pulse.levels[1].damage).toBeCloseTo(12 * 1.3);
    expect(pulse.levels[2].damage).toBeCloseTo(12 * 1.6);
    expect(pulse.levels[1].rate).toBeCloseTo(1.8 * 1.1);
    expect(pulse.levels[2].rate).toBeCloseTo(1.8 * 1.2);
    expect(pulse.levels[1].range).toBeCloseTo(3.2 * 1.08);
    expect(pulse.levels[2].range).toBeCloseTo(3.2 * 1.16);
  });

  it('locks mortar splash and cryo slow as tables, not multipliers', () => {
    const mortar = towerDef('mortar');
    expect(mortar.upgradeCosts).toEqual([75, 110]);
    expect(mortar.levels[0].splashRadius).toBe(1);
    expect(mortar.levels[1].splashRadius).toBe(1.15);
    expect(mortar.levels[2].splashRadius).toBe(1.3);

    const cryo = towerDef('cryo');
    expect(cryo.upgradeCosts).toEqual([65, 90]);
    expect(cryo.levels[0].slowStrength).toBe(0.4);
    expect(cryo.levels[1].slowStrength).toBe(0.45);
    expect(cryo.levels[2].slowStrength).toBe(0.5);
    expect(cryo.levels[0].slowDuration).toBe(1.5);
    expect(cryo.levels[1].slowDuration).toBe(1.7);
    expect(cryo.levels[2].slowDuration).toBe(1.9);
  });

  it('locks enemy stats and slow resistance', () => {
    const overlord = enemyDef('overlord');
    expect(overlord.hp).toBe(2200);
    expect(overlord.armor).toBe(6);
    expect(overlord.bounty).toBe(150);
    expect(overlord.leakDamage).toBe(10);
    expect(overlord.slowResistance).toBe(0.5);
    expect(enemyDef('drone').hp).toBe(55);
    expect(enemyDef('tank').armor).toBe(4);
    expect(enemyDef('swarm').bounty).toBe(3);
    expect(enemyDef('runner').speed).toBe(1.7);
    for (const enemy of ENEMIES) {
      if (enemy.type !== 'overlord') {
        expect(enemy.slowResistance).toBe(0);
      }
    }
  });

  it('spawns wave 10 with the overlord group last', () => {
    expect(WAVES).toHaveLength(10);
    const wave10 = getWave(10);
    expect(wave10.groups).toHaveLength(4);
    expect(wave10.groups[0]).toEqual({ type: 'drone', count: 10 });
    expect(wave10.groups[wave10.groups.length - 1]).toEqual({ type: 'overlord', count: 1 });
    const events = expandWave(wave10);
    expect(events).toHaveLength(21);
    expect(events[0].type).toBe('drone');
    expect(events[0].time).toBe(0);
    expect(events[events.length - 1].type).toBe('overlord');
    expect(events[events.length - 1].time).toBeCloseTo(25.6);
  });

  it('spaces enemies at 0.8s and groups at 4s, not 4.8s', () => {
    const wave1 = expandWave(getWave(1));
    expect(wave1.map((event) => event.type)).toEqual([
      'drone',
      'drone',
      'drone',
      'drone',
      'drone',
      'drone',
      'drone',
      'drone',
    ]);
    const wave1Times = [0, 0.8, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6];
    wave1.forEach((event, index) => {
      expect(event.time).toBeCloseTo(wave1Times[index]);
    });

    const wave2 = expandWave(getWave(2));
    expect(wave2).toHaveLength(14);
    expect(wave2[10].type).toBe('runner');
    expect(wave2[10].time).toBeCloseTo(11.2);
  });
});

describe('map 01 path', () => {
  it('locks pad ids, entry, core, and path length', () => {
    expect(MAP_01.pads.map((pad) => pad.id)).toEqual([
      'pad-01',
      'pad-02',
      'pad-03',
      'pad-04',
      'pad-05',
      'pad-06',
      'pad-07',
      'pad-08',
      'pad-09',
      'pad-10',
      'pad-11',
      'pad-12',
      'pad-13',
      'pad-14',
    ]);
    expect(MAP_01.entry).toEqual({ col: 0, row: 1 });
    expect(MAP_01.core).toEqual({ col: 19, row: 3 });
    expect(MAP_01.geometry.totalLength).toBe(2064);
  });

  it('keeps every pad off the path and orthogonally adjacent to it', () => {
    for (const pad of MAP_01.pads) {
      expect(isPathTile(pad.col, pad.row)).toBe(false);
      const adjacent =
        isPathTile(pad.col + 1, pad.row) ||
        isPathTile(pad.col - 1, pad.row) ||
        isPathTile(pad.col, pad.row + 1) ||
        isPathTile(pad.col, pad.row - 1);
      expect(adjacent).toBe(true);
    }
  });

  it('samples the path, clamps, and stays stable', () => {
    const start = samplePath(MAP_01.geometry, 0);
    expect(start.position).toEqual({ x: 24, y: 72 });
    expect(start.tangent).toEqual({ x: 1, y: 0 });

    const corner = samplePath(MAP_01.geometry, 384);
    expect(corner.position).toEqual(MAP_01.waypoints[1]);
    expect(corner.tangent).toEqual({ x: 0, y: 1 });

    expect(samplePath(MAP_01.geometry, 2064).position).toEqual({ x: 936, y: 168 });
    expect(samplePath(MAP_01.geometry, -10)).toEqual(samplePath(MAP_01.geometry, 0));
    expect(samplePath(MAP_01.geometry, 99999)).toEqual(samplePath(MAP_01.geometry, 2064));

    const first = samplePath(MAP_01.geometry, 100);
    const second = samplePath(MAP_01.geometry, 100);
    expect(second.position).toEqual(first.position);
    expect(second.tangent).toEqual(first.tangent);
  });
});
