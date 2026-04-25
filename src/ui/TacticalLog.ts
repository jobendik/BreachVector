import Phaser from 'phaser';
import { DEPTHS } from '../game/constants';

export class TacticalLog {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly lines: Phaser.GameObjects.Text[] = [];
  private bounds = new Phaser.Geom.Rectangle();

  constructor(private readonly scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setScrollFactor(0).setDepth(DEPTHS.ui);
    for (let i = 0; i < 4; i += 1) {
      this.lines.push(
        scene.add
          .text(0, 0, '', {
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            fontSize: '11px',
            fontStyle: '700',
            color: '#cbd5e1'
          })
          .setScrollFactor(0)
          .setDepth(DEPTHS.ui + 1)
      );
    }
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.bounds.setTo(x, y, width, height);
    this.lines.forEach((line, index) => line.setPosition(x + 14, y + 12 + index * 19));
  }

  update(messages: string[]): void {
    const { x, y, width, height } = this.bounds;
    this.graphics.clear();
    this.graphics.fillStyle(0x020617, 0.66);
    this.graphics.fillRoundedRect(x, y, width, height, 8);
    this.graphics.lineStyle(1, 0x38bdf8, 0.18);
    this.graphics.strokeRoundedRect(x, y, width, height, 8);
    const visible = messages.slice(-4).reverse();
    this.lines.forEach((line, index) => line.setText(visible[index] ? `> ${visible[index]}` : ''));
  }
}
