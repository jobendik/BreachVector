import Phaser from 'phaser';
import { COLORS, DEPTHS } from '../game/constants';
import type { HudState } from '../game/types';
import { cssColor } from '../utils/colors';

export class HealthArmorPanel {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly title: Phaser.GameObjects.Text;
  private readonly stats: Phaser.GameObjects.Text;
  private bounds = new Phaser.Geom.Rectangle();

  constructor(private readonly scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setScrollFactor(0).setDepth(DEPTHS.ui);
    this.title = scene.add
      .text(0, 0, 'OPERATOR', this.textStyle(12, '#67e8f9'))
      .setScrollFactor(0)
      .setDepth(DEPTHS.ui + 1);
    this.stats = scene.add
      .text(0, 0, '', this.textStyle(11, '#cbd5e1'))
      .setScrollFactor(0)
      .setDepth(DEPTHS.ui + 1);
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.bounds.setTo(x, y, width, height);
    this.title.setPosition(x + 16, y + 12);
    this.stats.setPosition(x + 16, y + height - 24);
  }

  update(state: HudState): void {
    const { x, y, width, height } = this.bounds;
    const healthRatio = state.health / state.maxHealth;
    const pulse = 0.45 + Math.sin(Date.now() / 120) * 0.18;
    const healthStart = healthRatio < 0.3 ? COLORS.alertRed : COLORS.operatorGreen;
    const healthEnd = healthRatio < 0.3 ? COLORS.hazardOrange : COLORS.operatorGreenBright;
    this.graphics.clear();
    this.panel(x, y, width, height, healthRatio < 0.3 ? COLORS.alertRed : COLORS.systemCyan);
    this.drawIcon(x + 22, y + 50, 'health', healthStart, healthRatio < 0.3 ? pulse : 0.9);
    this.segmentedBar(x + 44, y + 42, width - 60, 18, healthRatio, 12, healthStart, healthEnd);
    this.drawIcon(x + 22, y + 79, 'armor', COLORS.systemCyanSoft, 0.86);
    this.segmentedBar(
      x + 44,
      y + 72,
      width - 60,
      15,
      state.armor / Math.max(1, state.maxArmor),
      10,
      COLORS.systemCyan,
      COLORS.systemCyanSoft
    );
    this.drawIcon(x + 22, y + 106, 'dash', COLORS.hazardAmberBright, 0.86);
    this.segmentedBar(
      x + 44,
      y + 100,
      width - 60,
      10,
      state.dashRatio,
      8,
      COLORS.hazardAmber,
      COLORS.hazardAmberBright,
      true
    );
    this.stats.setText(
      `HP ${Math.ceil(state.health)}/${state.maxHealth}   AR ${Math.ceil(state.armor)}/${state.maxArmor}`
    );
    this.stats.setColor(healthRatio < 0.3 ? cssColor(COLORS.alertRedSoft) : cssColor(COLORS.textMuted));
  }

  private panel(x: number, y: number, width: number, height: number, accent: number): void {
    this.graphics.fillStyle(COLORS.blacksitePanel, 0.88);
    this.graphics.fillRoundedRect(x, y, width, height, 8);
    this.graphics.lineStyle(1, accent, 0.38);
    this.graphics.strokeRoundedRect(x, y, width, height, 8);
    this.graphics.fillStyle(accent, 0.8);
    this.graphics.fillRect(x, y, 4, height);
  }

  private segmentedBar(
    x: number,
    y: number,
    width: number,
    height: number,
    ratio: number,
    segments: number,
    start: number,
    end: number,
    sweep = false
  ): void {
    const clamped = Phaser.Math.Clamp(ratio, 0, 1);
    const gap = 3;
    const segmentWidth = (width - gap * (segments - 1)) / segments;
    this.graphics.fillStyle(COLORS.blacksiteNavy, 0.92);
    this.graphics.fillRoundedRect(x, y, width, height, 4);
    for (let i = 0; i < segments; i += 1) {
      const sx = x + i * (segmentWidth + gap);
      const fill = Phaser.Math.Clamp(clamped * segments - i, 0, 1);
      this.graphics.fillStyle(COLORS.steelDark, 0.55);
      this.graphics.fillRoundedRect(sx + 1, y + 2, segmentWidth - 2, height - 4, 2);
      if (fill > 0) {
        this.graphics.fillGradientStyle(start, end, start, end, 1, 1, 1, 1);
        this.graphics.fillRoundedRect(sx + 1, y + 2, Math.max(2, (segmentWidth - 2) * fill), height - 4, 2);
      }
    }

    if (sweep && clamped > 0.98) {
      const highlightX = x + ((Date.now() / 8) % width);
      this.graphics.fillStyle(COLORS.white, 0.16);
      this.graphics.fillRect(highlightX, y + 1, 12, height - 2);
    }
  }

  private drawIcon(x: number, y: number, type: 'health' | 'armor' | 'dash', color: number, alpha: number): void {
    this.graphics.lineStyle(2, color, alpha);
    this.graphics.fillStyle(color, 0.08);
    if (type === 'health') {
      this.graphics.strokeCircle(x, y, 8);
      this.graphics.lineBetween(x - 4, y, x + 4, y);
      this.graphics.lineBetween(x, y - 4, x, y + 4);
      return;
    }
    if (type === 'armor') {
      this.graphics.beginPath();
      this.graphics.moveTo(x, y - 9);
      this.graphics.lineTo(x + 8, y - 5);
      this.graphics.lineTo(x + 6, y + 6);
      this.graphics.lineTo(x, y + 10);
      this.graphics.lineTo(x - 6, y + 6);
      this.graphics.lineTo(x - 8, y - 5);
      this.graphics.closePath();
      this.graphics.strokePath();
      return;
    }
    this.graphics.beginPath();
    this.graphics.moveTo(x - 7, y + 6);
    this.graphics.lineTo(x, y - 8);
    this.graphics.lineTo(x + 7, y + 6);
    this.graphics.closePath();
    this.graphics.strokePath();
  }

  private textStyle(size: number, color: string): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: `${size}px`,
      fontStyle: '700',
      color
    };
  }
}
