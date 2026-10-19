# TASK-010: Content tables, map, and path math

**Phase / dependencies:** Phase 1. Depends on TASK-002 (`status: pass`, merged as `8fefaab`, tag `phase-0`).
**Subagent:** general
**Git branch:** `task/TASK-010-content-path` (already created from `main`; stay on it)
**Result file:** `results/TASK-010-content-path.md`

## Goal

Add the framework-free domain types, the locked content tables, map 01, and path sampling. Unit tests must pin the numbers and the path. No engine, no canvas, no Angular imports in these files.

## Read first — only these

- `results/TASK-002-ci-lint.md`
- `plan/implementation-plan.md` §1.2, §1.3, §1.4, §1.5, and the path paragraph in §2.2
- `package.json` scripts

If `results/TASK-002-ci-lint.md` does not start with `status: pass`, stop.

Do not read the whole repository. Do not load `angular-scaffold`. Do not re-run `ng add`.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`.

Confirm `git branch --show-current` is `task/TASK-010-content-path` before editing. If it prints `main`, stop. Do not switch, merge, or push.

## Rules the tests must lock

- Grid is 20 x 12, tile size 48, canvas 960 x 576.
- Upgrade costs are the table, not a fresh rounding: Pulse 50/70, Mortar 75/110, Cryo 65/90.
- Stat growth is the §1.3 multiplier applied to L1. Mortar splash is 1 / 1.15 / 1.3, not a multiplier. Cryo slow is 0.4 / 0.45 / 0.5. Cryo duration is 1.5 / 1.7 / 1.9.
- `sellRefund` is `Math.floor(invested * 0.7)`. Oracle: 70 -> 49, 120 -> 84. A nearest-5 refund is wrong.
- Wave table order is spawn order. Wave 10 is four groups and the Overlord group is last. Do not put the Overlord first.
- Spawn timing lives in data: 0.8 s between enemies inside a group. The gap from the last enemy of a group to the first enemy of the next group is 4 s, not 4.8 s. The first enemy of wave 1 is at t=0.
- Path distance is pixels. Enemy speed in the table is tiles per second. `tilesToPixels(tiles) = tiles * 48`.
- `samplePath` clamps to `[0, totalLength]`. At a waypoint that is not the end, the tangent is the outgoing segment. At the end, the tangent is the last segment.
- No `@angular/*` import under `src/app/core/game/` or `src/app/core/content/`.

## Copy these files

`src/app/core/content/types.ts`:

```ts
export type TowerType = 'pulse' | 'mortar' | 'cryo';
export type EnemyType = 'drone' | 'runner' | 'tank' | 'swarm' | 'overlord';
export type TargetingMode = 'first' | 'strongest' | 'closest';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Tile {
  col: number;
  row: number;
}

export interface TowerLevelStats {
  damage: number;
  rate: number;
  range: number;
  splashRadius?: number;
  slowStrength?: number;
  slowDuration?: number;
}

export interface TowerDef {
  type: TowerType;
  cost: number;
  levels: [TowerLevelStats, TowerLevelStats, TowerLevelStats];
  upgradeCosts: [number, number];
}

export interface EnemyDef {
  type: EnemyType;
  hp: number;
  speed: number;
  armor: number;
  bounty: number;
  leakDamage: number;
  slowResistance: number;
}

export interface WaveGroup {
  type: EnemyType;
  count: number;
}

export interface WaveDef {
  wave: number;
  groups: WaveGroup[];
}

export interface SpawnEvent {
  type: EnemyType;
  time: number;
}

export const TILE_SIZE = 48;
export const GRID_COLS = 20;
export const GRID_ROWS = 12;
export const CANVAS_WIDTH = GRID_COLS * TILE_SIZE;
export const CANVAS_HEIGHT = GRID_ROWS * TILE_SIZE;
export const STARTING_GOLD = 150;
export const STARTING_INTEGRITY = 20;
export const WAVE_COUNT = 10;
export const SELL_REFUND_RATIO = 0.7;
export const MIN_HIT_DAMAGE = 1;
export const DEFAULT_TARGETING: TargetingMode = 'first';
export const SPAWN_INTERVAL = 0.8;
export const GROUP_DELAY = 4;

export function sellRefund(invested: number): number {
  return Math.floor(invested * SELL_REFUND_RATIO);
}

export function waveClearBonus(wave: number): number {
  return 25 + 5 * wave;
}

export function computeScore(kills: number, wavesCleared: number, remainingIntegrity: number): number {
  return kills * 10 + wavesCleared * 100 + remainingIntegrity * 25;
}
```

`src/app/core/game/math.ts`:

```ts
import type { Vec2 } from '../content/types';
import { TILE_SIZE } from '../content/types';

export function tilesToPixels(tiles: number): number {
  return tiles * TILE_SIZE;
}

export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(v: Vec2, factor: number): Vec2 {
  return { x: v.x * factor, y: v.y * factor };
}

export function length(v: Vec2): number {
  return Math.hypot(v.x, v.y);
}

export function distance(a: Vec2, b: Vec2): number {
  return length(sub(b, a));
}

export function distanceSquared(a: Vec2, b: Vec2): number {
  const d = sub(b, a);
  return d.x * d.x + d.y * d.y;
}

export function normalize(v: Vec2): Vec2 {
  const len = length(v);
  if (len === 0) {
    return { x: 0, y: 0 };
  }
  return scale(v, 1 / len);
}

export function lerp(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
```

`src/app/core/game/path.ts`:

```ts
import type { Vec2 } from '../content/types';
import { distance, lerp, normalize, sub } from './math';

export interface PathGeometry {
  points: Vec2[];
  segmentLengths: number[];
  cumulative: number[];
  totalLength: number;
}

export interface PathSample {
  position: Vec2;
  tangent: Vec2;
}

export function buildPath(points: readonly Vec2[]): PathGeometry {
  if (points.length < 2) {
    throw new Error('path needs at least 2 points');
  }
  const copied = points.map((point) => ({ x: point.x, y: point.y }));
  const segmentLengths: number[] = [];
  const cumulative = [0];
  for (let i = 1; i < copied.length; i++) {
    const len = distance(copied[i - 1], copied[i]);
    if (len === 0) {
      throw new Error('zero-length segment');
    }
    segmentLengths.push(len);
    cumulative.push(cumulative[i - 1] + len);
  }
  return {
    points: copied,
    segmentLengths,
    cumulative,
    totalLength: cumulative[cumulative.length - 1],
  };
}

export function samplePath(geometry: PathGeometry, distanceAlong: number): PathSample {
  const clamped = Math.min(Math.max(distanceAlong, 0), geometry.totalLength);
  const last = geometry.segmentLengths.length - 1;
  let index = 0;
  while (index < last && geometry.cumulative[index + 1] <= clamped) {
    index += 1;
  }
  const start = geometry.points[index];
  const end = geometry.points[index + 1];
  const segLen = geometry.segmentLengths[index];
  const t = (clamped - geometry.cumulative[index]) / segLen;
  return {
    position: lerp(start, end, t),
    tangent: normalize(sub(end, start)),
  };
}
```

`src/app/core/content/towers.ts`:

```ts
import type { TowerDef, TowerLevelStats, TowerType } from './types';

function level(
  base: TowerLevelStats,
  damageScale: number,
  rateScale: number,
  rangeScale: number,
  extra: Partial<TowerLevelStats> = {},
): TowerLevelStats {
  return {
    damage: base.damage * damageScale,
    rate: base.rate * rateScale,
    range: base.range * rangeScale,
    ...extra,
  };
}

const pulseBase: TowerLevelStats = { damage: 12, rate: 1.8, range: 3.2 };
const mortarBase: TowerLevelStats = { damage: 45, rate: 0.55, range: 4, splashRadius: 1 };
const cryoBase: TowerLevelStats = {
  damage: 5,
  rate: 1.2,
  range: 3,
  slowStrength: 0.4,
  slowDuration: 1.5,
};

export const TOWERS: readonly TowerDef[] = [
  {
    type: 'pulse',
    cost: 70,
    upgradeCosts: [50, 70],
    levels: [
      pulseBase,
      level(pulseBase, 1.3, 1.1, 1.08),
      level(pulseBase, 1.6, 1.2, 1.16),
    ],
  },
  {
    type: 'mortar',
    cost: 110,
    upgradeCosts: [75, 110],
    levels: [
      mortarBase,
      level(mortarBase, 1.3, 1.1, 1.08, { splashRadius: 1.15 }),
      level(mortarBase, 1.6, 1.2, 1.16, { splashRadius: 1.3 }),
    ],
  },
  {
    type: 'cryo',
    cost: 90,
    upgradeCosts: [65, 90],
    levels: [
      cryoBase,
      level(cryoBase, 1.3, 1.1, 1.08, { slowStrength: 0.45, slowDuration: 1.7 }),
      level(cryoBase, 1.6, 1.2, 1.16, { slowStrength: 0.5, slowDuration: 1.9 }),
    ],
  },
];

export function towerDef(type: TowerType): TowerDef {
  const found = TOWERS.find((tower) => tower.type === type);
  if (!found) {
    throw new Error(`unknown tower ${type}`);
  }
  return found;
}
```

`src/app/core/content/enemies.ts`:

```ts
import type { EnemyDef, EnemyType } from './types';

export const ENEMIES: readonly EnemyDef[] = [
  { type: 'drone', hp: 55, speed: 1, armor: 0, bounty: 6, leakDamage: 1, slowResistance: 0 },
  { type: 'runner', hp: 40, speed: 1.7, armor: 0, bounty: 8, leakDamage: 1, slowResistance: 0 },
  { type: 'tank', hp: 300, speed: 0.55, armor: 4, bounty: 18, leakDamage: 2, slowResistance: 0 },
  { type: 'swarm', hp: 22, speed: 1.15, armor: 0, bounty: 3, leakDamage: 1, slowResistance: 0 },
  { type: 'overlord', hp: 2200, speed: 0.45, armor: 6, bounty: 150, leakDamage: 10, slowResistance: 0.5 },
];

export function enemyDef(type: EnemyType): EnemyDef {
  const found = ENEMIES.find((enemy) => enemy.type === type);
  if (!found) {
    throw new Error(`unknown enemy ${type}`);
  }
  return found;
}
```

`src/app/core/content/waves.ts`:

```ts
import type { SpawnEvent, WaveDef } from './types';
import { GROUP_DELAY, SPAWN_INTERVAL, WAVE_COUNT } from './types';

export const WAVES: readonly WaveDef[] = [
  { wave: 1, groups: [{ type: 'drone', count: 8 }] },
  { wave: 2, groups: [{ type: 'drone', count: 10 }, { type: 'runner', count: 4 }] },
  { wave: 3, groups: [{ type: 'swarm', count: 16 }, { type: 'drone', count: 6 }] },
  { wave: 4, groups: [{ type: 'tank', count: 4 }, { type: 'drone', count: 8 }] },
  { wave: 5, groups: [{ type: 'runner', count: 10 }, { type: 'swarm', count: 8 }] },
  {
    wave: 6,
    groups: [
      { type: 'tank', count: 6 },
      { type: 'drone', count: 10 },
      { type: 'runner', count: 6 },
    ],
  },
  { wave: 7, groups: [{ type: 'swarm', count: 20 }, { type: 'tank', count: 4 }] },
  {
    wave: 8,
    groups: [
      { type: 'runner', count: 12 },
      { type: 'drone', count: 8 },
      { type: 'tank', count: 4 },
    ],
  },
  {
    wave: 9,
    groups: [
      { type: 'tank', count: 8 },
      { type: 'swarm', count: 20 },
      { type: 'runner', count: 10 },
    ],
  },
  {
    wave: 10,
    groups: [
      { type: 'drone', count: 10 },
      { type: 'runner', count: 6 },
      { type: 'tank', count: 4 },
      { type: 'overlord', count: 1 },
    ],
  },
];

export function getWave(waveNumber: number): WaveDef {
  const found = WAVES.find((wave) => wave.wave === waveNumber);
  if (!found) {
    throw new Error(`unknown wave ${waveNumber}`);
  }
  return found;
}

export function expandWave(
  wave: WaveDef,
  spawnInterval = SPAWN_INTERVAL,
  groupDelay = GROUP_DELAY,
): SpawnEvent[] {
  const events: SpawnEvent[] = [];
  let time = 0;
  wave.groups.forEach((group, groupIndex) => {
    if (groupIndex > 0) {
      time += groupDelay;
    }
    for (let i = 0; i < group.count; i++) {
      if (i > 0) {
        time += spawnInterval;
      }
      events.push({ type: group.type, time });
    }
  });
  return events;
}

export function assertWaveTable(): void {
  if (WAVES.length !== WAVE_COUNT) {
    throw new Error('expected 10 waves');
  }
}
```

`src/app/core/content/map-01.ts`:

```ts
import type { Tile, Vec2 } from './types';
import { TILE_SIZE } from './types';
import { buildPath, type PathGeometry } from '../game/path';

export interface BuildPad {
  id: string;
  col: number;
  row: number;
}

export interface GameMap {
  id: 'map-01';
  cols: number;
  rows: number;
  tileSize: number;
  entry: Tile;
  core: Tile;
  waypointTiles: readonly Tile[];
  waypoints: Vec2[];
  pathTiles: Tile[];
  pads: readonly BuildPad[];
  geometry: PathGeometry;
}

export function tileCenter(col: number, row: number, tileSize = TILE_SIZE): Vec2 {
  return { x: (col + 0.5) * tileSize, y: (row + 0.5) * tileSize };
}

export function tilesOnSegment(a: Tile, b: Tile): Tile[] {
  if (a.col !== b.col && a.row !== b.row) {
    throw new Error('path segment must be axis-aligned');
  }
  const tiles: Tile[] = [];
  const colStep = Math.sign(b.col - a.col);
  const rowStep = Math.sign(b.row - a.row);
  let col = a.col;
  let row = a.row;
  tiles.push({ col, row });
  while (col !== b.col || row !== b.row) {
    col += colStep;
    row += rowStep;
    tiles.push({ col, row });
  }
  return tiles;
}

export function pathTilesFromWaypoints(waypoints: readonly Tile[]): Tile[] {
  const seen = new Set<string>();
  const tiles: Tile[] = [];
  for (let i = 1; i < waypoints.length; i++) {
    for (const tile of tilesOnSegment(waypoints[i - 1], waypoints[i])) {
      const key = `${tile.col},${tile.row}`;
      if (!seen.has(key)) {
        seen.add(key);
        tiles.push(tile);
      }
    }
  }
  return tiles;
}

const waypointTiles: readonly Tile[] = [
  { col: 0, row: 1 },
  { col: 8, row: 1 },
  { col: 8, row: 5 },
  { col: 3, row: 5 },
  { col: 3, row: 9 },
  { col: 14, row: 9 },
  { col: 14, row: 3 },
  { col: 19, row: 3 },
];

const pads: readonly BuildPad[] = [
  { id: 'pad-01', col: 1, row: 0 },
  { id: 'pad-02', col: 1, row: 2 },
  { id: 'pad-03', col: 5, row: 0 },
  { id: 'pad-04', col: 5, row: 2 },
  { id: 'pad-05', col: 7, row: 3 },
  { id: 'pad-06', col: 9, row: 3 },
  { id: 'pad-07', col: 6, row: 4 },
  { id: 'pad-08', col: 6, row: 6 },
  { id: 'pad-09', col: 2, row: 7 },
  { id: 'pad-10', col: 4, row: 7 },
  { id: 'pad-11', col: 8, row: 8 },
  { id: 'pad-12', col: 8, row: 10 },
  { id: 'pad-13', col: 13, row: 6 },
  { id: 'pad-14', col: 15, row: 6 },
];

const waypoints = waypointTiles.map((tile) => tileCenter(tile.col, tile.row));

export const MAP_01: GameMap = {
  id: 'map-01',
  cols: 20,
  rows: 12,
  tileSize: TILE_SIZE,
  entry: waypointTiles[0],
  core: waypointTiles[waypointTiles.length - 1],
  waypointTiles,
  waypoints,
  pathTiles: pathTilesFromWaypoints(waypointTiles),
  pads,
  geometry: buildPath(waypoints),
};

export function padById(id: string): BuildPad | undefined {
  return MAP_01.pads.find((pad) => pad.id === id);
}

export function isPathTile(col: number, row: number): boolean {
  return MAP_01.pathTiles.some((tile) => tile.col === col && tile.row === row);
}
```

`src/app/core/content/content.spec.ts` — write these assertions. Import the functions you copied. Do not weaken a number to make a test pass.

- canvas 960 x 576, tile 48, grid 20 x 12, starting gold 150, integrity 20
- `sellRefund(70) === 49` and `sellRefund(120) === 84`
- `waveClearBonus(1) === 30` and `waveClearBonus(10) === 75`
- `computeScore(3, 2, 8) === 3 * 10 + 2 * 100 + 8 * 25`
- Pulse cost 70, upgrade costs `[50, 70]`, L1 damage 12, rate 1.8, range 3.2
- Pulse L2/L3 damage `toBeCloseTo(12 * 1.3)` / `12 * 1.6`, rate `1.8 * 1.1` / `1.8 * 1.2`, range `3.2 * 1.08` / `3.2 * 1.16`
- Mortar splash radii exactly 1, 1.15, 1.3 and upgrade costs `[75, 110]`
- Cryo slow 0.4, 0.45, 0.5 and duration 1.5, 1.7, 1.9 and upgrade costs `[65, 90]`
- Overlord hp 2200, armor 6, bounty 150, leak 10, slowResistance 0.5. Other enemies have slowResistance 0. Drone hp 55. Tank armor 4. Swarm bounty 3. Runner speed 1.7.
- `WAVES.length === 10`. Wave 10 has 4 groups. Last group is one overlord. First group is 10 drones. `expandWave(getWave(10))` has 21 events, first type `drone` at time 0, last type `overlord` at time 25.6.
- Wave 1 expand: 8 drones at 0, 0.8, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6.
- Wave 2: 14 events, event index 10 is a runner at time 11.2 (7.2 + 4, not 7.2 + 0.8 + 4).
- `MAP_01.pads` ids are exactly `pad-01` through `pad-14` in that order.
- Every pad is orthogonally adjacent to a path tile and is not itself a path tile.
- Entry is `{ col: 0, row: 1 }`. Core is `{ col: 19, row: 3 }`.
- `MAP_01.geometry.totalLength === 2064`.
- `samplePath(MAP_01.geometry, 0)` position `{ x: 24, y: 72 }`, tangent `{ x: 1, y: 0 }`.
- `samplePath(MAP_01.geometry, 384)` position equals the second waypoint, tangent `{ x: 0, y: 1 }`.
- `samplePath(MAP_01.geometry, 2064)` position `{ x: 936, y: 168 }`.
- `samplePath(MAP_01.geometry, -10)` equals `samplePath(..., 0)`.
- `samplePath(MAP_01.geometry, 99999)` equals `samplePath(..., 2064)`.
- Calling `samplePath` twice with the same distance returns the same position and tangent.

## Commands

```bash
npm test
npm run lint
npm run build
if grep -R "@angular" src/app/core/game src/app/core/content; then echo HAS_ANGULAR; exit 1; else echo NO_ANGULAR; fi
```

`npm test` must not watch. Do not start a dev server.

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, `results/DECISIONS.md`, or another task result.
- Do not create `engine.ts`, systems, components, routes, or a smoke spec.
- Do not add dependencies.
- Do not spawn subagents.
- Do not `git add -A`.
- Do not change `fileReplacements`.

## Handoff

Write `results/TASK-010-content-path.md` before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run build
verify_exit: 0
```

List the shipped signatures in `api:`. List pad ids and the path total length `2064` in `notes:`. The next task copies those; it does not invent another map.

```bash
git add \
  src/app/core/content/types.ts \
  src/app/core/content/towers.ts \
  src/app/core/content/enemies.ts \
  src/app/core/content/waves.ts \
  src/app/core/content/map-01.ts \
  src/app/core/content/content.spec.ts \
  src/app/core/game/math.ts \
  src/app/core/game/path.ts \
  results/TASK-010-content-path.md
git status --short
git commit -m "feat(TASK-010): add map, content tables, and path math"
```

Stop if a path outside that list is untracked, or if `node_modules`, `dist`, `.angular`, or Playwright output is staged.

Final chat reply <= 8 lines: status, tests run, files changed, blockers.
