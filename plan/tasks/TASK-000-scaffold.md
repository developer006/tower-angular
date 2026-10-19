# TASK-000: Scaffold Angular workspace, Material, and Playwright

**Phase:** 0 — Setup
**Subagent:** general
**Depends on:** none (git repo, remote, and npm already exist)
**Git target:** `main` (bootstrap exception — no feature branch needed)
**Result file:** `results/TASK-000-scaffold.md`

## Goal

Turn `C:/wrk/tower-angular` into a blank, verified Angular 22.2.3 workspace with Material 22.2.3, Playwright, and a dark-by-default runtime theme. No game features. Commit and push.

## Read first

- `plan/implementation-plan.md` §0.10, §2.4, §4.4
- `results/DECISIONS.md`

Do not read the whole repository. Do not load `angular-scaffold`. It is not installed. This brief is the contract.

The Hermes terminal is git-bash, not PowerShell. Native tools (`node`, `npm`, `npx`, `git`) get `C:/` paths.

## Deliverables

- [ ] Angular 22.2.3 workspace (`package.json`, `angular.json`, `src/`, `public/`)
- [ ] Material, CDK, and animations at 22.2.3
- [ ] `public/assets/themes/deeppurple-amber.css` and `purple-green.css`
- [ ] `@playwright/test` and Chromium
- [ ] Theme link, `ThemeService`, specs, Playwright shell spec, rewritten `app.spec.ts`
- [ ] `test` script is `ng test --watch=false`
- [ ] `.gitattributes` (`* text=auto`) and the extra `.gitignore` lines
- [ ] README rewritten as valid Markdown (the current file is `"# tower-angular"` with stray quotes)
- [ ] `results/TASK-000-scaffold.md` with `status: pass` and `commit: pending`
- [ ] Commit on `main`, pushed

## Acceptance criteria

- [ ] `node --version` is v26.x (this host is v26.7.0). Do not abort because it is not v24.
- [ ] `npx ng version` reports Angular CLI 22.2.3
- [ ] `npm test` passes and does not watch
- [ ] `npm run build` writes `dist/tower-angular/browser`
- [ ] `npm run e2e` passes the shell spec
- [ ] Theme defaults to dark; light survives reload; a trailing-space theme value is rewritten to dark
- [ ] `package.json` has no `zone.js` and no `@analogjs/*`
- [ ] All `@angular/*` packages are 22.2.3
- [ ] `angular.json` styles is only `src/styles.css`. `styles.css` does not import a prebuilt theme
- [ ] After the commit, `git status --short` is empty and `git push origin main` succeeded

## Commands

```bash
node --version
npm --version

cd /c/wrk
rm -rf tower-angular-scaffold
npx --yes @angular/cli@22.2.3 new tower-angular \
  --directory tower-angular-scaffold \
  --style=css \
  --routing=true \
  --ssr=false \
  --skip-git \
  --skip-install \
  --package-manager=npm \
  --test-runner=vitest \
  --zoneless \
  --ai-config=none \
  --defaults \
  --interactive=false

find /c/wrk/tower-angular-scaffold -mindepth 1 -maxdepth 1 \
  ! -name README.md ! -name node_modules \
  -exec cp -a {} /c/wrk/tower-angular/ \;
rm -rf /c/wrk/tower-angular-scaffold

cd /c/wrk/tower-angular
npm install
# If npm fails with EALLOWSCRIPTS: npm install --ignore-scripts
npm install @angular/material@22.2.3 @angular/cdk@22.2.3 @angular/animations@22.2.3
npm install -D @playwright/test@1
npx playwright install chromium

node -e "const fs=require('node:fs');fs.mkdirSync('public/assets/themes',{recursive:true});for(const t of ['deeppurple-amber','purple-green'])fs.copyFileSync('node_modules/@angular/material/prebuilt-themes/'+t+'.css','public/assets/themes/'+t+'.css')"
printf '* text=auto\n' > .gitattributes
```

cwd for `ng new` is `C:/wrk`. `--directory` is the relative name `tower-angular-scaffold`. Do not pass an absolute `--directory`, and do not pre-create the directory and pass `--directory .`. Do not pass `--file-name-style-guide=2016`. If the CLI still prompts, stop and quote the prompt in the result file.

Set the `test` script to `ng test --watch=false`. A bare `ng test` watches in this TTY and hangs. Keep `test:watch` as `ng test --watch`.

Append to `.gitignore` if missing: `test-results/`, `playwright-report/`, `blob-report/`, `results/evidence/`.

Do not run `ng add @angular/material`. That injects a second theme. Copy the shell files below exactly. `load()` runs from the constructor. The corrupt-theme spec starts the link on the light file so a no-op-on-unknown service fails. Templates call `theme.activeTheme()`. `imports` includes `MatButton` and `RouterOutlet`. Keep `provideZonelessChangeDetection()`. Add `provideBrowserGlobalErrorListeners()` and `provideAnimationsAsync` from `@angular/platform-browser/animations/async`. No date adapter, no `zone.js`, no `provideExperimentalZonelessChangeDetection`. No Google font links.

`src/index.html` keeps `<base href="/">` and uses:

