# TASK-002: Lint, Prettier integration, and CI

**Phase / dependencies:** Phase 0. Depends on TASK-001 (`status: pass`, merged to `main` as `9181a6f`).
**Subagent:** general
**Git branch:** `task/TASK-002-ci-lint` (already created from `main`; stay on it)
**Result file:** `results/TASK-002-ci-lint.md`

## Goal

Add Angular ESLint 22, keep Prettier from fighting it, add the `lint` script, and add a Chromium-only GitHub Actions workflow. `npm run lint` must pass. Do not add game code.

## Read first — only these

- `results/TASK-001-playwright.md`
- `plan/implementation-plan.md` §4.4 (scripts and CI paragraph only)
- `package.json`
- `angular.json`
- `.prettierrc`

Do not read the entire repository. Do not load `angular-scaffold`.

If `results/TASK-001-playwright.md` does not start with `status: pass`, stop.

The Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`.

## Deliverables

- [ ] `ng add angular-eslint@22 --skip-confirmation` applied. The package `angular-eslint` ships schematics at `@angular-eslint/schematics/dist/collection.json`. Do not substitute `@angular-eslint/schematics` unless that exact `ng add` command fails, and then say so.
- [ ] `eslint-config-prettier` installed and applied last in the generated ESLint flat config, unless the schematic already did that.
- [ ] `"lint": "ng lint"` in `package.json`.
- [ ] `.github/workflows/ci.yml` as specified below.
- [ ] `results/TASK-002-ci-lint.md`

## Commands

```bash
git branch --show-current
npx ng add angular-eslint@22 --skip-confirmation
npm install -D eslint-config-prettier
```

Confirm `git branch --show-current` prints `task/TASK-002-ci-lint` before editing. If it prints `main`, stop. Do not create a second branch. Do not switch to `main`. Do not merge. Do not push.

If `ng add` prompts despite `--skip-confirmation`, stop and quote the prompt. If npm fails with `EALLOWSCRIPTS`, rerun that install with `--ignore-scripts` and then continue. Do not run `ng add @angular/material`.

## ESLint / Prettier

Let the schematic write `eslint.config.js` and the `lint` architect target. Do not hand-write a second config.

`.prettierrc` already exists (`printWidth` 100, `singleQuote` true, Angular HTML parser). Do not delete it. Do not reformat the repository.

After the schematic, open `eslint.config.js`. If it is CommonJS and uses `tseslint.config(...)`, add:

```js
const eslintConfigPrettier = require('eslint-config-prettier');
```

and pass `eslintConfigPrettier` as the last argument so it disables stylistic rules that conflict with Prettier. If the file is ESM, use the matching import and still keep that config last. If the schematic already includes `eslint-config-prettier` once, do not add it again.

Keep the generated selector rules: prefix `app`, element `kebab-case`, attribute `camelCase`.

Set the npm script to exactly `"lint": "ng lint"` if the schematic did not. Do not add `sim`, `build:pages`, `copy404`, `tsx`, or `@axe-core/playwright`.

## CI workflow

Create `.github/workflows/ci.yml` with this content:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 26
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npm run e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-traces
          path: |
            test-results/
            playwright-report/
            blob-report/
```

`node-version` must be `26`, not `24`. Chromium only. Do not add Firefox, WebKit, or a deploy workflow.

## Acceptance

- [ ] `npm run lint` exits 0.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] `npm run e2e` passes the shell spec.
- [ ] `package.json` script `lint` is `ng lint`.
- [ ] `angular.json` still has build `fileReplacements` only on configuration `e2e`, replacing `harness-loader.ts` with `harness-loader.e2e.ts`. Do not reverse it.
- [ ] CI file matches the block above.
- [ ] No `tsx`, no `@axe-core/playwright`, no `zone.js` dependency added.

If `ng lint` reports errors in existing files, fix those files. Do not turn recommended rules off to get a green run. Do not change harness behavior.

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, `results/DECISIONS.md`, or another task's result file.
- Do not implement game features, the harness API, or GitHub Pages.
- Do not spawn subagents.
- Do not `git add -A`.

## Handoff

Write `results/TASK-002-ci-lint.md` before the commit. First lines:

```text
status: pass
commit: pending
verify: npm run lint && npm test && npm run build && npm run e2e
verify_exit: 0
```

Do not write a commit hash. Do not amend.

Record the resolved `angular-eslint` version and whether `eslint.config.js` is CJS or ESM. Note that TASK-010 may start after this merges. Do not tell the next agent to re-run `ng add`.

Stage the schematic output by name. Expected paths:

```bash
git add \
  package.json package-lock.json angular.json \
  eslint.config.js \
  .github/workflows/ci.yml \
  results/TASK-002-ci-lint.md
git status --short
```

If the schematic wrote a different config filename, or updated `.vscode/extensions.json`, add that path by name and say so. Stop if a path outside that set is still untracked after those adds, or if `node_modules`, `dist`, `.angular`, `test-results`, `playwright-report`, `blob-report`, or `results/evidence` is staged.

```bash
git commit -m "chore(TASK-002): add angular-eslint, prettier compat, and CI"
```

Final chat reply <= 8 lines: status, tests run, files changed, blockers.
