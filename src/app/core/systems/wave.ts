import { computeScore, WAVE_COUNT, waveClearBonus } from '../content/types';
import type { GameState, Phase } from '../game/state';

const settledRuns = new WeakSet<GameState>();

export interface LiveSnapshot {
  phase: Phase;
  wave: number;
  integrity: number;
}

export function counters(state: GameState): { kills: number; wavesCleared: number; bestWave: number } {
  return {
    kills: state.kills ?? 0,
    wavesCleared: state.wavesCleared ?? 0,
    bestWave: state.bestWave ?? 0,
  };
}

function settleScore(state: GameState): void {
  if (settledRuns.has(state)) {
    return;
  }
  settledRuns.add(state);
  const { kills, wavesCleared } = counters(state);
  state.score = computeScore(kills, wavesCleared, state.integrity);
}

function waveIsEmpty(state: GameState): boolean {
  return (
    state.spawnQueue.length === 0 &&
    state.projectiles.length === 0 &&
    state.enemies.every((enemy) => !enemy.alive)
  );
}

export function advanceWave(state: GameState): void {
  if (state.phase === 'victory' || state.phase === 'defeat') {
    settleScore(state);
    return;
  }
  if (state.phase !== 'wave' || !waveIsEmpty(state)) {
    return;
  }
  if (state.integrity <= 0) {
    state.phase = 'defeat';
    settleScore(state);
    return;
  }
  state.gold += waveClearBonus(state.wave);
  state.wavesCleared = (state.wavesCleared ?? 0) + 1;
  if (state.wave >= WAVE_COUNT) {
    state.phase = 'victory';
    settleScore(state);
    return;
  }
  state.phase = 'build';
  state.wave += 1;
}

/** One sentence for the live region. Later events replace earlier ones; never joined. */
export function nextLiveAnnouncement(previous: LiveSnapshot, current: LiveSnapshot): string | null {
  if (current.phase === 'victory' && previous.phase !== 'victory') {
    return 'Victory. The core holds.';
  }
  if (current.phase === 'defeat' && previous.phase !== 'defeat') {
    return 'Defeat. The core is lost.';
  }
  if (previous.phase === 'wave' && current.phase === 'build') {
    return `Wave ${previous.wave} cleared.`;
  }
  if (current.integrity < previous.integrity) {
    return `Core hit. Integrity ${current.integrity}.`;
  }
  if (current.phase === 'wave' && previous.phase !== 'wave') {
    return `Wave ${current.wave} deployed.`;
  }
  return null;
}
