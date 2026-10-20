# Core Defense

Angular 22 workspace for Core Defense. Dark theme by default.

## Setup

- Node 26
- `npm install`

## Commands

- `npm start` — start the dev server
- `npm run start:e2e` — start the dev server with the e2e configuration
- `npm test` — run unit tests once
- `npm run lint` — lint the project
- `npm run e2e` — run the 18 Playwright tests
- `npm run sim` — run the headless balance simulator
- `npm run build` — production build
- `npm run build:pages` — production build with base href `/tower-angular/` and the 404 fallback
- `npm run copy404` — copy the built `index.html` to `404.html`

## Architecture

Simulation lives under `src/app/core/` and has no Angular imports in `core/game` or `core/systems`. The UI lives under `src/app/features/`.

## Harness

The default file `src/app/core/testing/harness-loader.ts` is the no-op, and the `e2e` configuration replaces it with `harness-loader.e2e.ts`.

## Test strategy

- Unit tests (`npm test`)
- The 18 Playwright tests (`npm run e2e`)
- `npm run sim`
- Visual captures that run only when `VISUAL=1`. Baselines are produced on Ubuntu by `visual-baselines.yml`, not on Windows.

## Release checklist

Run these commands. This list is not a claim that GitHub Pages is deployed.

- `npm test`
- `npm run lint`
- `npm run e2e` three times; each run should print `18 passed`
- `npm run sim`
- `npm run build`, then confirm the new `dist/` contains neither `__TD__` nor `harness-loader.e2e`
- `npx tsx scripts/perf-check.ts` in the foreground. It builds 20 towers and 100 enemies and times `engine.step()`. The average must be under 4 ms. This timer is not part of `npm test`.

