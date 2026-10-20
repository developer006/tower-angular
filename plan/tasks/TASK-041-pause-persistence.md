# TASK-041: Pause, speed, visibility, and persistence

**Phase / dependencies:** Phase 4. Depends on TASK-040 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-041-pause-persistence` (already created from `main`; stay on it)
**Result file:** `results/TASK-041-pause-persistence.md`

## Goal

Pause and 2x speed work, a hidden tab does not fast-forward, and best score plus settings survive reload. Corrupt storage falls back without throwing.

## Read first — only these

- `results/TASK-040-menu-results.md`
- `plan/implementation-plan.md` §1.6 and the pause paragraph in §2.1
- `src/app/state/game-facade.ts`
- `src/app/core/game/loop.ts`
- `src/app/features/game/results-overlay.html`

If the TASK-040 result does not start with `status: pass`, stop.

Do not edit the accumulator correction in `loop.ts`. Do not reverse `fileReplacements`. Do not remove Retry or Main Menu. Do not add synthesized audio. TASK-042 owns sound playback. This task only stores `soundMuted`.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-041-pause-persistence`. Do not switch, merge, or push.

## Locked behavior

- `Space` toggles pause. `F` toggles speed between 1 and 2 only. Ignore those keys when the target is an input, textarea, or select. Do not handle them as build keys.
- While paused, `deploy-wave` is disabled. Build, upgrade, sell, and targeting stay enabled.
- A paused `advanceFrame` does not add `frameDelta` to the accumulator and does not increase `tick`.
- A hidden document discards frame time the same way and does not change the user's pause flag. The first frame after becoming visible must not step the time that passed while hidden.
- `SettingsStore` calls `load()` from its constructor. Storage key is `core-defense:v1`. Shape is `{ bestScore, bestWave, soundMuted, reducedMotion, colorblind }`. Defaults are 0, 0, false, false, false. The theme key `theme` is separate and must not be written inside this object.
- A missing key, corrupt JSON, or a wrong type falls back to the defaults and does not throw.
- Persist `bestScore` when the new end score is greater than the stored one. Persist `bestWave` when the run's `bestWave` is greater than the stored one. Do this when the run reaches victory or defeat, not on every tick.
- Results overlay shows `data-testid="best-score"` with the stored best score. HUD `hud-score` stays `0`.
- A button `data-testid="pause"` and `data-testid="speed"` reflect the current values. A `data-testid="sound-muted"` control toggles the stored flag and does not play audio.

## Tests

- Missing, `'{'`, and `{ "bestScore": "nope" }` all load as defaults and do not throw.
- A finalized score of 100 then 50 leaves bestScore 100.
- Paused `advanceFrame(engine, loop, 1)` leaves tick and accumulator at 0.
- `F` goes from 1 to 2 to 1.
- Hidden-tab handling does not call `setPaused`.
- Destroy every fixture.

## Commands

```bash
npm test
npm run lint
npm run e2e
```

Playwright stays at 8 passed.

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, or another task result.
- Do not add dependencies. Do not spawn subagents. Do not `git add -A`.
- No `@angular` imports under `src/app/core/game/` or `src/app/core/systems/`.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
```

`notes:` must say the storage key is `core-defense:v1`, theme stays separate, and pause does not dump the accumulator.

```bash
git add \
  src/app/state/settings-store.ts \
  src/app/state/settings-store.spec.ts \
  src/app/state/game-facade.ts \
  src/app/features/game/game-page.ts \
  src/app/features/game/game-page.html \
  src/app/features/game/results-overlay.ts \
  src/app/features/game/results-overlay.html \
  src/app/features/game/board-overlay.ts \
  results/TASK-041-pause-persistence.md
git status --short
git commit -m "feat(TASK-041): add pause, speed, and settings persistence"
```

Add a spec file by name if you split one. Stop if an unexpected path is untracked.

Final chat reply <= 8 lines.
