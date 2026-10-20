status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
files:
- e2e/specs/visual.spec.ts
- playwright.config.ts
- .github/workflows/ci.yml
- .github/workflows/visual-baselines.yml
- src/app/core/render/renderer.ts
- src/app/core/render/entities.ts
- src/app/features/game/game-canvas.ts
- src/app/features/game/game-page.ts
- results/TASK-050-visual-regression.md
api:
- renderMap accepts an optional actor frame. When it is omitted, towers, enemies, and projectiles are not drawn.
- drawActors paints those three shapes only. No canvas text, particles, or shake.
deviations:
- Actor drawing lives in src/app/core/render/entities.ts so renderer.ts stays the map entry point.
notes:
- No PNG was committed. Baselines come from visual-baselines.yml on Ubuntu.
- npm run e2e stayed 18 passed. visual.spec.ts runs only when VISUAL=1.
- This host did not run --update-snapshots.

# TASK-050 Result

**Status:** pass
**Branch:** task/TASK-050-visual-regression
**Commit:** pending

## Summary

- Three captures: build-phase canvas at tick 0, mid-combat canvas at tick 60 after a Pulse is placed on pad-01 through the UI, and the victory overlay after the wave-10 no-tower setup. Each sets reduced motion before the shot and uses maxDiffPixelRatio 0.01 on the named element only.
- The canvas draws towers, enemies, and projectiles when state is passed. Tick 60 has a Pulse and two live drones, so that shot is not the build shot. Missing state skips the actor draw.
- Linux baselines are a workflow_dispatch job. CI compares them only after e2e/specs/visual.spec.ts-snapshots exists.

## Files changed

- `e2e/specs/visual.spec.ts` — three visual captures
- `playwright.config.ts` — ignore visual.spec.ts unless VISUAL=1
- `.github/workflows/ci.yml` — compare step, or print baselines not committed yet
- `.github/workflows/visual-baselines.yml` — Ubuntu snapshot update and non-forced push
- `src/app/core/render/entities.ts` — deterministic tower, enemy, and projectile shapes
- `src/app/core/render/renderer.ts` — optional actor frame
- `src/app/features/game/game-canvas.ts` — pass live state on resize
- `src/app/features/game/game-page.ts` — pass live state on the render callback
- `results/TASK-050-visual-regression.md` — this report

## Tests and evidence

- `npm test` -> exit 0; 19 files, 105 tests passed
- `npm run lint` -> exit 0; All files pass linting
- `npm run e2e` -> exit 0; 18 passed
- Seed 1, Pulse on pad-01, wave started, tick 60: one tower, two alive drones, phase wave. No PNG was written on this host.

## Acceptance criteria

- [x] VERIFY-PHASE-4 starts with status: pass
- [x] Exactly three visual tests, reduced motion before each capture, maxDiffPixelRatio 0.01
- [x] Screenshots are the canvas or the results overlay, not the page and not the HUD
- [x] Actor draw is omitted when no state is passed; no @angular import in core/render
- [x] npm run e2e stays 18 passed; visual.spec.ts is ignored unless VISUAL=1
- [x] visual-baselines.yml is workflow_dispatch, ubuntu-latest, Node 26, contents: write, no force-push
- [x] ci.yml compares only when the snapshot directory already exists and does not generate snapshots
- [x] No PNG committed

## Decisions / assumptions

- `status: pass` because the required commands exited 0 and the read checks hold.
- `commit` stays `pending`. No hash written. No amend.
- A Windows PNG is not a baseline. The Ubuntu workflow owns e2e/specs/visual.spec.ts-snapshots.

## Handoff for next task

- Do not start TASK-051 from this branch.
- Do not merge or push.
- After this commit is merged, dispatch visual-baselines.yml on Ubuntu to create the snapshot directory.
