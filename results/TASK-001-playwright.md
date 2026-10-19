status: pass
commit: pending
verify: npm test && npm run build && npx ng build --configuration e2e && npm run e2e
verify_exit: 0
files:
- angular.json
- package.json
- package-lock.json
- playwright.config.ts
- src/app/app.ts
- src/app/core/testing/harness-loader.ts
- src/app/core/testing/harness-loader.e2e.ts
- results/TASK-001-playwright.md
api:
- installHarness(_facade?: unknown): void
- TdHarnessStub = { ready: boolean }
deviations:
- none
notes:
- Signature that shipped: `installHarness(_facade?: unknown): void`
- `App` calls it once. TASK-013 moves that call to `GamePageComponent` and removes it from `App`. Do not leave both calls.
- Production file is the default. The `e2e` configuration replaces it. Do not reverse that.
- `window.__TD__` methods are not implemented yet.

# TASK-001 Result

**Status:** pass
**Branch:** task/TASK-001-playwright
**Commit:** pending

## Summary

- Added a production no-op harness loader and an e2e loader that assigns `globalThis.__TD__` to `{ ready: false }`.
- `ng build --configuration e2e` and `ng serve --configuration e2e` replace the production loader. Playwright `webServer.command` is `npm run start:e2e`.
- Installed `http-server@14` and added `e2e:serve`. Did not run `e2e:serve`. Did not implement harness methods or a smoke spec.

## Files changed

- `src/app/core/testing/harness-loader.ts` — production no-op; no `__TD__`
- `src/app/core/testing/harness-loader.e2e.ts` — assigns `globalThis.__TD__`
- `src/app/app.ts` — one `installHarness()` call in the constructor
- `angular.json` — build and serve configuration `e2e` only
- `package.json` / `package-lock.json` — `start:e2e`, `e2e:serve`, `http-server@14.1.1`
- `playwright.config.ts` — `webServer.command` is `npm run start:e2e`

## Tests and evidence

- `npm test` -> pass (2 files, 3 tests)
- `npm run build` -> pass; `grep -R __TD__ dist/tower-angular/browser` -> `PROD_ABSENT`
- `npx ng build --configuration e2e` -> pass; grep -> `E2E_HAS_TD`
- `npm run e2e` -> pass (Playwright: 1 passed / 0 failed, `e2e/specs/shell.spec.ts`)
- `npm ls http-server --depth=0` -> `http-server@14.1.1`

## Acceptance criteria

- [x] `fileReplacements` exists only on the build configuration named `e2e`, replacing `harness-loader.ts` with `harness-loader.e2e.ts`
- [x] Serve configuration `e2e` uses `tower-angular:build:e2e`
- [x] Production loader source does not contain `__TD__`. The e2e loader assigns `globalThis.__TD__`
- [x] `npm test` passes
- [x] Production `dist/tower-angular/browser` does not contain `__TD__`. The e2e configuration build does
- [x] `npm run e2e` passes `e2e/specs/shell.spec.ts` with `webServer.command` equal to `npm run start:e2e`
- [x] `http-server` is a devDependency. `start:e2e` and `e2e:serve` exist. No lint, tsx, or axe packages

## Decisions / assumptions

- Did not add `lint`, `sim`, `build:pages`, or `copy404`.
- Did not implement `getState`, `stepTicks`, `dispatch`, or a smoke spec.
- Did not run `e2e:serve` (it starts a server and does not exit).

## Open issues / risks

- none

## Handoff for next task

- Signature that shipped: `installHarness(_facade?: unknown): void`
- `App` calls it once. TASK-013 moves that call to `GamePageComponent` and removes it from `App`. Do not leave both calls.
- Production file is the default. The `e2e` configuration replaces it. Do not reverse that.
- `window.__TD__` methods are not implemented yet.
