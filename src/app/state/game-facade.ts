import { Injectable, signal, type Signal, type WritableSignal } from '@angular/core';
import { MAP_01 } from '../core/content/map-01';
import { GameEngine } from '../core/game/engine';
import { advanceFrame, createLoop } from '../core/game/loop';
import type { Command, CommandResult, GameState } from '../core/game/state';

export interface ScenarioOptions {
  seed: number;
  integrity?: number;
  wave?: number;
  gold?: number;
}

export interface HudSnapshot {
  gold: number;
  integrity: number;
  wave: number;
  score: number;
  phase: string;
  tick: number;
}

export interface HarnessMap {
  padIds: string[];
  waypoints: { x: number; y: number }[];
  entry: { col: number; row: number };
  core: { col: number; row: number };
}

@Injectable()
export class GameFacade {
  readonly gold: Signal<number>;
  readonly integrity: Signal<number>;
  readonly wave: Signal<number>;
  readonly score: Signal<number>;
  readonly paused: Signal<boolean>;
  readonly speed: Signal<1 | 2>;

  private readonly engine = new GameEngine(1);
  private readonly loop = createLoop();
  private readonly goldValue: WritableSignal<number>;
  private readonly integrityValue: WritableSignal<number>;
  private readonly waveValue: WritableSignal<number>;
  private readonly scoreValue: WritableSignal<number>;
  private readonly pausedValue: WritableSignal<boolean>;
  private readonly speedValue: WritableSignal<1 | 2>;
  private renderCallback: (() => void) | null = null;
  private frameHandle = 0;
  private running = false;
  private primed = false;
  private manual = false;
  private lastTime = 0;
  private discardHiddenTime = false;
  private visibilityBound = false;
  private stepResultHandler: ((results: CommandResult[]) => void) | null = null;
  private readonly onVisibilityChange = (): void => {
    if (documentHidden()) {
      this.discardHiddenTime = true;
    }
  };

  constructor() {
    const state = this.engine.getState();
    this.goldValue = signal(state.gold);
    this.integrityValue = signal(state.integrity);
    this.waveValue = signal(state.wave);
    this.scoreValue = signal(state.score);
    this.pausedValue = signal(state.paused);
    this.speedValue = signal(state.speed);
    this.gold = this.goldValue.asReadonly();
    this.integrity = this.integrityValue.asReadonly();
    this.wave = this.waveValue.asReadonly();
    this.score = this.scoreValue.asReadonly();
    this.paused = this.pausedValue.asReadonly();
    this.speed = this.speedValue.asReadonly();
  }

  refresh(): void {
    const state = this.engine.getState();
    this.goldValue.set(state.gold);
    this.integrityValue.set(state.integrity);
    this.waveValue.set(state.wave);
    this.scoreValue.set(state.score);
    this.pausedValue.set(state.paused);
    this.speedValue.set(state.speed);
  }

  stepTicks(n: number): void {
    for (let i = 0; i < n; i += 1) {
      this.engine.step();
    }
    this.publishStepResults();
    this.refresh();
    this.renderCallback?.();
  }

  setManualMode(enabled: boolean): void {
    this.manual = enabled;
  }

  dispatch(command: Command): CommandResult {
    const result = this.engine.dispatch(command);
    this.refresh();
    return result;
  }

  setPaused(paused: boolean): void {
    this.engine.setPaused(paused);
    this.refresh();
  }

  togglePaused(): void {
    this.setPaused(!this.engine.isPaused());
  }

  toggleSpeed(): void {
    this.engine.setSpeed(this.engine.getSpeed() === 1 ? 2 : 1);
    this.refresh();
  }

  reset(options: ScenarioOptions): void {
    this.engine.configureScenario(options);
    this.refresh();
  }

  getState(): HudSnapshot {
    const state = this.engine.getState();
    return {
      gold: state.gold,
      integrity: state.integrity,
      wave: state.wave,
      score: state.score,
      phase: state.phase,
      tick: state.tick,
    };
  }

  getLoop(): { accumulator: number } {
    return { accumulator: this.loop.accumulator };
  }

  getFullState(): GameState {
    return this.engine.getState();
  }

  getMap(): HarnessMap {
    return {
      padIds: MAP_01.pads.map((pad) => pad.id),
      waypoints: MAP_01.waypoints.map((point) => ({ x: point.x, y: point.y })),
      entry: { col: MAP_01.entry.col, row: MAP_01.entry.row },
      core: { col: MAP_01.core.col, row: MAP_01.core.row },
    };
  }

  registerRender(callback: () => void): void {
    this.renderCallback = callback;
  }

  registerStepResults(handler: ((results: CommandResult[]) => void) | null): void {
    this.stepResultHandler = handler;
  }

  start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.primed = false;
    this.bindVisibility();
    this.schedule();
  }

  stop(): void {
    this.running = false;
    this.discardHiddenTime = false;
    this.unbindVisibility();
    const cancel = globalThis.cancelAnimationFrame;
    if (typeof cancel === 'function') {
      cancel(this.frameHandle);
    }
    this.frameHandle = 0;
  }

  private schedule(): void {
    if (!this.running) {
      return;
    }
    const raf = globalThis.requestAnimationFrame;
    if (typeof raf !== 'function') {
      return;
    }
    this.frameHandle = raf((time: number) => {
      this.onFrame(time);
    });
  }

  private onFrame(time: number): void {
    if (!this.running) {
      return;
    }
    if (!this.primed) {
      this.primed = true;
      this.lastTime = time;
    } else if (this.manual || this.discardFrameTime()) {
      this.lastTime = time;
    } else {
      const deltaSeconds = Math.max(0, (time - this.lastTime) / 1000);
      this.lastTime = time;
      advanceFrame(this.engine, this.loop, deltaSeconds);
      this.publishStepResults();
      this.renderCallback?.();
    }
    this.schedule();
  }

  private discardFrameTime(): boolean {
    if (documentHidden()) {
      this.discardHiddenTime = true;
      return true;
    }
    if (this.discardHiddenTime) {
      this.discardHiddenTime = false;
      return true;
    }
    return false;
  }

  private bindVisibility(): void {
    if (this.visibilityBound || typeof document === 'undefined') {
      return;
    }
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.visibilityBound = true;
  }

  private unbindVisibility(): void {
    if (!this.visibilityBound || typeof document === 'undefined') {
      return;
    }
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.visibilityBound = false;
  }

  private publishStepResults(): void {
    const results = this.engine.takeStepResults();
    this.stepResultHandler?.(results);
  }
}

function documentHidden(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  return document.hidden || document.visibilityState === 'hidden';
}
