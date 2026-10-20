status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
files:
- src/app/app.routes.ts
- src/app/features/menu/main-menu.ts
- src/app/features/menu/main-menu.html
- src/app/features/menu/main-menu.spec.ts
- src/app/features/game/results-overlay.ts
- src/app/features/game/results-overlay.html
- src/app/features/game/wave-end.spec.ts
- results/TASK-040-menu-results.md
api:
- none
deviations:
- none
notes:
- Retry remains (`data-testid="retry"`) and still calls reset(1) on `/play`. Main Menu is `data-testid="main-menu-button"`.
- Theme toggle stays in App, outside the outlet.

# TASK-040 Result

**Status:** pass
**Branch:** task/TASK-040-menu-results
**Commit:** pending

## Summary

- `/` loads standalone `MainMenu` (`app-main-menu`, `data-testid="main-menu"`). Play (`data-testid="play"`, accessible name Play) navigates to `/play`.
- Results overlay keeps Retry and adds Main Menu. Main Menu navigates to `/` and does not reset the run.
- Theme toggle remains in `App`, outside the router outlet.

## Files changed

- `src/app/app.routes.ts` — `''` (pathMatch full) loads MainMenu; `/play` unchanged
- `src/app/features/menu/main-menu.ts` — menu component and Play navigation
- `src/app/features/menu/main-menu.html` — menu markup
- `src/app/features/menu/main-menu.spec.ts` — Play click expects router URL `/play`; fixture destroyed
- `src/app/features/game/results-overlay.ts` — Main Menu navigates to `/`; Retry still `reset(1)`
- `src/app/features/game/results-overlay.html` — Retry plus Main Menu
- `src/app/features/game/wave-end.spec.ts` — Retry assertions kept; Main Menu asserted as well
- `results/TASK-040-menu-results.md` — this report

## Tests and evidence

- `npm test` -> exit 0; 15 files, 89 tests passed
- `npm run lint` -> exit 0; All files pass linting
- `npm run e2e` -> exit 0; 8 passed, including `shell.spec.ts` on `/`

## Acceptance criteria

- [x] `/` loads standalone MainMenu, selector `app-main-menu`, `data-testid="main-menu"`
- [x] Play button `data-testid="play"` accessible name Play navigates to `/play`
- [x] Theme toggle stays in App so `/` still finds Toggle color theme
- [x] Retry remains `data-testid="retry"` and calls `reset(1)` on `/play`
- [x] Main Menu is `data-testid="main-menu-button"` with accessible name Main Menu and navigates to `/`
- [x] Existing score-0 and Retry restore assertions were not removed
- [x] No pause, sound, or persistence added

## Decisions / assumptions

- Empty path uses `pathMatch: 'full'` so it does not swallow `/play`.
- Main Menu resolves `Router` on click so existing GamePage specs that never navigate do not need a router provider.
- No CSS file. Overlay button matches the existing Retry button.

## Handoff for next task

- Do not remove Retry. Do not reverse `fileReplacements`. Do not edit `loop.ts`.
- TASK-041 owns pause, sound, and persistence. Do not start it from this branch.
