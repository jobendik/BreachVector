import Phaser from 'phaser';
import type { Enemy } from '../entities/Enemy';
import type { Player } from '../entities/Player';
import type { LevelData, RectData } from '../game/types';
import { angleBetween, normalizeAngle, shortestAngle, TAU } from '../utils/math';
import { rayRect, segmentClear } from '../utils/geometry';

export interface VisionWorld {
  level: LevelData;
  player: Player;
  getClosedDoorRects(): RectData[];
  getSolidPropRects(blockLosOnly?: boolean): RectData[];
}

export class VisionSystem {
  constructor(private readonly world: VisionWorld) {}

  blockerRects(): RectData[] {
    return [...this.world.level.walls, ...this.world.getClosedDoorRects(), ...this.world.getSolidPropRects(true)];
  }

  hasLineOfSight(a: Phaser.Math.Vector2, b: Phaser.Math.Vector2): boolean {
    return segmentClear(a, b, this.blockerRects());
  }

  canEnemySeePlayer(enemy: Enemy, player: Player): boolean {
    const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
    const visibleDistance = enemy.config.visionDistance * (player.noiseMultiplier < 0.5 ? 0.88 : 1);
    if (distance > visibleDistance) {
      return false;
    }
    const targetAngle = angleBetween(enemy, player);
    const diff = Math.abs(shortestAngle(enemy.facing.angle(), targetAngle));
    if (diff > enemy.config.fov / 2) {
      return false;
    }
    return this.hasLineOfSight(enemy.positionVector, player.positionVector);
  }

  isVisibleFromPlayer(point: Phaser.Math.Vector2, maxDistance = 700): boolean {
    const { player } = this.world;
    if (Phaser.Math.Distance.Between(player.x, player.y, point.x, point.y) > maxDistance) {
      return false;
    }
    return this.hasLineOfSight(player.positionVector, point);
  }

  rayEnd(origin: Phaser.Math.Vector2, angle: number, maxDistance: number): Phaser.Math.Vector2 {
    const end = new Phaser.Math.Vector2(
      origin.x + Math.cos(angle) * maxDistance,
      origin.y + Math.sin(angle) * maxDistance
    );
    let best = end;
    let bestDistance = maxDistance;
    for (const rect of this.blockerRects()) {
      const hit = rayRect(origin, end, rect);
      if (!hit) {
        continue;
      }
      const distance = Phaser.Math.Distance.Between(origin.x, origin.y, hit.x, hit.y);
      if (distance < bestDistance) {
        best = hit;
        bestDistance = distance;
      }
    }
    return best;
  }

  visibilityPolygon(origin: Phaser.Math.Vector2, maxDistance = 760): Phaser.Math.Vector2[] {
    const angles: number[] = [];
    for (let angle = 0; angle < TAU; angle += Math.PI / 44) {
      angles.push(angle);
    }

    for (const rect of this.blockerRects()) {
      const corners = [
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.w, y: rect.y },
        { x: rect.x + rect.w, y: rect.y + rect.h },
        { x: rect.x, y: rect.y + rect.h }
      ];
      for (const corner of corners) {
        const angle = normalizeAngle(Math.atan2(corner.y - origin.y, corner.x - origin.x));
        angles.push(normalizeAngle(angle - 0.0001), angle, normalizeAngle(angle + 0.0001));
      }
    }

    return angles.sort((a, b) => a - b).map((angle) => this.rayEnd(origin, angle, maxDistance));
  }
}
