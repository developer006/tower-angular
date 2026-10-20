# TASK-032-FIX: Move Angular tests out of core/systems

**Phase / dependencies:** Phase 3. VERIFY-3 blocked on this import.
**Subagent:** general
**Git branch:** `task/TASK-032-FIX` (already created from `main`; stay on it)
**Result file:** `results/TASK-032-FIX.md`

## Goal

`src/app/core/systems/wave.spec.ts` imports `@angular/core/testing`. Production systems must stay free of Angular, and so must every file under `src/app/core/game/` and `src/app/core/systems/`. Move the component tests. Do not delete them.

## Read first

- `src/app/core/systems/wave.spec.ts`

The Angular block starts at `describe('results overlay and wave preview'`. Everything above that is engine-only and stays in `wave.spec.ts`.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-032-FIX`. Do not switch, merge, or push.

## Fix

- Remove the Angular import and the overlay describe from `src/app/core/systems/wave.spec.ts`.
- Put that describe in `src/app/features/game/wave-end.spec.ts`, with the imports it needs.
- Do not weaken an assertion. HUD score stays `0`. Retry still restores gold 150, integrity 20, wave 1. Wave 10 preview still ends with `1 Overlord` after `4 Tanks`.
- Do not edit engine, content, or `loop.ts`.

## Commands

```bash
npm test
npm run lint
if grep -R "@angular" src/app/core/game src/app/core/systems; then echo HAS_ANGULAR; exit 1; else echo NO_ANGULAR; fi
```

## Handoff

Write `results/TASK-032-FIX.md` before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint
verify_exit: 0
```

```bash
git add \
  src/app/core/systems/wave.spec.ts \
  src/app/features/game/wave-end.spec.ts \
  results/TASK-032-FIX.md
git status --short
git commit -m "fix(TASK-032): move Angular wave tests out of core/systems"
```

Do not `git add -A`. Do not spawn subagents.

Final chat reply <= 8 lines.
