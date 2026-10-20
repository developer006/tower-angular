# VERIFY-2: Phase 2 verification

**Subagent:** general, read-only except the report file
**Result file:** `results/VERIFY-PHASE-2.md`
**Git:** stay on `task/VERIFY-2`. Do not modify source. Do not merge. Do not push.

## Goal

Independently verify phase 2. Write one report. Do not fix failures.

## Read first

- `plan/implementation-plan.md` §6 Phase 2 only
- `results/TASK-021-placement-economy.md`
- `results/TASK-022-palette-inspector.md`
- `results/TASK-023-FIX.md`

If any of those does not start with `status: pass`, write `status: blocked` and stop.

## Checks

Run these yourself.

```bash
npm test
npm run lint
npm run e2e
```

Also confirm by reading:

- `e2e/specs/build.spec.ts` expects `That pad is already taken.` and `Not enough gold.` and `data-range-tiles` `3.2`.
- `e2e/specs/upgrade-sell.spec.ts` expects gold `114` and `129`.
- `placement-error` is not asserted as an empty string for an occupied pad.
- HUD score text in the game page starts at `0`.
- Pad buttons `pad-01` through `pad-14` still exist.
- `fileReplacements` still replaces `harness-loader.ts` with `harness-loader.e2e.ts` only on the `e2e` configuration.

`status: pass` only if every command exited 0 and the read checks hold. Playwright must include the build and upgrade-sell specs. Otherwise `status: blocked` with the failing command and output.

Do not edit `plan/`, `results/INDEX.md`, or source. Do not spawn subagents.

Write `results/VERIFY-PHASE-2.md` and commit only that file:

```bash
git add results/VERIFY-PHASE-2.md
git commit -m "docs(VERIFY-2): record phase 2 verification"
```

First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
```

Use `blocked` instead of `pass` if a check failed. Do not write a hash. Do not amend.

Final chat reply <= 8 lines.
