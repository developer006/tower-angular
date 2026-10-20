# TASK-043: Accessibility pass and axe scan

**Phase / dependencies:** Phase 4. Depends on TASK-042 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-043-accessibility` (already created from `main`; stay on it)
**Result file:** `results/TASK-043-accessibility.md`

## Goal

Make `/` and `/play` pass an axe scan with zero violations. Do not disable rules to get there.

## Read first — only these

- `results/TASK-042-audio-polish.md`
- `plan/implementation-plan.md` §1.7 and the `@axe-core/playwright` line in §4.4
- `src/app/app.html`
- `src/app/features/game/game-page.html`
- `src/app/features/game/board-overlay.html`
- `src/app/features/game/board-overlay.css`
- `e2e/specs/shell.spec.ts`

If the TASK-042 result does not start with `status: pass`, stop.

Do not edit `loop.ts`. Do not reverse `fileReplacements`. Do not write into `state.effects`. Do not call the synth from the simulator. Do not add `pause-speed.spec.ts`, `persistence.spec.ts`, or `visual.spec.ts`. Those belong to later tasks.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-043-accessibility`. Do not switch, merge, or push.

## Install

```bash
npm install -D @axe-core/playwright --ignore-scripts
```

Do not run `ng add`. On this host the CLI's own install flag is rejected. Keep the package name `@axe-core/playwright`.

## Locked behavior

- Add `e2e/specs/accessibility.spec.ts` with exactly two tests: one axe scan of `/`, one of `/play`. Both must report zero violations. Do not pass `disableRules`. Do not exclude the canvas, the HUD, or the theme toggle from the scan.
- TASK-044 will add Tab/Enter, focus-ring, and live-region assertions to this same file. Do not add those assertions now. Do not create a second accessibility spec.
- The existing 8 Playwright tests must still pass. After this task the suite is 10 tests: the old 8 plus these 2. A "10 passed" line is the acceptance count. Do not delete a spec to keep the old count.
- Wrap the shell body in `<main>` so the page has a landmark. Keep the `h1` and the theme toggle outside the outlet. The toggle's accessible name stays `Toggle color theme`.
- Live-region text stays the whole announcement, not joined with other status. Exact sentences remain `Wave {n} deployed.` / `Wave {n} cleared.` / `Core hit. Integrity {n}.` / `Victory. The core holds.` / `Defeat. The core is lost.`
- Pad buttons keep `aria-label`. Add `:focus-visible` with a 2px solid outline. Do not set `outline: none` on those buttons.
- If axe fails, fix the markup or the color. Record the rule ids you fixed. If a rule cannot be fixed without disabling it, stop with `status: blocked` and paste the violation. Do not commit a green scan that disabled the rule.

## Commands

```bash
npm test
npm run lint
npm run e2e
```

`npm run e2e` must print `10 passed`.

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, or another task result.
- Do not spawn subagents. Do not `git add -A`.
- No `@angular` imports under `src/app/core/game/` or `src/app/core/systems/`.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
```

`notes:` must say axe ran with no disabled rules, and the suite is 10 tests because two axe scans were added.

```bash
git add \
  package.json \
  package-lock.json \
  e2e/specs/accessibility.spec.ts \
  src/app/app.html \
  src/app/features/game/board-overlay.css \
  results/TASK-043-accessibility.md
git status --short
git commit -m "feat(TASK-043): add an axe scan and fix the violations it finds"
```

Add a markup or CSS file by name if axe required that fix. Stop if an unexpected path is untracked.

Final chat reply <= 8 lines.
