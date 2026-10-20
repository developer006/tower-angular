# TASK-035: Balance pass

**Phase / dependencies:** Phase 3. Depends on TASK-034 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-035-balance-tune` (already created from `main`; stay on it)
**Result file:** `results/TASK-035-balance-tune.md`

## Goal

Tune `src/app/core/content/` until the existing simulator meets the invariants. Do not edit engine code. Do not type the outcome rows by hand.

## Read first — only these

- `results/TASK-034-balance-sim.md`
- `src/app/core/sim/strategies.ts`
- `src/app/core/content/towers.ts`
- `src/app/core/content/enemies.ts`
- `src/app/core/content/waves.ts`
- `e2e/specs/combat.spec.ts`
- `e2e/specs/victory.spec.ts`

If the TASK-034 result does not start with `status: pass`, stop.

The measured baseline, from `npm run sim` on this branch before your edits:

```text
none seed=1 defeat bestWave=2 integrity=0
pulse seed=1 victory integrity=6
mortar seed=1 victory integrity=11
cryo seed=1 defeat bestWave=2
mixed seed=3 victory integrity=10
```

Pulse and mortar winning is the bug. Cryo dying at wave 2 is too early. Do not re-author those rows. Change content, then re-run `npm run sim`.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-035-balance-tune`. Do not switch, merge, or push.

Run `npm run sim` in the foreground. A background PTY node process exits at once with `stdin is not a tty`.

## Invariants the new sim stdout must show

- `none`: defeat, `bestWave` 2.
- `pulse`, `mortar`, and `cryo`: defeat, `bestWave` 6 or 7. A win is wrong. A loss at wave 2 is wrong.
- `mixed`: victory with integrity 8 through 15. Search seeds 1 through 30 with the same `runStrategy('mixed', seed)` function. Record the first seed that hits. If none hit, raise the cap and continue that function. Do not invent a build.

## Locks

These e2e oracles must still pass. Do not change them:

- Pulse cost 70 and damage 12. Placing Pulse leaves gold 80. A kill still adds 6, so gold can reach 86.
- Drone hp 55, bounty 6, leak damage 1.
- Wave 10 group counts and every leak damage. No-tower wave 10 still leaks 34. Integrity 50 ends at 16. Score stays 500.
- Pulse L2 upgrade cost 50. Sell of 70 refunds 49. Sell of 120 refunds 84.
- Do not edit `src/app/core/game/`, `src/app/core/systems/`, or `src/app/core/sim/strategies.ts`.

You may change other enemy hp, armor, speed, later-wave counts except wave 10, and non-Pulse tower damage or rate. If a change breaks `npm run e2e`, revert that change.

## Commands

```bash
npm run sim
npm test
npm run lint
npm run e2e
```

Copy the new sim stdout into the result file. A row the script did not print is a failure.

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, or another task result.
- Do not add dependencies. Do not spawn subagents. Do not `git add -A`.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm run sim && npm test && npm run lint && npm run e2e
verify_exit: 0
```

`notes:` must list the new measured rows and the mixed seed. Name every content number you changed.

```bash
git add \
  src/app/core/content/towers.ts \
  src/app/core/content/enemies.ts \
  src/app/core/content/waves.ts \
  src/app/core/content/content.spec.ts \
  results/TASK-035-balance-tune.md
git status --short
git commit -m "feat(TASK-035): tune content so the reference strategies meet the invariants"
```

Add a content spec only if an existing assertion must move to the new table value. Do not weaken the sell-refund or wave-10 overlord-last assertions. Stop if an unexpected path is untracked.

Final chat reply <= 8 lines.
