# TASK-020: Board overlay, focus, and build-mode keyboard

**Phase / dependencies:** Phase 2. Depends on VERIFY-1 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-020-board-overlay` (already created from `main`; stay on it)
**Result file:** `results/TASK-020-board-overlay.md`

## Goal

Put a real DOM button on each build pad, over the canvas, with keyboard selection. Do not spend gold. Do not add range preview, an inspector, or a new Playwright spec.

## Read first — only these

- `results/VERIFY-PHASE-1.md`
- `results/TASK-012-renderer-shell.md`
- `results/TASK-013-e2e-harness.md`
- `src/app/features/game/game-page.html`
- `src/app/core/content/map-01.ts`

If `results/VERIFY-PHASE-1.md` does not start with `status: pass`, stop.

Copy pad ids `pad-01` through `pad-14` from `MAP_01.pads`. Do not invent another map. Do not edit `loop.ts`. Do not reverse `fileReplacements`. Do not remove HUD test ids or `deploy-wave`.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-020-board-overlay`. Do not switch, merge, or push.

## Deliverables

- `src/app/features/game/board-overlay.ts`
- `src/app/features/game/board-overlay.html`
- `src/app/features/game/board-overlay.css`
- `src/app/features/game/board-overlay.spec.ts`
- Update `game-page.ts` and `game-page.html` so the overlay covers the canvas.

## Locked behavior

- One `<button type="button">` per pad, in pad order. `data-testid` is the pad id (`pad-01` ... `pad-14`). `tabindex="0"`.
- Position each button with percentages of the 960 x 576 logical board, centered on `tileCenter(col, row)`. Width is `36 / 960 * 100%`. Height is `36 / 576 * 100%`. The overlay is `position: absolute; inset: 0` over the canvas. Do not use pixel coordinates that ignore scaling.
- Keys, when the event target is not an input or textarea: `1` selects `pulse`, `2` selects `mortar`, `3` selects `cryo`, `Escape` clears the selection. Do not handle `Space` or `F`. TASK-041 owns pause and speed.
- The overlay host has `data-testid="board-overlay"` and `data-selected-type` set to the selection or empty.
- Each pad button gets `data-build-target="true"` only while a type is selected. Focus ring is a 2px solid `#3ec6ff` outline, not `outline: none`.
- Clicking a pad does not dispatch `placeTower` and does not change gold. TASK-021 wires click and Enter to `facade.dispatch`. Leave a comment in the click handler: `TASK-021 places the tower`.
- `deploy-wave` still has no click handler. Do not add one and do not remove the button.
- Templates call signals: `selectedType()`, not `selectedType`.

## Tests

- Fourteen buttons, ids `pad-01` through `pad-14`, in that order.
- Dispatch `1`, `2`, `3`, and `Escape` on the overlay. Selection becomes `pulse`, `mortar`, `cryo`, then empty.
- While a type is selected, every pad has `data-build-target="true"`. After Escape, none do.
- A button click does not change `facade.gold()`.
- Destroy every fixture.

## Commands

```bash
npm test
npm run lint
npm run build
npm run e2e
```

Playwright must stay at 2 passed. Do not add a spec.

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

`notes:` must say pad buttons are `pad-01` through `pad-14`, click does not place yet, and TASK-021 must call `facade.dispatch` without replacing the buttons.

```bash
git add \
  src/app/features/game/board-overlay.ts \
  src/app/features/game/board-overlay.html \
  src/app/features/game/board-overlay.css \
  src/app/features/game/board-overlay.spec.ts \
  src/app/features/game/game-page.ts \
  src/app/features/game/game-page.html \
  results/TASK-020-board-overlay.md
git status --short
git commit -m "feat(TASK-020): add pad overlay and build-mode keyboard"
```

Add a game-page CSS file by name only if you change it. Stop if an unexpected path is untracked or if build output is staged.

Final chat reply <= 8 lines.
