import Phaser from 'phaser';
import { DEPTHS } from '../game/constants';
import type { HudState } from '../game/types';

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
    this.graphics.clear();
    this.panel(x, y, width, height, 0x38bdf8);
    this.bar(x + 16, y + 42, width - 32, 18, state.health / state.maxHealth, 0x22c55e, 0x34d399);
    this.bar(x + 16, y + 72, width - 32, 15, state.armor / Math.max(1, state.maxArmor), 0x38bdf8, 0xa5f3fc);
    this.bar(x + 16, y + 100, width - 32, 10, state.dashRatio, 0xf59e0b, 0xfbbf24);
    this.stats.setText(
      `HP ${Math.ceil(state.health)}/${state.maxHealth}   AR ${Math.ceil(state.armor)}/${state.maxArmor}`
    );
  }

  private panel(x: number, y: number, width: number, height: number, accent: number): void {
    this.graphics.fillStyle(0x07111f, 0.88);
    this.graphics.fillRoundedRect(x, y, width, height, 8);
    this.graphics.lineStyle(1, accent, 0.38);
    this.graphics.strokeRoundedRect(x, y, width, height, 8);
    this.graphics.fillStyle(accent, 0.8);
    this.graphics.fillRect(x, y, 4, height);
  }

  private bar(x: number, y: number, width: number, height: number, ratio: number, start: number, end: number): void {
    this.graphics.fillStyle(0x020617, 0.9);
    this.graphics.fillRoundedRect(x, y, width, height, 4);
    this.graphics.fillGradientStyle(start, end, start, end, 1, 1, 1, 1);
    this.graphics.fillRoundedRect(
      x + 2,
      y + 2,
      Math.max(2, (width - 4) * Phaser.Math.Clamp(ratio, 0, 1)),
      height - 4,
      3
    );
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
