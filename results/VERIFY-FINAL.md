status: pass
commit: pending
verify: npm run lint && npm test && npm run e2e && npm run e2e && npm run e2e && npm run sim && npm run build && npm run build:pages && npx tsx scripts/perf-check.ts
verify_exit: 0

# TASK-053: Final verification

Independently re-run on branch `task/TASK-053` at `7637a90`. No source was modified, nothing was merged, pushed, or tagged, and no snapshots were updated.

## Commands (all foreground, exit 0)

| Command | Result |
| --- | --- |
| `npm run lint` | `All files pass linting.` |
| `npm test` | `Test Files 19 passed (19)` / `Tests 105 passed (105)` |
| `npm run e2e` (1) | `18 passed (9.5s)` |
| `npm run e2e` (2) | `18 passed (9.8s)` |
| `npm run e2e` (3) | `18 passed (9.4s)` |
| `npm run sim` | rows below |
| `npm run build` | bundle generated, exit 0 |
| `npm run build:pages` | `copy-404: wrote ...\browser\404.html`, exit 0 |
| `npx tsx scripts/perf-check.ts` | `PERF_OK`, exit 0 |

Three consecutive e2e runs each printed `18 passed`; the pinned pause/speed clock from TASK-053-FIX held on every run.

## Simulator output (verbatim)

```text
none seed=1 outcome=defeat bestWave=2 wavesCleared=1 integrity=0 kills=0 score=100
pulse seed=1 outcome=defeat bestWave=6 wavesCleared=5 integrity=0 kills=80 score=1300
mortar seed=1 outcome=defeat bestWave=6 wavesCleared=5 integrity=0 kills=77 score=1270
cryo seed=1 outcome=defeat bestWave=6 wavesCleared=5 integrity=0 kills=75 score=1250
mixed seed=1 outcome=victory bestWave=10 wavesCleared=10 integrity=11 kills=196 score=3235
```

Matches the required invariants: `none` defeats at `bestWave=2`; `pulse`, `mortar`, and `cryo` defeat at `bestWave=6`; `mixed` wins with integrity 11 (within 8-15).

## Harness exposure

Grepped the production `dist/` immediately after `npm run build`, before `build:pages` overwrote it.

- Production build: `__TD__` absent, `harness-loader.e2e` absent -> `PROD_ABSENT`
- Pages build: `__TD__` absent, `harness-loader.e2e` absent

## Pages output

- `dist/tower-angular/browser/index.html` contains `<base href="/tower-angular/">`
- `dist/tower-angular/browser/404.html` is byte-identical to `index.html` (`cmp` returned identical)

## Performance

```text
towers=20
enemies=100
steps=300
average_ms=0.1468
budget_ms=4
PERF_OK
```

Average `0.1468 ms`, under the 4 ms budget.

## Read checks

- `angular.json`: default build `fileReplacements` is `[]`; only the `e2e` configuration replaces `src/app/core/testing/harness-loader.ts` with `harness-loader.e2e.ts`. Direction is correct — the default file is the no-op.
- No `@angular` import anywhere under `src/app/core/game/` or `src/app/core/systems/`.
- `e2e/specs/visual.spec.ts-snapshots/` contains `build-phase-canvas-1-chromium-linux.png`, `mid-combat-canvas-1-chromium-linux.png`, and `victory-overlay-1-chromium-linux.png`. Not regenerated.
- README documents setup (Node 26, `npm install`), every real script (`start`, `start:e2e`, `test`, `lint`, `e2e`, `sim`, `build`, `build:pages`, `copy404`), the `core/` vs `features/` split, and the test strategy including the `VISUAL=1` baseline caveat.
- `.github/workflows/deploy-pages.yml` uses `actions/upload-pages-artifact@v4` and `actions/deploy-pages@v4`.

## Verdict

All commands exited 0 and every read check holds. v1 is verified on `task/TASK-053`.
