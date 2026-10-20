status: pass
commit: pending
verify: npm test && npm run lint
verify_exit: 0
files:
- src/app/core/systems/wave.spec.ts
- src/app/features/game/wave-end.spec.ts
- results/TASK-032-FIX.md
deviations:
- none
notes:
- Angular overlay describe moved unchanged. Engine tests stayed in core/systems/wave.spec.ts.

# TASK-032-FIX Result

**Status:** pass
**Branch:** task/TASK-032-FIX
**Commit:** pending

## Summary

- Removed `@angular/core/testing` and the overlay describe from `src/app/core/systems/wave.spec.ts`.
- Moved that describe, with its helpers and imports, to `src/app/features/game/wave-end.spec.ts`.
- Assertions were not weakened: HUD score stays 0; Retry restores gold 150, integrity 20, wave 1; wave 10 preview still has `1 Overlord` after `4 Tanks`.
- Engine, content, and `loop.ts` were not edited.

## Files changed

- `src/app/core/systems/wave.spec.ts` — engine-only wave tests; no Angular import.
- `src/app/features/game/wave-end.spec.ts` — results overlay and wave preview component tests.
- `results/TASK-032-FIX.md` — this handoff.

## Tests and evidence

- `npm test` -> exit 0; 14 files, 87 tests passed
- `npm run lint` -> exit 0; All files pass linting
- `grep -R "@angular" src/app/core/game src/app/core/systems` -> no matches; `NO_ANGULAR`

## Acceptance criteria

- [x] Angular import and overlay describe removed from `src/app/core/systems/wave.spec.ts`
- [x] Overlay describe lives in `src/app/features/game/wave-end.spec.ts` with the imports it needs
- [x] HUD score assertion remains `0`
- [x] Retry still restores gold 150, integrity 20, wave 1
- [x] Wave 10 preview still ends with `1 Overlord` after `4 Tanks`
- [x] No `@angular` under `src/app/core/game` or `src/app/core/systems`
- [x] Engine, content, and `loop.ts` unchanged

## Decisions / assumptions

- `drone` and `engineState` were copied into the feature spec. They were not exported from the systems spec.

## Open issues / risks

- none

## Handoff for next task

- Re-run `npm test && npm run lint`.
- `src/app/core/systems` and `src/app/core/game` must stay free of `@angular`.
