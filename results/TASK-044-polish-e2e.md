status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
files:
- e2e/specs/pause-speed.spec.ts
- e2e/specs/persistence.spec.ts
- e2e/specs/accessibility.spec.ts
- src/app/core/testing/harness-loader.e2e.ts
- src/app/state/game-facade.ts
- src/app/state/game-facade.spec.ts
- results/TASK-044-polish-e2e.md
api:
- GameFacade.getLoop(): { accumulator: number }
- window.__TD__.getLoop() on the e2e harness only
deviations:
- page.clock.pauseAt(Date.now()) runs after install and before goto so wall time cannot step the loop between 16 ms slices.
notes:
- Manual mode was off for the clock spec. Time moved only in 16 ms page.clock.runFor slices. The two axe tests were not given disableRules.

# TASK-044 Result

**Status:** pass
**Branch:** task/TASK-044-polish-e2e
**Commit:** pending

## Summary

- Pause freezes tick and accumulator after the run has already reached tick 10. Twenty more 16 ms slices leave both unchanged, Deploy Wave stays disabled, and one 16 ms slice after resume increases tick by at most 1 with the accumulator still below 0.2.
- The same slice count at speed 1 and speed 2, each after reset, stays inside 1.7x to 2.3x. Both deltas are greater than 0. Manual mode was off.
- Best score and the sound, reduced-motion, and colorblind flags survive reload under `core-defense:v1`. `theme` is not inside that object. Corrupt `{` storage falls back: the sound control says `Sound`, the theme link still ends in `deeppurple-amber.css`, and the page does not throw.
- The existing accessibility spec gained Tab/Enter placement, a 2px solid focus outline, and the wave and leak live-region sentences. The two axe tests were not given `disableRules`.

## Files changed

- `e2e/specs/pause-speed.spec.ts` — clock-driven pause and 2x specs
- `e2e/specs/persistence.spec.ts` — reload and corrupt-storage specs
- `e2e/specs/accessibility.spec.ts` — four keyboard and live-region tests; axe tests unchanged
- `src/app/core/testing/harness-loader.e2e.ts` — read-only `getLoop`
- `src/app/state/game-facade.ts` — `getLoop()` returns a copy of the accumulator
- `src/app/state/game-facade.spec.ts` — copy and live-accumulator coverage
- `results/TASK-044-polish-e2e.md` — this report

## Tests and evidence

- `npm test` -> exit 0; 19 files, 105 tests passed
- `npm run lint` -> exit 0; All files pass linting
- `npm run e2e` -> exit 0; 18 passed

## Acceptance criteria

- [x] Pause spec slices until tick is at least 10, then proves pause does not dump time on resume
- [x] 2x delta is between 1.7 and 2.3 times the 1x delta; both deltas are greater than 0
- [x] Manual mode was off for the clock spec; no `page.clock.runFor(1000)` and no `stepTicks` in the pause or speed assertions
- [x] Best score and the three settings flags survive reload; `theme` is not inside `core-defense:v1`
- [x] Corrupt storage falls back without a page error
- [x] Tab/Enter places a Pulse without coordinates; focused pad outline is 2px solid
- [x] Live region is exactly `Wave 1 deployed.` and exactly `Core hit. Integrity ${integrity}.`
- [x] Two axe tests remain, with no `disableRules`
- [x] Suite is 18 passed

## Decisions / assumptions

- `getLoop` returns a new object so the harness cannot mutate the loop.
- The clock is paused after install. Otherwise Playwright keeps the fake clock tied to wall time, and the click itself steps the simulation before pause can engage.
- Ending the persisted run uses the Deploy Wave control, then one-tick harness steps until defeat. Setup may call harness `reset`.

## Handoff for next task

- VERIFY-4 is not started. Do not create `e2e/specs/visual.spec.ts`; TASK-050 owns that file.
- Do not reverse `fileReplacements`. Do not edit `loop.ts`.
