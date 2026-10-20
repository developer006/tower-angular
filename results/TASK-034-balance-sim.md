status: pass
commit: pending
verify: npm run sim && npm test && npm run lint
verify_exit: 0
files:
- package.json
- package-lock.json
- scripts/balance-sim.ts
- src/app/core/sim/strategies.ts
- src/app/core/sim/strategies.spec.ts
- results/TASK-034-balance-sim.md
deviations:
- none
notes:
- none seed=1 outcome=defeat bestWave=2 wavesCleared=1 integrity=0 kills=0 score=100
- pulse seed=1 outcome=victory bestWave=10 wavesCleared=10 integrity=6 kills=191 score=3060
- mortar seed=1 outcome=victory bestWave=10 wavesCleared=10 integrity=11 kills=194 score=3215
- cryo seed=1 outcome=defeat bestWave=2 wavesCleared=1 integrity=0 kills=0 score=100
- mixed seed=1 missed the 8-15 window (victory, integrity 16). mixed seed=2 missed (defeat, bestWave 4). mixed seed=3 outcome=victory bestWave=10 wavesCleared=10 integrity=10 kills=193 score=3180
- Search stopped at seed 3. Seeds 4-20 were not run. Content tables were not edited. TASK-035 tunes content; it does not re-author these rows.
- Pulse and mortar did not fail by wave 6-7. Cryo lost at wave 2. Those are the measured outcomes.

# TASK-034 Result

**Status:** pass
**Branch:** task/TASK-034-balance-sim
**Commit:** pending

## Summary

Headless `npm run sim` runs the real engine. Rows below are copied from that stdout.

```text
none seed=1 outcome=defeat bestWave=2 wavesCleared=1 integrity=0 kills=0 score=100
pulse seed=1 outcome=victory bestWave=10 wavesCleared=10 integrity=6 kills=191 score=3060
mortar seed=1 outcome=victory bestWave=10 wavesCleared=10 integrity=11 kills=194 score=3215
cryo seed=1 outcome=defeat bestWave=2 wavesCleared=1 integrity=0 kills=0 score=100
mixed seed=1 outcome=victory bestWave=10 wavesCleared=10 integrity=16 kills=199 score=3390
mixed seed=2 outcome=defeat bestWave=4 wavesCleared=3 integrity=0 kills=29 score=590
mixed seed=3 outcome=victory bestWave=10 wavesCleared=10 integrity=10 kills=193 score=3180
```

## Files changed

- `package.json` — `sim` script; `tsx` devDependency. No `build:pages` or `copy404`.
- `package-lock.json` — lockfile for `tsx`.
- `scripts/balance-sim.ts` — imports the engine and content, prints measured rows.
- `src/app/core/sim/strategies.ts` — strategies and `runStrategy(name, seed)`.
- `src/app/core/sim/strategies.spec.ts` — calls `runStrategy`. No JSON fixture.
- `results/TASK-034-balance-sim.md` — this report.

## Tests and evidence

- `npm run sim && npm test && npm run lint` -> exit 0
- `npm test` -> 13 files, 87 tests passed
- `npm run lint` -> All files pass linting

## Acceptance criteria

- [x] `none` defeats by wave 2
- [x] Single-type strategies recorded as measured, not rewritten to fail by wave 6-7
- [x] `mixed` seed 3 wins with integrity 10 (window 8-15). Seeds 1 and 2 missed. Search stopped
- [x] Spec asserts defeat by wave 2, same-seed equality, and numbers from `runStrategy`
- [x] Printed rows copied above. No unprinted row was added
- [x] Content tables, `loop.ts`, and `plan/` were not edited

## Decisions / assumptions

- Placement uses `setPaused(true)` so it applies immediately. `startWave` is rejected while paused, so the runner unpauses before `startWave`, then `step()` until the wave clears or the run ends.
- Single-type strategies spend gold only by placing that type on the lowest free pad. They do not upgrade.
- `mixed` is a seed-selected rotation of pulse, mortar, and cryo on the lowest free pad. Same seed, same build.
- A wave that does not end throws. It does not invent an outcome.

## Handoff for next task

- TASK-035 tunes content. Do not re-author these rows.
- Do not reorder `runSimulationSystems`. Do not reverse `fileReplacements`. Do not edit `loop.ts`.
