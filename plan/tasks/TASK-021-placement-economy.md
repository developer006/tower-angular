# TASK-021: Placement, gold, and error messages

**Phase / dependencies:** Phase 2. Depends on TASK-020 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-021-placement-economy` (already created from `main`; stay on it)
**Result file:** `results/TASK-021-placement-economy.md`

## Goal

Clicking or pressing Enter on a pad places the selected tower through `facade.dispatch`. Invalid placements show a reason and do not spend gold. HUD gold updates from the engine. Do not add an inspector, range preview, or a new Playwright spec.

## Read first — only these

- `results/TASK-020-board-overlay.md`
- `results/TASK-011-engine-loop.md`
- `src/app/features/game/board-overlay.ts`
- `src/app/state/game-facade.ts`
- `src/app/features/game/game-page.html`

If `results/TASK-020-board-overlay.md` does not start with `status: pass`, stop.

Do not replace the pad buttons. Do not invent pad ids. Do not edit `loop.ts`. Do not reverse `fileReplacements`. Do not handle `Space` or `F`.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-021-placement-economy`. Do not switch, merge, or push.

## Locked behavior

- Inject `GameFacade`. Pad click and Enter on a focused pad call `facade.dispatch({ type: 'placeTower', towerType, padId })` only when a type is selected.
- No selection: do not dispatch. Set the error to `Select a tower first.`
- Engine reasons, exact strings:
  - `occupied` -> `That pad is already taken.`
  - `insufficient-gold` -> `Not enough gold.`
  - `unknown-pad` -> `That pad is not on the map.`
  - `unknown-tower` -> `Unknown tower.`
- Put the message in `data-testid="placement-error"`. Clear it when a placement is accepted.
- Unpaused `placeTower` queues. Gold does not change until `step()`. Do not change that engine rule. Tests that need an immediate spend call `facade.setPaused(true)` first. Paused placement applies immediately and `dispatch` already refreshes the HUD.
- A rejected command leaves gold unchanged. Pulse costs 70, so gold goes from 150 to 80. A second place on the same pad stays at 80. Mortar costs 110, so after one Pulse there is not enough gold.
- HUD ids stay `hud-integrity`, `hud-gold`, `hud-wave`, `hud-score`. Score stays `0`. Bind with signal calls.
- Do not add upgrade, sell, or targeting controls. TASK-022 owns those.
- Do not add a click handler to `deploy-wave`. Do not remove that button.
- Do not add an e2e spec.

## Tests

Add them to `board-overlay.spec.ts`. Destroy every fixture.

- Paused, select Pulse, click `pad-01`: error is empty, `hud-gold` is `80`, engine has tower `t1` on `pad-01`.
- Click `pad-01` again: gold stays `80`, error is `That pad is already taken.`
- Select Mortar, click `pad-02`: gold stays `80`, error is `Not enough gold.`
- With no selection, click `pad-03`: gold unchanged, error is `Select a tower first.`, and `dispatch` was not called for that click. Spy if needed.
- Enter on a focused `pad-04` after selecting Pulse places it. Use a fresh fixture so gold starts at 150.
- Score text stays `0`.

## Commands

```bash
npm test
npm run lint
npm run build
npm run e2e
```

Playwright stays at 2 passed.

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, `results/DECISIONS.md`, or another task result.
- Do not add dependencies. Do not spawn subagents. Do not `git add -A`.
- No `@angular` imports under `src/app/core/`.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run build && npm run e2e
verify_exit: 0
```

`notes:` must list the four reason strings exactly. TASK-023 copies them. Also say unpaused placement stays queued until `step()`.

```bash
git add \
  src/app/features/game/board-overlay.ts \
  src/app/features/game/board-overlay.html \
  src/app/features/game/board-overlay.spec.ts \
  src/app/features/game/game-page.html \
  results/TASK-021-placement-economy.md
git status --short
git commit -m "feat(TASK-021): place towers and show rejection reasons"
```

Add a CSS file by name only if you change it. Stop if an unexpected path is untracked or if build output is staged.

Final chat reply <= 8 lines.
