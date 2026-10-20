import { TILE_SIZE } from '../content/types';
import { clearStaticCache, drawStatic, type DrawContext } from './background';
import {
  PALETTE,
  restoreDefaultPalette,
  samePalette,
  writePalette,
  type MapPalette,
} from './palette';

export interface CanvasHost {
  getContext(contextId: '2d'): DrawContext | null;
}

export interface RangeCircle {
  x: number;
  y: number;
  rangeTiles: number;
}

let rangeCircle: RangeCircle | null = null;
let selectedPalette: MapPalette = PALETTE;

export function useRenderPalette(palette: MapPalette): void {
  selectedPalette = palette;
}

export function setRangeCircle(circle: RangeCircle | null): void {
  rangeCircle = circle;
}

export function getRangeCircle(): RangeCircle | null {
  return rangeCircle;
}

export function drawDynamic(ctx: DrawContext): void {
  const circle = rangeCircle;
  if (!circle) {
    return;
  }
  ctx.beginPath();
  ctx.strokeStyle = PALETTE.padStroke;
  ctx.lineWidth = 2;
  ctx.arc(circle.x, circle.y, circle.rangeTiles * TILE_SIZE, 0, Math.PI * 2);
  ctx.stroke();
}

export function renderMap(
  canvas: CanvasHost | null,
  backingWidth: number,
  backingHeight: number,
  palette: MapPalette = selectedPalette,
): void {
  if (!canvas) {
    return;
  }
  let ctx: DrawContext | null;
  try {
    ctx = canvas.getContext('2d');
  } catch {
    return;
  }
  if (!ctx) {
    return;
  }
  const swapped = !samePalette(PALETTE, palette);
  if (swapped) {
    writePalette(PALETTE, palette);
    clearStaticCache();
  }
  try {
    drawStatic(ctx, backingWidth, backingHeight);
    drawDynamic(ctx);
  } finally {
    if (swapped) {
      restoreDefaultPalette();
      clearStaticCache();
    }
  }
}
