status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e && npm run e2e && npm run e2e && npm run sim && npm run build
verify_exit: 0
files:
- README.md
- scripts/perf-check.ts
- results/TASK-051-docs-release.md
notes:
- e2e run 1: 18 passed
- e2e run 2: 18 passed
- e2e run 3: 18 passed
- sim rows:
  none seed=1 outcome=defeat bestWave=2 wavesCleared=1 integrity=0 kills=0 score=100
  pulse seed=1 outcome=defeat bestWave=6 wavesCleared=5 integrity=0 kills=80 score=1300
  mortar seed=1 outcome=defeat bestWave=6 wavesCleared=5 integrity=0 kills=77 score=1270
  cryo seed=1 outcome=defeat bestWave=6 wavesCleared=5 integrity=0 kills=75 score=1250
  mixed seed=1 outcome=victory bestWave=10 wavesCleared=10 integrity=11 kills=196 score=3235
- PROD_ABSENT
- engine.step() average 0.1218 ms over 300 steps with 20 towers and 100 enemies. Budget is 4 ms. Not added to npm test.

# TASK-051 Result

**Status:** pass
**Branch:** task/TASK-051-docs-release
**Commit:** pending

## Summary

- README documents Node 26 setup, the commands that exist today, the core/features split, the no-op harness direction, the test strategy, and a release checklist. It does not claim a GitHub Pages deploy.
- Three `npm run e2e` runs each printed `18 passed`.
- Production `dist/` from this build contains neither `__TD__` nor `harness-loader.e2e`.
- Foreground `npx tsx scripts/perf-check.ts` averaged 0.1218 ms per `engine.step()` for 20 towers and 100 enemies.

## Files changed

- `README.md` — setup, commands, architecture, harness, tests, release checklist
- `scripts/perf-check.ts` — foreground step timer, not part of `npm test`
- `results/TASK-051-docs-release.md` — this report

## Tests and evidence

- `npm test` -> exit 0; 19 files, 105 tests passed
- `npm run lint` -> exit 0; All files pass linting
- `npm run e2e` -> exit 0; 18 passed
- `npm run e2e` -> exit 0; 18 passed
- `npm run e2e` -> exit 0; 18 passed
- `npm run sim` -> exit 0; rows copied above
- `npm run build` -> exit 0; then grep of the new `dist/` (10 files) found neither `__TD__` nor `harness-loader.e2e` (`PROD_ABSENT`)
- `npx tsx scripts/perf-check.ts` -> exit 0; towers=20 enemies=100 steps=300 average_ms=0.1218 budget_ms=4 PERF_OK

## Acceptance criteria

- [x] TASK-050 result starts with status: pass
- [x] README replaces the Playwright shell spec line and documents setup, commands, architecture, harness direction, and test strategy
- [x] Harness sentence keeps the default file as the no-op and the e2e configuration as the replacement
- [x] Release checklist is commands only; no Pages deploy, no build:pages, no copy-404.mjs
- [x] Three e2e runs each printed 18 passed
- [x] Sim rows are from this run
- [x] PROD_ABSENT on the dist produced by this build
- [x] Step average 0.1218 ms is under 4 ms; timer is not in npm test

## Decisions / assumptions

- `status: pass` because the required commands exited 0, the production grep was empty, and the measured step average is under 4 ms.
- `commit` stays `pending`. No hash written. No amend.
- The map has 14 pads. The perf script reuses those pad ids so all 20 tower records still run targeting and firing. Enemy hit points are raised so the 100 enemies stay alive for every timed step. The 4 ms budget is unchanged.
- GitHub Pages remains TASK-052. This task does not add a deploy workflow.

## Handoff for next task

- Do not start TASK-052 from this branch.
- Do not merge or push.
- Do not reverse fileReplacements.
