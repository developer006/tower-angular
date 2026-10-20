# VERIFY-4: Phase 4 verification

**Subagent:** general, read-only except the report file
**Result file:** `results/VERIFY-PHASE-4.md`
**Git:** stay on `task/VERIFY-4`. Do not modify source. Do not merge. Do not push. Do not tag.

## Goal

Independently verify phase 4. Write one report. Do not fix failures. Do not re-author simulator rows.

## Read first

- `plan/implementation-plan.md` §6 Phase 4 only
- `results/TASK-044-polish-e2e.md`

If that result does not start with `status: pass`, write `status: blocked` and stop.

## Checks

Run these yourself, in the foreground. Do not trust an earlier summary.

```bash
npm run sim
npm test
npm run lint
npm run e2e
```

`npm run e2e` must print `18 passed`.

`npm run sim` stdout must show:

- `none` defeat, `bestWave=2`
- `pulse`, `mortar`, and `cryo` defeat, `bestWave=6` or `bestWave=7`
- `mixed` victory with integrity 8 through 15

Copy the sim rows from the command. A row you did not see printed is a failure.

Also confirm by reading:

- `e2e/specs/pause-speed.spec.ts`, `persistence.spec.ts`, and `accessibility.spec.ts` exist.
- `accessibility.spec.ts` has no `disableRules`.
- `angular.json` `fileReplacements` replaces `harness-loader.ts` with `harness-loader.e2e.ts` only in the `e2e` configuration. The default file is the no-op. If that direction is reversed, status is `blocked`.
- No `@angular` import under `src/app/core/game/` or `src/app/core/systems/`.
- `/` has a Play control, results has Retry and Main Menu, and the storage key in `settings-store.ts` is `core-defense:v1`.

`status: pass` only if every command exited 0 and every read check holds. Otherwise `status: blocked` with the failing command and output.

Do not edit `plan/`, `results/INDEX.md`, or source. Do not spawn subagents. Do not create `visual.spec.ts`.

Write `results/VERIFY-PHASE-4.md` and commit only that file:

```bash
git add results/VERIFY-PHASE-4.md
git commit -m "docs(VERIFY-4): record phase 4 verification"
```

First lines:

```text
status: pass
commit: pending
verify: npm run sim && npm test && npm run lint && npm run e2e
verify_exit: 0
```

Use `blocked` instead of `pass` if a check failed. Do not write a hash. Do not amend.

Final chat reply <= 8 lines.