```html
<html lang="en" class="dark-mode">
  <head>
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
    <link id="theme-link" rel="stylesheet" href="assets/themes/purple-green.css" data-beasties-skip />
    <title>Core Defense</title>
  </head>
```

`src/app/theme.service.ts`:

```ts
import { Injectable, signal } from '@angular/core';

export type AppTheme = 'purple-green' | 'deeppurple-amber';

const LIGHT: AppTheme = 'deeppurple-amber';
const DARK: AppTheme = 'purple-green';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly theme = signal<AppTheme>(DARK);

  constructor() {
    this.load();
  }

  activeTheme(): AppTheme {
    return this.theme();
  }

  isDark(): boolean {
    return this.theme() === DARK;
  }

  toggle(): void {
    this.apply(this.theme() === DARK ? LIGHT : DARK);
  }

  load(): void {
    const saved = globalThis.localStorage?.getItem('theme');
    this.apply(saved === LIGHT ? LIGHT : DARK);
  }

  private apply(next: AppTheme): void {
    this.theme.set(next);
    const link = document.getElementById('theme-link') as HTMLLinkElement | null;
    if (link) {
      link.href = `assets/themes/${next}.css`;
    }
    document.documentElement.classList.toggle('dark-mode', next === DARK);
    globalThis.localStorage?.setItem('theme', next);
  }
}
```

`src/app/theme.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.getElementById('theme-link')?.remove();
    const link = document.createElement('link');
    link.id = 'theme-link';
    link.href = 'assets/themes/deeppurple-amber.css';
    document.head.append(link);
  });

  it('rewrites a corrupt value to dark even when the link starts light', () => {
    localStorage.setItem('theme', 'deeppurple-amber ');
    const service = TestBed.inject(ThemeService);
    const link = document.getElementById('theme-link') as HTMLLinkElement;
    expect(service.activeTheme()).toBe('purple-green');
    expect(link.getAttribute('href')).toBe('assets/themes/purple-green.css');
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('purple-green');
  });

  it('selects light only for the exact stored string', () => {
    localStorage.setItem('theme', 'deeppurple-amber');
    const service = TestBed.inject(ThemeService);
    expect(service.activeTheme()).toBe('deeppurple-amber');
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
  });
});
```

`src/app/app.ts` imports `RouterOutlet` and `MatButton`. `src/app/app.html`:

```html
<h1>Core Defense</h1>
<button matButton type="button" data-testid="theme-toggle" aria-label="Toggle color theme" (click)="theme.toggle()">
  Theme: {{ theme.activeTheme() }}
</button>
<router-outlet />
```

`theme` is `inject(ThemeService)`. Rewrite `app.spec.ts` to import `App`, destroy the fixture, and expect `Core Defense`. The shell spec clicks `getByRole('button', { name: 'Toggle color theme' })`, asserts `#theme-link` moves from `purple-green.css` to `deeppurple-amber.css`, asserts `html` loses `dark-mode`, reloads, and asserts `errors` is `[]`. `playwright.config.ts` uses `testDir: './e2e'`, `baseURL: 'http://localhost:4200'`, Chromium, and `webServer.command: 'npm run start'` with a 120s timeout. Do not add the game smoke spec.

Replace `README.md` with valid Markdown. No wrapping quotes. Name Core Defense and list `npm install`, `npm start`, `npm test`, `npm run build`, `npm run e2e`.

```bash
npm test
npm run build
npm run e2e
git add \
  .gitattributes .gitignore angular.json package.json package-lock.json \
  tsconfig.json tsconfig.app.json tsconfig.spec.json playwright.config.ts \
  README.md public src e2e plan results
git status --short
```

Stop if a path outside that list is untracked, or if `node_modules`, `dist`, `.angular`, `test-results`, `playwright-report`, `blob-report`, or `results/evidence` is staged. Add an expected CLI extra (`.editorconfig`, `.vscode/`) by name. Do not run `git add -A`.

```bash
git commit -m "feat(TASK-000): scaffold Angular 22 workspace, Material, and Playwright"
git push origin main
```

Write the result file before the commit. First lines: `status: pass`, `commit: pending`, `verify: npm test && npm run build && npm run e2e`, `verify_exit: 0`. Do not write a hash. Do not amend.

## Constraints

- Do not delete or reinitialize `.git`; do not force-push.
- Do not overwrite the existing commit history.
- Blank shell only. No canvas, no towers, no harness.
- Do not add `http-server`, `tsx`, `@axe-core/playwright`, or lint tooling. TASK-001, TASK-002, and TASK-043 own those.
- Shell spec is `e2e/specs/shell.spec.ts`. `webServer` uses `npm run start`. TASK-001 switches it to `npm run start:e2e`.
- Do not edit `plan/` except by committing the files already there. Do not edit `results/INDEX.md`.
- Do not spawn subagents.
- If the CLI prompts despite `--interactive=false`, stop and quote the prompt.

## Handoff

Write `results/TASK-000-scaffold.md` before the commit, using `status: pass` and `commit: pending`. Final chat reply <= 8 lines: status, tests run, files changed, blockers.
