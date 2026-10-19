# Core Defense — Design

Condensed reference for task subagents. The full delivery workflow lives in `implementation-plan.md`.

## Vision

A neon vector sci-fi tower defense game. The player defends a data core from corrupted drones on a circuit-board map. One authored fixed path, fixed build pads, three tower types, ten waves, and a boss. Desktop-first responsive web app built with Angular 22, Canvas 2D, and a pure TypeScript simulation.

## Core loop

1. Start with 150 gold and 20 core integrity.
2. Build/upgrade towers during the build phase.
3. Press **Deploy Wave**; enemies follow the fixed path toward the core.
4. Towers acquire targets, fire, and earn bounty gold for kills.
5. Leaks reduce integrity.
6. Clear the wave, collect a bonus, invest, repeat.
7. Survive wave 10 and kill the boss to win; reach 0 integrity to lose.

Building is allowed during a wave. Pause freezes simulation but not the build UI.

## Map and placement

- Grid: 20 x 12 tiles, 48 px each, 960 x 576 logical canvas.
- One entry point, one core, one authored polyline path.
- 14 fixed build pads. Placement only on empty build pads.
- Selecting a tower highlights valid pads and shows a range preview.
- Invalid placement shows a reason and spends nothing.
- Sell refunds 70% of invested gold.

## Towers

| Tower | Cost | Damage | Rate | Range | Role |
|---|---:|---:|---:|---:|---|
| Pulse | 70 | 12 | 1.8/s | 3.2 tiles | Single-target damage |
| Mortar | 110 | 45 splash | 0.55/s | 4.0 tiles | Anti-clump, anti-armor |
| Cryo | 90 | 5 | 1.2/s | 3.0 tiles | 40% slow for 1.5 s |

Three upgrade levels. Targeting modes: First, Strongest, Closest (default First). Armor is flat reduction per hit (minimum 1 damage). Slow is strongest-wins with duration refresh.

## Enemies

| Enemy | HP | Speed | Armor | Bounty | Leak damage |
|---|---:|---:|---:|---:|---:|
| Drone | 55 | 1.0 tile/s | 0 | 6 | 1 |
| Runner | 40 | 1.7 tile/s | 0 | 8 | 1 |
| Tank | 300 | 0.55 tile/s | 4 | 18 | 2 |
| Swarm | 22 | 1.15 tile/s | 0 | 3 | 1 |
| Overlord (boss, wave 10) | 2200 | 0.45 tile/s | 6 | 150 | 10 |

Boss has 50% slow resistance.

## Waves

| Wave | Composition |
|---:|---|
| 1 | 8 Drones |
| 2 | 10 Drones, 4 Runners |
| 3 | 16 Swarm, 6 Drones |
| 4 | 4 Tanks, 8 Drones |
| 5 | 10 Runners, 8 Swarm |
| 6 | 6 Tanks, 10 Drones, 6 Runners |
| 7 | 20 Swarm, 4 Tanks |
| 8 | 12 Runners, 8 Drones, 4 Tanks |
| 9 | 8 Tanks, 20 Swarm, 10 Runners |
| 10 | Overlord, 10 Drones, 6 Runners, 4 Tanks |

Spawn intervals and group delays live in data. Numbers are starting points for the balance simulator.

## Economy, score, end states

- Wave-clear bonus: `25 + 5 x wave`; plus kill bounties.
- Score: `kills x 10 + wavesReached x 100 + remainingLives x 25`.
- Victory when wave 10 is cleared; defeat at 0 integrity.
- Best score, best wave, and settings persist in `localStorage` under `core-defense:v1`.
- Results overlay: waves, kills, integrity, score, best score, Retry, Main Menu.

## Engine

- Fixed 60 Hz timestep with accumulator; clamp frame delta to 0.25 s; max 10 steps per frame; 2x speed feeds the accumulator at double rate.
- Deterministic: integer ticks, no wall clock in simulation, authored waves, seeded PRNG for cosmetics only, stable system order.
- State: tick, phase, gold, integrity, wave, score, towers, enemies, projectiles, effects, spawn queue, RNG.
- Commands: placeTower, upgradeTower, sellTower, setTargeting, startWave, reset.
- Tick order: commands -> spawn -> slow effects -> movement/leaks -> targeting -> fire -> projectiles -> damage/deaths -> wave state -> cosmetic effects.
- Path: precomputed segment lengths and cumulative distance; enemies store distanceAlongPath.
- Targeting: distance-squared checks; no spatial hash needed at 20 towers x 150 enemies.
- Rendering: Canvas 2D; cached static layer (grid, path, pads, core); dynamic layer sorted by y; DPR capped at 2; HUD in DOM.

## Angular integration

- Angular 22.2.x (22.2.3 verified), standalone, zoneless, native Vitest, Angular Material 22 + CDK + animations for chrome, angular-eslint 22 + Prettier, Playwright for e2e.
- Engine is framework-free; `GameFacade` owns engine/loop/renderer and exposes signals.
- HUD snapshots at 10 Hz; entity positions never go through change detection.
- `GameCanvasComponent` renders; `BoardOverlayComponent` provides transparent DOM buttons over pads/towers for mouse, keyboard, accessibility, and stable test selectors.
- Material theme service toggles prebuilt themes in `public/assets/themes/`; default dark; theme preference under `theme`, game settings under `core-defense:v1`. Relative asset URLs for subpath builds.
- Production builds replace `harness-loader.ts` with a no-op, so the e2e harness (`window.__TD__`) is absent from production bundles.

## UX and accessibility

- HUD: integrity, gold, wave, score, pause, speed, sound.
- Keys: 1/2/3 select tower, Space pause, F speed, Esc cancel, Tab cycles pads/towers.
- `aria-live` announcements for wave start/clear, leak, victory, defeat.
- Colorblind-safe palette with distinct shapes; reduced-motion option.
