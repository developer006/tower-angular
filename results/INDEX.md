# Task Index

Status legend: `pending` | `in-progress` | `blocked` | `verify` | `done`

Last updated: 2026-10-20 (phase-3 tagged)

| ID | Task | Depends on | Status | Result |
|---|---|---|---|---|
| TASK-000 | Scaffold Angular 22 + Material + Playwright config/shell spec; confirm plan/results; commit | — | done | `results/TASK-000-scaffold.md` |
| TASK-001 | E2E build + serve configuration, harness loader replacement, `start:e2e`, `http-server`; keep shell spec green | 000 | done | `results/TASK-001-playwright.md` |
| TASK-002 | Lint/format (`angular-eslint`), npm scripts, CI workflow | 001 | done | `results/TASK-002-ci-lint.md` |
| TASK-010 | Domain types, content schemas, map data, path math + tests | 002 | done | `results/TASK-010-content-path.md` |
| TASK-011 | Fixed-step loop, engine API, commands, seeded RNG + tests | 010 | done | `results/TASK-011-engine-loop.md` |
| TASK-012 | Canvas renderer, static map layer, `/play` game page shell | 010, 011 | done | `results/TASK-012-renderer-shell.md` |
| TASK-013 | E2E harness integration, deterministic smoke tests | 012, 001 | done | `results/TASK-013-e2e-harness.md` |
| VERIFY-1 | Phase 1 verification | 013 | done | `results/VERIFY-PHASE-1.md` |
| TASK-020 | DOM board overlay, focus, build mode, keyboard | VERIFY-1 | done | `results/TASK-020-board-overlay.md` |
| TASK-021 | Placement validation, economy, HUD, error messages | 020 | done | `results/TASK-021-placement-economy.md` |
| TASK-022 | Tower palette, range preview, inspector, upgrade/sell/targeting | 021 | done | `results/TASK-022-palette-inspector.md` |
| TASK-023 | E2E specs: placement, invalid placement, upgrade/sell, keyboard | 022 | done | `results/TASK-023-FIX.md` |
| VERIFY-2 | Phase 2 verification | 023 | done | `results/VERIFY-PHASE-2.md` |
| TASK-030 | Enemy content, spawn queue, path movement, leak detection | VERIFY-2 | done | `results/TASK-030-enemy-movement.md` |
| TASK-031 | Targeting, firing, projectiles, armor/slow + tests | 030 | done | `results/TASK-031-combat.md` |
| TASK-032 | 10-wave data, wave state machine, victory/defeat, results overlay (score + Retry) | 031 | done | `results/TASK-032-waves-endstates.md` |
| TASK-033 | E2E specs: combat, leak, defeat, victory | 032 | done | `results/TASK-033-combat-e2e.md` |
| TASK-034 | Headless balance simulator + reference strategies | 033 | done | `results/TASK-034-balance-sim.md` |
| TASK-035 | Balance pass and content tuning | 034 | done | `results/TASK-035-balance-tune.md` |
| VERIFY-3 | Phase 3 verification | 035 | done | `results/VERIFY-PHASE-3.md` |
| TASK-040 | Router, `/` main menu, results-to-menu flow, restart | VERIFY-3 | in-progress | `results/TASK-040-menu-results.md` |
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
- TASK-002 done: `9399349 chore(TASK-002): add angular-eslint, prettier compat, and CI`, merged as `8fefaab`. Tagged `phase-0`.
- TASK-010 done: `5414bdf feat(TASK-010): add map, content tables, and path math`, merged as `7b5f9e3`. Orchestrator re-ran `npm test` (14 passed), `npm run lint`, `npm run build`. `NO_ANGULAR` in core content and game.
- TASK-011 done: `916d99e feat(TASK-011): add fixed-step engine, commands, and seeded RNG`, merged as `c7d6e20`. Orchestrator re-ran `npm test` (32 passed), `npm run lint`, `npm run build`. `NO_CLOCK`. Loop remainder is corrected by 1 ULP; do not revert that line.
- TASK-012 done: `64511e5 feat(TASK-012): add map canvas and play page shell`, merged as `7d77ee7`. Orchestrator re-ran `npm test` (37 passed), `npm run lint`, `npm run build`, `npm run e2e` (1 passed). `NO_ANGULAR` and `NO_SHADOW` in core render.
- TASK-013 done: `a3b6ced feat(TASK-013): install the e2e harness and smoke spec`, merged as `2c3c833`. Orchestrator re-ran `npm test` (43 passed), lint, production build `PROD_ABSENT`, e2e build `E2E_HAS_TD`, `npm run e2e` (2 passed). `APP_CLEAN`.
- VERIFY-1 done: `e589c70 docs(VERIFY-1): record phase 1 verification`, merged as `82f4f5d`. Tagged `phase-1`. Independent re-run matched the orchestrator: 43 tests, `PROD_ABSENT`, `E2E_HAS_TD`, Playwright 2 passed.
- TASK-020 done: `784ac07 feat(TASK-020): add pad overlay and build-mode keyboard`, merged as `a68c2c5`. Orchestrator re-ran `npm test` (44 passed), lint, build, and `npm run e2e` (2 passed). Click does not place yet.
- TASK-021 done: `b56cbc8 feat(TASK-021): place towers and show rejection reasons`, merged as `f2f8a77`. Orchestrator re-ran `npm test` (47 passed), lint, build, and `npm run e2e` (2 passed). Pulse place spends 70.
- TASK-022 done: `bfaf8cb feat(TASK-022): add palette, range preview, and inspector`, merged as `835d7a2`. Orchestrator re-ran `npm test` (54 passed), lint, build, and `npm run e2e` (2 passed). Refund oracles 49 and 84 are in the spec. `NO_SHADOW`.
- TASK-023 blocked before commit. Queued `placeTower` clears `placement-error` before `step()` rejects it. Fix is `plan/tasks/TASK-023-FIX.md`. Do not weaken the oracle to an empty string.
- TASK-023-FIX done: `003bb1b fix(TASK-023): show apply-time placement rejections`, merged as `d87761e`. Orchestrator re-ran `npm test` (55 passed), lint, and `npm run e2e` (5 passed: shell, smoke, build, upgrade-sell, L1 sell). Gold oracles 114 and 129 held.
- VERIFY-2 done: `047abdd docs(VERIFY-2): record phase 2 verification`, merged as `3ee9a2e`. Tagged `phase-2`.
- TASK-030 done: `17385b4 feat(TASK-030): spawn waves, move enemies, and apply leaks`, merged as `95d25f4`. Orchestrator re-ran `npm test` (62 passed), lint, and `npm run e2e` (5 passed). Second drone at elapsed tick 48. Leak pays no bounty.
- TASK-031 done: `548bd76 feat(TASK-031): add targeting, projectiles, armor, and slow`, merged as `ce01ce7`. Orchestrator re-ran `npm test` (74 passed), lint, and `npm run e2e` (5 passed). Pulse versus Tank deals 8. Kill bounty does not change score.
- TASK-032 done: `2e3abaf feat(TASK-032): add wave clears, score, and the results overlay`, merged as `62f65ba`. Orchestrator re-ran `npm test` (85 passed), lint, and `npm run e2e` (5 passed). HUD score stays 0. Retry is present. Main Menu is not asserted absent.
- TASK-033 done: `83edc4e test(TASK-033): cover combat, defeat, and victory`, merged as `0bdf9d4`. Orchestrator re-ran `npm run e2e` (8 passed), `npm test` (85 passed), and lint. Victory score oracle is 500.
- TASK-034 done: `23b3720 feat(TASK-034): add the headless balance simulator`, merged as `ab44a48`. Orchestrator re-ran `npm run sim`; stdout matched the result file. Pulse and mortar still win. Cryo dies at wave 2. TASK-035 tunes content.
- TASK-035 done: `c729279 feat(TASK-035): tune content so the reference strategies meet the invariants`, merged as `3de435b`. Orchestrator re-ran `npm run sim`; stdout matched. Single-type strategies defeat at bestWave 6. Mixed seed 1 wins with integrity 11. `npm run e2e` 8 passed.
- VERIFY-3 blocked before merge. Sim, tests, lint, and e2e passed. `src/app/core/systems/wave.spec.ts` imports `@angular/core/testing`. Fix is `plan/tasks/TASK-032-FIX.md`.
- TASK-032-FIX done: `d0518d9 fix(TASK-032): move Angular wave tests out of core/systems`. Orchestrator re-ran `npm test` (87 passed), lint, and grep. `NO_ANGULAR` under `src/app/core/game` and `src/app/core/systems`.
- VERIFY-3 done: `a33be39 docs(VERIFY-3): record phase 3 verification`, merged as `db081ac`. Tagged `phase-3`. Sim rows matched the earlier orchestrator run.
