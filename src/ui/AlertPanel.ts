import Phaser from 'phaser';
import { DEPTHS } from '../game/constants';
import type { HudState } from '../game/types';

export class AlertPanel {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly title: Phaser.GameObjects.Text;
  private readonly detail: Phaser.GameObjects.Text;
  private bounds = new Phaser.Geom.Rectangle();

  constructor(private readonly scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setScrollFactor(0).setDepth(DEPTHS.ui);
    this.title = scene.add.text(0, 0, '', this.textStyle(20, '#94a3b8')).setScrollFactor(0).setDepth(DEPTHS.ui + 1);
    this.detail = scene.add.text(0, 0, '', this.textStyle(11, '#94a3b8')).setScrollFactor(0).setDepth(DEPTHS.ui + 1);
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.bounds.setTo(x, y, width, height);
    this.title.setPosition(x + 16, y + 16);
    this.detail.setPosition(x + 16, y + 52);
  }

  update(state: HudState): void {
    const { x, y, width, height } = this.bounds;
    const color = state.alertState === 'detected' ? 0xef4444 : state.alertState === 'searching' ? 0xf59e0b : 0x64748b;
    this.graphics.clear();
    this.graphics.fillStyle(0x07111f, 0.88);
    this.graphics.fillRoundedRect(x, y, width, height, 8);
    this.graphics.lineStyle(1, color, 0.48);
    this.graphics.strokeRoundedRect(x, y, width, height, 8);
    this.graphics.fillStyle(color, 0.9);
    this.graphics.fillRect(x, y, width, 4);
    this.title.setText(state.alertState.toUpperCase()).setColor(`#${color.toString(16).padStart(6, '0')}`);
    this.detail.setText(state.debugEnabled ? `DEBUG ACTIVE - ${state.enemiesAlive} HOSTILES` : this.detailFor(state.alertState));
  }

  private detailFor(state: HudState['alertState']): string {
    if (state === 'detected') return 'emergency lights active';
    if (state === 'searching') return 'hostiles investigating';
    return 'silent approach';
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
