# TASK-011: Fixed-step engine, commands, and seeded RNG

**Phase / dependencies:** Phase 1. Depends on TASK-010 (`status: pass`, merged as `7b5f9e3`).
**Subagent:** general
**Git branch:** `task/TASK-011-engine-loop` (already created from `main`; stay on it)
**Result file:** `results/TASK-011-engine-loop.md`

## Goal

Add a framework-free engine with `dispatch`, `step`, `getState`, and `getSnapshot`, a 60 Hz loop, command validation, and a serializable mulberry32 RNG. Simulation systems are ordered no-ops. Do not implement combat.

## Read first — only these

- `results/TASK-010-content-path.md`
- `plan/implementation-plan.md` §2.1 and §2.2
- `src/app/core/content/types.ts`
- `src/app/core/content/towers.ts`
- `src/app/core/content/map-01.ts`

If `results/TASK-010-content-path.md` does not start with `status: pass`, stop.

Copy pad ids and path length from that result. Do not invent another map. Do not load `angular-scaffold`.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-011-engine-loop`. Do not switch, merge, or push.

## Locked behavior

- `DT` is exactly `1 / 60`. Not `0.016`. Not `16`.
- `step()` increments `tick` first, then applies queued commands, then calls systems in the order below.
- A rejected command does not change gold, towers, tick, integrity, or history. Do not clear those fields before the attempt.
- Unpaused `placeTower`, `upgradeTower`, `sellTower`, `setTargeting`, and `startWave` queue. They do not spend gold until `step()`.
- Structural failures reject immediately and do not queue: `unknown-pad`, `unknown-tower`, `bad-targeting`.
- `occupied`, `insufficient-gold`, `missing-tower`, `max-level`, `wave-active`, and `ended` are decided at apply time.
- While paused, build, sell, upgrade, and targeting apply immediately and do not increment `tick`. `startWave` returns `paused` and does not change phase.
- `reset` always applies immediately, clears `pending`, and does not use `Date.now()`.
- Pause does not add `frameDelta` to the accumulator. Speed is only `1` or `2`. A frame adds `min(frameDelta, 0.25) * speed`, then at most 10 steps.
- Sell uses `sellRefund`. Pulse L1+L2 invested 120 refunds 84.
- Tower ids are `t1`, `t2`, ... Default targeting is `first`.
- `wave` stays 1-based. A fresh run is `wave: 1`, `phase: 'build'`. `startWave` sets `phase` to `'wave'` and does not change `wave`.
- No `@angular/*` import. No `Date.now()`, `Math.random()`, or `performance.now()` under `src/app/core/game/` or `src/app/core/systems/`.

System order inside `runSimulationSystems`, even while the bodies are no-ops:

1. spawn due enemies
2. tick slow effects
3. move enemies and handle leaks
4. acquire targets
5. fire towers
6. move projectiles
7. apply damage
8. advance wave state
9. tick cosmetic effects

## Copy these files

`src/app/core/game/state.ts`:

```ts
import type { EnemyType, SpawnEvent, TargetingMode, TowerType } from '../content/types';

export type Phase = 'build' | 'wave' | 'victory' | 'defeat';

export interface TowerState {
  id: string;
  towerType: TowerType;
  padId: string;
  level: 1 | 2 | 3;
  invested: number;
  targeting: TargetingMode;
  cooldown: number;
}

export interface EnemyState {
  id: string;
  enemyType: EnemyType;
  hp: number;
  maxHp: number;
  distanceAlongPath: number;
  alive: boolean;
  slowStrength: number;
  slowRemaining: number;
}

export interface ProjectileState {
  id: string;
  towerId: string;
  targetId: string;
  x: number;
  y: number;
  damage: number;
  splashRadius: number;
}

export interface EffectState {
  id: string;
  kind: string;
  x: number;
  y: number;
  remaining: number;
}

export interface GameState {
  tick: number;
  phase: Phase;
  gold: number;
  integrity: number;
  wave: number;
  score: number;
  towers: TowerState[];
  enemies: EnemyState[];
  projectiles: ProjectileState[];
  effects: EffectState[];
  spawnQueue: SpawnEvent[];
  rngState: number;
  paused: boolean;
  speed: 1 | 2;
  nextTowerId: number;
  nextEnemyId: number;
  nextProjectileId: number;
  history: Command[];
  pending: Command[];
}

export type Command =
  | { type: 'placeTower'; towerType: TowerType; padId: string }
  | { type: 'upgradeTower'; towerId: string }
  | { type: 'sellTower'; towerId: string }
  | { type: 'setTargeting'; towerId: string; mode: TargetingMode }
  | { type: 'startWave' }
  | { type: 'reset'; seed: number };

export type RejectReason =
  | 'unknown-pad'
  | 'unknown-tower'
  | 'occupied'
  | 'insufficient-gold'
  | 'missing-tower'
  | 'max-level'
  | 'bad-targeting'
  | 'paused'
  | 'wave-active'
  | 'ended';

export interface CommandResult {
  ok: boolean;
  reason?: RejectReason;
  queued?: boolean;
}
```

`src/app/core/game/rng.ts`:

```ts
export function nextUnit(rngState: number): { value: number; rngState: number } {
  let a = (rngState + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), a | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return {
    value: ((t ^ (t >>> 14)) >>> 0) / 4294967296,
    rngState: a >>> 0,
  };
}
```

`src/app/core/systems/order.ts`:

```ts
import type { GameState } from '../game/state';

export function spawnDue(state: GameState): void {
  void state;
}

export function tickSlow(state: GameState): void {
  void state;
}

export function moveEnemies(state: GameState): void {
  void state;
}

export function acquireTargets(state: GameState): void {
  void state;
}

export function fireTowers(state: GameState): void {
  void state;
}

export function moveProjectiles(state: GameState): void {
  void state;
}

export function applyDamage(state: GameState): void {
  void state;
}

export function advanceWave(state: GameState): void {
  void state;
}

export function tickEffects(state: GameState): void {
  void state;
}

export function runSimulationSystems(state: GameState): void {
  spawnDue(state);
  tickSlow(state);
  moveEnemies(state);
  acquireTargets(state);
  fireTowers(state);
  moveProjectiles(state);
  applyDamage(state);
  advanceWave(state);
  tickEffects(state);
}
```

`src/app/core/game/engine.ts` must export `GameEngine` with `dispatch`, `step`, `getState` (structuredClone), `getSnapshot` (stable JSON), `setPaused`, `setSpeed`, `isPaused`, `getSpeed`. Constructor calls `reset(seed)`.

Apply rules:

- `placeTower` uses `padById` and `towerDef`. Spend `cost`. Id is ``t${nextTowerId}``. `invested` starts at `cost`. `targeting` is `DEFAULT_TARGETING`. Then increment `nextTowerId`.
- `upgradeTower` spends `upgradeCosts[level - 1]`, adds that to `invested`, and increments `level`. Level 3 returns `max-level` before spending.
- `sellTower` adds `sellRefund(invested)` and removes that tower only.
- `setTargeting` accepts only `first`, `strongest`, and `closest`.
- `startWave` from `build` sets `phase` to `wave`. From `wave` returns `wave-active`. From `victory` or `defeat` returns `ended`.
- Accepted commands are pushed to `history`. Rejected ones are not.
- `reset(seed)` restores gold 150, integrity 20, wave 1, phase `build`, tick 0, score 0, empty arrays, `rngState = seed >>> 0`, paused false, speed 1, ids starting at 1.

`getSnapshot` includes tick, phase, gold, integrity, wave, score, towers, enemies, projectiles, effects, spawnQueue, rngState, paused, speed, nextTowerId, nextEnemyId, nextProjectileId, history, and pending. Build that object with those keys in that order.

`src/app/core/game/loop.ts`:

```ts
import type { GameEngine } from './engine';

export const DT = 1 / 60;

export interface LoopState {
  accumulator: number;
}

export function createLoop(): LoopState {
  return { accumulator: 0 };
}

export function advanceFrame(engine: GameEngine, loop: LoopState, frameDelta: number): number {
  if (engine.isPaused()) {
    return 0;
  }
  loop.accumulator += Math.min(frameDelta, 0.25) * engine.getSpeed();
  let steps = 0;
  while (loop.accumulator >= DT && steps < 10) {
    engine.step();
    loop.accumulator -= DT;
    steps += 1;
  }
  return steps;
}
```

## Tests in `src/app/core/game/engine.spec.ts`

- `DT` equals `1 / 60` and is not `0.016`.
- Fresh `new GameEngine(1)` has gold 150, integrity 20, wave 1, phase `build`, tick 0.
- Paused place Pulse on `pad-01` spends 70 immediately, creates `t1` with invested 70 and targeting `first`, and leaves tick at 0.
- Paused upgrade of `t1` spends 50, level 2, invested 120. Paused sell refunds 84 and frees the pad. A second sell returns `missing-tower` and does not change gold.
- Unknown pad `pad-99` returns `unknown-pad`, does not queue, and leaves gold at 150.
- Unpaused place on `pad-01` leaves gold at 150 until `step()`, then gold is 80 and tick is 1.
- Two queued Mortar places on `pad-02`: after one `step()`, one tower, gold 40, history length 1.
- `setTargeting` to `closest` sticks. Mode `'last' as 'first'` is not required. Dispatch `{ type: 'setTargeting', towerId: 't1', mode: 'closest' }` works. A cast bad mode returns `bad-targeting` if you accept a widened argument in the test via a helper; if the type forbids it, skip that case and instead reject a missing tower.
- Paused `startWave` returns `paused`, phase stays `build`, tick stays 0.
- Unpaused `startWave` then `step()` sets phase `wave` and leaves `wave` at 1.
- `advanceFrame` while paused with frameDelta 1 leaves tick and accumulator at 0.
- Speed 1 and frameDelta `DT` takes 1 step. Speed 2 and frameDelta `DT` takes 2 steps.
- frameDelta 10 at speed 1 takes 10 steps and leaves the accumulator at `0.25 - 10 / 60`.
- Two engines with seed 7, the same place plus startWave, then 600 `step()` calls, have equal snapshots. Tick is 600.
- `nextUnit` from seed 1 matches itself across two runs and differs from seed 2.

## Commands

```bash
npm test
npm run lint
npm run build
if grep -R "@angular" src/app/core/game src/app/core/systems; then echo HAS_ANGULAR; exit 1; else echo NO_ANGULAR; fi
if grep -R -E "Date\.now|Math\.random|performance\.now" src/app/core/game src/app/core/systems; then echo HAS_CLOCK; exit 1; else echo NO_CLOCK; fi
```

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, `results/DECISIONS.md`, content tables, or another task result.
- Do not add dependencies. Do not create components, canvas, or a smoke spec.
- Do not spawn subagents. Do not `git add -A`. Do not reverse `fileReplacements`.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run build
verify_exit: 0
```

`api:` must list `GameEngine.dispatch`, `step`, `getState`, `getSnapshot`, `DT`, `advanceFrame`, and `nextUnit`. `notes:` must say system bodies are no-ops and the call order in `runSimulationSystems` must not be reordered. Reject reasons that shipped must be listed exactly.

```bash
git add \
  src/app/core/game/state.ts \
  src/app/core/game/rng.ts \
  src/app/core/game/engine.ts \
  src/app/core/game/loop.ts \
  src/app/core/game/engine.spec.ts \
  src/app/core/systems/order.ts \
  results/TASK-011-engine-loop.md
git status --short
git commit -m "feat(TASK-011): add fixed-step engine, commands, and seeded RNG"
```

Stop if a path outside that list is untracked, or if build output is staged.

Final chat reply <= 8 lines.
