import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../content/types';

export const LOGICAL_WIDTH = CANVAS_WIDTH;
export const LOGICAL_HEIGHT = CANVAS_HEIGHT;

export interface CanvasCssSize {
  width: number;
  height: number;
}

export function cappedDevicePixelRatio(dpr: number): number {
  return Math.min(Math.max(dpr, 1), 2);
}

export function fitCanvasCss(containerWidth: number, containerHeight: number): CanvasCssSize {
  if (!(containerWidth > 0) || !(containerHeight > 0)) {
    return { width: 0, height: 0 };
  }
  const scale = Math.min(containerWidth / LOGICAL_WIDTH, containerHeight / LOGICAL_HEIGHT);
  return {
    width: LOGICAL_WIDTH * scale,
    height: LOGICAL_HEIGHT * scale,
  };
}
