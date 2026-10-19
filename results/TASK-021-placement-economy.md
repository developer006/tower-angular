status: pass
commit: pending
verify: npm test && npm run lint && npm run build && npm run e2e
verify_exit: 0
files:
- src/app/features/game/board-overlay.ts
- src/app/features/game/board-overlay.html
- src/app/features/game/board-overlay.css
- src/app/features/game/board-overlay.spec.ts
- src/app/state/game-facade.ts
- results/TASK-021-placement-economy.md
api:
- Pad click and Enter on a focused pad call facade.dispatch({ type: 'placeTower', towerType, padId }) only when a type is selected
- data-testid="placement-error" is empty when a placement is accepted, otherwise the locked reason string
- GameFacade.setPaused(paused) forwards to the engine and refreshes HUD signals
deviations:
- GameFacade had no setPaused. The brief's tests call facade.setPaused(true), so the method was added and src/app/state/game-facade.ts was staged with the listed paths.
notes:
- occupied -> That pad is already taken.
- insufficient-gold -> Not enough gold.
- unknown-pad -> That pad is not on the map.
- unknown-tower -> Unknown tower.
- No selection sets Select a tower first. and does not dispatch.
- Unpaused placement stays queued until step(). Gold does not change until step(). Paused placement applies immediately and dispatch refreshes the HUD.
- Pulse costs 70, so gold goes from 150 to 80. A second place on the same pad stays at 80. Mortar costs 110, so after one Pulse there is not enough gold.
- HUD ids stay hud-integrity, hud-gold, hud-wave, hud-score, bound with signal calls. Score stays 0.
- Pad buttons were not replaced. deploy-wave has no click handler. Space and F are not handled. loop.ts was not edited. fileReplacements was not reversed. No upgrade, sell, range preview, or Playwright spec.

# TASK-021 Result

**Status:** pass
**Branch:** task/TASK-021-placement-economy
**Commit:** pending

## Summary

- Clicking a pad, or pressing Enter on a focused pad, places the selected tower through facade.dispatch.
- Invalid placements show a locked reason and do not spend gold. HUD gold updates from the engine.

## Files changed

- `src/app/features/game/board-overlay.ts` — place on click and Enter, map rejection reasons
- `src/app/features/game/board-overlay.html` — placement-error, existing pad buttons unchanged except handlers
- `src/app/features/game/board-overlay.css` — error message position
- `src/app/features/game/board-overlay.spec.ts` — paused spend, occupied, insufficient gold, no selection, Enter
- `src/app/state/game-facade.ts` — setPaused so tests can apply a placement immediately

## Tests and evidence

- `npm test` -> exit 0; 8 files, 47 tests passed
- `npm run lint` -> exit 0; All files pass linting
- `npm run build` -> exit 0
- `npm run e2e` -> exit 0; 2 passed (shell, smoke)

## Acceptance criteria

- [x] Paused Pulse on pad-01 clears the error, sets hud-gold to 80, and creates tower t1 on pad-01
- [x] Second place on pad-01 stays at 80 and shows That pad is already taken.
- [x] Mortar on pad-02 stays at 80 and shows Not enough gold.
- [x] No selection on pad-03 leaves gold unchanged, shows Select a tower first., and does not dispatch
- [x] Enter on a focused pad-04 places Pulse from a fresh fixture at 150 gold
- [x] Score text stays 0
- [x] Fixtures are destroyed
- [x] Playwright stays at 2 passed

## Handoff for next task

- Reason strings, exact: That pad is already taken. / Not enough gold. / That pad is not on the map. / Unknown tower.
- Unpaused placement stays queued until step().
- Do not add upgrade, sell, or targeting here. TASK-022 owns those.
- Do not replace the pad buttons. Do not edit loop.ts. Do not reverse fileReplacements.
