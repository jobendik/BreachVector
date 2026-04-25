import Phaser from 'phaser';
import type { VectorData } from '../game/types';

export const TAU = Math.PI * 2;

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function randomRange(min: number, max: number): number {
  return Phaser.Math.FloatBetween(min, max);
}

export function normalizeAngle(angle: number): number {
  return ((angle % TAU) + TAU) % TAU;
}

export function shortestAngle(from: number, to: number): number {
  const diff = normalizeAngle(to) - normalizeAngle(from);
  return Phaser.Math.Wrap(diff + Math.PI, 0, TAU) - Math.PI;
}

export function vectorFrom(data: VectorData): Phaser.Math.Vector2 {
  return new Phaser.Math.Vector2(data.x, data.y);
}

export function angleBetween(a: VectorData, b: VectorData): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function distance(a: VectorData, b: VectorData): number {
  return Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
}

export function colorToCss(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}
