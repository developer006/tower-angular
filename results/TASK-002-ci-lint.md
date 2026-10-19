status: pass
commit: pending
verify: npm run lint && npm test && npm run build && npm run e2e
verify_exit: 0
files:
- package.json
- package-lock.json
- angular.json
- eslint.config.js
- .github/workflows/ci.yml
- results/TASK-002-ci-lint.md
versions:
- angular-eslint: 22.6.0
- eslint: 10.13.0
- typescript-eslint: 8.71.0
- eslint-config-prettier: 10.1.8
eslint_config: CJS (module.exports / require). Not ESM.
deviations:
- `npx ng add angular-eslint@22 --skip-confirmation` failed with npm EALLOWSCRIPTS (`--allow-scripts is not allowed in project-scoped installs`) while the CLI ran `npm install angular-eslint@^22.6.0 --save-dev --ignore-scripts`. Per the brief, installed with `npm install -D angular-eslint@22 --ignore-scripts`, then ran the installed package's ng-add schematic (`node node_modules/@angular/cli/bin/ng.js generate angular-eslint:ng-add --skip-install`). Did not substitute the collection name `@angular-eslint/schematics`. The schematic still wrote `eslint.config.js`, the lint architect target, and `"lint": "ng lint"`.
- Generated config uses `defineConfig([...])`, not `tseslint.config(...)`. `eslint-config-prettier` is required and is the last entry in that array.
notes:
- Do not re-run `ng add`.
- TASK-010 may start after this merges.
- `fileReplacements` remains only on build configuration `e2e`.
- No `tsx`, `@axe-core/playwright`, `zone.js`, Firefox, WebKit, or deploy workflow added.
- `.prettierrc` was not deleted or used to reformat the repo.
- Schematic did not write `.vscode/extensions.json`.

# TASK-002 Result

**Status:** pass
**Branch:** task/TASK-002-ci-lint
**Commit:** pending

## Summary

- Added Angular ESLint 22.6.0, `eslint-config-prettier` last in the flat config, the `lint` script, and a Chromium-only GitHub Actions workflow.
- `npm run lint`, `npm test`, `npm run build`, and `npm run e2e` all exited 0.

## Tests and evidence

- `npm run lint` -> All files pass linting.
- `npm test` -> 2 files, 3 tests passed.
- `npm run build` -> pass.
- `npm run e2e` -> 1 passed (`e2e/specs/shell.spec.ts`).

## Acceptance criteria

- [x] `npm run lint` exits 0
- [x] `npm test` passes
- [x] `npm run build` passes
- [x] `npm run e2e` passes the shell spec
- [x] `package.json` script `lint` is `ng lint`
- [x] `fileReplacements` only on build configuration `e2e`
- [x] CI file matches the brief (`node-version: 26`, Chromium only)
- [x] No `tsx`, `@axe-core/playwright`, or `zone.js` dependency added

## Handoff for next task

- angular-eslint 22.6.0 is installed. `eslint.config.js` is CommonJS. Do not re-run `ng add`.
- TASK-010 may start after this merges.
