# TASK-023-FIX: Show apply-time placement rejections

**Phase / dependencies:** Phase 2. TASK-023 blocked before commit.
**Subagent:** general
**Git branch:** `task/TASK-023-FIX` (already created from `main`; stay on it)
**Result file:** `results/TASK-023-FIX.md`

## Goal

A queued `placeTower` that `step()` rejects must show the locked reason in `placement-error`. Then add the two Playwright specs from `plan/tasks/TASK-023-build-e2e.md`. Do not weaken the oracles.

## Why the last attempt blocked

Unpaused `placeTower` returns `{ ok: true, queued: true }`. `BoardOverlay` clears `placement-error` when `result.ok` is true. `engine.step()` applies the command and discards the `occupied` or `insufficient-gold` result. After `stepTicks(1)`, gold stays `80` but the error text is `""`. Expected text is `That pad is already taken.`

Do not reject occupancy at dispatch time. The double-queue engine test depends on apply-time checks. Do not pause the engine in the spec to hide this. Do not change gold oracles.

## Read first — only these

- `plan/tasks/TASK-023-build-e2e.md`
- `results/TASK-021-placement-economy.md`
- `src/app/core/game/engine.ts` `step()`
- `src/app/state/game-facade.ts` `stepTicks` and the animation-frame callback
- `src/app/features/game/board-overlay.ts` place method

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-023-FIX`. Do not switch, merge, or push.

## Fix

- `step()` stores each `apply()` result. Add `takeStepResults(): CommandResult[]`.
- `GameFacade.stepTicks` and the frame callback after `advanceFrame` publish the latest rejection.
- `placement-error` renders that message. A queued dispatch must not leave the element stuck on `""` after the rejecting step.
- Locked strings, unchanged:
  - `occupied` -> `That pad is already taken.`
  - `insufficient-gold` -> `Not enough gold.`
  - `unknown-pad` -> `That pad is not on the map.`
  - `unknown-tower` -> `Unknown tower.`
  - no selection -> `Select a tower first.`
- An accepted placement still clears the message.
- Paused placement still applies immediately and still shows an immediate rejection.

## Unit test

Unpaused, queue two Pulse places on `pad-01`, call `stepTicks(1)`. Gold is `80`. `placement-error` is `That pad is already taken.` One tower. Destroy the fixture.

## Specs

Follow `plan/tasks/TASK-023-build-e2e.md` exactly. Create only `e2e/specs/build.spec.ts` and `e2e/specs/upgrade-sell.spec.ts`. Manual mode on. `stepTicks(1)` after each spending UI action. Oracles: gold `80`, then `30`, then `114`; L1-only sell ends at `129`. Error strings as above. `data-range-tiles` is `3.2`.

## Commands

```bash
npm test
npm run lint
npm run e2e
```

Expect Playwright 4 passed. Do not edit `loop.ts`. Do not reverse `fileReplacements`.

## Handoff

Write `results/TASK-023-FIX.md` before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
```

`notes:` must say apply-time rejections are published by `takeStepResults`, and the spec names.

```bash
git add \
  src/app/core/game/engine.ts \
  src/app/state/game-facade.ts \
  src/app/features/game/board-overlay.ts \
  src/app/features/game/board-overlay.html \
  src/app/features/game/board-overlay.spec.ts \
  e2e/specs/build.spec.ts \
  e2e/specs/upgrade-sell.spec.ts \
  results/TASK-023-FIX.md
git status --short
git commit -m "fix(TASK-023): show apply-time placement rejections"
```

Add an e2e helper by name if you create one. Stop if an unexpected path is untracked. Do not `git add -A`. Do not spawn subagents.

Final chat reply <= 8 lines.
