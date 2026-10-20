status: pass
commit: pending
verify: npm run e2e && npm test && npm run lint
verify_exit: 0
files:
- e2e/specs/combat.spec.ts
- e2e/specs/leak-defeat.spec.ts
- e2e/specs/victory.spec.ts
- results/TASK-033-combat-e2e.md
deviations:
- none
notes:
- Retry is asserted present. Main Menu is not asserted absent. The victory score oracle is 500.

# TASK-033 Result

**Status:** pass
**Branch:** task/TASK-033-combat-e2e
**Commit:** pending

## Summary

- Combat places Pulse on pad-01, sees gold 80, deploys wave 1, moves an enemy, collects the 6 bounty at gold 86, and clears to build wave 2 with score still 0.
- A leak from integrity 1 reaches defeat, shows Retry, keeps HUD score at 0, and Retry restores gold 150, integrity 20, and wave 1.
- Wave 10 with no towers leaks for 34 damage, ends at integrity 16, wavesCleared 1, kills 0, and score 500. Retry is visible. HUD score stays 0.

## Files changed

- `e2e/specs/combat.spec.ts` — Pulse combat, bounty, and wave-1 clear
- `e2e/specs/leak-defeat.spec.ts` — leak defeat and Retry
- `e2e/specs/victory.spec.ts` — wave-10 victory oracle
- `results/TASK-033-combat-e2e.md` — this report

## Tests and evidence

- `npm run e2e` -> exit 0; 8 passed
- `npm test` -> exit 0; 12 files, 85 tests passed
- `npm run lint` -> exit 0; All files pass linting
- Combined `npm run e2e && npm test && npm run lint` -> exit 0

## Acceptance criteria

- [x] Pulse on pad-01 leaves gold 80 after one tick
- [x] Deploy plus one tick spawns an enemy, and a later tick increases distanceAlongPath
- [x] Gold reaches 86 and getFullState().score stays 0
- [x] Wave 1 clears to phase build and wave 2 within 6000 ticks
- [x] Leak defeat shows the overlay and Retry, integrity 0, HUD score 0
- [x] Retry restores gold 150, integrity 20, wave 1, and hides the overlay
- [x] Wave 10 with no towers reaches an Overlord within 4000 ticks and victory within 12000
- [x] Victory integrity is 16, wavesCleared is 1, kills are 0, score is 500
- [x] Overlay shows score 500, Retry is present, HUD score is 0
- [x] Main Menu is not asserted absent
- [x] Previous 5 e2e tests still pass. No twelfth spec was added

## Decisions / assumptions

- Retry is asserted with `data-testid="retry"` visible. No assertion looks for Main Menu or asserts that it is absent.
- Victory score oracle is 500: 0 kills * 10 + 1 cleared wave * 100 + 16 integrity * 25.
- Fast-forward uses `stepTicks` inside the page. Deploy, pad, and Retry clicks are real UI events.
- Tick caps were not raised. Wave clear, defeat, Overlord, and victory all landed inside the brief caps.

## Handoff for next task

- Do not add a test that asserts Main Menu is absent. TASK-040 adds that control.
- HUD hud-score stays 0. The results overlay is the score display.
- Do not reorder runSimulationSystems. Do not reverse fileReplacements. Do not edit loop.ts.
