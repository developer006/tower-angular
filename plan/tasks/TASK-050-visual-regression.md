# TASK-050: Visual regression spec and CI baselines

**Phase / dependencies:** Phase 5. Depends on VERIFY-4 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-050-visual-regression` (already created from `main`; stay on it)
**Result file:** `results/TASK-050-visual-regression.md`

## Goal

Add three deterministic visual captures and a Linux-only baseline workflow. Do not commit screenshots taken on this Windows host.

## Read first — only these

- `results/VERIFY-PHASE-4.md`
- `plan/implementation-plan.md` §4.2 and §4.3
- `playwright.config.ts`
- `src/app/core/render/renderer.ts`
- `e2e/specs/victory.spec.ts`
- `.github/workflows/ci.yml`

If `results/VERIFY-PHASE-4.md` does not start with `status: pass`, stop.

Do not edit `loop.ts`. Do not reverse `fileReplacements`. Do not write into `state.effects`. Do not add a fourth screenshot. This host has no Docker and no `gh`. A PNG written here is not a baseline.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-050-visual-regression`. Do not switch, merge, or push.

## Locked captures

`e2e/specs/visual.spec.ts` has exactly three tests. Each sets reduced motion before the capture. `expect` uses `maxDiffPixelRatio: 0.01`. Screenshot the named element only, not the page and not the HUD.

- `build phase canvas`: manual mode, `reset({ seed: 1 })`, tick is 0, screenshot `[data-testid="game-canvas"]`.
- `mid-combat canvas`: manual mode, `reset({ seed: 1 })`, place a Pulse on `pad-01` through the UI, deploy wave, step until tick is 60, screenshot the canvas. Tick must be 60 at capture.
- `victory overlay`: the same wave-10 no-tower setup as `victory.spec.ts`, then screenshot `[data-testid="results-overlay"]` only, after phase is `victory` and score is 500.

The canvas does not draw actors today, so a mid-combat shot would match the build shot. Add a deterministic draw of towers, enemies, and projectiles in `core/render`, with no canvas text, no particles, and no shake. Omit that draw when no state is passed, so the existing map specs stay green. No `@angular` import in `core/render`.

## Playwright and CI

`npm run e2e` must stay 18 passed on this host. Ignore `visual.spec.ts` unless `VISUAL=1`. Do not change the `e2e` script to drop other specs.

Add `.github/workflows/visual-baselines.yml`, `workflow_dispatch` only, `ubuntu-latest`, Node 26. It installs Playwright Chromium, runs `VISUAL=1 npx playwright test e2e/specs/visual.spec.ts --update-snapshots`, and commits `e2e/specs/visual.spec.ts-snapshots` if that directory changed. `permissions: contents: write`. Do not force-push. If the push is rejected, upload that directory as artifact `visual-baselines` and stop.

In `ci.yml`, add a compare step that runs the visual spec only when `e2e/specs/visual.spec.ts-snapshots` already exists. If it does not, print `baselines not committed yet` and exit 0. Do not generate snapshots in that step.

## Commands

```bash
npm test
npm run lint
npm run e2e
```

`npm run e2e` must print `18 passed`. Do not run `--update-snapshots` on this host. If a `*.png` is untracked, delete it. Do not stage it.

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, or another task result.
- Do not add dependencies. Do not spawn subagents. Do not `git add -A`.
- No `@angular` imports under `src/app/core/game/` or `src/app/core/systems/`.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
```

`notes:` must say no PNG was committed, and baselines come from `visual-baselines.yml` on Ubuntu.

```bash
git add \
  e2e/specs/visual.spec.ts \
  playwright.config.ts \
  .github/workflows/ci.yml \
  .github/workflows/visual-baselines.yml \
  src/app/core/render/renderer.ts \
  src/app/features/game/game-canvas.ts \
  src/app/features/game/game-page.ts \
  results/TASK-050-visual-regression.md
git status --short
git commit -m "test(TASK-050): add visual captures and a Linux baseline workflow"
```

Add a render file by name if you split the actor draw. Stop if an unexpected path, or any PNG, is untracked.

Final chat reply <= 8 lines.
