# Decisions

Orchestrator-owned. Add an entry whenever a cross-cutting decision is made.

## 2026-10-19 — Project bootstrap

- **Project root:** `C:\wrk\tower-angular`.
- **Remote:** `origin` = `https://github.com/developer006/tower-angular.git`; branch `main`.
- **Package manager:** npm. Host Node is **v26.7.0**, npm 11.19.0. Angular 22 engines are `^22.22.3 || ^24.15.0 || ^26.0.0`. CI uses Node 26. A preflight that expects v24.x is wrong.
- **Shell:** Hermes terminal is git-bash. Briefs are bash. Native tools get `C:/` paths.
- **Results committed:** yes; `results/evidence/` is gitignored. Playwright `test-results/`, `playwright-report/`, and `blob-report/` are also ignored.
- **Game:** classic fixed-path tower defense, neon vector sci-fi theme, one map, 10 waves, 3 tower types, 4 enemy types + boss.
- **Scaffold baseline:** Angular CLI / core / Material / CDK / animations 22.2.3, standalone, zoneless, native Vitest, angular-eslint 22 + Prettier, Playwright 1.x with Chromium.
- **`angular-scaffold` skill:** not installed. Do not load it and do not install it. The contract is `plan/tasks/TASK-000-scaffold.md`.
- **Routing enabled:** `/` menu and `/play` game; deviates from the blank-shell `--routing=false` baseline.
- **Scaffold strategy:** from `C:/wrk`, `ng new tower-angular --directory tower-angular-scaffold` (relative). Do not pass an absolute `--directory` and do not pre-create the directory and pass `--directory .`. Copy with `cp -a`, not a `*` glob. Then `npm install` at the repo root. Preserve `.git`.
- **Theming:** prebuilt Material themes copied to `public/assets/themes/`; `ThemeService` toggles `deeppurple-amber` / `purple-green` under the `theme` key; default dark, and missing/corrupt values fall back to dark. The theme link keeps `data-beasties-skip`. Game settings persist under `core-defense:v1`. Canvas uses its own neon palette.
- **Victory/score:** wave 10 clears when every spawned enemy is killed or leaked; victory requires integrity above 0. Score uses `wavesCleared` and `remainingIntegrity`.
- **Upgrade economy:** base costs, L2/L3 costs, stat multipliers, splash growth, and slow growth are content data starting in `plan/implementation-plan.md` §1.3 and tuned by TASK-035.
- **Harness safety:** `harness-loader.ts` is the no-op. The `e2e` build and serve configurations replace that file with `harness-loader.e2e.ts`. Production does not apply that replacement. Do not reverse it.
- **Deployment:** GitHub Pages under `/tower-angular/`, `npm run build:pages` (build + `scripts/copy-404.mjs`), `404.html` fallback for deep links.
- **Tooling:** `@axe-core/playwright` is owned by TASK-043 for the accessibility scan.
- **Plan docs:** review fix 3 and the TASK-000 scaffold are on `origin/main` (`7185020`). Do not amend a task commit to write its hash into the result file. The orchestrator records the hash in `results/INDEX.md`.
- **Plan review corrections:** TASK-002 depends on TASK-001; deployment is TASK-052 and final verification is TASK-053; TASK-032 owns Retry and TASK-040 owns Main Menu; `/play` lands in TASK-012. Review fix 3: bash briefs, Node 26, relative `ng new --directory`, harness replacement direction, Overlord spawns last, `status: pass` / `commit: pending`.
- **Audio:** synthesized WebAudio SFX only; no external audio assets.
- **Testing philosophy:** harness for setup/fast-forward/state assertions; real UI interaction for every user-facing behavior; only three visual snapshots.

## Pending decisions

- None blocking. Add entries here if scope or tooling changes.
