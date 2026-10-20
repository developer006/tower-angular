# TASK-031: Targeting, firing, projectiles, armor, and slow

**Phase / dependencies:** Phase 3. Depends on TASK-030 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-031-combat` (already created from `main`; stay on it)
**Result file:** `results/TASK-031-combat.md`

## Goal

Towers acquire targets, fire homing projectiles, apply armor and slow, and pay kill bounties. Do not open a results overlay or change the score. Score stays 0.

## Read first — only these

- `results/TASK-030-enemy-movement.md`
- `plan/implementation-plan.md` §1.3 and the system-order list in §2.2
- `src/app/core/systems/order.ts`
- `src/app/core/content/towers.ts`
- `src/app/core/content/types.ts`

If the TASK-030 result does not start with `status: pass`, stop.

Do not reorder `runSimulationSystems`. Do not edit `loop.ts`. Do not reverse `fileReplacements`. Do not award bounty on leak.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-031-combat`. Do not switch, merge, or push.

## Locked rules

- Range and splash are in tiles. Convert with `tilesToPixels` (tile size 48). Tower position is `tileCenter` of its pad. Enemy position is `samplePath(MAP_01.geometry, distanceAlongPath).position`.
- Targeting, in range only. Default `first`.
  - `first`: furthest `distanceAlongPath`. Tie: lowest enemy id.
  - `strongest`: highest current hp. Tie: furthest along the path, then lowest id.
  - `closest`: smallest distance squared to the tower. Tie: furthest along the path, then lowest id.
- A dead, leaked, or out-of-range target is cleared before a new one is chosen.
- Cooldown is in seconds. Each tick, `cooldown = Math.max(0, cooldown - DT)`. Fire when `cooldown === 0` and a target exists, then `cooldown += 1 / rate`.
- Projectile speed is `8` tiles per second for every tower. Id `p1`, `p2`, ... from `nextProjectileId`. Store the locked enemy id, damage, and splash radius in tiles (0 for Pulse and Cryo).
- Each tick, move the projectile toward the target's current position by at most `tilesToPixels(8) * DT`. If the target is gone, remove the projectile and deal no damage and no splash.
- On impact, damage is `Math.max(MIN_HIT_DAMAGE, projectile.damage - enemy.armor)`. Minimum is 1, so Cryo 5 versus Overlord armor 6 deals 1, not 0. Pulse 12 versus Tank armor 4 deals 8.
- Mortar splash hits every alive enemy within the splash radius of the impact point, including the target, once each, for the same full damage after that enemy's armor. No falloff.
- Cryo applies slow on impact. Effective strength is `slowStrength * (1 - slowResistance)`. Overlord resistance is 0.5, so 0.4 becomes 0.2. Duration is not halved. Strongest strength wins. Equal strength refreshes duration. A weaker slow does not change the current strength or duration.
- `tickSlow` runs before movement and subtracts `DT` from `slowRemaining`. At 0, clear strength and remaining. `moveEnemies` multiplies speed by `(1 - slowStrength)`.
- Hp at or below 0 removes the enemy and adds `bounty` to gold. That is not a leak. Do not change `score`.
- No `Math.random()`, `Date.now()`, or Angular imports.

## Tests

- A Pulse at pad-01 and a drone inside 3.2 tiles is the target. A second drone further along the path wins `first`.
- `closest` picks the nearer drone even if it is behind on the path.
- Equal distance uses the further path distance, then the lower id.
- One Pulse shot on a Tank reduces hp by 8. One Cryo shot on an Overlord reduces hp by 1 and sets slow strength 0.2 and duration 1.5.
- A stronger slow is not replaced by a weaker one.
- A Mortar impact at splash 1.0 damages two enemies inside 1 tile and not an enemy 2 tiles away.
- A projectile whose target was removed before impact deals no damage.
- Killing a Drone adds 6 gold and does not change score.
- A slowed drone moves at 60% speed: 60 ticks from 0 travel 28.8 pixels, not 48.
- Destroy every Angular fixture if you add one. Plain engine tests are enough.

## Commands

```bash
npm test
npm run lint
npm run e2e
if grep -R -E "Date\.now|Math\.random|performance\.now" src/app/core/game src/app/core/systems; then echo HAS_CLOCK; exit 1; else echo NO_CLOCK; fi
```

Playwright stays at 5 passed.

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, or another task result.
- Do not add dependencies. Do not spawn subagents. Do not `git add -A`.
- Do not implement the victory overlay.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run e2e
verify_exit: 0
```

`notes:` must list projectile speed 8 tiles/s, the armor minimum 1, and that kill bounty does not change score.

```bash
git add \
  src/app/core/systems/order.ts \
  src/app/core/systems/movement.ts \
  src/app/core/systems/targeting.ts \
  src/app/core/systems/firing.ts \
  src/app/core/systems/projectiles.ts \
  src/app/core/systems/damage.ts \
  src/app/core/systems/combat.spec.ts \
  results/TASK-031-combat.md
git status --short
git commit -m "feat(TASK-031): add targeting, projectiles, armor, and slow"
```

Add a spec split by name if one file is too large. Stop if an unexpected path is untracked.

Final chat reply <= 8 lines.
