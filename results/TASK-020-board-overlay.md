status: pass
commit: pending
verify: npm test && npm run lint && npm run build && npm run e2e
verify_exit: 0
files:
- src/app/features/game/board-overlay.ts
- src/app/features/game/board-overlay.html
- src/app/features/game/board-overlay.css
- src/app/features/game/board-overlay.spec.ts
- src/app/features/game/game-page.ts
- src/app/features/game/game-page.html
- src/app/features/game/game-page.css
- results/TASK-020-board-overlay.md
api:
- BoardOverlay host: data-testid="board-overlay", data-selected-type is pulse, mortar, cryo, or empty
- Pad buttons: data-testid pad-01 through pad-14, tabindex="0", data-build-target="true" only while a type is selected
deviations:
- none
notes:
- Pad buttons are pad-01 through pad-14, copied from MAP_01.pads in that order.
- Click does not place yet. The pad click handler only comments that TASK-021 places the tower. It does not dispatch placeTower and does not change gold.
- TASK-021 must call facade.dispatch without replacing the buttons.
- Keys 1, 2, and 3 select pulse, mortar, and cryo. Escape clears the selection. Space and F are not handled. Input and textarea targets are ignored.
- deploy-wave is unchanged and still has no click handler. loop.ts was not edited. fileReplacements was not reversed.

# TASK-020 Result

**Status:** pass
**Branch:** task/TASK-020-board-overlay
**Commit:** pending

## Summary

- Added a DOM button for each map-01 build pad, absolutely positioned over the canvas with percentage coordinates.
- Keyboard build mode selects pulse, mortar, or cryo, and Escape clears it. Clicking a pad does not spend gold.

## Files changed

- `src/app/features/game/board-overlay.ts` — pad buttons, selection signal, keyboard handler, no-op click
- `src/app/features/game/board-overlay.html` — one button per pad, signal calls
- `src/app/features/game/board-overlay.css` — absolute overlay, 36/960 by 36/576 buttons, focus ring
- `src/app/features/game/board-overlay.spec.ts` — pad order, keyboard selection, gold unchanged, fixtures destroyed
- `src/app/features/game/game-page.ts` — imports the overlay
- `src/app/features/game/game-page.html` — overlay covers the canvas
- `src/app/features/game/game-page.css` — aspect-locked frame so the overlay matches the canvas

## Tests and evidence

- `npm test` -> exit 0; 8 files, 44 tests passed
- `npm run lint` -> exit 0; All files pass linting
- `npm run build` -> exit 0
- `npm run e2e` -> exit 0; 2 passed (shell, smoke)

## Acceptance criteria

- [x] Fourteen buttons, ids pad-01 through pad-14, in that order
- [x] Keys 1, 2, 3, and Escape select pulse, mortar, cryo, then empty
- [x] data-build-target="true" on every pad while a type is selected, and on none after Escape
- [x] A pad click does not change gold
- [x] Fixtures are destroyed
- [x] Playwright stays at 2 passed

## Handoff for next task

- Pad buttons are pad-01 through pad-14. Do not replace them.
- Click does not place yet. TASK-021 must call facade.dispatch without replacing the buttons.
- Do not handle Space or F here. TASK-041 owns pause and speed.
- Do not edit loop.ts. Do not reverse fileReplacements.
