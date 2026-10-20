status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
files:
- src/app/core/game/state.ts
- src/app/core/game/engine.ts
- src/app/core/systems/order.ts
- src/app/core/systems/damage.ts
- src/app/core/systems/wave.ts
- src/app/core/systems/wave.spec.ts
- src/app/features/game/game-page.ts
- src/app/features/game/game-page.html
- src/app/features/game/results-overlay.ts
- src/app/features/game/results-overlay.html
- src/app/features/game/results-overlay.css
- src/app/features/game/wave-preview.ts
- src/app/features/game/wave-preview.html
- results/TASK-032-waves-endstates.md
api:
- advanceWave(state: GameState): void
- nextLiveAnnouncement(previous: LiveSnapshot, current: LiveSnapshot): string | null
deviations:
- kills, wavesCleared, and bestWave are optional on GameState so existing hand-built fixtures still typecheck. reset always sets them to 0.
- Score is settled once per state object. A later mutation of kills does not recompute it.
notes:
- Score is kills * 10 + wavesCleared * 100 + remainingIntegrity * 25, computed once when phase becomes victory or defeat. HUD hud-score stays 0. The overlay shows that score.
- Retry is data-testid="retry" and calls reset(1).
- Main Menu is intentionally absent so TASK-040 can add it without deleting an assertion.

# TASK-032 Result

**Status:** pass
**Branch:** task/TASK-032-waves-endstates
**Commit:** pending

## Summary

- A wave clears only when phase is wave, the spawn queue is empty, no alive enemies remain, and no projectiles remain.
- A clear with integrity above 0 pays waveClearBonus(wave), increments wavesCleared, returns to build, and advances the wave. Wave 10 sets victory.
- A leak that drops integrity to 0 is defeat and pays no clear bonus. wavesCleared stays at fully cleared waves. bestWave is the highest wave started.
- A kill increments kills and does not change score. A leaked Overlord is a normal leak and can still end in victory.

## Files changed

- `src/app/core/game/state.ts` — kills, wavesCleared, bestWave
- `src/app/core/game/engine.ts` — reset zeros the counters; startWave records bestWave
- `src/app/core/systems/wave.ts` — clear, victory, defeat score, live sentences
- `src/app/core/systems/order.ts` — advanceWave still runs in the same slot
- `src/app/core/systems/damage.ts` — a kill increments kills and does not change score
- `src/app/features/game/results-overlay.ts` — overlay and Retry
- `src/app/features/game/wave-preview.ts` — next wave groups in table order
- `src/app/features/game/game-page.ts` — Deploy Wave dispatch and the live region
- `results/TASK-032-waves-endstates.md` — this report

## Tests and evidence

- `npm test` -> exit 0; 12 files, 85 tests passed
- `npm run lint` -> exit 0; All files pass linting
- `npm run e2e` -> exit 0; 5 passed
- grep `Date.now|Math.random|performance.now` under `src/app` -> no matches

## Acceptance criteria

- [x] Clear a crafted wave 1 with integrity 20: gold gains 30, wavesCleared is 1, phase is build, wave is 2
- [x] Clear wave 10 with integrity 8: phase is victory, score is kills * 10 + 10 * 100 + 8 * 25
- [x] Defeat during wave 4 after 3 clears: bestWave is 4, wavesCleared is 3, no bonus, score uses 3 cleared waves
- [x] HUD score text stays 0 while the overlay shows the non-zero score
- [x] Retry returns gold 150, integrity 20, wave 1, and hides the overlay
- [x] Wave preview for wave 10 contains 1 Overlord after 4 Tanks
- [x] Every fixture is destroyed
- [x] runSimulationSystems order is unchanged. loop.ts was not edited

## Decisions / assumptions

- Score formula is kills * 10 + wavesCleared * 100 + remainingIntegrity * 25. It is written once when the run ends and is not recomputed.
- Retry test id is `retry`. It dispatches reset with seed 1.
- Main Menu is intentionally absent so TASK-040 can add it without deleting an assertion.
- Live region text is one sentence: Wave {n} deployed. / Wave {n} cleared. / Core hit. Integrity {n}. / Victory. The core holds. / Defeat. The core is lost.
- Wave preview names follow the table: 8 Drones, Swarm stays Swarm, wave 10 ends with 1 Overlord.

## Handoff for next task

- Do not reorder runSimulationSystems. Do not reverse fileReplacements. Do not award bounty on leak. Do not change score on a kill.
- Do not add a test that asserts Main Menu is absent. TASK-040 adds that control.
- HUD hud-score stays 0. The results overlay is the score display.
