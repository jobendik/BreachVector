import Phaser from 'phaser';
import type { Enemy } from '../entities/Enemy';
import { COLORS, DEPTHS } from '../game/constants';
import { GameEvents, eventBus } from '../game/events';
import { EnemyState } from '../game/types';
import { formatEnemyState } from '../utils/debug';

export class DebugSystem {
  enabled = false;
  private readonly labels = new Map<string, Phaser.GameObjects.Text>();

  constructor(private readonly graphics: Phaser.GameObjects.Graphics) {}

  toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    if (this.enabled === enabled) {
      return;
    }
    this.enabled = enabled;
    eventBus.emit(GameEvents.DebugChanged, { enabled });
    if (!enabled) {
      this.clear();
    }
  }

  drawEnemyOverlay(enemies: Enemy[]): void {
    this.graphics.clear();
    if (!this.enabled) {
      this.hideLabels();
      return;
    }

    this.graphics.setDepth(DEPTHS.debug);
    const visibleLabels = new Set<string>();
    for (const enemy of enemies) {
      if (enemy.dead) {
        continue;
      }

      const color =
        enemy.aiState === EnemyState.Attack || enemy.aiState === EnemyState.Flank ? COLORS.red : COLORS.amber;
      this.graphics.lineStyle(1, color, 0.35);
      this.graphics.beginPath();
      this.graphics.moveTo(enemy.x, enemy.y);
      const left = enemy.facing.angle() - enemy.config.fov / 2;
      const right = enemy.facing.angle() + enemy.config.fov / 2;
      this.graphics.lineTo(
        enemy.x + Math.cos(left) * enemy.config.visionDistance,
        enemy.y + Math.sin(left) * enemy.config.visionDistance
      );
      this.graphics.moveTo(enemy.x, enemy.y);
      this.graphics.lineTo(
        enemy.x + Math.cos(right) * enemy.config.visionDistance,
        enemy.y + Math.sin(right) * enemy.config.visionDistance
      );
      this.graphics.strokePath();
      this.graphics.fillStyle(color, 0.9);
      this.graphics.fillCircle(enemy.x, enemy.y - 28, 3);

      visibleLabels.add(enemy.actorId);
      this.updateLabel(enemy);
    }
    this.hideLabels(visibleLabels);
  }

  destroy(): void {
    this.clear();
    for (const label of this.labels.values()) {
      label.destroy();
    }
    this.labels.clear();
  }

  private clear(): void {
    this.graphics.clear();
    this.hideLabels();
  }

  private updateLabel(enemy: Enemy): void {
    let label = this.labels.get(enemy.actorId);
    if (!label) {
      label = this.graphics.scene.add.text(0, 0, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#f8fafc',
        backgroundColor: '#020617aa',
        padding: { x: 3, y: 2 }
      });
      label.setDepth(DEPTHS.debug + 1);
      this.labels.set(enemy.actorId, label);
    }

    label
      .setPosition(enemy.x + 14, enemy.y - 42)
      .setText(formatEnemyState(enemy.aiState))
      .setVisible(true);
  }

  private hideLabels(visibleLabels = new Set<string>()): void {
    for (const [actorId, label] of this.labels) {
      if (!visibleLabels.has(actorId)) {
        label.setVisible(false);
      }
    }
  }
}
