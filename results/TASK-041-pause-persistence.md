status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
files:
- src/app/state/settings-store.ts
- src/app/state/settings-store.spec.ts
- src/app/state/game-facade.ts
- src/app/features/game/game-page.ts
- src/app/features/game/game-page.html
- src/app/features/game/results-overlay.ts
- src/app/features/game/results-overlay.html
- src/app/features/game/board-overlay.ts
- src/app/features/game/pause-persistence.spec.ts
- src/app/features/game/board-overlay.spec.ts
- results/TASK-041-pause-persistence.md
api:
- SettingsStore.load(), recordRunEnd(score, bestWave), toggleSoundMuted()
- GameFacade.togglePaused(), toggleSpeed(), speed signal
deviations:
- board-overlay.spec.ts presses Space a second time so the queued-click gold assertion still runs unpaused. The first Space now pauses and would apply the place immediately.
notes:
- Storage key is core-defense:v1. Theme stays under the separate theme key and is not written inside this object.
- Pause does not dump the accumulator. A paused advanceFrame leaves tick and accumulator unchanged, including a non-zero remainder.
- Hidden-tab handling discards frame time and does not call setPaused.

# TASK-041 Result

**Status:** pass
**Branch:** task/TASK-041-pause-persistence
**Commit:** pending

## Summary

- Space toggles pause. F toggles speed between 1 and 2. Both are ignored when the target is an input, textarea, or select, and they are not build keys.
- Deploy Wave is disabled while paused. Build, upgrade, sell, and targeting stay enabled.
- A hidden document discards frame time, including the first frame after it becomes visible, and does not change the pause flag.
- Settings persist under `core-defense:v1`. Missing, corrupt, or wrong-type storage falls back to defaults and does not throw. Best score and best wave update only when a run ends and the new value is greater.
- Results overlay shows `data-testid="best-score"`. HUD `hud-score` stays 0. The sound control stores `soundMuted` and does not play audio.

## Files changed

- `src/app/state/settings-store.ts` — load-on-construct store for best score, best wave, and settings
- `src/app/state/settings-store.spec.ts` — missing, corrupt, and wrong-type fallback; 100 then 50 keeps 100
- `src/app/state/game-facade.ts` — speed signal, pause/speed toggles, hidden-tab frame discard
- `src/app/features/game/game-page.ts` — persist best score and best wave on victory or defeat only
- `src/app/features/game/game-page.html` — pause, speed, and sound-muted controls
- `src/app/features/game/results-overlay.ts` — stored best score in the end view
- `src/app/features/game/results-overlay.html` — `data-testid="best-score"`
- `src/app/features/game/board-overlay.ts` — Space and F, not handled as build keys
- `src/app/features/game/pause-persistence.spec.ts` — pause, speed, hidden tab, best score, sound
- `src/app/features/game/board-overlay.spec.ts` — resume after the Space probe so the queued click stays queued
- `results/TASK-041-pause-persistence.md` — this report

## Tests and evidence

- `npm test` -> exit 0; 17 files, 99 tests passed
- `npm run lint` -> exit 0; All files pass linting
- `npm run e2e` -> exit 0; 8 passed

## Acceptance criteria

- [x] Space toggles pause and F toggles speed between 1 and 2 only
- [x] Those keys are ignored on input, textarea, and select, and are not build keys
- [x] Deploy Wave is disabled while paused; build, upgrade, sell, and targeting stay enabled
- [x] Paused `advanceFrame` does not add `frameDelta` and does not increase tick or dump the accumulator
- [x] A hidden document discards frame time and does not call `setPaused`
- [x] Storage key is `core-defense:v1`; theme stays separate
- [x] Missing, `'{'`, and `{ "bestScore": "nope" }` load as defaults and do not throw
- [x] A finalized score of 100 then 50 leaves bestScore 100
- [x] Best score and best wave persist when the run reaches victory or defeat, not on every tick
- [x] Results overlay shows `data-testid="best-score"`; HUD `hud-score` stays 0
- [x] Pause, speed, and sound-muted controls reflect current values; sound does not play audio
- [x] Retry and Main Menu remain
- [x] Every fixture is destroyed

## Decisions / assumptions

- Hidden-tab discard lives in `GameFacade`, not `loop.ts`. The accumulator correction was not edited.
- `SettingsStore` is `providedIn: 'root'` and calls `load()` from its constructor. A wrong type rejects the whole object.
- Best score and best wave are recorded on the victory/defeat transition inside the wrapped `refresh`, so the HUD timer does not rewrite storage every tick.
- No synthesized audio. `soundMuted` is stored only.

## Handoff for next task

- Do not remove Retry or Main Menu. Do not reverse `fileReplacements`. Do not edit the accumulator correction in `loop.ts`.
- TASK-042 owns sound playback. This task only stores `soundMuted`.
- Do not start TASK-042 from this branch.
