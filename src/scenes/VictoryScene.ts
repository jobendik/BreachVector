import Phaser from 'phaser';
import { levels } from '../data/levels';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create(data: { levelIndex?: number }): void {
    const levelIndex = data.levelIndex ?? 0;
    const nextLevel = levelIndex + 1;
    const complete = nextLevel >= levels.length;
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x020617);
    this.add.rectangle(width / 2, height / 2, width, height, 0x04140f, 1);
    this.add
      .text(width / 2, height / 2 - 105, complete ? 'CAMPAIGN COMPLETE' : 'SECTOR CLEAR', {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: complete ? '42px' : '48px',
        fontStyle: '900',
        color: '#34d399'
      })
      .setOrigin(0.5);
    this.add
      .text(
        width / 2,
        height / 2 - 38,
        complete ? 'All blacksite sectors breached. Command network neutralized.' : 'Objective complete. Advance to the next sector.',
        {
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: '14px',
          color: '#cbd5e1',
          align: 'center'
        }
      )
      .setOrigin(0.5);

    if (!complete) {
      this.button(width / 2, height / 2 + 54, 'NEXT SECTOR', () => this.scene.start('GameScene', { levelIndex: nextLevel }));
    }
    this.button(width / 2, height / 2 + (complete ? 54 : 112), 'RETURN TO MENU', () => this.scene.start('MenuScene'));
  }

  private button(x: number, y: number, label: string, onClick: () => void): void {
    const bg = this.add.rectangle(x, y, 250, 44, 0x0f172a, 0.96).setStrokeStyle(2, 0x34d399, 0.55);
    this.add
      .text(x, y, label, {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: '14px',
        fontStyle: '900',
        color: '#dcfce7'
      })
      .setOrigin(0.5);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', onClick);
  }
}
