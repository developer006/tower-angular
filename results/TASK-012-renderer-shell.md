status: pass
commit: pending
verify: npm test && npm run lint && npm run build && npm run e2e
verify_exit: 0
files:
- src/app/core/render/palette.ts
- src/app/core/render/layout.ts
- src/app/core/render/background.ts
- src/app/core/render/renderer.ts
- src/app/core/render/render.spec.ts
- src/app/features/game/game-canvas.ts
- src/app/features/game/game-canvas.html
- src/app/features/game/game-canvas.css
- src/app/features/game/game-page.ts
- src/app/features/game/game-page.html
- src/app/features/game/game-page.css
- src/app/features/game/game-page.spec.ts
- src/app/app.routes.ts
- results/TASK-012-renderer-shell.md
api:
- cappedDevicePixelRatio(dpr: number): number
- fitCanvasCss(containerWidth: number, containerHeight: number): CanvasCssSize
- drawStatic(ctx: DrawContext, width: number, height: number): void
- drawDynamic(ctx: DrawContext): void
- renderMap(canvas: CanvasHost | null, backingWidth: number, backingHeight: number): void
- clearStaticCache(): void
- PALETTE
- LOGICAL_WIDTH
- LOGICAL_HEIGHT
deviations:
- Pad rectangles use a 2px logical stroke in padStroke. Size stays 36. The brief locks the fill size and stroke color, not the stroke width.
notes:
- HUD test ids: hud-integrity, hud-gold, hud-wave, hud-score. Also game-page and game-canvas. TASK-021 binds them instead of replacing them.
- cappedDevicePixelRatio caps dpr to [1, 2]. fitCanvasCss keeps the 960/576 aspect inside the container. A missing host size uses 960 x 576; fitCanvasCss(0, 0) stays { width: 0, height: 0 }.
- Pad ids copied from TASK-010, in order: pad-01, pad-02, pad-03, pad-04, pad-05, pad-06, pad-07, pad-08, pad-09, pad-10, pad-11, pad-12, pad-13, pad-14. Path total length is 2064. This task does not invent another map.
- drawDynamic is empty. No towers, enemies, or combat. loop.ts and runSimulationSystems were not edited.
- Bitmap size is css width/height times cappedDevicePixelRatio. The canvas stores the integer backing size, and that size is the static-cache key.

# TASK-012 Result

**Status:** pass
**Branch:** task/TASK-012-renderer-shell
**Commit:** pending

## Summary

- Added a framework-free map renderer with a cached static layer for map 01.
- Added a responsive `/play` page shell with static HUD nodes.

## Files changed

- `src/app/core/render/palette.ts` — locked canvas colors
- `src/app/core/render/layout.ts` — `cappedDevicePixelRatio` and `fitCanvasCss`
- `src/app/core/render/background.ts` — grid, path, pads, entry, and core, cached by backing size
- `src/app/core/render/renderer.ts` — `renderMap` and empty `drawDynamic`
- `src/app/core/render/render.spec.ts` — dpr, fit, and cache oracles
- `src/app/features/game/game-canvas.ts` — host fit, bitmap size, null-context render
- `src/app/features/game/game-page.ts` — `/play` shell
- `src/app/app.routes.ts` — lazy `play` route

## Tests and evidence

- `npm test` -> 6 files, 37 tests passed
- `npm run lint` -> All files pass linting
- `npm run build` -> pass
- `npm run e2e` -> 1 passed
- grep `@angular` under `src/app/core/render` -> NO_ANGULAR
- grep `shadowBlur` under `src/app/core/render` -> NO_SHADOW

## Acceptance criteria

- [x] Logical canvas 960 x 576; dpr 0/1/2/3 cap to 1/1/2/2
- [x] 960 x 576 fits as itself; 480 x 576 fits as 480 x 288; zero container is 0 x 0
- [x] Static layer draws grid, path stroke, 14 pads, entry, and core; same backing size does not rebuild
- [x] Dynamic layer exists and draws nothing
- [x] Null `getContext('2d')` returns without throwing
- [x] `/play` shows game-page, game-canvas, and HUD text 20, 150, 1, 0
- [x] Theme toggle and `installHarness()` stay in `App`
- [x] No `@angular` import and no `shadowBlur` under `src/app/core/render`

## Handoff for next task

- Do not delete HUD test ids hud-integrity, hud-gold, hud-wave, hud-score. TASK-021 binds them instead of replacing them.
- Keep `cappedDevicePixelRatio` and `fitCanvasCss`. Do not change the fit oracles.
- Copy pad ids pad-01 through pad-14 and path length 2064. Do not invent another map.
- Do not reorder `runSimulationSystems`. Do not edit the loop accumulator correction.
