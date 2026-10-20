status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
files:
- src/app/core/game/engine.ts
- src/app/state/game-facade.ts
- src/app/features/game/board-overlay.ts
- src/app/features/game/board-overlay.spec.ts
- e2e/specs/build.spec.ts
- e2e/specs/upgrade-sell.spec.ts
- results/TASK-023-FIX.md
api:
- GameEngine.step() stores each apply() result
- GameEngine.takeStepResults(): CommandResult[] returns those results and clears the buffer
- GameFacade.stepTicks and the frame callback after advanceFrame publish them
- placement-error renders the locked reason after the rejecting step
deviations:
- board-overlay.html was unchanged. placement-error already binds placementError().
- Playwright reported 5 passed. upgrade-sell.spec.ts has the required second test, so the count is shell, smoke, build, and two upgrade-sell tests.
notes:
- Apply-time rejections are published by takeStepResults. A queued placeTower still returns ok/queued and does not reject occupancy at dispatch. After stepTicks(1), placement-error shows the locked reason.
- occupied -> That pad is already taken. insufficient-gold -> Not enough gold. unknown-pad -> That pad is not on the map. unknown-tower -> Unknown tower. No selection stays Select a tower first.
- Specs are e2e/specs/build.spec.ts and e2e/specs/upgrade-sell.spec.ts. UI actions that spend or refund gold call stepTicks(1) while manual mode is on.
- Oracles held: gold 80, then 30, then 114; L1-only sell ends at 129. data-range-tiles is 3.2. One tower after the occupied rejection. loop.ts was not edited. fileReplacements was not reversed.

# TASK-023-FIX Result

**Status:** pass
**Branch:** task/TASK-023-FIX
**Commit:** pending

## Summary

- step() keeps each apply() result, and takeStepResults publishes the latest rejection after stepTicks and after advanceFrame.
- An unpaused double place on pad-01 leaves gold at 80, one tower, and placement-error That pad is already taken.
- Playwright covers placement, keyboard rejection, range, upgrade, and both sell refunds.

## Tests and evidence

- npm test -> exit 0; 8 files, 55 tests passed
- npm run lint -> exit 0; All files pass linting
- npm run e2e -> exit 0; 5 passed (shell, smoke, build, upgrade-sell, L1 sell)
