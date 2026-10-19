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
