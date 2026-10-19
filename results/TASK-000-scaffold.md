status: pass
commit: pending
verify: npm test && npm run build && npm run e2e
verify_exit: 0
files:
- package.json
- package-lock.json
- angular.json
- tsconfig.json
- tsconfig.app.json
- tsconfig.spec.json
- playwright.config.ts
- .gitattributes
- .gitignore
- .editorconfig
- .prettierrc
- .vscode/extensions.json
- .vscode/launch.json
- .vscode/tasks.json
- README.md
- public/favicon.ico
- public/assets/themes/deeppurple-amber.css
- public/assets/themes/purple-green.css
- src/index.html
- src/main.ts
- src/styles.css
- src/app/app.ts
- src/app/app.html
- src/app/app.css
- src/app/app.config.ts
- src/app/app.routes.ts
- src/app/app.spec.ts
- src/app/theme.service.ts
- src/app/theme.service.spec.ts
- e2e/specs/shell.spec.ts
- results/TASK-000-scaffold.md
api:
- ThemeService.activeTheme(): AppTheme
- ThemeService.isDark(): boolean
- ThemeService.toggle(): void
- ThemeService.load(): void
- AppTheme = 'purple-green' | 'deeppurple-amber'
deviations:
- none
notes:
- Staged CLI extras the allowlist missed, by name: .editorconfig, .vscode/, .prettierrc.
- CLI 22.2.3 --zoneless did not emit provideZonelessChangeDetection(); it is in app.config.ts because the shell contract requires it.
- Do not redo the scaffold. TASK-001 owns start:e2e and the harness replacement. Do not add the game smoke spec here.

# TASK-000 Result

**Status:** pass
**Branch:** main
**Commit:** pending

## Summary

- Scaffolded Angular 22.2.3 (zoneless, Vitest, routing) into the existing repo without touching `.git`.
- Added Material, CDK, and animations 22.2.3 plus Playwright 1.64.1 with Chromium.
- Runtime theme is the only theme source: dark `purple-green` by default, light only for the exact `deeppurple-amber` string.
- Blank shell only. No canvas, towers, harness, lint, or Pages base href.

## Files changed

- `src/app/theme.service.ts` — dark default, exact-string light, constructor `load()`
- `src/app/app.ts` / `app.html` — `MatButton`, `RouterOutlet`, theme toggle
- `e2e/specs/shell.spec.ts` — toggle, reload, empty error list
- `playwright.config.ts` — `testDir: './e2e'`, Chromium, `webServer` `npm run start`, 120s
- `public/assets/themes/` — copied prebuilt CSS; `angular.json` styles stays `src/styles.css`

## Tests and evidence

- `npm test` -> pass (2 files, 3 tests)
- `npm run build` -> pass (`dist/tower-angular/browser`)
- `npm run e2e` -> pass (Playwright: 1 passed / 0 failed)
- `npx ng version` -> Angular CLI 22.2.3, Angular 22.2.3, Node 26.7.0

## Acceptance criteria

- [x] Node v26.7.0; did not abort for not being v24
- [x] Angular CLI 22.2.3
- [x] `npm test` passes and does not watch
- [x] `npm run build` writes `dist/tower-angular/browser`
- [x] `npm run e2e` passes the shell spec
- [x] Theme defaults to dark; light survives reload; trailing-space value rewrites to dark
- [x] No `zone.js`, no `@analogjs/*`
- [x] All installed `@angular/*` packages are 22.2.3
- [x] `angular.json` styles is only `src/styles.css`; `styles.css` does not import a prebuilt theme
- [x] Commit and `git push origin main` are the next steps after this file

## Decisions / assumptions

- `test` is `ng test --watch=false`. `test:watch` is `ng test --watch`.
- Also added `e2e` and `e2e:ui`. Did not add `start:e2e`, `lint`, `http-server`, `tsx`, or axe.
- Theme link keeps `data-beasties-skip`. No Google font links. No date adapter.

## Open issues / risks

- none

## Handoff for next task

- Read `src/app/app.config.ts`, `playwright.config.ts`, and `e2e/specs/shell.spec.ts`.
- TASK-001 switches `webServer.command` to `npm run start:e2e` after the e2e serve configuration exists.
- Preserve `provideZonelessChangeDetection()`, `provideBrowserGlobalErrorListeners()`, and `provideAnimationsAsync()`.
- Do not run `ng add @angular/material`.
