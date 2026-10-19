# TASK-001: E2E build, harness loader replacement, start:e2e

**Phase / dependencies:** Phase 0. Depends on TASK-000 (`status: pass`, commit `7185020` on `main`).
**Subagent:** general
**Git branch:** `task/TASK-001-playwright` (already created from `main`; stay on it)
**Result file:** `results/TASK-001-playwright.md`

## Goal

Make `ng build --configuration e2e` and `ng serve --configuration e2e` replace the production harness loader with the e2e loader. Point Playwright at `npm run start:e2e`. Install `http-server` and add `e2e:serve`. Keep the shell spec green. Do not build the game harness API.

## Read first — only these

- `results/TASK-000-scaffold.md`
- `plan/implementation-plan.md` §4.1 and §4.4
- `angular.json`
- `package.json`
- `playwright.config.ts`
- `src/app/app.ts`

Do not read the entire repository or the entire plan. Do not load `angular-scaffold`.

If `results/TASK-000-scaffold.md` does not start with `status: pass`, stop.

The Hermes terminal is git-bash. Native tools (`node`, `npm`, `npx`, `git`) get `C:/` paths. Workspace is `C:/wrk/tower-angular`.

## Deliverables

- [ ] `src/app/core/testing/harness-loader.ts` — production no-op. Must not contain the characters `__TD__`.
- [ ] `src/app/core/testing/harness-loader.e2e.ts` — assigns `globalThis.__TD__`.
- [ ] `angular.json` build configuration `e2e` with `fileReplacements`, and serve configuration `e2e`.
- [ ] `package.json` scripts `start:e2e` and `e2e:serve`; devDependency `http-server`.
- [ ] `playwright.config.ts` `webServer.command` is `npm run start:e2e`.
- [ ] `src/app/app.ts` calls `installHarness()` once.
- [ ] `results/TASK-001-playwright.md`

## Exact files

`src/app/core/testing/harness-loader.ts`:

```ts
export function installHarness(_facade?: unknown): void {
  void _facade;
}
```

`src/app/core/testing/harness-loader.e2e.ts`:

```ts
export interface TdHarnessStub {
  ready: boolean;
}

export function installHarness(_facade?: unknown): void {
  void _facade;
  const hook: TdHarnessStub = { ready: false };
  (globalThis as { __TD__?: TdHarnessStub }).__TD__ = hook;
}
```

`src/app/app.ts` — keep the existing component. Add the import and the constructor call. Do not add a second call later in this task.

```ts
import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { installHarness } from './core/testing/harness-loader';
import { ThemeService } from './theme.service';

@Component({
  imports: [MatButton, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly theme = inject(ThemeService);

  constructor() {
    installHarness();
  }
}
```

In `angular.json`, add this build configuration next to `development`. Do not add `fileReplacements` to `production` or `development`. Do not reverse replace/with.

```json
"e2e": {
  "optimization": false,
  "extractLicenses": false,
  "sourceMap": true,
  "fileReplacements": [
    {
      "replace": "src/app/core/testing/harness-loader.ts",
      "with": "src/app/core/testing/harness-loader.e2e.ts"
    }
  ]
}
```

Add this serve configuration next to `development`:

```json
"e2e": {
  "buildTarget": "tower-angular:build:e2e"
}
```

In `package.json` scripts, add exactly:

```json
"start:e2e": "ng serve --configuration e2e",
"e2e:serve": "ng build --configuration e2e && http-server dist/tower-angular/browser -p 4200 -c-1 --proxy http://localhost:4200?"
```

Do not add `lint`, `sim`, `build:pages`, or `copy404`.

`playwright.config.ts`: set `webServer.command` to `'npm run start:e2e'`. Leave `url`, `reuseExistingServer`, and `timeout: 120_000` as they are.

## Commands to run

```bash
git branch --show-current
npm install -D http-server@14
npm test
npm run build
if grep -R -q __TD__ dist/tower-angular/browser; then echo PROD_HAS_TD; exit 1; else echo PROD_ABSENT; fi
npx ng build --configuration e2e
if grep -R -q __TD__ dist/tower-angular/browser; then echo E2E_HAS_TD; else echo E2E_MISSING; exit 1; fi
npm run e2e
```

Do not run `e2e:serve`. It starts a server and does not exit. `npm ls http-server --depth=0` is enough to prove the dependency.

Confirm `git branch --show-current` prints `task/TASK-001-playwright` before editing. If it prints `main`, stop. Do not create a second branch. Do not switch to `main`. Do not merge. Do not push.

## Acceptance criteria

- [ ] `fileReplacements` exists only on the build configuration named `e2e`, and it replaces `harness-loader.ts` with `harness-loader.e2e.ts`.
- [ ] Serve configuration `e2e` uses `tower-angular:build:e2e`.
- [ ] Production loader source does not contain `__TD__`. The e2e loader assigns `globalThis.__TD__`.
- [ ] `npm test` passes.
- [ ] Production `dist/tower-angular/browser` does not contain `__TD__`. The e2e configuration build does.
- [ ] `npm run e2e` passes `e2e/specs/shell.spec.ts` with `webServer.command` equal to `npm run start:e2e`.
- [ ] `http-server` is a devDependency. `start:e2e` and `e2e:serve` exist. No lint, tsx, or axe packages.

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, `results/DECISIONS.md`, or `results/TASK-000-scaffold.md`.
- Do not implement `getState`, `stepTicks`, `dispatch`, smoke specs, or game pages. TASK-013 owns the harness API. This task only installs the replacement and a `{ ready: false }` stub.
- Do not add `zone.js`, `@analogjs/*`, or a second theme.
- Do not run `ng add`.
- Do not spawn subagents.
- Do not `git add -A`.

## Handoff

Write `results/TASK-001-playwright.md` before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run build && npx ng build --configuration e2e && npm run e2e
verify_exit: 0
```

Do not write a commit hash. Do not amend.

Notes the next agent must copy, not re-derive:

- Signature that shipped: `installHarness(_facade?: unknown): void`
- `App` calls it once. TASK-013 moves that call to `GamePageComponent` and removes it from `App`. Do not leave both calls.
- Production file is the default. The `e2e` configuration replaces it. Do not reverse that.
- `window.__TD__` methods are not implemented yet.

```bash
git add \
  angular.json package.json package-lock.json \
  playwright.config.ts \
  src/app/app.ts \
  src/app/core/testing/harness-loader.ts \
  src/app/core/testing/harness-loader.e2e.ts \
  results/TASK-001-playwright.md
git status --short
git commit -m "feat(TASK-001): add e2e harness loader replacement and start:e2e"
```

Stop if `git status --short` after that add shows a path outside the list, or if `node_modules`, `dist`, `.angular`, `test-results`, `playwright-report`, `blob-report`, or `results/evidence` is staged.

Final chat reply <= 8 lines: status, tests run, files changed, blockers.
