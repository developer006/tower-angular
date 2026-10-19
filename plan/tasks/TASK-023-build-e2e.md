# TASK-023: Build and upgrade Playwright specs

**Phase / dependencies:** Phase 2. Depends on TASK-022 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-023-build-e2e` (already created from `main`; stay on it)
**Result file:** `results/TASK-023-build-e2e.md`

## Goal

Add two Playwright specs that drive placement, rejection, upgrade, and sell through the real UI. Do not add a third spec. Do not change game rules.

## Read first — only these

- `results/TASK-021-placement-economy.md`
- `results/TASK-022-palette-inspector.md`
- `results/TASK-013-e2e-harness.md`
- `e2e/specs/smoke.spec.ts`

If either task result does not start with `status: pass`, stop.

Copy the reason strings and refund oracles. Do not invent pad ids. Do not edit `loop.ts`. Do not reverse `fileReplacements`.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-023-build-e2e`. Do not switch, merge, or push.

## Specs

Create only:

- `e2e/specs/build.spec.ts`
- `e2e/specs/upgrade-sell.spec.ts`

`webServer` stays `npm run start:e2e`. Wait for `window.__TD__?.ready === true` after `page.goto('/play')`. Call `setManualMode(true)` before clicks so the frame loop does not race. Unpaused placement, upgrade, and sell stay queued until `step()`. After each UI action that should spend or refund gold, call `stepTicks(1)` before reading gold.

Do not assert through `dispatch` for the behavior under test. `dispatch` and `reset` may set up a clean board only. The click or key that spends gold must be a real UI event.

### build.spec.ts

- Click `palette-pulse`, click `pad-01`, `stepTicks(1)`. `hud-gold` is `80`. `getFullState().towers` has `t1` on `pad-01`.
- Click `pad-01` again, `stepTicks(1)`. Gold stays `80`. `placement-error` is `That pad is already taken.`
- Press `Escape`, press `3`, focus `pad-02`, press `Enter`, `stepTicks(1)`. A Cryo tower is on `pad-02`. Gold is `80 - 90` only if that would be non-negative; it is not, so this press must instead show `Not enough gold.` and leave gold at `80`. That is the keyboard rejection.
- Hover `pad-03` while Pulse is selected. `board-overlay` `data-range-tiles` is `3.2`.
- No page errors.

### upgrade-sell.spec.ts

- UI-place Pulse on `pad-01` as above. Gold `80`.
- Press `Escape` so no type is selected. Click `pad-01`. Inspector `tower-inspector` is visible and does not dispatch another place. Gold stays `80`.
- Click `upgrade-tower`, `stepTicks(1)`. Gold is `30`. Tower level is `2` and invested is `120`.
- Click `sell-tower`, `stepTicks(1)`. Gold is `114`. The pad has no tower. Inspector is gone.
- A second test, fresh page: UI-place Pulse, open inspector, sell without upgrade. Gold is `129`. A nearest-5 refund (`130` or `85`) is wrong.

## Commands

```bash
npm run e2e
npm test
npm run lint
```

Expect Playwright 4 passed: shell, smoke, build, upgrade-sell. Do not add combat, leak, or visual specs.

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, or source except a test helper under `e2e/` if you need one. Add that helper by name.
- Do not add dependencies. Do not spawn subagents. Do not `git add -A`.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm run e2e && npm test && npm run lint
verify_exit: 0
```

`notes:` must say the specs are `build.spec.ts` and `upgrade-sell.spec.ts`, and that UI actions need `stepTicks(1)` while manual mode is on.

```bash
git add \
  e2e/specs/build.spec.ts \
  e2e/specs/upgrade-sell.spec.ts \
  results/TASK-023-build-e2e.md
git status --short
git commit -m "test(TASK-023): cover placement, upgrade, and sell in Playwright"
```

Stop if an unexpected path is untracked or if build output is staged.

Final chat reply <= 8 lines.
