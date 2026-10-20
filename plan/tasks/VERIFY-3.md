# VERIFY-3: Phase 3 verification

**Subagent:** general, read-only except the report file
**Result file:** `results/VERIFY-PHASE-3.md`
**Git:** stay on `task/VERIFY-3`. Do not modify source. Do not merge. Do not push.

## Goal

Independently verify phase 3. Write one report. Do not fix failures. Do not re-author simulator rows.

## Read first

- `plan/implementation-plan.md` §6 Phase 3 only
- `results/TASK-033-combat-e2e.md`
- `results/TASK-035-balance-tune.md`

If either result does not start with `status: pass`, write `status: blocked` and stop.

## Checks

Run these yourself, in the foreground.

```bash
npm run sim
npm test
npm run lint
npm run e2e
```

`npm run sim` stdout must show:

- `none` defeat, `bestWave=2`
- `pulse`, `mortar`, and `cryo` defeat, `bestWave=6` or `bestWave=7`
- `mixed` victory with integrity 8 through 15

Also confirm by reading:

- `e2e/specs/combat.spec.ts`, `leak-defeat.spec.ts`, and `victory.spec.ts` exist.
- Victory score oracle is 500. Retry is asserted present. No spec asserts Main Menu is absent.
- `runSimulationSystems` order is still spawn, slow, move, targets, fire, projectiles, damage, wave, effects.
- No `@angular` import under `src/app/core/game/` or `src/app/core/systems/`.

`status: pass` only if every command exited 0 and the sim rows match. Otherwise `status: blocked` with the failing command and output.

Do not edit `plan/`, `results/INDEX.md`, or source. Do not spawn subagents.

Write `results/VERIFY-PHASE-3.md` and commit only that file:

```bash
git add results/VERIFY-PHASE-3.md
git commit -m "docs(VERIFY-3): record phase 3 verification"
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
