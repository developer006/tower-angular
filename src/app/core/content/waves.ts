import type { SpawnEvent, WaveDef } from './types';
import { GROUP_DELAY, SPAWN_INTERVAL, WAVE_COUNT } from './types';

export const WAVES: readonly WaveDef[] = [
  { wave: 1, groups: [{ type: 'drone', count: 8 }] },
  { wave: 2, groups: [{ type: 'drone', count: 10 }, { type: 'runner', count: 4 }] },
  { wave: 3, groups: [{ type: 'swarm', count: 16 }, { type: 'drone', count: 6 }] },
  { wave: 4, groups: [{ type: 'tank', count: 4 }, { type: 'drone', count: 8 }] },
  { wave: 5, groups: [{ type: 'runner', count: 10 }, { type: 'swarm', count: 8 }] },
  {
    wave: 6,
    groups: [
      { type: 'tank', count: 6 },
      { type: 'drone', count: 10 },
      { type: 'runner', count: 6 },
    ],
  },
  { wave: 7, groups: [{ type: 'swarm', count: 20 }, { type: 'tank', count: 4 }] },
  {
    wave: 8,
    groups: [
      { type: 'runner', count: 12 },
      { type: 'drone', count: 8 },
      { type: 'tank', count: 4 },
    ],
  },
  {
    wave: 9,
    groups: [
      { type: 'tank', count: 8 },
      { type: 'swarm', count: 20 },
      { type: 'runner', count: 10 },
    ],
  },
  {
    wave: 10,
    groups: [
      { type: 'drone', count: 10 },
      { type: 'runner', count: 6 },
      { type: 'tank', count: 4 },
      { type: 'overlord', count: 1 },
    ],
  },
];

export function getWave(waveNumber: number): WaveDef {
  const found = WAVES.find((wave) => wave.wave === waveNumber);
  if (!found) {
    throw new Error(`unknown wave ${waveNumber}`);
  }
  return found;
}

export function expandWave(
  wave: WaveDef,
  spawnInterval = SPAWN_INTERVAL,
  groupDelay = GROUP_DELAY,
): SpawnEvent[] {
  const events: SpawnEvent[] = [];
  let time = 0;
  wave.groups.forEach((group, groupIndex) => {
    if (groupIndex > 0) {
      time += groupDelay;
    }
    for (let i = 0; i < group.count; i++) {
      if (i > 0) {
        time += spawnInterval;
      }
      events.push({ type: group.type, time });
    }
  });
  return events;
}

export function assertWaveTable(): void {
  if (WAVES.length !== WAVE_COUNT) {
    throw new Error('expected 10 waves');
  }
}
