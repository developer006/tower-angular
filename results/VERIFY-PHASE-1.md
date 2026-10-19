status: pass
commit: pending
verify: npm test && npm run lint && npm run build && npm run e2e
verify_exit: 0
files:
- results/VERIFY-PHASE-1.md
api:
- none
deviations:
- none
notes:
- Phase 1 acceptance holds. Do not start TASK-020 until this file is merged.
- Production `dist/tower-angular/browser` is `PROD_ABSENT`. E2e configuration build is `E2E_HAS_TD`.
- `fileReplacements` for `harness-loader.e2e.ts` exists only on the `e2e` build configuration. Do not reverse it.
- `DT` is `1 / 60`. The 600-step same-seed snapshot is in `engine.spec.ts`. Do not edit `loop.ts`.

# VERIFY-1 Result

**Status:** pass
**Branch:** task/VERIFY-1
**Commit:** pending

## Summary

- Prerequisite reports `TASK-010`, `TASK-011`, `TASK-012`, and `TASK-013` each start with `status: pass`.
- Re-ran unit tests, lint, production build, e2e configuration build, and Playwright. All exited 0.
- Production bundle has no `__TD__`. The e2e bundle does. Core game and systems have no `@angular` imports.
- Read checks match the brief: fixed step, 600-step snapshot, canvas fit, harness replacement, single `installHarness` call, harness methods, and pad ids `pad-01` through `pad-14`.

## Files changed

- `results/VERIFY-PHASE-1.md` — phase 1 verification report only. No source edits.

## Tests and evidence

- `npm test` -> exit 0; 7 files, 43 tests passed
- `npm run lint` -> exit 0; All files pass linting
- `npm run build` -> exit 0; `dist/tower-angular/browser`
- `grep -R __TD__ dist/tower-angular/browser` after production build -> `PROD_ABSENT`
- `npx ng build --configuration e2e` -> exit 0
- `grep -R __TD__ dist/tower-angular/browser` after e2e build -> `E2E_HAS_TD`
- `npm run e2e` -> exit 0; 2 passed (shell, smoke)
- `grep -R @angular src/app/core/game src/app/core/systems` -> `NO_ANGULAR`

## Acceptance criteria

- [x] Map, path, content types, and fixed-step engine are unit-tested (`npm test` 43 passed)
- [x] Same-seed 600-step snapshot test exists in `src/app/core/game/engine.spec.ts` and passed with the suite
- [x] `fitCanvasCss(480, 576)` is expected to be `{ width: 480, height: 288 }` in `render.spec.ts`; smoke spec shows the canvas
- [x] E2e harness exposes `stepTicks`, `getFullState`, `setManualMode`, and `getMap` on `window.__TD__`
- [x] No Angular imports in `src/app/core/game/` or `src/app/core/systems/`
- [x] `DT` is `1 / 60` in `src/app/core/game/loop.ts`
- [x] `fileReplacements` replaces `harness-loader.ts` with `harness-loader.e2e.ts` only on the `e2e` build configuration
- [x] `App` does not call `installHarness`. `GamePage` calls it once
- [x] Map result pad ids are `pad-01` through `pad-14` via `MAP_01.pads`

## Decisions / assumptions

- `status: pass` because every required command exited 0 and every read check held.
- `commit` stays `pending`. No hash written. No amend.

## Handoff for next task

- Phase 1 is verified. Orchestrator may merge this report, then dispatch TASK-020.
- Do not edit `plan/` or `results/INDEX.md` from this branch.
