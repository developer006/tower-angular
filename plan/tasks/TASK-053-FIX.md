# TASK-053-FIX: Make the pause/speed clock deterministic

**Phase / dependencies:** Phase 5 fix. Blocks TASK-053.
**Subagent:** general
**Git branch:** `task/TASK-053-FIX` (already created from `main`; stay on it)
**Result file:** `results/TASK-053-FIX.md`

## Why

Final verification blocked: `npm run e2e` printed 17 passed, 1 failed.

```text
e2e/specs/pause-speed.spec.ts:46 › 2x advances about twice as far
Error: Cannot fast-forward to the past
```

`openClockPlay` calls `page.clock.install()` and then `page.clock.pauseAt(Date.now())`. `install()` starts the fake clock at its own time, and the `Date.now()` read afterwards can already be earlier than that fake time, so `pauseAt` rejects. The spec is racy; the game is not.

## Read first — only these

- `results/VERIFY-FINAL.md` (blocked report)
- `e2e/specs/pause-speed.spec.ts`

Do not edit any product source. Do not edit `loop.ts`. Do not weaken the 1.7x/2.3x bounds, the `tick >= 10` precondition, or the accumulator checks. Do not add `disableRules`. Do not reverse `fileReplacements`.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-053-FIX`. Do not switch, merge, or push.

## Required change

In `openClockPlay`:

- Define one fixed instant, `const CLOCK_START = new Date('2026-01-01T00:00:00Z');`
- Call `page.clock.install({ time: CLOCK_START })`
- Call `page.clock.pauseAt(CLOCK_START)` immediately after, using that same value
- Replace the `Date.now() + 20_000` readiness deadline with a bounded iteration count (for example 400 attempts, each `runFor(SLICE_MS)`). Do not depend on wall time anywhere in this spec.

Do not change what the two tests assert.

## Prove it

```bash
npm run e2e
npm run e2e
npm run e2e
```

All three must print `18 passed`. A single green run is not proof that the race is gone.

Also run:

```bash
npm test
npm run lint
```

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, or another task result.
- Do not add dependencies. Do not spawn subagents. Do not `git add -A`.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e && npm run e2e && npm run e2e
verify_exit: 0
```

`notes:` must include all three e2e counts and say the spec no longer reads wall time.

```bash
git add \
  e2e/specs/pause-speed.spec.ts \
  results/TASK-053-FIX.md
git status --short
git commit -m "test(TASK-053-FIX): pin the pause-speed clock to a fixed instant"
```

Final chat reply <= 8 lines.
