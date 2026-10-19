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
