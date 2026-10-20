# TASK-032: Wave clear, victory, defeat, and results overlay

**Phase / dependencies:** Phase 3. Depends on TASK-031 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-032-waves-endstates` (already created from `main`; stay on it)
**Result file:** `results/TASK-032-waves-endstates.md`

## Goal

Finish the 10-wave state machine, show the results overlay with score and Retry, and preview the next wave. Do not add Main Menu. Do not change score on a kill before the run ends.

## Read first — only these

- `results/TASK-031-combat.md`
- `plan/implementation-plan.md` §1.5 and §1.6
- `src/app/core/systems/order.ts`
- `src/app/core/content/waves.ts`
- `src/app/features/game/game-page.html`

If the TASK-031 result does not start with `status: pass`, stop.

Do not reorder `runSimulationSystems`. Do not edit `loop.ts`. Do not reverse `fileReplacements`. Do not award bounty on leak. Do not add a Main Menu button. Do not add a test that asserts Main Menu is absent.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-032-waves-endstates`. Do not switch, merge, or push.

## Locked behavior

- Add `kills`, `wavesCleared`, and `bestWave` to `GameState`. `reset` sets them to 0. A kill increments `kills` and still does not change `score`.
- `startWave` sets `bestWave` to the max of its current value and the 1-based wave being started.
- `advanceWave` clears a wave only when `phase` is `wave`, the spawn queue is empty, no alive enemies remain, and no projectiles remain. Then, if integrity is above 0, add `waveClearBonus(wave)` to gold and increment `wavesCleared`.
- After a clear of waves 1 through 9, set `phase` back to `build` and increment `wave` by 1. Wave 10 clear with integrity above 0 sets `phase` to `victory`.
- A leaked Overlord is a normal leak. Victory still happens if integrity stays above 0.
- Defeat is already set when integrity hits 0. Do not pay a wave-clear bonus on that path. `wavesCleared` stays at the number of fully cleared waves, so a defeat during wave N scores N-1. `bestWave` can be N.
- Compute score once, when `phase` becomes `victory` or `defeat`: `kills * 10 + wavesCleared * 100 + remainingIntegrity * 25`. Do not recompute it. HUD `hud-score` stays `0`. The overlay shows the computed score.
- Wire `deploy-wave` to `facade.dispatch({ type: 'startWave' })`. It stays disabled while paused. Unpaused start stays queued until `step()`.
- Results overlay `data-testid="results-overlay"` is visible only for `victory` or `defeat`. It shows waves cleared, kills, integrity, and score. `data-testid="retry"` calls `reset(1)` and closes the overlay.
- Wave preview `data-testid="wave-preview"` lists the next wave's groups in table order. Wave 1 is `8 Drones`. Wave 10 ends with `1 Overlord`, not the other way around.
- Live region `data-testid="live-region"` with `aria-live="polite"` uses the whole text, not a join. Exact sentences: `Wave {n} deployed.` / `Wave {n} cleared.` / `Core hit. Integrity {n}.` / `Victory. The core holds.` / `Defeat. The core is lost.`
- No `Date.now()` as a gameplay seed. Retry uses seed 1.

## Tests

- Clear a crafted wave 1 with integrity 20: gold gains 30, `wavesCleared` is 1, `phase` is `build`, `wave` is 2.
- Clear wave 10 with integrity 8: `phase` is `victory`, score is `kills * 10 + 10 * 100 + 8 * 25`.
- Defeat during wave 4 after 3 clears: `bestWave` is 4, `wavesCleared` is 3, no bonus for wave 4, score uses 3 cleared waves.
- HUD score text stays `0` while the overlay shows the non-zero score.
- Retry returns gold 150, integrity 20, wave 1, and hides the overlay.
- Wave preview for wave 10 contains `1 Overlord` after `4 Tanks`.
- Destroy every fixture.

## Commands

```bash
npm test
npm run lint
npm run e2e
```

Playwright stays at 5 passed. The smoke spec still finds an enabled Deploy Wave button. Do not click it in that spec.

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, or another task result.
- Do not add dependencies. Do not spawn subagents. Do not `git add -A`.
- Do not add Main Menu.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
```

`notes:` must list the score formula, the Retry test id, and that Main Menu is intentionally absent so TASK-040 can add it without deleting an assertion.

```bash
git add \
  src/app/core/game/state.ts \
  src/app/core/game/engine.ts \
  src/app/core/systems/order.ts \
  src/app/core/systems/damage.ts \
  src/app/core/systems/wave.ts \
  src/app/core/systems/wave.spec.ts \
  src/app/features/game/game-page.ts \
  src/app/features/game/game-page.html \
  src/app/features/game/results-overlay.ts \
  src/app/features/game/results-overlay.html \
  src/app/features/game/wave-preview.ts \
  src/app/features/game/wave-preview.html \
  results/TASK-032-waves-endstates.md
git status --short
git commit -m "feat(TASK-032): add wave clears, score, and the results overlay"
```

Add a CSS file by name if you create one. Stop if an unexpected path is untracked.

Final chat reply <= 8 lines.
