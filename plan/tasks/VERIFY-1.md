# VERIFY-1: Phase 1 verification

**Subagent:** general, read-only except the report file
**Result file:** `results/VERIFY-PHASE-1.md`
**Git:** stay on `task/VERIFY-1`. Do not modify source. Do not merge. Do not push.

## Goal

Independently verify phase 1. Write one report. Do not fix failures.

## Read first

- `plan/implementation-plan.md` §6 Phase 1 only
- `results/TASK-010-content-path.md`
- `results/TASK-011-engine-loop.md`
- `results/TASK-012-renderer-shell.md`
- `results/TASK-013-e2e-harness.md`

If any of those result files does not start with `status: pass`, write `status: blocked` and stop.

## Checks

Run these yourself. A previous summary is not evidence.

```bash
npm test
npm run lint
npm run build
if grep -R -q __TD__ dist/tower-angular/browser; then echo PROD_HAS_TD; else echo PROD_ABSENT; fi
npx ng build --configuration e2e
if grep -R -q __TD__ dist/tower-angular/browser; then echo E2E_HAS_TD; else echo E2E_MISSING; fi
npm run e2e
if grep -R "@angular" src/app/core/game src/app/core/systems; then echo HAS_ANGULAR; else echo NO_ANGULAR; fi
```

Also confirm by reading, not by assuming:

- `DT` is `1 / 60` in `src/app/core/game/loop.ts`.
- `engine.spec.ts` has a 600-step same-seed snapshot test.
- `fitCanvasCss(480, 576)` is expected to be `{ width: 480, height: 288 }`.
- `fileReplacements` replaces `harness-loader.ts` with `harness-loader.e2e.ts` only on the `e2e` build configuration.
- `App` does not call `installHarness`. `GamePage` calls it once.
- `window.__TD__` methods include `stepTicks`, `getFullState`, `setManualMode`, and `getMap`.
- Pad ids in the map result are `pad-01` through `pad-14`.

`status: pass` only if every command exited 0, production grep is `PROD_ABSENT`, e2e grep is `E2E_HAS_TD`, and the read checks hold. Otherwise `status: blocked` with the failing command and output.

Do not edit `plan/`, `results/INDEX.md`, or source files. Do not spawn subagents.

Write `results/VERIFY-PHASE-1.md` and commit only that file:

```bash
git add results/VERIFY-PHASE-1.md
git commit -m "docs(VERIFY-1): record phase 1 verification"
```

First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run build && npm run e2e
verify_exit: 0
```

Use `blocked` instead of `pass` if a check failed. Do not write a hash. Do not amend.

Final chat reply <= 8 lines.
