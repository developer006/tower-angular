# Decisions

Orchestrator-owned. Add an entry whenever a cross-cutting decision is made.

## 2026-10-19 — Project bootstrap

- **Project root:** `C:\wrk\tower-angular`.
- **Remote:** `origin` = `https://github.com/developer006/tower-angular.git`; branch `main`.
- **Package manager:** npm (Node 24.20.0, npm 11.19.0).
- **Results committed:** yes; `results/evidence/` is gitignored.
- **Game:** classic fixed-path tower defense, neon vector sci-fi theme, one map, 10 waves, 3 tower types, 4 enemy types + boss.
- **Scaffold baseline:** Angular 22.2.3, standalone, zoneless, native Vitest, Angular Material 22 + CDK + animations, Playwright 1.x with Chromium.
- **Routing enabled:** `/` menu and `/play` game; deviates from the blank-shell `--routing=false` baseline.
- **Scaffold strategy:** scaffold in `C:\wrk\tower-angular-scaffold` (sibling) and move files into the existing non-empty repo; preserve `.git` and update README.
- **Theming:** prebuilt Material themes copied to `public/assets/themes/`; `ThemeService` toggles `deeppurple-amber` / `purple-green`; default dark. Canvas uses its own neon palette.
- **Deployment:** GitHub Pages under `/tower-angular/`, `npm run build:pages`, `404.html` fallback for deep links.
- **Audio:** synthesized WebAudio SFX only; no external audio assets.
- **Testing philosophy:** harness for setup/fast-forward/state assertions; real UI interaction for every user-facing behavior; only three visual snapshots.

## Pending decisions

- None blocking. Add entries here if scope or tooling changes.
