import Phaser from 'phaser';
import { GAME_TITLE } from '../game/constants';
import { levels } from '../data/levels';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x020617);
    this.drawBackdrop();

    const width = this.scale.width;
    const height = this.scale.height;
    this.add
      .text(width / 2, height * 0.18, GAME_TITLE, {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: `${Math.min(54, width / 16)}px`,
        fontStyle: '900',
        color: '#34d399',
        stroke: '#020617',
        strokeThickness: 8,
        align: 'center'
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.29, 'NEON TACTICAL BLACKSITE BREACH PROTOTYPE', {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: '15px',
        fontStyle: '700',
        color: '#bae6fd',
        align: 'center'
      })
      .setOrigin(0.5);

    const briefing = `${levels[0].briefing}\n\nWASD move  |  Mouse aim  |  LMB fire  |  RMB grenade  |  R reload  |  Space dash\nShift slow walk  |  E hack/open  |  F takedown  |  1-4 weapons  |  Tab debug`;
    this.add
      .text(width / 2, height * 0.48, briefing, {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: '14px',
        lineSpacing: 8,
        color: '#cbd5e1',
        align: 'center',
        wordWrap: { width: Math.min(840, width - 80) }
      })
      .setOrigin(0.5);

    this.button(width / 2, height * 0.73, 'INITIATE BREACH', () => {
      this.scene.start('GameScene', { levelIndex: 0 });
    });

    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('GameScene', { levelIndex: 0 }));
  }

  private drawBackdrop(): void {
    const g = this.add.graphics();
    const width = this.scale.width;
    const height = this.scale.height;
    g.fillGradientStyle(0x020617, 0x07111f, 0x020617, 0x0f172a, 1);
    g.fillRect(0, 0, width, height);
    g.lineStyle(1, 0x38bdf8, 0.08);
    for (let x = 0; x < width; x += 48) {
      g.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 48) {
      g.lineBetween(0, y, width, y);
    }
    g.fillStyle(0x10b981, 0.1);
    g.fillCircle(width * 0.16, height * 0.24, 180);
    g.fillStyle(0xef4444, 0.08);
    g.fillCircle(width * 0.84, height * 0.7, 220);
  }

  private button(x: number, y: number, label: string, onClick: () => void): void {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 280, 54, 0x10b981, 0.95).setStrokeStyle(2, 0xa7f3d0, 0.9);
    const text = this.add
      .text(0, 0, label, {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: '16px',
        fontStyle: '900',
        color: '#02130d'
      })
      .setOrigin(0.5);
    container.add([bg, text]);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => container.setScale(1.04));
    bg.on('pointerout', () => container.setScale(1));
    bg.on('pointerdown', onClick);
  }
}
