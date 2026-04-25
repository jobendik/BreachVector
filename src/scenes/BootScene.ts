import Phaser from 'phaser';
import { COLORS } from '../game/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.scene.start('PreloadScene');
  }
}
