import { Injectable, signal } from '@angular/core';

export const SETTINGS_STORAGE_KEY = 'core-defense:v1';

export interface PersistedSettings {
  bestScore: number;
  bestWave: number;
  soundMuted: boolean;
  reducedMotion: boolean;
  colorblind: boolean;
}

const DEFAULTS: PersistedSettings = {
  bestScore: 0,
  bestWave: 0,
  soundMuted: false,
  reducedMotion: false,
  colorblind: false,
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isSettings(value: unknown): value is PersistedSettings {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    isFiniteNumber(record['bestScore']) &&
    isFiniteNumber(record['bestWave']) &&
    typeof record['soundMuted'] === 'boolean' &&
    typeof record['reducedMotion'] === 'boolean' &&
    typeof record['colorblind'] === 'boolean'
  );
}

function readStorage(): PersistedSettings {
  try {
    const raw = globalThis.localStorage?.getItem(SETTINGS_STORAGE_KEY);
    if (raw == null) {
      return { ...DEFAULTS };
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isSettings(parsed)) {
      return { ...DEFAULTS };
    }
    return {
      bestScore: parsed.bestScore,
      bestWave: parsed.bestWave,
      soundMuted: parsed.soundMuted,
      reducedMotion: parsed.reducedMotion,
      colorblind: parsed.colorblind,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

@Injectable({ providedIn: 'root' })
export class SettingsStore {
  private readonly bestScoreValue = signal(DEFAULTS.bestScore);
  private readonly bestWaveValue = signal(DEFAULTS.bestWave);
  private readonly soundMutedValue = signal(DEFAULTS.soundMuted);
  private readonly reducedMotionValue = signal(DEFAULTS.reducedMotion);
  private readonly colorblindValue = signal(DEFAULTS.colorblind);

  readonly bestScore = this.bestScoreValue.asReadonly();
  readonly bestWave = this.bestWaveValue.asReadonly();
  readonly soundMuted = this.soundMutedValue.asReadonly();
  readonly reducedMotion = this.reducedMotionValue.asReadonly();
  readonly colorblind = this.colorblindValue.asReadonly();

  constructor() {
    this.load();
  }

  load(): void {
    const next = readStorage();
    this.bestScoreValue.set(next.bestScore);
    this.bestWaveValue.set(next.bestWave);
    this.soundMutedValue.set(next.soundMuted);
    this.reducedMotionValue.set(next.reducedMotion);
    this.colorblindValue.set(next.colorblind);
  }

  recordRunEnd(score: number, bestWave: number): void {
    const nextScore =
      isFiniteNumber(score) && score > this.bestScoreValue() ? score : this.bestScoreValue();
    const nextWave =
      isFiniteNumber(bestWave) && bestWave > this.bestWaveValue() ? bestWave : this.bestWaveValue();
    if (nextScore === this.bestScoreValue() && nextWave === this.bestWaveValue()) {
      return;
    }
    this.bestScoreValue.set(nextScore);
    this.bestWaveValue.set(nextWave);
    this.persist();
  }

  toggleSoundMuted(): void {
    this.soundMutedValue.update((muted) => !muted);
    this.persist();
  }

  toggleReducedMotion(): void {
    this.reducedMotionValue.update((enabled) => !enabled);
    this.persist();
  }

  toggleColorblind(): void {
    this.colorblindValue.update((enabled) => !enabled);
    this.persist();
  }

  private persist(): void {
    const payload: PersistedSettings = {
      bestScore: this.bestScoreValue(),
      bestWave: this.bestWaveValue(),
      soundMuted: this.soundMutedValue(),
      reducedMotion: this.reducedMotionValue(),
      colorblind: this.colorblindValue(),
    };
    try {
      globalThis.localStorage?.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      return;
    }
  }
}
