# TASK-012: Canvas renderer and /play shell

**Phase / dependencies:** Phase 1. Depends on TASK-010 and TASK-011 (both `status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-012-renderer-shell` (already created from `main`; stay on it)
**Result file:** `results/TASK-012-renderer-shell.md`

## Goal

Render map 01 on a responsive canvas and add a `/play` page shell. No combat, no harness API, no HUD binding to a live engine yet.

## Read first — only these

- `results/TASK-010-content-path.md`
- `results/TASK-011-engine-loop.md`
- `src/app/core/content/map-01.ts`
- `src/app/app.routes.ts`
- `src/app/app.ts`

If either result file does not start with `status: pass`, stop.

Copy pad ids `pad-01` through `pad-14` and path length 2064. Do not invent another map. Do not reorder `runSimulationSystems`. Do not edit `loop.ts`. The accumulator correction there is intentional.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-012-renderer-shell`. Do not switch, merge, or push.

## Deliverables

- `src/app/core/render/palette.ts`
- `src/app/core/render/layout.ts`
- `src/app/core/render/background.ts`
- `src/app/core/render/renderer.ts`
- `src/app/core/render/render.spec.ts`
- `src/app/features/game/game-canvas.ts` and `game-canvas.html`
- `src/app/features/game/game-page.ts` and `game-page.html`
- `src/app/features/game/game-page.spec.ts`
- route `/play` in `src/app/app.routes.ts`

No Angular imports under `src/app/core/render/`.

## Locked behavior

- Logical canvas is 960 x 576. `cappedDevicePixelRatio` returns `Math.min(Math.max(dpr, 1), 2)`.
- `fitCanvasCss(containerWidth, containerHeight)` returns the largest size that fits inside the container and keeps aspect ratio `960 / 576`. A container of 960 x 576 returns that size. A container of 480 x 576 returns width 480 and height 288. A container of 0 returns `{ width: 0, height: 0 }`.
- Static layer draws grid, path, 14 pads, entry, and core. Cache it. Redraw the cache only when the backing size changes. Do not call `shadowBlur`.
- Dynamic layer function exists and may be empty. Do not draw towers or enemies yet.
- If `getContext('2d')` is null, rendering returns without throwing.
- `/play` shows `data-testid="game-page"`, `data-testid="game-canvas"`, and HUD nodes `hud-integrity`, `hud-gold`, `hud-wave`, `hud-score` with text `20`, `150`, `1`, and `0`. TASK-021 binds these ids to signals. Do not delete them.
- Keep the theme toggle and `installHarness()` call in `App`. Do not move them.
- Do not add `e2e/specs/smoke.spec.ts`.

## Palette

```ts
export const PALETTE = {
  background: '#0b1020',
  grid: '#1c2744',
  path: '#3d4f7c',
  padFill: '#12343f',
  padStroke: '#3ec6ff',
  entry: '#7cffb2',
  core: '#ff4d6d',
} as const;
```

## Route

Add one route. Do not add a menu route. `/` stays the existing shell.

```ts
{ path: 'play', loadComponent: () => import('./features/game/game-page').then((m) => m.GamePage) }
```

`GamePage` is a standalone component. Its `imports` include `GameCanvas`. `GameCanvas` is standalone. Selector `app-game-page` and `app-game-canvas`.

The canvas element sets its CSS width and height from `fitCanvasCss` against the host size, and its bitmap width and height to `css * cappedDevicePixelRatio`. On a missing host size, use 960 x 576.

Draw pads as rectangles centered on `tileCenter(pad.col, pad.row)` with size 36. Draw the path as a stroke through `MAP_01.waypoints` with line width 28. Draw the core as a circle of radius 16 at the last waypoint. Draw the entry as a square of size 14 at the first waypoint.

## Tests

`render.spec.ts`:

- dpr 1, 2, and 3 cap to 1, 2, and 2. dpr 0 caps to 1.
- fit cases above, including the zero container.
- `drawStatic` on a mock context records a path stroke and 14 pad fills. A second draw with the same size does not rebuild the cache. A size change does.

Use a tiny fake context object. Do not require a real canvas in the unit test.

`game-page.spec.ts` creates `GamePage`, expects the four HUD strings and `data-testid="game-canvas"`, then `fixture.destroy()`.

## Commands

```bash
npm test
npm run lint
npm run build
npm run e2e
if grep -R "@angular" src/app/core/render; then echo HAS_ANGULAR; exit 1; else echo NO_ANGULAR; fi
if grep -R shadowBlur src/app/core/render; then echo HAS_SHADOW; exit 1; else echo NO_SHADOW; fi
```

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, `results/DECISIONS.md`, content tables, engine command rules, or `loop.ts`.
- Do not add dependencies. Do not spawn subagents. Do not `git add -A`.
- Do not reverse `fileReplacements`.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run build && npm run e2e
verify_exit: 0
```

`notes:` must list the HUD test ids and say TASK-021 binds them instead of replacing them. List `cappedDevicePixelRatio` and `fitCanvasCss`.

```bash
git add \
  src/app/core/render/palette.ts \
  src/app/core/render/layout.ts \
  src/app/core/render/background.ts \
  src/app/core/render/renderer.ts \
  src/app/core/render/render.spec.ts \
  src/app/features/game/game-canvas.ts \
  src/app/features/game/game-canvas.html \
  src/app/features/game/game-page.ts \
  src/app/features/game/game-page.html \
  src/app/features/game/game-page.spec.ts \
  src/app/app.routes.ts \
  results/TASK-012-renderer-shell.md
git status --short
git commit -m "feat(TASK-012): add map canvas and play page shell"
```

Add a CSS file by name if you create one. Stop if an unexpected path is untracked or if build output is staged.

Final chat reply <= 8 lines.
