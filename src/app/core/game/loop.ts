import type { GameEngine } from './engine';

export const DT = 1 / 60;

export interface LoopState {
  accumulator: number;
}

export function createLoop(): LoopState {
  return { accumulator: 0 };
}

export function advanceFrame(engine: GameEngine, loop: LoopState, frameDelta: number): number {
  if (engine.isPaused()) {
    return 0;
  }
  const added = Math.min(frameDelta, 0.25) * engine.getSpeed();
  const base = loop.accumulator;
  loop.accumulator += added;
  let steps = 0;
  while (loop.accumulator >= DT && steps < 10) {
    engine.step();
    loop.accumulator -= DT;
    steps += 1;
  }
  // Sequential -= DT is 1 ULP above 0.25 - 10/60 at the 10-step cap.
  loop.accumulator = base + added - steps * DT;
  return steps;
}
