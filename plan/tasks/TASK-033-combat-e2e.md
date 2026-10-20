# TASK-033: Combat, leak, defeat, and victory specs

**Phase / dependencies:** Phase 3. Depends on TASK-032 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-033-combat-e2e` (already created from `main`; stay on it)
**Result file:** `results/TASK-033-combat-e2e.md`

## Goal

Add three Playwright specs that prove combat, a leak defeat, and a wave-10 victory. Assert Retry is present. Do not assert that Main Menu is absent.

## Read first — only these

- `results/TASK-032-waves-endstates.md`
- `results/TASK-013-e2e-harness.md`
- `e2e/specs/smoke.spec.ts`

If the TASK-032 result does not start with `status: pass`, stop.

Do not edit `loop.ts`. Do not reverse `fileReplacements`. Do not add Main Menu. Do not add a test that Main Menu is absent.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-033-combat-e2e`. Do not switch, merge, or push.

## Specs

Create only:

- `e2e/specs/combat.spec.ts`
- `e2e/specs/leak-defeat.spec.ts`
- `e2e/specs/victory.spec.ts`

Wait for `window.__TD__?.ready === true`. Call `setManualMode(true)` before driving time. After a UI click that queues a command, call `stepTicks(1)` before reading gold or phase. Fast-forward with `stepTicks` in the page. Do not start a background node process.

`reset({ seed, integrity, wave, gold })` may set up a scenario. The deploy click, the tower click, and the Retry click must be real UI events.

### combat.spec.ts

- Place Pulse on `pad-01` through the palette and the pad button. After `stepTicks(1)`, gold is `80`.
- Click `deploy-wave`, then `stepTicks(1)`. An enemy exists.
- Further ticks increase that enemy's `distanceAlongPath`.
- Keep stepping until gold is `86` (the 6 bounty). Score in `getFullState()` stays 0.
- Keep stepping until wave 1 clears: `phase` is `build` and `wave` is 2. Cap the loop at 6000 ticks. If it does not clear, stop and report the state. Do not raise the cap by weakening the assertion.

### leak-defeat.spec.ts

- `reset({ seed: 1, integrity: 1, wave: 1, gold: 0 })`.
- Click `deploy-wave` and step until `phase` is `defeat`. Cap at 6000 ticks.
- `results-overlay` is visible. `retry` is visible. Integrity is 0.
- HUD `hud-score` is `0`.
- Click Retry. Gold is `150`, integrity is `20`, wave is `1`, and the overlay is hidden.

### victory.spec.ts

- `reset({ seed: 1, integrity: 50, wave: 10, gold: 0 })`. Do not place a tower.
- Click `deploy-wave`.
- Step until an enemy with type `overlord` exists. Cap at 4000 ticks.
- Step until `phase` is `victory`. Cap at 12000 ticks.
- Wave 10 leak damage with no towers is 34, so integrity ends at 16. `wavesCleared` is 1. Kills are 0. Score is `500`.
- The overlay is visible and shows that score. `retry` is visible. `hud-score` is `0`.
- Do not look for a Main Menu button.

## Commands

```bash
npm run e2e
npm test
npm run lint
```

The previous 5 tests must still pass. Do not add a twelfth spec. These three files are the only additions.

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, or game source unless a control cannot be reached. If you must touch source, name the file and why.
- Do not add dependencies. Do not spawn subagents. Do not `git add -A`.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm run e2e && npm test && npm run lint
verify_exit: 0
```

`notes:` must say Retry is asserted present, Main Menu is not asserted absent, and the victory score oracle is 500.

```bash
git add \
  e2e/specs/combat.spec.ts \
  e2e/specs/leak-defeat.spec.ts \
  e2e/specs/victory.spec.ts \
  results/TASK-033-combat-e2e.md
git status --short
git commit -m "test(TASK-033): cover combat, defeat, and victory"
```

Add one e2e helper by name if you create one. Stop if an unexpected path is untracked.

Final chat reply <= 8 lines.
