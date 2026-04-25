import Phaser from 'phaser';
import { COLORS, DEPTHS } from '../game/constants';
import type { HudState } from '../game/types';
import { cssColor } from '../utils/colors';

export class WeaponPanel {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private readonly ammo: Phaser.GameObjects.Text;
  private readonly meta: Phaser.GameObjects.Text;
  private bounds = new Phaser.Geom.Rectangle();

  constructor(private readonly scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setScrollFactor(0).setDepth(DEPTHS.ui);
    this.label = scene.add
      .text(0, 0, '', this.textStyle(13, '#38bdf8'))
      .setScrollFactor(0)
      .setDepth(DEPTHS.ui + 1);
    this.ammo = scene.add
      .text(0, 0, '', this.textStyle(28, '#f8fafc'))
      .setScrollFactor(0)
      .setDepth(DEPTHS.ui + 1);
    this.meta = scene.add
      .text(0, 0, '', this.textStyle(10, '#94a3b8'))
      .setScrollFactor(0)
      .setDepth(DEPTHS.ui + 1);
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.bounds.setTo(x, y, width, height);
    this.label.setPosition(x + 16, y + 14);
    this.ammo.setPosition(x + 16, y + 45);
    this.meta.setPosition(x + 166, y + 18);
  }

  update(state: HudState): void {
    const { x, y, width, height } = this.bounds;
    const ammoRatio = state.ammo / Math.max(1, state.magazineSize);
    const lowAmmo = ammoRatio <= 0.25 && !state.reloading;
    this.graphics.clear();
    this.graphics.fillStyle(COLORS.blacksitePanel, 0.88);
    this.graphics.fillRoundedRect(x, y, width, height, 8);
    this.graphics.lineStyle(1, lowAmmo ? COLORS.alertRed : state.weaponColor, lowAmmo ? 0.78 : 0.42);
    this.graphics.strokeRoundedRect(x, y, width, height, 8);
    this.graphics.fillStyle(lowAmmo ? COLORS.alertRed : COLORS.hazardAmber, 0.85);
    this.graphics.fillRect(x, y + height - 4, width, 4);
    this.drawWeaponSilhouette(x + width - 78, y + 42, state);
    this.label.setText(state.weaponName.toUpperCase()).setColor(cssColor(state.weaponColor));
    this.ammo.setText(
      state.reloading
        ? 'RELOADING'
        : lowAmmo
          ? `LOW ${state.ammo} / ${state.reserveAmmo}`
          : `${state.ammo} / ${state.reserveAmmo}`
    );
    this.ammo.setFontSize(state.reloading ? 20 : 28);
    this.ammo.setColor(lowAmmo ? cssColor(COLORS.alertRedSoft) : cssColor(COLORS.textBright));
    this.meta
      .setText(`${state.weaponFireMode}  ${state.weaponNoiseLevel}`)
      .setColor(
        cssColor(
          state.weaponNoiseLevel === 'QUIET'
            ? COLORS.operatorGreenSoft
            : state.weaponNoiseLevel === 'BREACH'
              ? COLORS.hazardOrangeSoft
              : COLORS.hazardAmberBright
        )
      );

    this.drawMagazineTicks(x + 16, y + height - 30, width - 118, 8, state);
    this.drawNoiseMeter(x + 166, y + 43, 72, 8, state.weaponNoiseLevel);

    for (let i = 0; i < state.maxGrenades; i += 1) {
      this.graphics.lineStyle(2, COLORS.hazardOrange, i < state.grenades ? 1 : 0.38);
      this.graphics.fillStyle(COLORS.hazardOrange, i < state.grenades ? 0.75 : 0.04);
      this.graphics.fillCircle(x + width - 24 - i * 24, y + height - 24, 7);
      this.graphics.strokeCircle(x + width - 24 - i * 24, y + height - 24, 7);
      this.graphics.lineStyle(1, COLORS.hazardAmberBright, i < state.grenades ? 0.75 : 0.25);
      this.graphics.lineBetween(x + width - 24 - i * 24, y + height - 31, x + width - 20 - i * 24, y + height - 27);
    }

    if (state.reloading) {
      this.drawReloadArc(x + width - 46, y + 52, state.reloadRatio, state.weaponColor);
    }
  }

