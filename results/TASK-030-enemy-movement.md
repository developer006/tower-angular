status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
files:
- src/app/core/game/state.ts
- src/app/core/game/engine.ts
- src/app/core/game/engine.spec.ts
- src/app/core/systems/order.ts
- src/app/core/systems/spawn.ts
- src/app/core/systems/movement.ts
- src/app/core/systems/spawn.spec.ts
- src/app/core/systems/movement.spec.ts
- results/TASK-030-enemy-movement.md
api:
- GameState.waveStartTick: number; reset sets it to 0
- applyStartWave fills spawnQueue from expandWave(getWave(state.wave)) and sets waveStartTick to the tick being processed
- spawnDue(state: GameState): void
- moveEnemies(state: GameState): void
deviations:
- src/app/core/game/engine.spec.ts was not in the brief's git add list. The 600-step oracle expected enemies []. That held only while spawn and movement were stubs. It is staged because npm test cannot pass without it. After 600 steps, eight drones are still on the path, integrity is 20, gold is 80, and the queue is empty.
- getSnapshot does not include waveStartTick. SNAPSHOT_KEYS stays the locked TASK-011 list.
notes:
- The second wave-1 drone spawns at elapsed tick 48.
- Leak does not pay bounty.
- Defeat stops later leaks in that tick.
- Path length is map 01's 2064. A start-wave step leaves e1 at distance 0. Sixty drone movement ticks from 0 land on 48.

# TASK-030 Result

**Status:** pass
**Branch:** task/TASK-030-enemy-movement
**Commit:** pending

## Summary

- Starting a wave fills the spawn queue and spawns due enemies from the authored table.
- Enemies move along map 01. A leak removes the enemy, subtracts leak damage, and does not pay bounty.
- Integrity never goes below 0. The leak that crosses 0 sets defeat and stops later leaks in that tick.

## Files changed

- `src/app/core/game/state.ts` — `waveStartTick`, plus speed, leak damage, and spawn tick on enemies
- `src/app/core/game/engine.ts` — `applyStartWave` fills the queue and records `waveStartTick`; reset sets it to 0
- `src/app/core/systems/order.ts` — calls `spawnDue` and `moveEnemies` in the existing positions
- `src/app/core/systems/spawn.ts` — due-queue spawn
- `src/app/core/systems/movement.ts` — path movement and leaks
- `src/app/core/systems/spawn.spec.ts` — wave-1 spawn oracles
- `src/app/core/systems/movement.spec.ts` — 48-pixel and integrity-zero oracles
- `src/app/core/game/engine.spec.ts` — 600-step enemy count matches live waves
- `results/TASK-030-enemy-movement.md` — this report

## Tests and evidence

- `npm test` -> exit 0; 10 files, 62 tests passed
- `npm run lint` -> exit 0; All files pass linting
- `npm run e2e` -> exit 0; 5 passed
- grep `@angular` under `src/app/core/game` and `src/app/core/systems` -> NO_ANGULAR
- grep `Date.now|Math.random|performance.now` under those trees -> NO_CLOCK

## Acceptance criteria

- [x] Wave 1 step once spawns `e1` at hp 55, distance 0, with seven events left
- [x] The second wave-1 drone spawns at elapsed tick 48 and no more
- [x] The eighth drone spawns at `Math.round(5.6 / DT)` elapsed ticks
- [x] A drone at distance 0 is at 48 after 60 `moveEnemies` calls
- [x] A drone at 2063.5 leaks, integrity falls by 1, gold is unchanged
- [x] Integrity 1 and two leaking drones: integrity 0, phase `defeat`, only one leak
- [x] No spawn after defeat. No bounty. Integrity never goes below 0
- [x] `runSimulationSystems` order is unchanged. `loop.ts` was not edited

## Decisions / assumptions

- `waveStartTick` is the tick after `step()` increments, which is the tick `applyStartWave` sees.
- Time 0 spawns in that same tick. Elapsed ticks are `state.tick - waveStartTick`.
- Spawned enemies do not move on `spawnedAtTick`, so the start step leaves distance 0.
- Movement is `origin + speed * tilesToPixels(1) * DT * ticks`. Sixty additions of the per-tick delta are 1 ULP under 48; the product is exactly 48.
- Leak threshold is `MAP_01.geometry.totalLength` (2064), not a second map.
- The crossing leak is removed, integrity is clamped at 0, phase becomes `defeat`, and the loop returns before later enemies leak.

## Handoff for next task

- Do not reorder `runSimulationSystems`. Do not reverse `fileReplacements`. Do not award bounty on leak.
- Targeting, projectiles, and the results overlay are not implemented.
