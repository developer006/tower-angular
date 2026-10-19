status: pass
commit: pending
verify: npm test && npm run lint && npm run build
verify_exit: 0
files:
- src/app/core/game/state.ts
- src/app/core/game/rng.ts
- src/app/core/game/engine.ts
- src/app/core/game/loop.ts
- src/app/core/game/engine.spec.ts
- src/app/core/systems/order.ts
- results/TASK-011-engine-loop.md
api:
- GameEngine.dispatch(command: Command): CommandResult
- GameEngine.step(): void
- GameEngine.getState(): GameState
- GameEngine.getSnapshot(): string
- GameEngine.setPaused(paused: boolean): void
- GameEngine.setSpeed(speed: 1 | 2): void
- GameEngine.isPaused(): boolean
- GameEngine.getSpeed(): 1 | 2
- DT = 1 / 60
- advanceFrame(engine: GameEngine, loop: LoopState, frameDelta: number): number
- nextUnit(rngState: number): { value: number; rngState: number }
- runSimulationSystems(state: GameState): void
deviations:
- `nextUnit` binds `a` with `const` so `prefer-const` passes. The mulberry32 steps are unchanged.
- `advanceFrame` still uses the specified while loop, DT, and 10-step cap. The stored remainder is `base + added - steps * DT` because ten sequential `-= DT` leaves a value 1 ULP above `0.25 - 10 / 60`.
notes:
- System bodies are no-ops. The call order in `runSimulationSystems` must not be reordered: spawnDue, tickSlow, moveEnemies, acquireTargets, fireTowers, moveProjectiles, applyDamage, advanceWave, tickEffects.
- Reject reasons that shipped: unknown-pad, unknown-tower, occupied, insufficient-gold, missing-tower, max-level, bad-targeting, paused, wave-active, ended.
- Pad ids copied from TASK-010, in order: pad-01, pad-02, pad-03, pad-04, pad-05, pad-06, pad-07, pad-08, pad-09, pad-10, pad-11, pad-12, pad-13, pad-14. Path total length is 2064. This task does not invent another map.
- `max-level` and `ended` are implemented. Starting gold cannot buy a level-3 upgrade, and no-op systems never set victory or defeat.

# TASK-011 Result

**Status:** pass
**Branch:** task/TASK-011-engine-loop
**Commit:** pending

## Summary

- Added a framework-free engine with queued commands, immediate paused build actions, and `reset`.
- Added a 60 Hz loop, mulberry32 `nextUnit`, and ordered no-op simulation systems.
- Unit tests pin DT, refund 84, the 10-step cap, and seed-stable snapshots.

## Files changed

- `src/app/core/game/state.ts` — phase, entity, and command types
- `src/app/core/game/rng.ts` — serializable mulberry32 step
- `src/app/core/game/engine.ts` — dispatch, step, snapshot
- `src/app/core/game/loop.ts` — fixed-step accumulator
- `src/app/core/game/engine.spec.ts` — command and loop oracles
- `src/app/core/systems/order.ts` — locked no-op system order

## Tests and evidence

- `npm test` -> 4 files, 32 tests passed
- `npm run lint` -> All files pass linting
- `npm run build` -> pass
- grep `@angular` under `src/app/core/game` and `src/app/core/systems` -> NO_ANGULAR
- grep `Date.now|Math.random|performance.now` under those trees -> NO_CLOCK

## Acceptance criteria

- [x] DT is `1 / 60`, not `0.016`
- [x] Fresh engine is gold 150, integrity 20, wave 1, phase `build`, tick 0
- [x] Paused Pulse place/upgrade/sell spends immediately; refund of 120 is 84; tick stays 0
- [x] Unknown pad does not queue; unpaused place spends only on `step()`
- [x] Two queued Mortars on pad-02 leave one tower, gold 40, history length 1
- [x] Paused `startWave` returns `paused`; unpaused start sets phase `wave` and leaves wave at 1
- [x] Paused frame leaves tick and accumulator at 0; speed 2 takes 2 steps per DT
- [x] frameDelta 10 takes 10 steps and leaves accumulator at `0.25 - 10 / 60`
- [x] Seed 7 plus 600 steps matches across two engines; tick is 600
- [x] No `@angular/*` import and no clock or `Math.random` under game or systems

## Decisions / assumptions

- Structural rejects (`unknown-pad`, `unknown-tower`, `bad-targeting`) never queue. `occupied`, `insufficient-gold`, `missing-tower`, `max-level`, `wave-active`, and `ended` are decided at apply time.
- `step()` increments tick, then applies `pending`, then calls `runSimulationSystems`.
- Tower ids are `t1`, `t2`, ... Default targeting is `first`. New towers start at cooldown 0.
- `getSnapshot` key order is tick, phase, gold, integrity, wave, score, towers, enemies, projectiles, effects, spawnQueue, rngState, paused, speed, nextTowerId, nextEnemyId, nextProjectileId, history, pending.

## Open issues / risks

- none

## Handoff for next task

- Read `results/TASK-011-engine-loop.md` and do not reorder `runSimulationSystems`.
- System bodies are no-ops. Do not add combat here.
- Copy pad ids pad-01 through pad-14 and path length 2064. Do not invent another map.
