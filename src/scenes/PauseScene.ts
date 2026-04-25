import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  private levelIndex = 0;

  constructor() {
    super('PauseScene');
  }

  create(data: { levelIndex?: number }): void {
    this.levelIndex = data.levelIndex ?? 0;
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x020617, 0.66);
    this.add
      .text(width / 2, height / 2 - 130, 'PAUSED', {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: '42px',
        fontStyle: '900',
        color: '#bae6fd'
      })
      .setOrigin(0.5);
    this.button(width / 2, height / 2 - 40, 'RESUME', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });
    this.button(width / 2, height / 2 + 28, 'RESTART SECTOR', () => {
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('GameScene', { levelIndex: this.levelIndex });
    });
    this.button(width / 2, height / 2 + 96, 'RETURN TO MENU', () => {
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    });
    this.input.keyboard?.once('keydown-ESC', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });
  }

  private button(x: number, y: number, label: string, onClick: () => void): void {
    const bg = this.add.rectangle(x, y, 250, 46, 0x0f172a, 0.96).setStrokeStyle(2, 0x38bdf8, 0.45);
    this.add
      .text(x, y, label, {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: '14px',
        fontStyle: '900',
        color: '#e0f2fe'
      })
      .setOrigin(0.5);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => bg.setFillStyle(0x164e63, 0.98));
    bg.on('pointerout', () => bg.setFillStyle(0x0f172a, 0.96));
    bg.on('pointerdown', onClick);
  }
}
