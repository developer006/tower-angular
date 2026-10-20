status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
files:
- src/app/features/audio/synth.ts
- src/app/features/audio/synth.spec.ts
- src/app/state/settings-store.ts
- src/app/state/settings-store.spec.ts
- src/app/core/render/palette.ts
- src/app/core/render/renderer.ts
- src/app/core/render/colorblind-palette.spec.ts
- src/app/features/game/game-page.ts
- src/app/features/game/game-page.html
- src/app/features/game/game-page.css
- src/app/features/game/board-overlay.ts
- results/TASK-042-audio-polish.md
api:
- play(cue, muted?) for place, leak, victory, and defeat
- SettingsStore.toggleReducedMotion(), toggleColorblind()
- COLORBLIND_PALETTE / COLORBLIND_HUES; renderMap(..., palette)
deviations:
- renderMap swaps PALETTE for the paint and restores it, because drawStatic reads PALETTE. background.ts was not edited.
- colorblind-palette.spec.ts holds the renderMap hue assertion.
notes:
- The synth is not called from the simulator, and state.effects is still unused.
- Place plays from a successful pad placement in the feature layer. Leak, victory, and defeat play from the live-region path. A muted play does not construct AudioContext.
- reducedMotion and prefers-reduced-motion: reduce set transition and animation to none. colorblind sets data-colorblind="true" and passes the alternate palette. Pulse, Mortar, and Cryo keep their names and always have data-shape.

# TASK-042 Result

**Status:** pass
**Branch:** task/TASK-042-audio-polish
**Commit:** pending

## Summary

- Synth cues are short oscillator bursts for place, leak, victory, and defeat. Mute skips AudioContext. A missing AudioContext does not throw.
- Reduced motion and colorblind persist as booleans in core-defense:v1 and do not write theme.
- The colorblind palette uses four hues that stay distinct in grayscale order: path darkest, then pad, entry, core lightest. The default PALETTE is unchanged when the flag is false.

## Files changed

- `src/app/features/audio/synth.ts` — AudioContext oscillator cues
- `src/app/features/audio/synth.spec.ts` — muted no-op, one start, missing context
- `src/app/state/settings-store.ts` — toggleReducedMotion and toggleColorblind
- `src/app/state/settings-store.spec.ts` — booleans in core-defense:v1, theme unchanged
- `src/app/core/render/palette.ts` — colorblind hues
- `src/app/core/render/renderer.ts` — renderMap accepts the alternate palette
- `src/app/core/render/colorblind-palette.spec.ts` — core fill is the lightest locked hue
- `src/app/features/game/game-page.ts` — live-region cues, colorblind attribute, palette pass-through
- `src/app/features/game/game-page.html` — reduced-motion and colorblind buttons; shape attributes
- `src/app/features/game/game-page.css` — reduced motion and shape marks
- `src/app/features/game/board-overlay.ts` — place cue after a successful pad placement
- `results/TASK-042-audio-polish.md` — this report

## Tests and evidence

- `npm test` -> exit 0; 19 files, 104 tests passed
- `npm run lint` -> exit 0; All files pass linting
- `npm run e2e` -> exit 0; 8 passed

## Acceptance criteria

- [x] Cues are place, leak, victory, and defeat; each is one short oscillator burst
- [x] A missing AudioContext does not throw
- [x] soundMuted true makes play a no-op and does not construct AudioContext
- [x] place is hooked from a successful pad placement in the feature layer
- [x] leak, victory, and defeat are hooked from the live-region path
- [x] The synth is not called from the simulator, and state.effects is still unused
- [x] toggleReducedMotion and toggleColorblind persist booleans in core-defense:v1 and do not write theme
- [x] HUD buttons data-testid reduced-motion and colorblind; sound-muted stays
- [x] reducedMotion and prefers-reduced-motion: reduce set transition and animation to none
- [x] colorblind sets data-colorblind="true" and passes an alternate palette into renderMap
- [x] Path, pad, entry, and core stay distinct in grayscale order, core lightest
- [x] Default PALETTE is unchanged when the flag is false
- [x] Pulse, Mortar, and Cryo keep their names and always have data-shape circle, square, and diamond
- [x] Every fixture is destroyed

## Decisions / assumptions

- play(cue, muted) checks mute before looking up AudioContext. The feature layer passes SettingsStore.soundMuted().
- A queued place plays only after the step confirms the pad gained a tower. A paused place plays when dispatch applies it.
- No shake, particles, or glow pulse were added. CSS motion is the only motion to disable.

## Handoff for next task

- Do not call the synth from engine.step(), the balance simulator, or core/systems.
- Do not write into state.effects. Do not reverse fileReplacements. Do not edit loop.ts.
- TASK-043 owns axe. TASK-044 owns pause-speed.spec.ts, persistence.spec.ts, accessibility.spec.ts, and visual.spec.ts.
- Do not start TASK-043 from this branch.
