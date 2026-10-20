# TASK-042: Synth SFX, reduced motion, and colorblind palette

**Phase / dependencies:** Phase 4. Depends on TASK-041 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-042-audio-polish` (already created from `main`; stay on it)
**Result file:** `results/TASK-042-audio-polish.md`

## Goal

Add mute-aware synthesized sounds, a reduced-motion switch, and a colorblind palette. Do not change simulation results.

## Read first — only these

- `results/TASK-041-pause-persistence.md`
- `plan/implementation-plan.md` §1.7 and the audio line in §10
- `src/app/state/settings-store.ts`
- `src/app/core/render/palette.ts`
- `src/app/features/game/game-page.ts`
- `src/app/features/game/game-page.html`

If the TASK-041 result does not start with `status: pass`, stop.

Do not edit `loop.ts`. Do not reverse `fileReplacements`. Do not write into `state.effects`. Do not import `@angular` under `src/app/core/game/` or `src/app/core/systems/`. Do not add an audio file or an npm dependency. Do not add Playwright specs. TASK-043 owns axe. TASK-044 owns `pause-speed.spec.ts`, `persistence.spec.ts`, `accessibility.spec.ts`, and `visual.spec.ts`.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-042-audio-polish`. Do not switch, merge, or push.

## Locked behavior

- Synth lives in `src/app/features/audio/synth.ts`. It uses `AudioContext` only. No decoded buffers and no asset URLs.
- Cues are `place`, `leak`, `victory`, and `defeat`. Each is one short oscillator burst. A missing `AudioContext` does not throw.
- `soundMuted` true means `play` is a no-op and does not construct `AudioContext`.
- Do not call the synth from `engine.step()`, the balance simulator, or `core/systems`. Hook `place` from a successful pad placement in the feature layer. Hook `leak`, `victory`, and `defeat` from the same live-region path that already sets those sentences.
- Add `toggleReducedMotion()` and `toggleColorblind()` on `SettingsStore`. They persist inside `core-defense:v1` and do not write the `theme` key.
- HUD buttons: `data-testid="reduced-motion"` and `data-testid="colorblind"`. The existing `sound-muted` button stays.
- `reducedMotion` true, and `prefers-reduced-motion: reduce`, both set `transition: none` and `animation: none` on the game page. Do not add shake, particles, or a glow pulse. There is nothing to disable beyond CSS motion.
- `colorblind` true sets `data-colorblind="true"` on `document.documentElement` and passes an alternate palette into `renderMap`. The alternate palette must not rely on red versus green alone: path, pad, entry, and core use four hues that stay distinct in grayscale order (path darkest, then pad, entry, core lightest). Default palette stays the current `PALETTE` when the flag is false.
- Palette buttons keep their text names. Add `data-shape="circle"` on Pulse, `square` on Mortar, and `diamond` on Cryo. Those attributes are always present, not only in colorblind mode.

## Tests

- Muted `play('place')` does not touch a stub `AudioContext`.
- Unmuted `play('place')` calls `start` once. A missing `AudioContext` does not throw.
- Toggling reduced motion and colorblind writes booleans into `core-defense:v1` and leaves `localStorage['theme']` unchanged.
- `renderMap` with the colorblind palette fills the core with the lightest of the four locked hues.
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
- Do not spawn subagents. Do not `git add -A`.
- No `@angular` imports under `src/app/core/game/` or `src/app/core/systems/`.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
```

`notes:` must say the synth is not called from the simulator, and `state.effects` is still unused.

```bash
git add \
  src/app/features/audio/synth.ts \
  src/app/features/audio/synth.spec.ts \
  src/app/state/settings-store.ts \
  src/app/state/settings-store.spec.ts \
  src/app/core/render/palette.ts \
  src/app/core/render/renderer.ts \
  src/app/features/game/game-page.ts \
  src/app/features/game/game-page.html \
  src/app/features/game/game-page.css \
  src/app/features/game/board-overlay.ts \
  src/app/features/game/board-overlay.html \
  results/TASK-042-audio-polish.md
git status --short
git commit -m "feat(TASK-042): add synth cues, reduced motion, and a colorblind palette"
```

Add a spec by name if you split one. Stop if an unexpected path is untracked.

Final chat reply <= 8 lines.
