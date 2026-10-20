status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e && npm run e2e && npm run e2e
verify_exit: 0
files:
- e2e/specs/pause-speed.spec.ts
- results/TASK-053-FIX.md
deviations:
- none
notes:
- e2e run 1: 18 passed. e2e run 2: 18 passed. e2e run 3: 18 passed.
- openClockPlay now installs the fake clock at a fixed CLOCK_START (2026-01-01T00:00:00Z) and pauseAt uses that same value, so pauseAt can no longer target an instant already behind the fake clock.
- The readiness wait is a bounded loop of 400 x runFor(16ms) instead of a Date.now() deadline; the spec no longer reads wall time anywhere.
- npm test: 19 files / 105 tests passed. npm run lint: all files pass.

# TASK-053-FIX Result

**Status:** pass
**Branch:** task/TASK-053-FIX
**Commit:** pending

## Summary

- Root cause: `page.clock.install()` seeded the fake clock with its own current time, then `page.clock.pauseAt(Date.now())` was passed a wall-clock instant read *after* install. When the fake clock had already advanced past that read, Playwright rejected with `Cannot fast-forward to the past`.
- Fix: one fixed instant, `const CLOCK_START = new Date('2026-01-01T00:00:00Z')`, used for both `page.clock.install({ time: CLOCK_START })` and `page.clock.pauseAt(CLOCK_START)`.
- The readiness wait no longer uses a `Date.now() + 20_000` deadline. It is capped at `READY_SLICES = 400` attempts, each `page.clock.runFor(SLICE_MS)`, so the spec depends only on fake time. The real-time `setTimeout` yield inside the loop is gone too.

## Files changed

- `e2e/specs/pause-speed.spec.ts` — fixed clock instant plus bounded readiness loop.
- `results/TASK-053-FIX.md` — this handoff.

## Tests and evidence

- `npm run e2e` (run 1) -> exit 0; 18 passed (32.4s)
- `npm run e2e` (run 2) -> exit 0; 18 passed (8.3s)
- `npm run e2e` (run 3) -> exit 0; 18 passed (9.0s)
- `npm test` -> exit 0; 19 files, 105 tests passed
- `npm run lint` -> exit 0; All files pass linting

## Acceptance criteria

- [x] One fixed `CLOCK_START` used for `install({ time })` and `pauseAt`
- [x] `Date.now()` deadline replaced by a bounded iteration count
- [x] Three consecutive `npm run e2e` runs each print `18 passed`
- [x] Assertions untouched: 1.7x / 2.3x bounds, `tick >= 10` precondition, accumulator checks
- [x] No product source, no `loop.ts`, no new dependencies

## Decisions / assumptions

- `READY_SLICES = 400` (6.4s of fake time) is well above the ~10 ticks the app needs to report ready; the loop exits as soon as `window.__TD__.ready` is true.

## Open issues / risks

- none

## Handoff for next task

- Re-run `npm test && npm run lint && npm run e2e` on `task/TASK-053-FIX` before merging into TASK-053.
