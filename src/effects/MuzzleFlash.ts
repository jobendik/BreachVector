import Phaser from 'phaser';
import { DEPTHS } from '../game/constants';

export interface MuzzleFlashOptions {
  length?: number;
  width?: number;
  coreRadius?: number;
  duration?: number;
  stretch?: number;
  fadeScaleY?: number;
}

export class MuzzleFlash extends Phaser.GameObjects.Graphics {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    angle: number,
    color: number,
    options: MuzzleFlashOptions = {}
  ) {
    super(scene);
    scene.add.existing(this);
    const length = options.length ?? 48;
    const width = options.width ?? 7;
    const coreRadius = options.coreRadius ?? 5;
    const duration = options.duration ?? 95;
    const stretch = options.stretch ?? 1.4;
    const fadeScaleY = options.fadeScaleY ?? 0.35;

    this.setDepth(DEPTHS.effects);
    this.setPosition(x, y);
    this.setRotation(angle);
    this.fillStyle(color, 0.9);
    this.beginPath();
    this.moveTo(0, 0);
    this.lineTo(length * 0.7, -width);
    this.lineTo(length, 0);
    this.lineTo(length * 0.7, width);
    this.closePath();
    this.fillPath();
    this.fillStyle(0xffffff, 0.75);
    this.fillCircle(length * 0.25, 0, coreRadius);
    scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: stretch,
      scaleY: fadeScaleY,
      duration,
      onComplete: () => this.destroy()
    });
  }
}
