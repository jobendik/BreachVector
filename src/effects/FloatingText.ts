import Phaser from 'phaser';
import { DEPTHS } from '../game/constants';

export class FloatingText extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, x: number, y: number, value: string, color: string) {
    super(scene, x, y, value, {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: '15px',
      fontStyle: '700',
      color,
      stroke: '#020617',
      strokeThickness: 3
    });
    scene.add.existing(this);
    this.setOrigin(0.5);
    this.setDepth(DEPTHS.effects);
    scene.tweens.add({
      targets: this,
      y: y - 34,
      alpha: 0,
      duration: 720,
      ease: 'Cubic.easeOut',
      onComplete: () => this.destroy()
    });
  }
}
