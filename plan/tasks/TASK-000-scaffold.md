# TASK-000: Scaffold Angular workspace, Material, and Playwright

**Phase:** 0 — Setup
**Subagent:** general
**Depends on:** none (git repo, remote, and npm already exist)
**Git target:** `main` (bootstrap exception — no feature branch needed)
**Result file:** `results/TASK-000-scaffold.md`

## Goal

Turn the existing git repository at `C:\wrk\tower-angular` into a blank, verified Angular 22.2.3 workspace with Material 22 and Playwright installed, matching the `angular-scaffold` skill baseline. Keep it a blank shell — no game features yet. Update the README and commit.

## Read first

- `plan/implementation-plan.md` §0.10 (scaffold instructions), §2.4, §3, §4.4
- `plan/design.md` (context only)
- `results/README.md`, `results/DECISIONS.md`
- Load the `angular-scaffold` skill before running scaffold commands.

Do not read the whole repository. It currently contains only `.git`, `README.md`, and the `plan/` and `results/` folders.

## Deliverables

- [ ] Angular 22.2.3 workspace in `C:\wrk\tower-angular` (`package.json`, `angular.json`, `src/`, `public/`, config files)
- [ ] Material 22 + CDK 22 + animations 22 installed
- [ ] Prebuilt themes in `public/assets/themes/` (`deeppurple-amber.css`, `purple-green.css`)
- [ ] `@playwright/test` installed; Chromium downloaded
- [ ] `src/index.html` uses relative theme and favicon URLs; theme link has `id="theme-link"`
- [ ] `ThemeService` implemented and applied in the shell
- [ ] Test scripts set: `test`, `test:watch`, `e2e`, `start`, `build`
- [ ] `.gitignore` covers `node_modules/`, `dist/`, `.angular/`, `test-results/`, `playwright-report/`, `results/evidence/`
- [ ] README updated with project name, stack, and commands
- [ ] Result file `results/TASK-000-scaffold.md`
- [ ] Commit on `main`, pushed to `origin`

## Acceptance criteria

- [ ] `npx ng version` reports Angular CLI 22.2.x
- [ ] `npm test` passes with `--no-watch` (shell spec rewritten; no placeholder expectations)
- [ ] `npm run build` succeeds and outputs `dist/tower-angular/browser`
- [ ] `npm run e2e` passes the shell spec (theme toggle + heading)
- [ ] `package.json` has no `zone.js` and no `@analogjs/*`
- [ ] All `@angular/*` packages are on major 22
- [ ] `git status --short` is clean after the commit; `git push origin main` succeeds

## Commands

```powershell
# Scaffold in a sibling (CLI refuses non-empty targets)
New-Item -ItemType Directory -Path C:\wrk\tower-angular-scaffold -Force
Set-Location C:\wrk\tower-angular-scaffold
npx --yes @angular/cli@22 new tower-angular `
  --directory . `
  --style=css `
  --routing `
  --ssr=false `
  --skip-git `
  --package-manager=npm `
  --test-runner=vitest `
  --zoneless `
  --ai-config=none `
  --defaults

# Fallback if npm install fails with EALLOWSCRIPTS:
# npm install --ignore-scripts

# Move generated files into the existing repo, preserving .git and README.md
Get-ChildItem C:\wrk\tower-angular-scaffold -Force |
  Where-Object { $_.Name -ne 'README.md' } |
  Move-Item -Destination C:\wrk\tower-angular -Force

Set-Location C:\wrk\tower-angular
npm install "@angular/material@22" "@angular/cdk@22" "@angular/animations@22"
npm install -D "@playwright/test@1"
npx playwright install chromium

# Themes
node -e "const fs=require('node:fs');fs.mkdirSync('public/assets/themes',{recursive:true});for(const t of ['deeppurple-amber','purple-green'])fs.copyFileSync('node_modules/@angular/material/prebuilt-themes/'+t+'.css','public/assets/themes/'+t+'.css')"

npm test
npm run build
git add -A
git commit -m "feat(TASK-000): scaffold Angular 22 workspace, Material, and Playwright"
git push origin main
```

## Constraints

- Do not delete or reinitialize `.git`; do not force-push.
- Do not overwrite the existing commit history.
- Keep the app a blank shell; no game components, no canvas, no tower code.
- `--routing` is intentional (menu and game routes later).
- Omit `provideNativeDateAdapter()`; no date components.
- Keep asset URLs relative (`assets/...`), never absolute.
- Do not edit `plan/` or `results/INDEX.md`.
- Do not spawn subagents.
- If the CLI prompts despite `--defaults`, stop and report the prompt in the result file.

## Handoff

Write `results/TASK-000-scaffold.md` using the result template. Include the exact `ng version`, test, build, and e2e outputs as short excerpts. Final chat reply <= 8 lines: status, tests run, files changed, blockers.
