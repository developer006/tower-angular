import { drawStatic, type DrawContext } from './background';

export interface CanvasHost {
  getContext(contextId: '2d'): DrawContext | null;
}

export function drawDynamic(ctx: DrawContext): void {
  void ctx;
}

export function renderMap(
  canvas: CanvasHost | null,
  backingWidth: number,
  backingHeight: number,
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
  drawStatic(ctx, backingWidth, backingHeight);
  drawDynamic(ctx);
}
