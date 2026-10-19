status: pass
commit: pending
verify: npm test && npm run lint && npm run build
verify_exit: 0
files:
- src/app/core/content/types.ts
- src/app/core/content/towers.ts
- src/app/core/content/enemies.ts
- src/app/core/content/waves.ts
- src/app/core/content/map-01.ts
- src/app/core/content/content.spec.ts
- src/app/core/game/math.ts
- src/app/core/game/path.ts
- results/TASK-010-content-path.md
api:
- sellRefund(invested: number): number
- waveClearBonus(wave: number): number
- computeScore(kills: number, wavesCleared: number, remainingIntegrity: number): number
- tilesToPixels(tiles: number): number
- add(a: Vec2, b: Vec2): Vec2
- sub(a: Vec2, b: Vec2): Vec2
- scale(v: Vec2, factor: number): Vec2
- length(v: Vec2): number
- distance(a: Vec2, b: Vec2): number
- distanceSquared(a: Vec2, b: Vec2): number
- normalize(v: Vec2): Vec2
- lerp(a: Vec2, b: Vec2, t: number): Vec2
- buildPath(points: readonly Vec2[]): PathGeometry
- samplePath(geometry: PathGeometry, distanceAlong: number): PathSample
- towerDef(type: TowerType): TowerDef
- enemyDef(type: EnemyType): EnemyDef
- getWave(waveNumber: number): WaveDef
- expandWave(wave: WaveDef, spawnInterval?: number, groupDelay?: number): SpawnEvent[]
- assertWaveTable(): void
- tileCenter(col: number, row: number, tileSize?: number): Vec2
- tilesOnSegment(a: Tile, b: Tile): Tile[]
- pathTilesFromWaypoints(waypoints: readonly Tile[]): Tile[]
- padById(id: string): BuildPad | undefined
- isPathTile(col: number, row: number): boolean
- MAP_01: GameMap
- TOWERS: readonly TowerDef[]
- ENEMIES: readonly EnemyDef[]
- WAVES: readonly WaveDef[]
deviations:
- none
notes:
- Pad ids, in order: pad-01, pad-02, pad-03, pad-04, pad-05, pad-06, pad-07, pad-08, pad-09, pad-10, pad-11, pad-12, pad-13, pad-14.
- Path total length is 2064. The next task copies this map; it does not invent another.
- sellRefund oracle is 49 and 84. Wave 10 overlord is last at 25.6. No engine or canvas.

# TASK-010 Result

**Status:** pass
**Branch:** task/TASK-010-content-path
**Commit:** pending

## Summary

- Added framework-free content tables, map 01, and path sampling.
- Unit tests pin refund 49/84, path length 2064, and the wave-10 overlord at 25.6.

## Files changed

- `src/app/core/content/types.ts` — domain types, economy helpers, grid constants
- `src/app/core/content/towers.ts` — locked tower table
- `src/app/core/content/enemies.ts` — locked enemy table
- `src/app/core/content/waves.ts` — wave table and spawn expansion
- `src/app/core/content/map-01.ts` — 14 pads and polyline path
- `src/app/core/game/math.ts` — vector and tile-to-pixel helpers
- `src/app/core/game/path.ts` — `buildPath` and `samplePath`
- `src/app/core/content/content.spec.ts` — oracle assertions

## Tests and evidence

- `npm test` -> 3 files, 14 tests passed
- `npm run lint` -> All files pass linting
- `npm run build` -> pass
- grep `@angular` under `src/app/core/game` and `src/app/core/content` -> NO_ANGULAR

## Acceptance criteria

- [x] Grid 20 x 12, tile 48, canvas 960 x 576
- [x] Upgrade costs are the table: Pulse 50/70, Mortar 75/110, Cryo 65/90
- [x] Mortar splash 1 / 1.15 / 1.3; Cryo slow 0.4 / 0.45 / 0.5; duration 1.5 / 1.7 / 1.9
- [x] `sellRefund` is `Math.floor(invested * 0.7)`: 70 -> 49, 120 -> 84
- [x] Wave 10 is four groups and the Overlord group is last at 25.6
- [x] Path length 2064; pads are pad-01 through pad-14
- [x] No `@angular/*` import under `src/app/core/game/` or `src/app/core/content/`

## Handoff for next task

- Copy pad ids pad-01 through pad-14 and path length 2064. Do not invent another map.
- No engine or canvas was created here.
