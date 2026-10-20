status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
files:
- src/app/core/systems/order.ts
- src/app/core/systems/movement.ts
- src/app/core/systems/targeting.ts
- src/app/core/systems/firing.ts
- src/app/core/systems/projectiles.ts
- src/app/core/systems/damage.ts
- src/app/core/systems/combat.spec.ts
- src/app/core/game/engine.spec.ts
- results/TASK-031-combat.md
api:
- acquireTargets(state: GameState): void
- fireTowers(state: GameState): void
- moveProjectiles(state: GameState): void
- applyDamage(state: GameState): void
- tickSlow(state: GameState): void
- readTarget(tower: TowerState): string | undefined
- PROJECTILE_TILES_PER_SECOND = 8
deviations:
- src/app/core/game/engine.spec.ts was not in the brief's git add list. It is staged because npm test cannot pass without it. The 600-step oracle expected gold 80, eight enemies, and no projectiles. That held only before towers fired. After 600 steps a Pulse on pad-01 has killed e1, gold is 86, seven enemies remain, p18 is in flight, integrity is 20, and score is 0.
- Tower targetId and enemy travelFactor are runtime fields, not added to the state interfaces, so paused place/sell equality stays exact.
notes:
- Projectile speed is 8 tiles/s.
- Armor minimum is 1. Pulse 12 versus Tank armor 4 deals 8. Cryo 5 versus Overlord armor 6 deals 1.
- Kill bounty does not change score. A killed Drone adds 6 gold. A leak still pays no bounty.
- A 40% slow moves 28.8 pixels in 60 ticks, not 48. Overlord slow is strength 0.2 for 1.5s.

# TASK-031 Result

**Status:** pass
**Branch:** task/TASK-031-combat
**Commit:** pending

## Summary

- Towers acquire in-range targets. Default is first. Ties use furthest path distance, then lowest id.
- Homing projectiles move at 8 tiles/s. A missing target expires with no damage and no splash.
- Armor reduces each hit with a minimum of 1. Mortar splash is full damage inside the radius, no falloff.
- Cryo slow uses strongest-wins. Resistance halves strength, not duration.
- A kill adds bounty gold and does not change score.

## Files changed

- `src/app/core/systems/targeting.ts` — first, strongest, and closest
- `src/app/core/systems/firing.ts` — cooldown and projectile spawn
- `src/app/core/systems/projectiles.ts` — homing at 8 tiles/s
- `src/app/core/systems/damage.ts` — armor, splash, slow, kill bounty
- `src/app/core/systems/movement.ts` — speed multiplied by `(1 - slowStrength)`
- `src/app/core/systems/order.ts` — tickSlow; same `runSimulationSystems` order
- `src/app/core/systems/combat.spec.ts` — combat oracles
- `src/app/core/game/engine.spec.ts` — 600-step counts after the first kill
- `results/TASK-031-combat.md` — this report

## Tests and evidence

- `npm test` -> exit 0; 11 files, 74 tests passed
- `npm run lint` -> exit 0; All files pass linting
- `npm run e2e` -> exit 0; 5 passed
- grep `Date.now|Math.random|performance.now` under `src/app/core/game` and `src/app/core/systems` -> NO_CLOCK

## Acceptance criteria

- [x] A Pulse at pad-01 targets a drone inside 3.2 tiles. A further drone wins first
- [x] closest picks the nearer drone even when it is behind on the path
- [x] Equal distance uses the further path distance, then the lower id
- [x] One Pulse shot on a Tank reduces hp by 8
- [x] One Cryo shot on an Overlord reduces hp by 1 and sets slow strength 0.2 for 1.5s
- [x] A stronger slow is not replaced by a weaker one
- [x] Mortar splash 1.0 damages two enemies inside 1 tile and not an enemy 2 tiles away
- [x] A projectile whose target was removed before impact deals no damage
- [x] Killing a Drone adds 6 gold and does not change score
- [x] A 40% slow moves 28.8 pixels in 60 ticks, not 48
- [x] `runSimulationSystems` order is unchanged. `loop.ts` was not edited

## Decisions / assumptions

- Targeting is recomputed each tick among alive in-range enemies. A dead, leaked, or out-of-range target is cleared first.
- Projectile ids are `p1`, `p2`, ... from `nextProjectileId`. Splash radius is 0 for Pulse and Cryo.
- Armor, bounty, and slow resistance come from `enemyDef`, not extra enemy fields.
- Slow is stored on the projectile so a sold tower still applies it on impact. Only the locked target is slowed.
- Splash radius 0 hits only the locked target. Splash above 0 hits each alive enemy inside the radius once, including the target.
- Unslowed movement keeps `speed * tilesToPixels(1) * DT * ticks` so 60 drone ticks stay exactly 48. Slowed movement uses `(speed * tilesToPixels(1) * ticks * factor) / (1 / DT)` so 60 ticks at 60% speed are exactly 28.8.
- `tickSlow` subtracts `DT` before movement and clears strength at 0. Kill removal is not a leak.

## Handoff for next task

- Do not reorder `runSimulationSystems`. Do not reverse `fileReplacements`. Do not award bounty on leak. Do not change score on a kill.
- The results overlay is not implemented. Score stays 0.
