import Phaser from 'phaser';
import { DEPTHS } from '../game/constants';

export class ScreenEffects {
  private readonly vignette: Phaser.GameObjects.Graphics;

  constructor(private readonly scene: Phaser.Scene) {
    this.vignette = scene.add.graphics();
    this.vignette.setScrollFactor(0);
    this.vignette.setDepth(DEPTHS.ui - 10);
  }

  updateLowHealth(healthRatio: number): void {
    const camera = this.scene.cameras.main;
    this.vignette.clear();
    if (healthRatio > 0.35) {
      return;
    }
    const alpha = Phaser.Math.Linear(0.04, 0.28, 1 - healthRatio / 0.35);
    this.vignette.fillGradientStyle(0xef4444, 0xef4444, 0x020617, 0x020617, alpha, alpha, 0, 0);
    this.vignette.fillRect(0, 0, camera.width, camera.height);
  }

  destroy(): void {
    this.vignette.destroy();
  }
}
