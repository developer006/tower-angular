status: pass
commit: pending
verify: npm test && npm run lint && npm run build && npm run e2e
verify_exit: 0
files:
- src/app/features/game/board-overlay.ts
- src/app/features/game/board-overlay.html
- src/app/features/game/board-overlay.css
- src/app/features/game/board-overlay.spec.ts
- src/app/features/game/game-page.html
- src/app/core/render/renderer.ts
- src/app/core/render/render.spec.ts
- results/TASK-022-palette-inspector.md
api:
- Palette buttons data-testid palette-pulse, palette-mortar, palette-cryo select the same types as keys 1/2/3
- Inspector root data-testid="tower-inspector"; controls are upgrade-tower, sell-tower, and targeting-mode
- data-range-tiles on board-overlay is the preview range; drawDynamic strokes one circle of radius rangeTiles * 48
deviations:
- none
notes:
- Refund oracles: Pulse L1 refunds 49 (gold 80+49=129). Pulse L1+L2 invested 120 refunds 84 (gold 30+84=114). A nearest-5 refund is wrong. Do not re-round.
- Upgrade cost: Pulse L1 to L2 costs 50. After a paused Pulse place (gold 80) and upgrade, gold is 30, level is 2, invested is 120. Level 3 disables upgrade-tower.
- Inspector test ids: tower-inspector, upgrade-tower, sell-tower, targeting-mode.
- Palette visible costs are 70, 110, and 90. Targeting options are first, strongest, and closest. Default remains first.
- Occupied pad click while a type is selected still shows That pad is already taken. and does not spend gold. Occupied pad click with no type opens the inspector and does not dispatch placeTower.
- Range preview uses L1 range 3.2, 4, or 3 while a type is selected and a pad is hovered or focused. An inspected tower uses that tower's current level range. Cleared when nothing is selected. No shadowBlur.
- Pad buttons were not replaced. deploy-wave has no click handler. Space and F are not handled. loop.ts was not edited. fileReplacements was not reversed. No Playwright spec.

# TASK-022 Result

**Status:** pass
**Branch:** task/TASK-022-palette-inspector
**Commit:** pending

## Summary

- Added a tower palette, a range preview, and an inspector that upgrades, sells, and sets targeting.
- Refunds stay on the engine sellRefund path: 49 and 84. Pulse L2 upgrade spends 50 and is not re-rounded.

## Files changed

- `src/app/features/game/game-page.html` — palette buttons with visible costs 70, 110, and 90
- `src/app/features/game/board-overlay.ts` — inspect, upgrade, sell, targeting, range attribute
- `src/app/features/game/board-overlay.html` — inspector and pad hover/focus handlers; pad buttons kept
- `src/app/features/game/board-overlay.css` — inspector chrome; pad button rules scoped so they are not replaced
- `src/app/features/game/board-overlay.spec.ts` — palette, upgrade, both refunds, targeting, range
- `src/app/core/render/renderer.ts` — one range circle, no shadowBlur
- `src/app/core/render/render.spec.ts` — fake context records one arc

## Tests and evidence

- `npm test` -> exit 0; 8 files, 54 tests passed
- `npm run lint` -> exit 0; All files pass linting
- `npm run build` -> exit 0
- `npm run e2e` -> exit 0; 2 passed (shell, smoke)
- shadowBlur grep -> NO_SHADOW

## Acceptance criteria

- [x] Palette click sets data-selected-type to mortar. Visible costs are 70, 110, and 90
- [x] Paused Pulse on pad-01, then upgrade: gold 30, level 2, invested 120. Upgrade cost 50
- [x] Sell that tower: gold 114, no towers, inspector gone. Refund oracle 84
- [x] Fresh fixture, paused Pulse, sell without upgrade: gold 129. Refund oracle 49
- [x] No selection, click occupied pad-01: inspector shows t1. Targeting closest sticks. No placeTower
- [x] Hover pad-01 while Pulse is selected: data-range-tiles is 3.2
- [x] Fake drawDynamic context records one arc. No shadowBlur
- [x] HUD score stays 0. Fixtures are destroyed. Playwright stays at 2 passed

## Handoff for next task

- Refund oracles: 49 and 84. Upgrade cost: 50. Do not re-round.
- Inspector test ids: tower-inspector, upgrade-tower, sell-tower, targeting-mode.
- Palette test ids: palette-pulse, palette-mortar, palette-cryo.
- Rejection strings stay: That pad is already taken. / Not enough gold. / That pad is not on the map. / Unknown tower. / Select a tower first.
- Unpaused commands stay queued until step(). Tests that check gold call setPaused(true).
