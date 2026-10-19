import { MAP_01, tileCenter } from '../content/map-01';
import { GRID_COLS, GRID_ROWS, TILE_SIZE } from '../content/types';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './layout';
import { PALETTE } from './palette';

const PATH_WIDTH = 28;
const PAD_SIZE = 36;
const PAD_STROKE = 2;
const ENTRY_SIZE = 14;
const CORE_RADIUS = 16;

export type DrawContext = Pick<
  CanvasRenderingContext2D,
  | 'fillStyle'
  | 'strokeStyle'
  | 'lineWidth'
  | 'lineJoin'
  | 'lineCap'
  | 'beginPath'
  | 'moveTo'
  | 'lineTo'
  | 'stroke'
  | 'fill'
  | 'fillRect'
  | 'strokeRect'
  | 'arc'
> &
  Partial<Pick<CanvasRenderingContext2D, 'drawImage'>>;

interface StaticCache {
  width: number;
  height: number;
  canvas: HTMLCanvasElement | OffscreenCanvas | null;
}

let cache: StaticCache | null = null;

export function clearStaticCache(): void {
  cache = null;
}

export function drawStatic(ctx: DrawContext, width: number, height: number): void {
  if (!(width > 0) || !(height > 0)) {
    return;
  }
  if (cache && cache.width === width && cache.height === height) {
    if (cache.canvas && ctx.drawImage) {
      ctx.drawImage(cache.canvas, 0, 0, width, height);
    }
    if (cache.canvas || !ctx.drawImage) {
      return;
    }
  }

  paintStatic(ctx, width, height);
  cache = { width, height, canvas: snapshotStatic(width, height) };
}

function snapshotStatic(width: number, height: number): HTMLCanvasElement | OffscreenCanvas | null {
  try {
    const surface = createSurface(width, height);
    if (!surface) {
      return null;
    }
    paintStatic(surface.ctx, width, height);
    return surface.canvas;
  } catch {
    return null;
  }
}

function createSurface(
  width: number,
  height: number,
): { canvas: HTMLCanvasElement | OffscreenCanvas; ctx: DrawContext } | null {
  const backingWidth = Math.max(1, Math.round(width));
  const backingHeight = Math.max(1, Math.round(height));
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      const canvas = new OffscreenCanvas(backingWidth, backingHeight);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        return { canvas, ctx };
      }
    } catch {
      // Fall through to a document canvas when OffscreenCanvas cannot draw.
    }
  }
  if (typeof document === 'undefined') {
    return null;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = backingWidth;
    canvas.height = backingHeight;
    const ctx = canvas.getContext('2d');
    return ctx ? { canvas, ctx } : null;
  } catch {
    return null;
  }
}

function paintStatic(ctx: DrawContext, width: number, height: number): void {
  const scaleX = width / LOGICAL_WIDTH;
  const scaleY = height / LOGICAL_HEIGHT;
  const xOf = (value: number): number => value * scaleX;
  const yOf = (value: number): number => value * scaleY;

  ctx.fillStyle = PALETTE.background;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = scaleX;
  ctx.beginPath();
  for (let col = 0; col <= GRID_COLS; col += 1) {
    const x = xOf(col * TILE_SIZE);
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let row = 0; row <= GRID_ROWS; row += 1) {
    const y = yOf(row * TILE_SIZE);
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  const waypoints = MAP_01.waypoints;
  if (waypoints.length > 0) {
    ctx.strokeStyle = PALETTE.path;
    ctx.lineWidth = PATH_WIDTH * scaleX;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(xOf(waypoints[0].x), yOf(waypoints[0].y));
    for (let i = 1; i < waypoints.length; i += 1) {
      ctx.lineTo(xOf(waypoints[i].x), yOf(waypoints[i].y));
    }
    ctx.stroke();
  }

  ctx.lineWidth = PAD_STROKE * scaleX;
  for (const pad of MAP_01.pads) {
    const center = tileCenter(pad.col, pad.row);
    const left = xOf(center.x - PAD_SIZE / 2);
    const top = yOf(center.y - PAD_SIZE / 2);
    ctx.fillStyle = PALETTE.padFill;
    ctx.strokeStyle = PALETTE.padStroke;
    ctx.fillRect(left, top, PAD_SIZE * scaleX, PAD_SIZE * scaleY);
    ctx.strokeRect(left, top, PAD_SIZE * scaleX, PAD_SIZE * scaleY);
  }

  if (waypoints.length > 0) {
    const entry = waypoints[0];
    ctx.fillStyle = PALETTE.entry;
    ctx.fillRect(
      xOf(entry.x - ENTRY_SIZE / 2),
      yOf(entry.y - ENTRY_SIZE / 2),
      ENTRY_SIZE * scaleX,
      ENTRY_SIZE * scaleY,
    );
    const core = waypoints[waypoints.length - 1];
    ctx.fillStyle = PALETTE.core;
    ctx.beginPath();
    ctx.arc(xOf(core.x), yOf(core.y), CORE_RADIUS * scaleX, 0, Math.PI * 2);
    ctx.fill();
  }
}
