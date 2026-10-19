# TASK-013: E2E harness and smoke spec

**Phase / dependencies:** Phase 1. Depends on TASK-012 and TASK-001 (both `status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-013-e2e-harness` (already created from `main`; stay on it)
**Result file:** `results/TASK-013-e2e-harness.md`

## Goal

Move harness installation to the game page, expose `window.__TD__` only in the e2e build, and add the smoke spec. Production builds must not contain `__TD__`.

## Read first — only these

- `results/TASK-001-playwright.md`
- `results/TASK-012-renderer-shell.md`
- `src/app/app.ts`
- `src/app/features/game/game-page.ts`
- `src/app/features/game/game-page.html`
- `src/app/core/testing/harness-loader.ts`
- `src/app/core/testing/harness-loader.e2e.ts`
- `src/app/core/game/engine.ts`
- `playwright.config.ts`

If either result does not start with `status: pass`, stop.

Copy pad ids `pad-01` through `pad-14`. Do not invent another map. Do not edit `loop.ts`. Do not reorder `runSimulationSystems`. Do not reverse `fileReplacements`: production file is the default, the `e2e` configuration replaces it with `harness-loader.e2e.ts`.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-013-e2e-harness`. Do not switch, merge, or push.

## Locked behavior

- Remove `installHarness()` from `App`. `GamePage` calls `installHarness(facade)` once. Do not leave both calls.
- Production `harness-loader.ts` stays a no-op and must not contain the characters `__TD__`.
- The e2e loader assigns `globalThis.__TD__` and sets `ready` to true when a facade is passed.
- `webServer.command` stays `npm run start:e2e`.
- HUD test ids stay `hud-integrity`, `hud-gold`, `hud-wave`, `hud-score`. Bind them to signals: `facade.gold()`, not `facade.gold`. Initial text remains `20`, `150`, `1`, `0`.
- Add `data-testid="deploy-wave"` with label `Deploy Wave`. It is enabled when not paused.
- `GamePage` implements `OnInit` and `OnDestroy`. A 10 Hz `setInterval` starts in `ngOnInit` and is cleared in `ngOnDestroy`. Also stop the animation frame there. The existing spec must destroy its fixture. Add a second fixture in that spec and destroy it too.
- No new dependencies. Do not add a twelfth e2e spec. The new spec is `e2e/specs/smoke.spec.ts` only.

## Facade and harness

Create `src/app/state/game-facade.ts`. It owns one `GameEngine(1)`, the loop from `createLoop()`, and signals `gold`, `integrity`, `wave`, `score`, `paused`.

Add `configureScenario` on `GameEngine`:

```ts
configureScenario(options: { seed: number; integrity?: number; wave?: number; gold?: number }): void
```

It calls `reset(options.seed)`, then assigns any provided `integrity`, `wave`, or `gold`. `wave` is the 1-based next wave. Do not use `Date.now()`.

`GameFacade` methods used by the harness:

- `refresh()` copies engine state into the signals.
- `stepTicks(n: number)` calls `engine.step()` n times, then `refresh()`, then the registered render callback.
- `setManualMode(enabled: boolean)` makes later animation frames skip `advanceFrame`.
- `dispatch(command)` forwards to the engine and returns the result, then `refresh()`.
- `reset(options)` calls `configureScenario` and `refresh()`.
- `getMap()` returns pad ids in order, waypoint pixel points, entry, and core from `MAP_01`.
- `start()` begins `requestAnimationFrame`. The first frame does not step. Later frames call `advanceFrame` only when manual mode is off. Do not refresh the HUD from every frame.
- `stop()` cancels the frame and sets a flag so a late callback does not schedule another.

`installHarness` signature stays `installHarness(_facade?: unknown): void`.

E2E hook shape:

```ts
{
  ready: boolean;
  getState(): { gold: number; integrity: number; wave: number; score: number; phase: string; tick: number };
  getFullState(): GameState;
  stepTicks(n: number): void;
  setManualMode(enabled: boolean): void;
  dispatch(command: Command): CommandResult;
  reset(options: { seed: number; integrity?: number; wave?: number; gold?: number }): void;
  getMap(): { padIds: string[]; waypoints: { x: number; y: number }[]; entry: { col: number; row: number }; core: { col: number; row: number } };
}
```

`getFullState` returns `engine.getState()` (already cloned). `getMap().padIds` is exactly `pad-01` through `pad-14`.

## Smoke spec

`e2e/specs/smoke.spec.ts`:

- `page.goto('/play')`
- wait until `window.__TD__?.ready === true`
- canvas `game-canvas` is visible
- `hud-gold` text is `150`, `hud-integrity` text is `20`
- `deploy-wave` is enabled
- no page errors

Do not add combat, victory, or visual specs.

## Tests

- Existing game-page spec still sees HUD text `20`, `150`, `1`, `0` and destroys every fixture, including a second one created in that file.
- A unit test calls production `installHarness()` and does not throw. Do not add the characters `__TD__` to `harness-loader.ts`.
- `configureScenario({ seed: 3, integrity: 9, wave: 10, gold: 40 })` leaves those values and tick 0.

## Commands

```bash
npm test
npm run lint
npm run build
if grep -R -q __TD__ dist/tower-angular/browser; then echo PROD_HAS_TD; exit 1; else echo PROD_ABSENT; fi
npx ng build --configuration e2e
if grep -R -q __TD__ dist/tower-angular/browser; then echo E2E_HAS_TD; else echo E2E_MISSING; exit 1; fi
npm run e2e
if grep -n installHarness src/app/app.ts; then echo APP_STILL_INSTALLS; exit 1; else echo APP_CLEAN; fi
```

Expect Playwright: 2 passed (shell and smoke).

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, `results/DECISIONS.md`, or another task result.
- Do not spawn subagents. Do not `git add -A`. Do not add `tsx`, axe, or Pages scripts.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run build && npx ng build --configuration e2e && npm run e2e
verify_exit: 0
```

`api:` must list the `__TD__` methods that shipped. `notes:` must say `App` no longer calls `installHarness`, and `GamePage` calls it once.

```bash
git add \
  src/app/app.ts \
  src/app/state/game-facade.ts \
  src/app/core/game/engine.ts \
  src/app/core/testing/harness-loader.ts \
  src/app/core/testing/harness-loader.e2e.ts \
  src/app/features/game/game-page.ts \
  src/app/features/game/game-page.html \
  src/app/features/game/game-page.spec.ts \
  e2e/specs/smoke.spec.ts \
  results/TASK-013-e2e-harness.md
git status --short
git commit -m "feat(TASK-013): install the e2e harness and smoke spec"
```

Add a new spec file by name if you create one beside the facade. Stop if an unexpected path is untracked or if build output is staged.

Final chat reply <= 8 lines.
