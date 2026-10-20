# TASK-030: Spawn queue, path movement, and leaks

**Phase / dependencies:** Phase 3. Depends on VERIFY-2 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-030-enemy-movement` (already created from `main`; stay on it)
**Result file:** `results/TASK-030-enemy-movement.md`

## Goal

Spawn the authored wave, move enemies along map 01, and apply leak damage. Do not fire towers, award bounties, or open a results overlay.

## Read first — only these

- `results/VERIFY-PHASE-2.md`
- `results/TASK-010-content-path.md`
- `src/app/core/systems/order.ts`
- `src/app/core/game/engine.ts` `applyStartWave`
- `src/app/core/content/waves.ts`
- `src/app/core/content/enemies.ts`

If `results/VERIFY-PHASE-2.md` does not start with `status: pass`, stop.

Copy pad ids and path length 2064. Do not invent another map. Do not reorder `runSimulationSystems`. Do not edit `loop.ts`. Do not reverse `fileReplacements`.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-030-enemy-movement`. Do not switch, merge, or push.

## Locked behavior

- `applyStartWave` fills `spawnQueue` from `expandWave(getWave(state.wave))` and records `waveStartTick` as the tick after `step()` increments, which is the tick currently being processed. Add `waveStartTick: number` to `GameState`. `reset` sets it to 0.
- `spawnDue` spawns a queued event when `state.tick - waveStartTick >= Math.round(event.time / DT)`. Time 0 spawns in that same tick. Do not use `Date.now()`.
- Spawned enemies use `e1`, `e2`, ... from `nextEnemyId`. Copy hp, speed, and leak damage from `enemyDef`. Start at `distanceAlongPath` 0, `alive` true, slow fields 0.
- Remove the spawned event from the queue. Do not spawn after `phase` is `defeat`.
- `moveEnemies` adds `speed * tilesToPixels(1) * DT` to `distanceAlongPath` each tick. Drone speed 1 moves 0.8 pixels per tick. After 60 ticks from distance 0, distance is 48.
- An enemy at or beyond path length 2064 leaks. Remove it. Subtract its `leakDamage` from integrity. Do not award bounty.
- Integrity never goes below 0. The leak that crosses 0 sets integrity to 0, sets `phase` to `defeat`, and later enemies in that tick do not leak.
- Wave 1 is 8 drones. The second spawns 48 ticks after `waveStartTick`. The eighth spawns at `Math.round(5.6 / DT)` elapsed ticks.
- Implement `spawnDue` and `moveEnemies` in new files. `order.ts` calls them in the existing positions. Do not reorder the nine calls.
- No `@angular` imports. No `Math.random()`.

## Tests

- Start wave 1 and step once: one drone `e1`, hp 55, distance 0, seven events left.
- From that state, 48 further ticks spawn the second drone and no more.
- A crafted drone at distance 0 moves to 48 after 60 direct `moveEnemies` calls.
- A crafted drone at distance 2063.5 leaks on the next tick. Integrity falls by 1. It is gone. Gold is unchanged.
- Integrity 1 and two drones that both would leak: integrity 0, phase `defeat`, only one leak applied.
- Destroy nothing the engine does not own. These are plain tests, not fixtures.

## Commands

```bash
npm test
npm run lint
npm run e2e
if grep -R "@angular" src/app/core/game src/app/core/systems; then echo HAS_ANGULAR; exit 1; else echo NO_ANGULAR; fi
if grep -R -E "Date\.now|Math\.random|performance\.now" src/app/core/game src/app/core/systems; then echo HAS_CLOCK; exit 1; else echo NO_CLOCK; fi
```

Playwright stays at 5 passed.

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, or another task result.
- Do not add dependencies. Do not spawn subagents. Do not `git add -A`.
- Do not implement targeting, projectiles, or the results overlay.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
```

`notes:` must say the second wave-1 drone spawns at elapsed tick 48, leak does not pay bounty, and defeat stops later leaks in that tick.

```bash
git add \
  src/app/core/game/state.ts \
  src/app/core/game/engine.ts \
  src/app/core/systems/order.ts \
  src/app/core/systems/spawn.ts \
  src/app/core/systems/movement.ts \
  src/app/core/systems/spawn.spec.ts \
  src/app/core/systems/movement.spec.ts \
  results/TASK-030-enemy-movement.md
git status --short
git commit -m "feat(TASK-030): spawn waves, move enemies, and apply leaks"
```

Stop if an unexpected path is untracked or if build output is staged.

Final chat reply <= 8 lines.
