import Phaser from 'phaser';
import { levels } from '../data/levels';
import { COLORS } from '../game/constants';
import { saveSectorReport, type ProgressUpdate } from '../game/progress';
import { loadRetention } from '../game/retention';
import type { SectorReport } from '../game/types';
import { cssColor } from '../utils/colors';

interface VictoryData {
  levelIndex?: number;
  report?: SectorReport;
}

export class VictoryScene extends Phaser.Scene {
  private uplink!: Phaser.GameObjects.Graphics;

  constructor() {
    super('VictoryScene');
  }

  create(data: VictoryData): void {
    const levelIndex = data.levelIndex ?? data.report?.levelIndex ?? 0;
    const nextLevel = levelIndex + 1;
    const complete = nextLevel >= levels.length;
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.blacksiteNavy);
    this.add.rectangle(width / 2, height / 2, width, height, 0x04140f, 1);
    this.uplink = this.add.graphics();

    this.add
      .text(
        width / 2,
        height * 0.15,
        complete ? 'CAMPAIGN COMPLETE' : 'SECTOR CLEAR',
        this.textStyle(complete ? 42 : 50, cssColor(COLORS.operatorGreenBright), '900')
      )
      .setOrigin(0.5);
    this.add
      .text(
        width / 2,
        height * 0.23,
        complete
          ? 'Command network neutralized. Extraction window stable.'
          : 'Objective complete. Review performance and advance.',
        {
          ...this.textStyle(14, cssColor(COLORS.textMuted), '700'),
          align: 'center'
        }
      )
      .setOrigin(0.5);

