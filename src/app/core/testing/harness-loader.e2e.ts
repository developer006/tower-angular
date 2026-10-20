import type { ScenarioOptions } from '../../state/game-facade';
import type { Command, CommandResult, GameState } from '../game/state';

export interface TdHarness {
  ready: boolean;
  getState(): {
    gold: number;
    integrity: number;
    wave: number;
    score: number;
    phase: string;
    tick: number;
  };
  getFullState(): GameState;
  stepTicks(n: number): void;
  setManualMode(enabled: boolean): void;
  dispatch(command: Command): CommandResult;
  reset(options: ScenarioOptions): void;
  getLoop(): { accumulator: number };
  getMap(): {
    padIds: string[];
    waypoints: { x: number; y: number }[];
    entry: { col: number; row: number };
    core: { col: number; row: number };
  };
}

interface HarnessFacade {
  getState(): ReturnType<TdHarness['getState']>;
  getFullState(): GameState;
  stepTicks(n: number): void;
  setManualMode(enabled: boolean): void;
  dispatch(command: Command): CommandResult;
  reset(options: ScenarioOptions): void;
  getLoop(): { accumulator: number };
  getMap(): ReturnType<TdHarness['getMap']>;
}

const EMPTY_STATE = {
  gold: 0,
  integrity: 0,
  wave: 0,
  score: 0,
  phase: 'build',
  tick: 0,
};

const EMPTY_MAP = {
  padIds: [] as string[],
  waypoints: [] as { x: number; y: number }[],
  entry: { col: 0, row: 0 },
  core: { col: 0, row: 0 },
};

export function installHarness(_facade?: unknown): void {
  const facade = _facade == null ? undefined : (_facade as HarnessFacade);
  const hook: TdHarness = {
    ready: facade != null,
    getState: () => facade?.getState() ?? EMPTY_STATE,
    getFullState: () => {
      if (!facade) {
        throw new Error('harness is not ready');
      }
      return facade.getFullState();
    },
    stepTicks: (n: number) => {
      facade?.stepTicks(n);
    },
    setManualMode: (enabled: boolean) => {
      facade?.setManualMode(enabled);
    },
    dispatch: (command: Command) => facade?.dispatch(command) ?? { ok: false },
    reset: (options: ScenarioOptions) => {
      facade?.reset(options);
    },
    getLoop: () => facade?.getLoop() ?? { accumulator: 0 },
    getMap: () => facade?.getMap() ?? EMPTY_MAP,
  };
  (globalThis as { __TD__?: TdHarness }).__TD__ = hook;
}

