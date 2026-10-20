# TASK-040: Main menu and results-to-menu

**Phase / dependencies:** Phase 4. Depends on VERIFY-3 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-040-menu-results` (already created from `main`; stay on it)
**Result file:** `results/TASK-040-menu-results.md`

## Goal

Add the `/` main menu and a Main Menu control on the results overlay. Keep Retry. Do not delete an existing assertion to make room for the new button.

## Read first — only these

- `results/VERIFY-PHASE-3.md`
- `results/TASK-032-waves-endstates.md`
- `src/app/app.routes.ts`
- `src/app/features/game/results-overlay.html`
- `src/app/features/game/wave-end.spec.ts`
- `e2e/specs/shell.spec.ts`

If `results/VERIFY-PHASE-3.md` does not start with `status: pass`, stop.

Do not edit `loop.ts`. Do not reverse `fileReplacements`. Do not remove Retry. Do not assert that Main Menu is the last control by deleting the Retry assertion. Move any end-of-overlay check so Retry remains and Main Menu is additional.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-040-menu-results`. Do not switch, merge, or push.

## Locked behavior

- `/` loads a standalone `MainMenu` component. Selector `app-main-menu`. `data-testid="main-menu"`.
- A button `data-testid="play"` with accessible name `Play` navigates to `/play`.
- The theme toggle stays in `App`, outside the outlet, so the shell spec still finds `Toggle color theme` on `/`.
- Results overlay keeps `data-testid="retry"`. Add `data-testid="main-menu-button"` with accessible name `Main Menu`. It navigates to `/` and does not need to reset the run. Retry still calls `reset(1)` and stays on `/play`.
- Do not add pause, sound, or persistence. TASK-041 owns those.

## Tests

- A component test clicks Play and expects the router URL to be `/play`. Destroy the fixture.
- Extend `wave-end.spec.ts` so the overlay still has Retry and also has Main Menu. Do not remove the score-0 or Retry restore assertions.
- `npm run e2e` stays green. The shell spec must still pass on `/`.

## Commands

```bash
npm test
npm run lint
npm run e2e
```

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, or another task result.
- Do not add dependencies. Do not spawn subagents. Do not `git add -A`.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
```

`notes:` must say Retry remains and Main Menu is `data-testid="main-menu-button"`.

```bash
git add \
  src/app/app.routes.ts \
  src/app/features/menu/main-menu.ts \
  src/app/features/menu/main-menu.html \
  src/app/features/menu/main-menu.spec.ts \
  src/app/features/game/results-overlay.ts \
  src/app/features/game/results-overlay.html \
  src/app/features/game/wave-end.spec.ts \
  results/TASK-040-menu-results.md
git status --short
git commit -m "feat(TASK-040): add the main menu and results-to-menu link"
```

Add a CSS file by name if you create one. Stop if an unexpected path is untracked.

Final chat reply <= 8 lines.
