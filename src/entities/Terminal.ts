import Phaser from 'phaser';
import { COLORS, DEPTHS, TextureKeys } from '../game/constants';
import type { TerminalData } from '../game/types';

export class Terminal extends Phaser.Physics.Arcade.Sprite {
  readonly terminalId: string;
  readonly prompt: string;
  readonly hackTime: number;
  private readonly idleTween: Phaser.Tweens.Tween;
  hacked = false;
  progress = 0;

  constructor(scene: Phaser.Scene, data: TerminalData) {
    super(scene, data.x, data.y, TextureKeys.Terminal);
    this.terminalId = data.id;
    this.prompt = data.prompt;
    this.hackTime = data.hackTime;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setCircle(18);
    this.setDepth(DEPTHS.terminals);
    this.idleTween = scene.tweens.add({
      targets: this,
      alpha: 0.82,
      duration: 880,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  advance(deltaSeconds: number): boolean {
    if (this.hacked) {
      return true;
    }
    this.progress = Phaser.Math.Clamp(this.progress + deltaSeconds, 0, this.hackTime);
    if (this.progress >= this.hackTime) {
      this.hacked = true;
      this.idleTween.stop();
      this.setTint(COLORS.operatorGreenBright);
      this.setAlpha(1);
      return true;
    }
    return false;
  }

  relax(deltaSeconds: number): void {
    if (!this.hacked) {
      this.progress = Math.max(0, this.progress - deltaSeconds * 1.4);
    }
  }

  destroy(fromScene?: boolean): void {
    this.idleTween.stop();
    super.destroy(fromScene);
  }
}
