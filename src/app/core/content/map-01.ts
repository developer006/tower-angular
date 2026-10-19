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
