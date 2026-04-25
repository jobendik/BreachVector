import Phaser from 'phaser';
import { DEPTHS } from '../game/constants';
import type { HudState } from '../game/types';
import { cssColor } from '../utils/colors';

export class WeaponPanel {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private readonly ammo: Phaser.GameObjects.Text;
  private bounds = new Phaser.Geom.Rectangle();

  constructor(private readonly scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setScrollFactor(0).setDepth(DEPTHS.ui);
    this.label = scene.add.text(0, 0, '', this.textStyle(13, '#38bdf8')).setScrollFactor(0).setDepth(DEPTHS.ui + 1);
    this.ammo = scene.add.text(0, 0, '', this.textStyle(28, '#f8fafc')).setScrollFactor(0).setDepth(DEPTHS.ui + 1);
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.bounds.setTo(x, y, width, height);
    this.label.setPosition(x + 16, y + 14);
    this.ammo.setPosition(x + 16, y + 45);
  }

  update(state: HudState): void {
    const { x, y, width, height } = this.bounds;
    this.graphics.clear();
    this.graphics.fillStyle(0x07111f, 0.88);
    this.graphics.fillRoundedRect(x, y, width, height, 8);
    this.graphics.lineStyle(1, state.weaponColor, 0.42);
    this.graphics.strokeRoundedRect(x, y, width, height, 8);
    this.graphics.fillStyle(0xf59e0b, 0.85);
    this.graphics.fillRect(x, y + height - 4, width, 4);
    this.label.setText(state.weaponName.toUpperCase()).setColor(cssColor(state.weaponColor));
    this.ammo.setText(state.reloading ? 'RELOADING' : `${state.ammo} / ${state.reserveAmmo}`);
    this.ammo.setFontSize(state.reloading ? 20 : 28);

    for (let i = 0; i < state.maxGrenades; i += 1) {
      this.graphics.lineStyle(2, 0xf97316, i < state.grenades ? 1 : 0.38);
      this.graphics.fillStyle(0xf97316, i < state.grenades ? 0.75 : 0.04);
      this.graphics.fillCircle(x + width - 24 - i * 24, y + height - 24, 7);
      this.graphics.strokeCircle(x + width - 24 - i * 24, y + height - 24, 7);
    }

    if (state.reloading) {
      this.graphics.fillStyle(0xf59e0b, 0.35);
      this.graphics.fillRect(x + 16, y + height - 16, (width - 32) * state.reloadRatio, 3);
    }
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
