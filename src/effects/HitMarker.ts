import Phaser from 'phaser';
import { DEPTHS } from '../game/constants';

export class HitMarker extends Phaser.GameObjects.Graphics {
  constructor(scene: Phaser.Scene, x: number, y: number, color = 0xe5eefb) {
    super(scene);
    scene.add.existing(this);
    this.setPosition(x, y);
    this.setDepth(DEPTHS.effects);
    this.lineStyle(2, color, 0.9);
    this.beginPath();
    this.moveTo(-6, -6);
    this.lineTo(6, 6);
    this.moveTo(6, -6);
    this.lineTo(-6, 6);
    this.strokePath();
    scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 1.8,
      duration: 180,
      onComplete: () => this.destroy()
    });
  }
}
