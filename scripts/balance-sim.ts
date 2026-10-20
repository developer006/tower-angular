import { WAVES } from '../src/app/core/content/waves';
import { TOWERS } from '../src/app/core/content/towers';
import { WAVE_COUNT } from '../src/app/core/content/types';
import { GameEngine } from '../src/app/core/game/engine';
import {
  formatStrategyRow,
  runStrategy,
  type StrategyName,
  type StrategyResult,
} from '../src/app/core/sim/strategies';

const MIXED_SEED_LIMIT = 20;
const INTEGRITY_MIN = 8;
const INTEGRITY_MAX = 15;

function assertBoundToThisEngine(): void {
  if (WAVES.length !== WAVE_COUNT) {
    throw new Error(`expected ${WAVE_COUNT} waves, found ${WAVES.length}`);
  }
  if (TOWERS.length !== 3) {
    throw new Error(`expected 3 tower types, found ${TOWERS.length}`);
  }
  const engine = new GameEngine(1);
  engine.reset(1);
  if (engine.getState().wave !== WAVES[0].wave) {
    throw new Error('engine reset did not bind to the content wave table');
  }
}

function inIntegrityWindow(result: StrategyResult): boolean {
  return (
    result.outcome === 'victory' &&
    result.integrity >= INTEGRITY_MIN &&
    result.integrity <= INTEGRITY_MAX
  );
}

function main(): void {
  assertBoundToThisEngine();
  const singles: StrategyName[] = ['none', 'pulse', 'mortar', 'cryo'];
  for (const name of singles) {
    console.log(formatStrategyRow(runStrategy(name, 1)));
  }

  const tried: number[] = [];
  let found = false;
  for (let seed = 1; seed <= MIXED_SEED_LIMIT; seed += 1) {
    tried.push(seed);
    const result = runStrategy('mixed', seed);
    console.log(formatStrategyRow(result));
    if (inIntegrityWindow(result)) {
      found = true;
      break;
    }
  }
  if (!found) {
    console.log('mixed: not-found');
    console.log(`seeds: ${tried.join(' ')}`);
  }
}

main();
