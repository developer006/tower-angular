# TASK-051: Docs, performance, flake, and bundle checks

**Phase / dependencies:** Phase 5. Depends on TASK-050 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-051-docs-release` (already created from `main`; stay on it)
**Result file:** `results/TASK-051-docs-release.md`

## Goal

Rewrite the README and record a release checklist backed by commands you ran. Do not add the GitHub Pages deploy. TASK-052 owns that.

## Read first — only these

- `results/TASK-050-visual-regression.md`
- `plan/implementation-plan.md` §6 Phase 5 and §9
- `README.md`
- `package.json`
- `angular.json` (`fileReplacements` only)

If the TASK-050 result does not start with `status: pass`, stop.

Do not edit `loop.ts`. Do not reverse `fileReplacements`. Do not add `build:pages`, `copy-404.mjs`, or a deploy workflow. Do not commit a PNG. Do not run `--update-snapshots`.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-051-docs-release`. Do not switch, merge, or push.

## README

Replace the stale "Playwright shell spec" line. The README must document:

- Setup: Node 26, `npm install`
- Commands that exist today: `start`, `start:e2e`, `test`, `lint`, `e2e`, `sim`, `build`. Do not document a script this commit does not add.
- Architecture: simulation lives under `src/app/core/` and has no Angular imports in `core/game` or `core/systems`. The UI lives under `src/app/features/`.
- Harness direction, in this sentence: the default file `src/app/core/testing/harness-loader.ts` is the no-op, and the `e2e` configuration replaces it with `harness-loader.e2e.ts`. Do not reverse that sentence.
- Test strategy: unit tests, the 18 Playwright tests, `npm run sim`, and visual captures that run only when `VISUAL=1`. Baselines are produced on Ubuntu by `visual-baselines.yml`, not on Windows.

Add a release checklist section. It is a list of commands, not a claim that Pages is deployed.

## Checks you must run

```bash
npm test
npm run lint
npm run e2e
npm run e2e
npm run e2e
npm run sim
npm run build
```

Three `npm run e2e` runs, each printing `18 passed`. Copy the sim rows from this run. Do not invent them.

After `npm run build`, grep `dist/` for `__TD__` and `harness-loader.e2e`. Both must be absent. Record `PROD_ABSENT` only if the grep found neither. Do not grep a stale `dist/` from before this build.

Performance: a foreground script, not a CI unit test, builds 20 towers and 100 enemies and times `engine.step()`. Record the average milliseconds per step. `status: pass` only if that average is under 4. If it is not, write `status: blocked` and do not commit. Do not weaken the budget. Do not add this timer to `npm test`.

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, or another task result.
- Do not add dependencies. Do not spawn subagents. Do not `git add -A`.
- No `@angular` imports under `src/app/core/game/` or `src/app/core/systems/`.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e && npm run e2e && npm run e2e && npm run sim && npm run build
verify_exit: 0
```

`notes:` must include the three e2e counts, the sim rows, `PROD_ABSENT` or the grep hit, and the measured step average.

```bash
git add \
  README.md \
  results/TASK-051-docs-release.md
git status --short
git commit -m "docs(TASK-051): document setup, tests, and the release checks"
```

Add `scripts/perf-check.ts` by name if you created it. Stop if an unexpected path is untracked.

Final chat reply <= 8 lines.
