import Phaser from 'phaser';
import { COLORS, DEPTHS } from '../game/constants';
import type { TacticalLogCategory, TacticalLogEntry } from '../game/types';
import { cssColor } from '../utils/colors';

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

  update(entries: TacticalLogEntry[]): void {
    const { x, y, width, height } = this.bounds;
    this.graphics.clear();
    this.graphics.fillStyle(0x020617, 0.66);
    this.graphics.fillRoundedRect(x, y, width, height, 8);
    this.graphics.lineStyle(1, 0x38bdf8, 0.18);
    this.graphics.strokeRoundedRect(x, y, width, height, 8);
    const visible = entries.slice(-4).reverse();
    this.lines.forEach((line, index) => {
      const entry = visible[index];
      if (!entry) {
        line.setText('');
        line.setAlpha(1);
        return;
      }
      if (entry.emphasis === 'critical') {
        this.graphics.fillStyle(this.colorFor(entry.category), 0.13);
        this.graphics.fillRoundedRect(x + 8, y + 7 + index * 19, width - 16, 16, 4);
      }
      const repeat = entry.count && entry.count > 1 ? ` x${entry.count}` : '';
      const critical = entry.emphasis === 'critical' ? '! ' : '';
      line.setText(`${critical}${this.prefixFor(entry.category)} ${entry.message}${repeat}`);
      line.setColor(cssColor(entry.emphasis === 'critical' ? COLORS.hazardAmberBright : this.colorFor(entry.category)));
      line.setAlpha(entry.emphasis === 'critical' ? 1 : Math.max(0.42, 1 - index * 0.18));
    });
  }

  private prefixFor(category: TacticalLogCategory): string {
    if (category === 'objective') return '[OBJ]';
    if (category === 'combat') return '[COM]';
    if (category === 'alert') return '[ALT]';
    if (category === 'pickup') return '[SUP]';
    return '[SYS]';
  }

  private colorFor(category: TacticalLogCategory): number {
    if (category === 'objective') return COLORS.systemCyan;
    if (category === 'combat') return COLORS.hazardOrange;
    if (category === 'alert') return COLORS.alertRed;
    if (category === 'pickup') return COLORS.operatorGreenBright;
    return COLORS.steelLight;
  }
}
