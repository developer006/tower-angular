# TASK-034: Headless balance simulator

**Phase / dependencies:** Phase 3. Depends on TASK-033 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-034-balance-sim` (already created from `main`; stay on it)
**Result file:** `results/TASK-034-balance-sim.md`

## Goal

Add a headless simulator that runs the real engine and records what the reference strategies actually do. Do not edit tower, enemy, or wave numbers. Do not write the results by hand.

## Read first — only these

- `results/TASK-033-combat-e2e.md`
- `plan/implementation-plan.md` §7
- `src/app/core/game/engine.ts`
- `package.json`

If the TASK-033 result does not start with `status: pass`, stop.

Do not reorder `runSimulationSystems`. Do not edit `loop.ts`. Do not reverse `fileReplacements`. Do not change content tables. TASK-035 owns tuning.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-034-balance-sim`. Do not switch, merge, or push.

Run the simulator in the foreground. A background PTY node process exits at once with `stdin is not a tty`. That exit is not a result.

## Deliverables

- `npm install -D tsx`
- `"sim": "tsx scripts/balance-sim.ts"` in `package.json`. Do not add `build:pages` or `copy404`.
- `scripts/balance-sim.ts` imports the engine and content. It does not shell out to a second copy of the rules.
- `src/app/core/sim/strategies.ts` exports the strategies and `runStrategy(name, seed)`.
- `src/app/core/sim/strategies.spec.ts` calls `runStrategy`. It does not read a handwritten JSON file as the source of truth.

## Strategies

Each strategy calls `reset(seed)`, then plays waves until victory, defeat, or wave 10 has ended. Place towers only on `pad-01` through `pad-14`. Use `setPaused(true)` so placement applies immediately, then `startWave` and `step()` until the wave clears or the run ends.

- `none`: never place a tower.
- `pulse`: spend gold only on Pulse, on the lowest free pad id.
- `mortar`: same, Mortar only.
- `cryo`: same, Cryo only.
- `mixed`: a function of the seed. It may place any of the three types. It must be deterministic for a seed.

Record, from the engine, for each strategy: `outcome` (`victory` or `defeat`), `bestWave`, `wavesCleared`, `integrity`, `kills`, `score`, and `seed`.

## Rules

- `none` must defeat by wave 2. Assert that in the spec.
- Run the single-type strategies. Record the measured wave. Do not change a result so it matches "fails by wave 6-7" if the engine did not do that.
- Run `mixed` for seed 1. If it does not win with integrity 8 through 15, call the same function with later seeds, up to 20. If none hit, write `mixed: not-found` and the seeds tried. Do not invent a winning build. Do not edit content to force one.
- The spec asserts `none` loses by wave 2, that two calls with the same seed return the same outcome, and that the recorded numbers come from `runStrategy`.
- Print the measured rows to stdout. Copy those rows into the result file. A row that was not printed by the script is a failure.

## Commands

```bash
npm run sim
npm test
npm run lint
```

`npm run sim` must exit 0 even when mixed is `not-found`.

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, content tables, or another task result.
- Do not spawn subagents. Do not `git add -A`.
- Do not add `@axe-core/playwright`.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm run sim && npm test && npm run lint
verify_exit: 0
```

`notes:` must list the measured outcome for each strategy and the seed. If mixed was not found, say so. TASK-035 tunes content; it does not re-author these rows.

```bash
git add \
  package.json package-lock.json \
  scripts/balance-sim.ts \
  src/app/core/sim/strategies.ts \
  src/app/core/sim/strategies.spec.ts \
  results/TASK-034-balance-sim.md
git status --short
git commit -m "feat(TASK-034): add the headless balance simulator"
```

Stop if an unexpected path is untracked or if `results/evidence` is staged.

Final chat reply <= 8 lines.