  private drawMagazineTicks(x: number, y: number, width: number, height: number, state: HudState): void {
    const tickCount = Math.min(state.magazineSize, 30);
    const gap = 2;
    const tickWidth = Math.max(2, (width - gap * (tickCount - 1)) / tickCount);
    for (let i = 0; i < tickCount; i += 1) {
      const filled = i < Math.ceil((state.ammo / Math.max(1, state.magazineSize)) * tickCount);
      this.graphics.fillStyle(filled ? state.weaponColor : COLORS.steelDark, filled ? 0.9 : 0.55);
      this.graphics.fillRoundedRect(x + i * (tickWidth + gap), y, tickWidth, height, 1);
    }
  }

  private drawNoiseMeter(
    x: number,
    y: number,
    width: number,
    height: number,
    level: HudState['weaponNoiseLevel']
  ): void {
    const fillRatio = level === 'QUIET' ? 0.28 : level === 'LOUD' ? 0.66 : 1;
    const color =
      level === 'QUIET' ? COLORS.operatorGreenSoft : level === 'LOUD' ? COLORS.hazardAmberBright : COLORS.hazardOrange;
    this.graphics.fillStyle(COLORS.blacksiteNavy, 0.9);
    this.graphics.fillRoundedRect(x, y, width, height, 3);
    this.graphics.fillStyle(color, 0.76);
    this.graphics.fillRoundedRect(x + 1, y + 1, (width - 2) * fillRatio, height - 2, 2);
  }

  private drawReloadArc(x: number, y: number, ratio: number, color: number): void {
    this.graphics.lineStyle(3, color, 0.85);
    this.graphics.beginPath();
    this.graphics.arc(x, y, 18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Phaser.Math.Clamp(ratio, 0, 1));
    this.graphics.strokePath();
  }

  private drawWeaponSilhouette(x: number, y: number, state: HudState): void {
    this.graphics.lineStyle(2, state.weaponColor, 0.9);
    this.graphics.fillStyle(state.weaponColor, 0.16);
    if (state.weaponId === 'scattergun') {
      this.graphics.fillRoundedRect(x - 28, y - 6, 42, 12, 2);
      this.graphics.strokeRoundedRect(x - 28, y - 6, 42, 12, 2);
      this.graphics.lineBetween(x + 12, y - 7, x + 30, y - 12);
      this.graphics.lineBetween(x + 12, y + 7, x + 30, y + 12);
      return;
    }
    if (state.weaponId === 'rail-piercer') {
      this.graphics.fillRoundedRect(x - 32, y - 5, 56, 10, 2);
      this.graphics.strokeRoundedRect(x - 32, y - 5, 56, 10, 2);
      this.graphics.lineStyle(1, COLORS.white, 0.7);
      this.graphics.lineBetween(x - 28, y, x + 34, y);
      return;
    }
    if (state.weaponId === 'silenced-pistol') {
      this.graphics.fillRoundedRect(x - 18, y - 5, 25, 10, 2);
      this.graphics.strokeRoundedRect(x - 18, y - 5, 25, 10, 2);
      this.graphics.lineBetween(x + 6, y, x + 27, y);
      return;
    }
    this.graphics.fillRoundedRect(x - 28, y - 4, 46, 8, 2);
    this.graphics.strokeRoundedRect(x - 28, y - 4, 46, 8, 2);
    this.graphics.lineBetween(x + 17, y, x + 31, y);
    this.graphics.lineBetween(x - 12, y + 4, x - 4, y + 13);
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
