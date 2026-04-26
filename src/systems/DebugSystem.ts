import Phaser from 'phaser';
import type { Enemy } from '../entities/Enemy';
import { COLORS, DEPTHS } from '../game/constants';
import { GameEvents, eventBus } from '../game/events';
import { EnemyState } from '../game/types';
import { formatEnemyState } from '../utils/debug';

export class DebugSystem {
  enabled = false;
  private readonly labels = new Map<string, Phaser.GameObjects.Text>();
  private readonly suspicionGraphics: Phaser.GameObjects.Graphics;

  constructor(private readonly graphics: Phaser.GameObjects.Graphics) {
    this.suspicionGraphics = graphics.scene.add.graphics().setDepth(DEPTHS.actors + 3);
  }

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

      this.drawNavPath(enemy);
      this.drawCommandDebug(enemy);

      visibleLabels.add(enemy.actorId);
      this.updateLabel(enemy);
    }
    this.hideLabels(visibleLabels);
  }

  private drawCommandDebug(enemy: Enemy): void {
    if (enemy.role === 'captain' && enemy.commandPulseTimer > 0) {
      this.graphics.lineStyle(2, COLORS.alertRed, 0.42);
      this.graphics.strokeCircle(enemy.x, enemy.y, 520 * (1 - enemy.commandPulseTimer / 1.05));
    }
    if (enemy.commandBoostTimer <= 0) {
      return;
    }
    this.graphics.fillStyle(COLORS.hazardAmberBright, 0.78);
    this.graphics.fillTriangle(enemy.x - 6, enemy.y - 48, enemy.x + 6, enemy.y - 48, enemy.x, enemy.y - 58);
  }

  drawSuspicionIndicators(enemies: Enemy[]): void {
    this.suspicionGraphics.clear();
    for (const enemy of enemies) {
      if (enemy.dead || enemy.suspicion <= 0.04 || (!enemy.recentlyVisible && !this.enabled)) {
        continue;
      }

      const ratio = Phaser.Math.Clamp(enemy.suspicion, 0, 1);
      const width = 30;
      const height = 4;
      const x = enemy.x - width / 2;
      const y = enemy.y - 38;
      const color = this.suspicionColor(ratio);

      this.suspicionGraphics.fillStyle(COLORS.black, 0.72);
      this.suspicionGraphics.fillRoundedRect(x - 2, y - 2, width + 4, height + 4, 3);
      this.suspicionGraphics.fillStyle(COLORS.steelDark, 0.88);
      this.suspicionGraphics.fillRoundedRect(x, y, width, height, 2);
      this.suspicionGraphics.fillStyle(color, 0.95);
      this.suspicionGraphics.fillRoundedRect(x, y, width * ratio, height, 2);

      if (ratio >= 0.96) {
        this.suspicionGraphics.fillStyle(COLORS.alertRed, 0.9);
        this.suspicionGraphics.fillCircle(enemy.x, y - 7, 4);
        this.suspicionGraphics.lineStyle(1, COLORS.white, 0.9);
        this.suspicionGraphics.lineBetween(enemy.x, y - 10, enemy.x, y - 6);
      }
    }
  }

  private drawNavPath(enemy: Enemy): void {
    if (enemy.navPath.length === 0) return;
    this.graphics.lineStyle(1, COLORS.operatorGreen, 0.45);
    this.graphics.beginPath();
    this.graphics.moveTo(enemy.x, enemy.y);
    for (const wp of enemy.navPath) {
      this.graphics.lineTo(wp.x, wp.y);
    }
    this.graphics.strokePath();
    this.graphics.fillStyle(COLORS.operatorGreen, 0.6);
    for (const wp of enemy.navPath) {
      this.graphics.fillCircle(wp.x, wp.y, 3);
    }
  }

  destroy(): void {
    this.clear();
    this.suspicionGraphics.destroy();
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

  private suspicionColor(ratio: number): number {
    if (ratio < SUSPICION_INVESTIGATE_RATIO) {
      return COLORS.hazardAmberBright;
    }
    if (ratio < 0.72) {
      return COLORS.hazardOrange;
    }
    return COLORS.alertRed;
  }
}

const SUSPICION_INVESTIGATE_RATIO = 0.3;
