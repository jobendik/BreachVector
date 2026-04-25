import Phaser from 'phaser';
import type { RectData, VectorData } from '../game/types';
import { clamp } from './math';

export function rectCenter(rect: RectData): Phaser.Math.Vector2 {
  return new Phaser.Math.Vector2(rect.x + rect.w / 2, rect.y + rect.h / 2);
}

export function pointInRect(point: VectorData, rect: RectData): boolean {
  return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
}

export function circleIntersectsRect(point: VectorData, radius: number, rect: RectData): boolean {
  const x = clamp(point.x, rect.x, rect.x + rect.w);
  const y = clamp(point.y, rect.y, rect.y + rect.h);
  const dx = point.x - x;
  const dy = point.y - y;
  return dx * dx + dy * dy <= radius * radius;
}

export function lineIntersection(
  a: Phaser.Math.Vector2,
  b: Phaser.Math.Vector2,
  c: Phaser.Math.Vector2,
  d: Phaser.Math.Vector2
): Phaser.Math.Vector2 | null {
  const denominator = (d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y);
  if (Math.abs(denominator) < 0.0000001) {
    return null;
  }

  const ua = ((d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)) / denominator;
  const ub = ((b.x - a.x) * (a.y - c.y) - (b.y - a.y) * (a.x - c.x)) / denominator;

  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return new Phaser.Math.Vector2(a.x + ua * (b.x - a.x), a.y + ua * (b.y - a.y));
  }

  return null;
}

export function rayRect(a: Phaser.Math.Vector2, b: Phaser.Math.Vector2, rect: RectData): Phaser.Math.Vector2 | null {
  const corners = [
    new Phaser.Math.Vector2(rect.x, rect.y),
    new Phaser.Math.Vector2(rect.x + rect.w, rect.y),
    new Phaser.Math.Vector2(rect.x + rect.w, rect.y + rect.h),
    new Phaser.Math.Vector2(rect.x, rect.y + rect.h)
  ];
  const edges: Array<[Phaser.Math.Vector2, Phaser.Math.Vector2]> = [
    [corners[0], corners[1]],
    [corners[1], corners[2]],
    [corners[2], corners[3]],
    [corners[3], corners[0]]
  ];

  let best: Phaser.Math.Vector2 | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const [start, end] of edges) {
    const hit = lineIntersection(a, b, start, end);
    if (!hit) {
      continue;
    }
    const distance = Phaser.Math.Distance.Between(a.x, a.y, hit.x, hit.y);
    if (distance < bestDistance) {
      best = hit;
      bestDistance = distance;
    }
  }

  return best;
}

export function segmentClear(a: Phaser.Math.Vector2, b: Phaser.Math.Vector2, blockers: RectData[]): boolean {
  return blockers.every((rect) => rayRect(a, b, rect) === null);
}

export function distanceToSegment(
  start: Phaser.Math.Vector2,
  end: Phaser.Math.Vector2,
  point: Phaser.Math.Vector2
): number {
  const segment = end.clone().subtract(start);
  const lengthSquared = segment.lengthSq();
  if (lengthSquared <= 0.0001) {
    return Phaser.Math.Distance.Between(start.x, start.y, point.x, point.y);
  }
  const t = clamp(point.clone().subtract(start).dot(segment) / lengthSquared, 0, 1);
  const projection = start.clone().add(segment.scale(t));
  return Phaser.Math.Distance.Between(projection.x, projection.y, point.x, point.y);
}
