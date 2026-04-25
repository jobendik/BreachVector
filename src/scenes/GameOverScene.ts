import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import type { SectorReport } from '../game/types';
import { cssColor } from '../utils/colors';

interface GameOverData {
  levelIndex?: number;
  report?: SectorReport;
}

export class GameOverScene extends Phaser.Scene {
  private signal!: Phaser.GameObjects.Graphics;

  constructor() {
    super('GameOverScene');
  }

  create(data: GameOverData): void {
    const levelIndex = data.levelIndex ?? data.report?.levelIndex ?? 0;
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.blacksiteNavy);
    this.add.rectangle(width / 2, height / 2, width, height, 0x1e0b12, 1);
    this.signal = this.add.graphics();

    this.add
      .text(width / 2, height * 0.16, 'SIGNAL LOST', this.textStyle(50, cssColor(COLORS.alertRed), '900'))
      .setOrigin(0.5);
    this.add
      .text(width / 2, height * 0.24, 'Operator telemetry terminated. Review the failure pattern and re-breach.', {
        ...this.textStyle(14, cssColor(COLORS.textMuted), '700'),
        align: 'center'
      })
      .setOrigin(0.5);

    this.drawReport(data.report);
    this.button(width / 2 - 150, height - 96, 'RESTART SECTOR', () => this.scene.start('GameScene', { levelIndex }));
    this.button(width / 2 + 150, height - 96, 'SECTOR SELECT', () => this.scene.start('MenuScene'));
    this.button(width / 2, height - 42, 'MENU', () => this.scene.start('MenuScene'));
  }

  update(time: number): void {
    this.drawSignalLoss(time / 1000);
  }

  private drawReport(report?: SectorReport): void {
    const { width, height } = this.scale;
    const x = width / 2 - 325;
    const y = height * 0.32;
    const panelWidth = 650;
    const panelHeight = 230;
    const g = this.add.graphics();
    g.fillStyle(COLORS.blacksitePanel, 0.86);
    g.fillRoundedRect(x, y, panelWidth, panelHeight, 8);
    g.lineStyle(1, COLORS.alertRed, 0.56);
    g.strokeRoundedRect(x, y, panelWidth, panelHeight, 8);
    g.fillStyle(COLORS.alertRed, 0.7);
    g.fillRect(x, y, 4, panelHeight);

    const cause = report?.deathCause ?? 'Unknown hostile action';
    const advice =
      report?.tacticalAdvice ?? 'Keep moving between cover, slow-walk before contact, and avoid open sightlines.';
    const stats = report
      ? [
          `Sector: ${report.levelName}`,
          `Killed by: ${cause}`,
          `Time survived: ${this.formatTime(report.completionTimeSeconds)}`,
          `Damage taken: ${Math.round(report.damageTaken)}`,
          `Hostiles neutralized: ${report.enemiesKilled}/${report.enemiesTotal}`,
          `Accuracy: ${Math.round(report.accuracy * 100)}% (${report.shotsHit}/${report.shotsFired})`,
          `Objectives complete: ${report.objectivesCompleted}/${report.objectivesTotal}`
        ]
      : ['Sector telemetry unavailable.'];

    this.add.text(x + 26, y + 22, 'DEATH RECAP', this.textStyle(15, cssColor(COLORS.alertRedSoft), '900'));
    this.add.text(x + 26, y + 58, stats.join('\n'), {
      ...this.textStyle(13, cssColor(COLORS.textMuted), '700'),
      lineSpacing: 8
    });
    this.add.text(x + 350, y + 58, `TACTICAL ADVICE\n${advice}`, {
      ...this.textStyle(13, cssColor(COLORS.hazardAmberBright), '700'),
      lineSpacing: 8,
      wordWrap: { width: 255 }
    });
  }

  private drawSignalLoss(timeSeconds: number): void {
    const { width, height } = this.scale;
    this.signal.clear();
    for (let y = 0; y < height; y += 18) {
      const alpha = 0.025 + Math.sin(timeSeconds * 7 + y * 0.04) * 0.015;
      this.signal.fillStyle(COLORS.alertRed, alpha);
      this.signal.fillRect(0, y, width, 2);
    }
    const tearY = (timeSeconds * 90) % height;
    this.signal.fillStyle(COLORS.textPrimary, 0.05);
    this.signal.fillRect(0, tearY, width, 10);
  }

  private button(x: number, y: number, label: string, onClick: () => void): void {
    const bg = this.add
      .rectangle(x, y, 240, 44, COLORS.blacksitePanelLight, 0.96)
      .setStrokeStyle(2, COLORS.alertRed, 0.48);
    const text = this.add.text(x, y, label, this.textStyle(14, cssColor(COLORS.alertRedSoft), '900')).setOrigin(0.5);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      bg.setFillStyle(COLORS.alertRed, 0.9);
      text.setColor(cssColor(COLORS.blacksiteNavy));
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(COLORS.blacksitePanelLight, 0.96);
      text.setColor(cssColor(COLORS.alertRedSoft));
    });
    bg.on('pointerdown', onClick);
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);
    return `${minutes}:${remaining.toString().padStart(2, '0')}`;
  }

  private textStyle(size: number, color: string, weight: string): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: `${size}px`,
      fontStyle: weight,
      color
    };
  }
}