    const progressUpdate = data.report ? saveSectorReport(data.report) : undefined;
    this.drawScoreBanner(data.report, progressUpdate);
    this.drawReport(data.report, progressUpdate);
    this.drawReturnHook();
    if (!complete) {
      this.button(width / 2 - 150, height - 96, 'NEXT SECTOR', () =>
        this.scene.start('GameScene', { levelIndex: nextLevel })
      );
    }
    this.button(width / 2 + (complete ? 0 : 150), height - 96, 'RETURN TO MENU', () => this.scene.start('MenuScene'));
  }

  update(time: number): void {
    this.drawUplink(time / 1000);
  }

  private drawScoreBanner(report?: SectorReport, progressUpdate?: ProgressUpdate): void {
    if (!report) {
      return;
    }
    const totalScore = Math.max(0, Math.floor(Number(report.score) || 0));
    const { width, height } = this.scale;
    const scoreText = this.add
      .text(
        width / 2,
        height * 0.285,
        'OPERATION SCORE 0',
        this.textStyle(26, cssColor(COLORS.hazardAmberBright), '900')
      )
      .setOrigin(0.5);
    const counter = { value: 0 };
    this.tweens.add({
      targets: counter,
      value: totalScore,
      duration: 1100,
      ease: 'Cubic.easeOut',
      onUpdate: () => scoreText.setText(`OPERATION SCORE ${Math.round(counter.value).toLocaleString('en-US')}`),
      onComplete: () => {
        scoreText.setText(`OPERATION SCORE ${totalScore.toLocaleString('en-US')}`);
        if (progressUpdate?.newBestScore) {
          const badge = this.add
            .text(
              width / 2,
              height * 0.285 + 48,
              'NEW HIGH SCORE',
              this.textStyle(15, cssColor(COLORS.energyVioletBright), '900')
            )
            .setOrigin(0.5)
            .setScale(0.4);
          this.tweens.add({ targets: badge, scale: 1, duration: 220, ease: 'Back.easeOut' });
          this.tweens.add({ targets: badge, alpha: 0.45, duration: 520, yoyo: true, repeat: -1 });
        }
      }
    });

    const b = report.scoreBreakdown;
    const parts = b
      ? [
          `COMBAT ${b.combatScore.toLocaleString('en-US')}`,
          b.stealthBonus > 0 ? `STEALTH +${b.stealthBonus}` : '',
          b.accuracyBonus > 0 ? `ACCURACY +${b.accuracyBonus}` : '',
          b.timeBonus > 0 ? `SPEED +${b.timeBonus}` : '',
          b.untouchableBonus > 0 ? `UNTOUCHABLE +${b.untouchableBonus}` : ''
        ].filter(Boolean)
      : [];
    this.add
      .text(
        width / 2,
        height * 0.285 + 26,
        parts.join('   '),
        this.textStyle(12, cssColor(COLORS.systemCyanSoft), '700')
      )
      .setOrigin(0.5);
  }

  private drawReturnHook(): void {
    const { width, height } = this.scale;
    const retention = loadRetention();
    const streak = Math.max(1, retention.streakDays);
    this.add
      .text(
        width / 2,
        height - 26,
        `OPERATIVE STREAK: DAY ${streak}  /  Return tomorrow to extend your streak`,
        this.textStyle(12, cssColor(COLORS.operatorGreenSoft), '700')
      )
      .setOrigin(0.5);
  }

  private drawReport(report?: SectorReport, progressUpdate?: ProgressUpdate): void {
    const { width, height } = this.scale;
    const x = width / 2 - 342;
    const y = height * 0.36;
    const panelWidth = 684;
    const panelHeight = 270;
    const g = this.add.graphics();
    g.fillStyle(COLORS.blacksitePanel, 0.86);
    g.fillRoundedRect(x, y, panelWidth, panelHeight, 8);
    g.lineStyle(1, COLORS.operatorGreenBright, 0.56);
    g.strokeRoundedRect(x, y, panelWidth, panelHeight, 8);
    g.fillStyle(COLORS.operatorGreenBright, 0.74);
    g.fillRect(x, y, 4, panelHeight);

    const grade = report?.grade ?? 'B';
    this.add.text(x + 32, y + 26, grade, this.textStyle(76, cssColor(this.gradeColor(grade)), '900'));
    this.add.text(x + 118, y + 42, 'SECTOR GRADE', this.textStyle(15, cssColor(COLORS.operatorGreenSoft), '900'));
    this.add.text(
      x + 118,
      y + 72,
      report?.stealthRating ?? 'Compromised',
      this.textStyle(22, cssColor(COLORS.systemCyanSoft), '900')
    );

    const stats = report
      ? [
          `Sector: ${report.levelName}`,
          `Clear time: ${this.formatTime(report.completionTimeSeconds)}`,
          `Damage taken: ${Math.round(report.damageTaken)}`,
          `Accuracy: ${Math.round(report.accuracy * 100)}% (${report.shotsHit}/${report.shotsFired})`,
          `Objectives: ${report.objectivesCompleted}/${report.objectivesTotal}`,
          `Hostiles neutralized: ${report.enemiesKilled}/${report.enemiesTotal}`
        ]
      : ['Sector telemetry unavailable.'];
    this.add.text(x + 32, y + 130, stats.join('\n'), {
      ...this.textStyle(13, cssColor(COLORS.textMuted), '700'),
      lineSpacing: 8
    });

    const breakdown = report ? this.formatBreakdown(report.killBreakdown) : 'No kill telemetry.';
    this.add.text(x + 384, y + 42, `KILL BREAKDOWN\n${breakdown}`, {
      ...this.textStyle(13, cssColor(COLORS.hazardAmberBright), '700'),
      lineSpacing: 8,
      wordWrap: { width: 250 }
    });
    this.add.text(x + 384, y + 178, `NEXT SECTOR PREVIEW\n${this.nextSectorPreview(report?.levelIndex ?? 0)}`, {
      ...this.textStyle(13, cssColor(COLORS.systemCyanSoft), '700'),
      lineSpacing: 8,
      wordWrap: { width: 250 }
    });

    if (progressUpdate) {
      const bestLines = [
        progressUpdate.firstClear ? 'FIRST CLEAR RECORDED' : 'BESTS UPDATED',
        `Best grade: ${progressUpdate.sector.bestGrade}${progressUpdate.newBestGrade ? '  NEW' : ''}`,
        `Best time: ${this.formatTime(progressUpdate.sector.bestTimeSeconds)}${
          progressUpdate.newBestTime ? '  NEW' : ''
        }`,
        `Best stealth: ${progressUpdate.sector.bestStealthRating}${progressUpdate.newBestStealth ? '  NEW' : ''}`,
        `Best score: ${progressUpdate.sector.bestScore.toLocaleString('en-US')}${progressUpdate.newBestScore ? '  NEW' : ''}`,
        `Completions: ${progressUpdate.sector.completions}`
      ];
      this.add.text(x + 32, y + panelHeight + 12, bestLines.join('  /  '), {
        ...this.textStyle(11, cssColor(COLORS.operatorGreenSoft), '700'),
        wordWrap: { width: 330 }
      });
    }
  }

  private drawUplink(timeSeconds: number): void {
    const { width, height } = this.scale;
    this.uplink.clear();
    const cx = width / 2;
    const cy = height * 0.52;
    this.uplink.lineStyle(1, COLORS.operatorGreenBright, 0.12);
    for (let i = 0; i < 4; i += 1) {
      const radius = 95 + i * 32 + ((timeSeconds * 26) % 32);
      this.uplink.strokeCircle(cx, cy, radius);
    }
    this.uplink.lineStyle(2, COLORS.systemCyan, 0.16);
    this.uplink.lineBetween(cx - 260, cy, cx + 260, cy);
    this.uplink.lineBetween(cx, cy - 150, cx, cy + 150);
  }

  private button(x: number, y: number, label: string, onClick: () => void): void {
    const bg = this.add
      .rectangle(x, y, 250, 44, COLORS.blacksitePanelLight, 0.96)
      .setStrokeStyle(2, COLORS.operatorGreenBright, 0.55);
    const text = this.add
      .text(x, y, label, this.textStyle(14, cssColor(COLORS.operatorGreenSoft), '900'))
      .setOrigin(0.5);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      bg.setFillStyle(COLORS.operatorGreenBright, 0.9);
      text.setColor(cssColor(COLORS.blacksiteNavy));
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(COLORS.blacksitePanelLight, 0.96);
      text.setColor(cssColor(COLORS.operatorGreenSoft));
    });
    bg.on('pointerdown', onClick);
  }

  private formatBreakdown(breakdown: Record<string, number>): string {
    const entries = Object.entries(breakdown);
    if (entries.length === 0) {
      return 'No hostiles neutralized.';
    }
    return entries
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => `${label}: ${count}`)
      .join('\n');
  }

  private nextSectorPreview(levelIndex: number): string {
    const next = levels[levelIndex + 1];
    if (!next) {
      return 'All available sectors cleared.';
    }
    const firstSentence = next.briefing.split(/(?<=\.)\s/)[0] ?? next.briefing;
    const teaser = firstSentence.length > 84 ? `${firstSentence.slice(0, 81).trimEnd()}...` : firstSentence;
    return `${next.name}\n${teaser}`;
  }

  private gradeColor(grade: string): number {
    if (grade === 'S') return COLORS.energyVioletBright;
    if (grade === 'A') return COLORS.operatorGreenBright;
    if (grade === 'B') return COLORS.systemCyan;
    return COLORS.hazardAmberBright;
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
