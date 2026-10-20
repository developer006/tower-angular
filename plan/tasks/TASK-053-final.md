# TASK-053: Final verification

**Subagent:** general, read-only except the report file
**Result file:** `results/VERIFY-FINAL.md`
**Git:** stay on `task/TASK-053`. Do not modify source. Do not merge. Do not push. Do not tag.

## Goal

Independently verify v1. Write one report. Do not fix failures. Do not re-author simulator rows. Do not create a tag.

## Read first

- `plan/implementation-plan.md` §6 Phase 5 and §9
- `results/TASK-052-github-pages.md`

If that result does not start with `status: pass`, write `status: blocked` and stop.

## Checks

Run these yourself, in the foreground. Do not trust an earlier summary.

```bash
npm run lint
npm test
npm run e2e
npm run sim
npm run build
npm run build:pages
npx tsx scripts/perf-check.ts
```

`npm run e2e` must print `18 passed`.

`npm run sim` stdout must show:

- `none` defeat, `bestWave=2`
- `pulse`, `mortar`, and `cryo` defeat, `bestWave=6` or `bestWave=7`
- `mixed` victory with integrity 8 through 15

Copy the sim rows from the command. A row you did not see printed is a failure.

After `npm run build`, grep `dist/` for `__TD__` and `harness-loader.e2e`. Both must be absent. Record `PROD_ABSENT` only if the grep found neither. Do not grep a stale `dist/` from before this build. `npm run build:pages` overwrites `dist/`, so grep the production build before the pages build, then grep the pages output again. Both must be absent.

After `npm run build:pages`:

- `dist/tower-angular/browser/index.html` contains `<base href="/tower-angular/">`
- `404.html` in that directory is identical to `index.html`

`npx tsx scripts/perf-check.ts` must print an average under 4 ms. Copy that line. If it is not under 4, status is `blocked`.

Also confirm by reading:

- `angular.json` `fileReplacements` replaces `harness-loader.ts` with `harness-loader.e2e.ts` only in the `e2e` configuration. The default file is the no-op. If that direction is reversed, status is `blocked`.
- No `@angular` import under `src/app/core/game/` or `src/app/core/systems/`.
- `e2e/specs/visual.spec.ts-snapshots/` contains the three Linux PNGs: `build-phase-canvas-1-chromium-linux.png`, `mid-combat-canvas-1-chromium-linux.png`, and `victory-overlay-1-chromium-linux.png`. Do not regenerate them.
- README documents setup, the commands that exist, the core/features split, and the test strategy.
- `.github/workflows/deploy-pages.yml` uses `actions/upload-pages-artifact` and `actions/deploy-pages`.

`status: pass` only if every command exited 0 and every read check holds. Otherwise `status: blocked` with the failing command and output.

Do not edit `plan/`, `results/INDEX.md`, or source. Do not spawn subagents. Do not run `--update-snapshots`.

Write `results/VERIFY-FINAL.md` and commit only that file:

```bash
git add results/VERIFY-FINAL.md
git commit -m "docs(TASK-053): record final verification"
```

First lines:

```text
status: pass
commit: pending
verify: npm run lint && npm test && npm run e2e && npm run sim && npm run build && npm run build:pages && npx tsx scripts/perf-check.ts
verify_exit: 0
```

Use `blocked` instead of `pass` if a check failed. Do not write a hash. Do not amend. Do not tag `v1.0.0`.

Final chat reply <= 8 lines.
