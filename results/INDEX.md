# Task Index

Status legend: `pending` | `in-progress` | `blocked` | `verify` | `done`

Last updated: 2026-10-19 (TASK-001 merged)

| ID | Task | Depends on | Status | Result |
|---|---|---|---|---|
| TASK-000 | Scaffold Angular 22 + Material + Playwright config/shell spec; confirm plan/results; commit | — | done | `results/TASK-000-scaffold.md` |
| TASK-001 | E2E build + serve configuration, harness loader replacement, `start:e2e`, `http-server`; keep shell spec green | 000 | done | `results/TASK-001-playwright.md` |
| TASK-002 | Lint/format (`angular-eslint`), npm scripts, CI workflow | 001 | in-progress | `results/TASK-002-ci-lint.md` |
| TASK-010 | Domain types, content schemas, map data, path math + tests | 002 | pending | `results/TASK-010-content-path.md` |
| TASK-011 | Fixed-step loop, engine API, commands, seeded RNG + tests | 010 | pending | `results/TASK-011-engine-loop.md` |
| TASK-012 | Canvas renderer, static map layer, `/play` game page shell | 010, 011 | pending | `results/TASK-012-renderer-shell.md` |
| TASK-013 | E2E harness integration, deterministic smoke tests | 012, 001 | pending | `results/TASK-013-e2e-harness.md` |
| VERIFY-1 | Phase 1 verification | 013 | pending | `results/VERIFY-PHASE-1.md` |
| TASK-020 | DOM board overlay, focus, build mode, keyboard | VERIFY-1 | pending | `results/TASK-020-board-overlay.md` |
| TASK-021 | Placement validation, economy, HUD, error messages | 020 | pending | `results/TASK-021-placement-economy.md` |
| TASK-022 | Tower palette, range preview, inspector, upgrade/sell/targeting | 021 | pending | `results/TASK-022-palette-inspector.md` |
| TASK-023 | E2E specs: placement, invalid placement, upgrade/sell, keyboard | 022 | pending | `results/TASK-023-build-e2e.md` |
| VERIFY-2 | Phase 2 verification | 023 | pending | `results/VERIFY-PHASE-2.md` |
| TASK-030 | Enemy content, spawn queue, path movement, leak detection | VERIFY-2 | pending | `results/TASK-030-enemy-movement.md` |
| TASK-031 | Targeting, firing, projectiles, armor/slow + tests | 030 | pending | `results/TASK-031-combat.md` |
| TASK-032 | 10-wave data, wave state machine, victory/defeat, results overlay (score + Retry) | 031 | pending | `results/TASK-032-waves-endstates.md` |
| TASK-033 | E2E specs: combat, leak, defeat, victory | 032 | pending | `results/TASK-033-combat-e2e.md` |
| TASK-034 | Headless balance simulator + reference strategies | 033 | pending | `results/TASK-034-balance-sim.md` |
| TASK-035 | Balance pass and content tuning | 034 | pending | `results/TASK-035-balance-tune.md` |
| VERIFY-3 | Phase 3 verification | 035 | pending | `results/VERIFY-PHASE-3.md` |
| TASK-040 | Router, `/` main menu, results-to-menu flow, restart | VERIFY-3 | pending | `results/TASK-040-menu-results.md` |
| TASK-041 | Pause/speed, visibility handling, persistence, settings, corrupted storage fallback, best score in results | 040 | pending | `results/TASK-041-pause-persistence.md` |
| TASK-042 | Synth SFX, visual effects, reduced motion, colorblind palette | 041 | pending | `results/TASK-042-audio-polish.md` |
| TASK-043 | Accessibility pass: aria-live, focus, keyboard, axe scan (`@axe-core/playwright`) | 042 | pending | `results/TASK-043-accessibility.md` |
| TASK-044 | E2E specs: pause/speed, persistence, accessibility | 043 | pending | `results/TASK-044-polish-e2e.md` |
| VERIFY-4 | Phase 4 verification | 044 | pending | `results/VERIFY-PHASE-4.md` |
| TASK-050 | Visual regression spec and CI baselines | VERIFY-4 | pending | `results/TASK-050-visual-regression.md` |
| TASK-051 | Docs, README, performance/flake/bundle checks, release checklist | 050 | pending | `results/TASK-051-docs-release.md` |
| TASK-052 | GitHub Pages deploy: base-href, 404 fallback, deploy workflow | 051 | pending | `results/TASK-052-github-pages.md` |
| TASK-053 | Final independent verification and v1 acceptance report | 052 | pending | `results/VERIFY-FINAL.md` |

## Rules

- One subagent per task; never reuse a session.
- The orchestrator updates this file after verification and merge.
- A fix is a new task ID (`TASK-###-FIX`) with its own result file.
- Movement order: update `Status`, keep the `Result` link stable.
- TASK-002 depends on TASK-001 because both edit `package.json`; never run them in parallel.
- Phase N+1 tasks depend on `VERIFY-N`; dispatch only after the verifier reports pass.
- New tooling ownership: `http-server` (TASK-001), `angular-eslint` + Prettier (TASK-002), `tsx` (TASK-034), `@axe-core/playwright` (TASK-043).

## Log

- TASK-000 done: `7185020 feat(TASK-000): scaffold Angular 22 workspace, Material, and Playwright`. Orchestrator re-ran `npm test` (3 passed), `npm run build` (`dist/tower-angular/browser`), `npm run e2e` (1 passed). `HEAD` matched `origin/main`.
- TASK-001 done: `ae211f0 feat(TASK-001): add e2e harness loader replacement and start:e2e`, merged as `9181a6f`. Orchestrator re-ran `npm test` (3 passed), production build `PROD_ABSENT`, e2e build `E2E_HAS_TD`, `npm run e2e` (1 passed).
