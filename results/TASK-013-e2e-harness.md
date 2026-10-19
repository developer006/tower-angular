status: pass
commit: pending
verify: npm test && npm run lint && npm run build && npx ng build --configuration e2e && npm run e2e
verify_exit: 0
files:
- src/app/app.ts
- src/app/state/game-facade.ts
- src/app/state/game-facade.spec.ts
- src/app/core/game/engine.ts
- src/app/core/testing/harness-loader.e2e.ts
- src/app/features/game/game-page.ts
- src/app/features/game/game-page.html
- src/app/features/game/game-page.spec.ts
- e2e/specs/smoke.spec.ts
- results/TASK-013-e2e-harness.md
api:
- ready: boolean
- getState(): { gold: number; integrity: number; wave: number; score: number; phase: string; tick: number }
- getFullState(): GameState
- stepTicks(n: number): void
- setManualMode(enabled: boolean): void
- dispatch(command: Command): CommandResult
- reset(options: { seed: number; integrity?: number; wave?: number; gold?: number }): void
- getMap(): { padIds: string[]; waypoints: { x: number; y: number }[]; entry: { col: number; row: number }; core: { col: number; row: number } }
deviations:
- none
notes:
- App no longer calls installHarness, and GamePage calls it once.
- Production harness-loader.ts is still a no-op and does not contain __TD__. The e2e loader assigns globalThis.__TD__ and sets ready true only when a facade is passed.
- HUD test ids stay hud-integrity, hud-gold, hud-wave, hud-score and call facade signals. Deploy Wave is enabled when not paused. Pad ids are pad-01 through pad-14 from MAP_01. loop.ts was not edited.

# TASK-013 Result

**Status:** pass
**Branch:** task/TASK-013-e2e-harness
**Commit:** pending

## Summary

- Moved `installHarness(facade)` from `App` to `GamePage`. The page owns one `GameFacade`, a 10 Hz HUD timer, and the animation frame.
- The e2e loader exposes the `__TD__` hook. Production builds do not contain `__TD__`.
- Added `e2e/specs/smoke.spec.ts`. Playwright is 2 passed (shell and smoke).

## Files changed

- `src/app/app.ts` — removed `installHarness`
- `src/app/state/game-facade.ts` — engine, loop, HUD signals, and harness methods
- `src/app/state/game-facade.spec.ts` — scenario, harness no-op, map, and frame tests
- `src/app/core/game/engine.ts` — `configureScenario`
- `src/app/core/testing/harness-loader.e2e.ts` — assigns `globalThis.__TD__`
- `src/app/features/game/game-page.ts` — one `installHarness(facade)` call, 10 Hz timer, frame stop
- `src/app/features/game/game-page.html` — signal HUD and Deploy Wave
- `src/app/features/game/game-page.spec.ts` — HUD text plus a second destroyed fixture
- `e2e/specs/smoke.spec.ts` — canvas, HUD, enabled deploy control, no page errors

## Tests and evidence

- `npm test` -> 7 files, 43 tests passed
- `npm run lint` -> All files pass linting
- `npm run build` -> pass; grep `__TD__` -> `PROD_ABSENT`
- `npx ng build --configuration e2e` -> pass; grep `__TD__` -> `E2E_HAS_TD`
- `npm run e2e` -> 2 passed
- grep `installHarness` in `src/app/app.ts` -> `APP_CLEAN`
- `GamePage` calls `installHarness(this.facade)` once

## Acceptance criteria

- [x] `App` no longer calls `installHarness`, and `GamePage` calls it once
- [x] Production loader has no `__TD__`. Production `dist/tower-angular/browser` has no `__TD__`
- [x] E2e loader assigns `globalThis.__TD__` and sets `ready` true when a facade is passed
- [x] `webServer.command` stays `npm run start:e2e`
- [x] HUD text stays 20, 150, 1, 0 and is bound with signal calls
- [x] Deploy Wave is enabled when not paused
- [x] `configureScenario({ seed: 3, integrity: 9, wave: 10, gold: 40 })` leaves those values and tick 0
- [x] Game page spec destroys both fixtures
- [x] Playwright: 2 passed

## Handoff for next task

- App no longer calls installHarness, and GamePage calls it once.
- Do not reverse `fileReplacements`. Do not edit `loop.ts`. Do not add a twelfth e2e spec.
- `getMap().padIds` is pad-01 through pad-14 from `MAP_01`.
