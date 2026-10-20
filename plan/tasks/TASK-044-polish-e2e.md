# TASK-044: Pause, persistence, and accessibility e2e

**Phase / dependencies:** Phase 4. Depends on TASK-043 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-044-polish-e2e` (already created from `main`; stay on it)
**Result file:** `results/TASK-044-polish-e2e.md`

## Goal

Add the pause/speed and persistence Playwright specs, and extend the existing accessibility spec. Do not add a visual spec.

## Read first — only these

- `results/TASK-043-accessibility.md`
- `plan/implementation-plan.md` §4.2, the pause paragraph in §2.1, and §1.7
- `e2e/specs/accessibility.spec.ts`
- `e2e/specs/build.spec.ts`
- `src/app/core/testing/harness-loader.e2e.ts`
- `src/app/core/systems/wave.ts` (`nextLiveAnnouncement`)

If the TASK-043 result does not start with `status: pass`, stop.

Do not edit `loop.ts`. Do not reverse `fileReplacements`. Do not write into `state.effects`. Do not create `e2e/specs/visual.spec.ts`. TASK-050 owns that file. Do not create a second accessibility spec. Do not delete the two axe tests, and do not add `disableRules`.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-044-polish-e2e`. Do not switch, merge, or push.

## Locked specs

`e2e/specs/pause-speed.spec.ts` has two tests. `page.clock.install()` happens before `goto`. Manual mode is off. Drive time with about 16 ms slices. Do not call `page.clock.runFor(1000)` in one shot, and do not use `stepTicks` for the pause or speed assertion. A paused run that never advanced is not evidence.

- `pause freezes tick and does not dump paused time on resume`: slice until tick is at least 10. Record tick and accumulator. Click `data-testid="pause"`. Twenty more slices leave both unchanged, and `deploy-wave` is disabled. Resume, then one 16 ms slice increases tick by at most 1. The accumulator stays below 0.2.
- `2x advances about twice as far`: same slice count at speed 1 and speed 2, after `reset`. The 2x tick delta is at least 1.7 times the 1x delta and at most 2.3 times it. Both deltas are greater than 0.

Expose a read-only `getLoop(): { accumulator: number }` on the e2e harness and the facade. Do not edit `src/app/core/testing/harness-loader.ts`.

`e2e/specs/persistence.spec.ts` has two tests.

- `best score and settings survive reload`: end a run through the UI, read `data-testid="best-score"`, toggle sound, reduced motion, and colorblind, reload, and expect the same `core-defense:v1` best score plus those three flags. The `theme` key is not inside that object.
- `corrupt storage falls back and does not throw`: `addInitScript` sets `core-defense:v1` to `{` and `theme` to `deeppurple-amber` before navigation. The page loads, the sound control says `Sound`, and the theme link still ends in `deeppurple-amber.css`. No page error.

Extend `e2e/specs/accessibility.spec.ts`. Keep the two axe tests unchanged.

- `Tab and Enter place a Pulse`: press `1`, Tab until the focused element is a pad, press Enter, step once, gold is 80, and that pad has a Pulse. Do not place by coordinates.
- `focused pad shows a 2px solid outline`: after keyboard focus, computed `outline-width` is `2px` and `outline-style` is `solid`.
- `live region announces Wave 1 deployed`: after deploy and one step, `[data-testid="live-region"]` text is exactly `Wave 1 deployed.`
- `live region announces a leak as the whole text`: step one tick at a time until integrity drops and phase is still `wave`. The live region is exactly `Core hit. Integrity ${integrity}.` and does not contain a second sentence.

## Commands

```bash
npm test
npm run lint
npm run e2e
```

`npm run e2e` must print `18 passed`: the existing 10, plus 2 pause/speed, 2 persistence, and 4 new accessibility tests.

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

`notes:` must say manual mode was off for the clock spec, and the two axe tests were not given `disableRules`.

```bash
git add \
  e2e/specs/pause-speed.spec.ts \
  e2e/specs/persistence.spec.ts \
  e2e/specs/accessibility.spec.ts \
  src/app/core/testing/harness-loader.e2e.ts \
  src/app/state/game-facade.ts \
  results/TASK-044-polish-e2e.md
git status --short
git commit -m "test(TASK-044): cover pause, persistence, and accessibility"
```

Add a facade spec by name if `getLoop` needs one. Stop if an unexpected path is untracked.

Final chat reply <= 8 lines.
