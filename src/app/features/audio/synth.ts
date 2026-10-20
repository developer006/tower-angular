export type SynthCue = 'place' | 'leak' | 'victory' | 'defeat';

const BURST: Record<SynthCue, { frequency: number; seconds: number }> = {
  place: { frequency: 880, seconds: 0.07 },
  leak: { frequency: 196, seconds: 0.14 },
  victory: { frequency: 660, seconds: 0.18 },
  defeat: { frequency: 131, seconds: 0.2 },
};

interface OscillatorBurst {
  type: OscillatorType;
  frequency: { value: number };
  connect(node: unknown): void;
  start(when?: number): void;
  stop(when?: number): void;
}

interface GainBurst {
  gain: { value: number };
  connect(node: unknown): void;
}

interface BurstContext {
  currentTime: number;
  destination: unknown;
  state?: string;
  resume?(): Promise<void> | void;
  createOscillator(): OscillatorBurst;
  createGain(): GainBurst;
}

type BurstContextCtor = new () => BurstContext;

let shared: BurstContext | null = null;
let sharedCtor: BurstContextCtor | null = null;

/** One oscillator burst. Muted play does not look up or construct AudioContext. */
export function play(cue: SynthCue, muted = false): void {
  if (muted) {
    return;
  }
  try {
    const Ctor = lookupAudioContext();
    if (!Ctor) {
      return;
    }
    const ctx = acquire(Ctor);
    const burst = BURST[cue];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = burst.frequency;
    gain.gain.value = 0.12;
    osc.connect(gain);
    gain.connect(ctx.destination);
    unlock(ctx);
    const now = Number.isFinite(ctx.currentTime) ? ctx.currentTime : 0;
    osc.start(now);
    osc.stop(now + burst.seconds);
  } catch {
    return;
  }
}

function lookupAudioContext(): BurstContextCtor | null {
  const host = globalThis as { AudioContext?: BurstContextCtor };
  return typeof host.AudioContext === 'function' ? host.AudioContext : null;
}

function acquire(Ctor: BurstContextCtor): BurstContext {
  if (shared && sharedCtor === Ctor) {
    return shared;
  }
  const created = new Ctor();
  shared = created;
  sharedCtor = Ctor;
  return created;
}

function unlock(ctx: BurstContext): void {
  if (ctx.state !== 'suspended') {
    return;
  }
  const pending = ctx.resume?.();
  if (pending && typeof pending.catch === 'function') {
    pending.catch(() => undefined);
  }
}
