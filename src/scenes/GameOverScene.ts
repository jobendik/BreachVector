import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: { levelIndex?: number }): void {
    const levelIndex = data.levelIndex ?? 0;
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x020617);
    this.add.rectangle(width / 2, height / 2, width, height, 0x1e0b12, 1);
    this.add
      .text(width / 2, height / 2 - 96, 'SIGNAL LOST', {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: '48px',
        fontStyle: '900',
        color: '#ef4444'
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 - 34, 'Operator down. Restart the sector and adjust your approach.', {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: '14px',
        color: '#cbd5e1',
        align: 'center'
      })
      .setOrigin(0.5);
    this.button(width / 2, height / 2 + 54, 'RESTART SECTOR', () => this.scene.start('GameScene', { levelIndex }));
    this.button(width / 2, height / 2 + 112, 'MENU', () => this.scene.start('MenuScene'));
  }

  private button(x: number, y: number, label: string, onClick: () => void): void {
    const bg = this.add.rectangle(x, y, 240, 44, 0x0f172a, 0.96).setStrokeStyle(2, 0xef4444, 0.45);
    this.add
      .text(x, y, label, {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: '14px',
        fontStyle: '900',
        color: '#fee2e2'
      })
      .setOrigin(0.5);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', onClick);
  }
}
