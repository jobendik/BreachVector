import Phaser from 'phaser';
import { DEPTHS } from '../game/constants';

export class MuzzleFlash extends Phaser.GameObjects.Graphics {
  constructor(scene: Phaser.Scene, x: number, y: number, angle: number, color: number) {
    super(scene);
    scene.add.existing(this);
    this.setDepth(DEPTHS.effects);
    this.setPosition(x, y);
    this.setRotation(angle);
    this.fillStyle(color, 0.9);
    this.beginPath();
    this.moveTo(0, 0);
    this.lineTo(34, -7);
    this.lineTo(48, 0);
    this.lineTo(34, 7);
    this.closePath();
    this.fillPath();
    this.fillStyle(0xffffff, 0.75);
    this.fillCircle(12, 0, 5);
    scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 1.4,
      scaleY: 0.35,
      duration: 95,
      onComplete: () => this.destroy()
    });
  }
}
