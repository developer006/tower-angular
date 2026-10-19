# TASK-022: Palette, range preview, inspector

**Phase / dependencies:** Phase 2. Depends on TASK-021 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-022-palette-inspector` (already created from `main`; stay on it)
**Result file:** `results/TASK-022-palette-inspector.md`

## Goal

Add a tower palette, a range preview, and an inspector that upgrades, sells, and sets targeting. Do not add a Playwright spec.

## Read first — only these

- `results/TASK-021-placement-economy.md`
- `src/app/features/game/board-overlay.ts`
- `src/app/features/game/game-page.html`
- `src/app/core/content/towers.ts`
- `src/app/core/render/renderer.ts`

If the TASK-021 result does not start with `status: pass`, stop.

Copy the rejection strings. Do not replace pad buttons. Do not edit `loop.ts`. Do not reverse `fileReplacements`. Do not handle `Space` or `F`. Do not wire `deploy-wave`.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-022-palette-inspector`. Do not switch, merge, or push.

## Locked behavior

- Palette buttons: `data-testid="palette-pulse"`, `palette-mortar`, `palette-cryo`. Visible costs are 70, 110, and 90. Clicking one selects that type, same as keys 1/2/3.
- Empty pad click still places. Occupied pad click while a type is selected still shows `That pad is already taken.` and does not spend gold.
- Occupied pad click while no type is selected opens the inspector for that tower. Do not dispatch `placeTower`.
- Inspector root: `data-testid="tower-inspector"`. It shows the tower id, level, and invested gold.
- `data-testid="upgrade-tower"` spends the next upgrade cost when paused or after `step()` if queued. Pulse L1 to L2 costs 50. After a paused Pulse place (gold 80) and upgrade, gold is 30, level is 2, invested is 120. Level 3 disables the button. Do not re-round costs.
- `data-testid="sell-tower"` refunds `sellRefund(invested)`. Pulse L1 refunds 49 (gold 80+49=129) and removes the tower. Pulse L1+L2 invested 120 refunds 84 (gold 30+84=114). A nearest-5 refund is wrong. Selling closes the inspector and frees the pad.
- `data-testid="targeting-mode"` is a native `<select>` with `first`, `strongest`, and `closest`. Changing it calls `setTargeting`. Default remains `first`.
- Range preview: while a type is selected and a pad is hovered or focused, expose `data-range-tiles` on `board-overlay` as the L1 range (`3.2`, `4`, or `3`). While a tower is inspected, use that tower's current level range. Clear it when nothing is selected. `drawDynamic` draws one circle of radius `rangeTiles * 48` at the pad center. No `shadowBlur`.
- HUD score stays `0`. Templates call signals.
- Paused commands apply immediately. Unpaused commands stay queued until `step()`. Tests that check gold call `setPaused(true)`.

## Tests

Destroy every fixture.

- Palette click sets `data-selected-type` to `mortar`.
- Paused Pulse on `pad-01`, then upgrade: gold 30, level 2, invested 120.
- Sell that tower: gold 114, no towers, inspector gone.
- Fresh fixture, paused Pulse, sell without upgrade: gold 129.
- No selection, click occupied `pad-01`: inspector shows `t1`. Targeting change to `closest` sticks on the engine tower.
- Hover `pad-01` while Pulse is selected: `data-range-tiles` is `3.2`.
- A fake `drawDynamic` context records one arc. No `shadowBlur`.

## Commands

```bash
npm test
npm run lint
npm run build
npm run e2e
if grep -R shadowBlur src/app/core/render src/app/features/game; then echo HAS_SHADOW; exit 1; else echo NO_SHADOW; fi
```

Playwright stays at 2 passed.

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, or another task result.
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

`notes:` must list refund oracles 49 and 84, upgrade cost 50, and the inspector test ids. TASK-023 copies them.

```bash
git add \
  src/app/features/game/board-overlay.ts \
  src/app/features/game/board-overlay.html \
  src/app/features/game/board-overlay.css \
  src/app/features/game/board-overlay.spec.ts \
  src/app/features/game/game-page.html \
  src/app/core/render/renderer.ts \
  src/app/core/render/render.spec.ts \
  results/TASK-022-palette-inspector.md
git status --short
git commit -m "feat(TASK-022): add palette, range preview, and inspector"
```

Add a new component file by name if you split the inspector out. Stop if an unexpected path is untracked or if build output is staged.

Final chat reply <= 8 lines.
