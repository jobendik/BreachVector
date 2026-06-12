import Phaser from 'phaser';
import { COLORS, DEPTHS } from '../game/constants';
import { cssColor } from '../utils/colors';

export class ScorePanel {
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly comboText: Phaser.GameObjects.Text;
  private readonly comboBar: Phaser.GameObjects.Graphics;
  private readonly streakText: Phaser.GameObjects.Text;
  private comboBarTween?: Phaser.Tweens.Tween;
  private streakTween?: Phaser.Tweens.TweenChain;
  private comboRatio = { value: 0 };
  private centerX = 0;
  private topY = 20;
  private displayedScore = 0;

  constructor(private readonly scene: Phaser.Scene) {
    this.scoreText = scene.add
      .text(0, 0, 'SCORE 0', this.style(20, cssColor(COLORS.hazardAmberBright)))
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(DEPTHS.ui + 60);
    this.comboText = scene.add
      .text(0, 0, '', this.style(15, cssColor(COLORS.systemCyanSoft)))
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(DEPTHS.ui + 60)
      .setVisible(false);
    this.comboBar = scene.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(DEPTHS.ui + 60);
    this.streakText = scene.add
      .text(0, 0, '', {
        ...this.style(40, cssColor(COLORS.hazardAmberBright)),
        stroke: cssColor(COLORS.blacksiteNavy),
        strokeThickness: 8
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DEPTHS.ui + 220)
      .setVisible(false);
  }

  layout(centerX: number, topY: number, streakY: number): void {
    this.centerX = centerX;
    this.topY = topY;
    this.scoreText.setPosition(centerX, topY);
    this.comboText.setPosition(centerX, topY + 30);
    this.streakText.setPosition(centerX, streakY);
    this.drawComboBar();
  }

  updateScore(payload: {
    score: number;
    chain: number;
    multiplier: number;
    comboRemainingSeconds: number;
    comboWindowSeconds: number;
    delta: number;
  }): void {
    this.displayedScore = payload.score;
    this.scoreText.setText(`SCORE ${payload.score.toLocaleString('en-US')}`);
    if (payload.delta > 0) {
      this.scene.tweens.killTweensOf(this.scoreText);
      this.scoreText.setScale(1.18);
      this.scene.tweens.add({
        targets: this.scoreText,
        scale: 1,
        duration: 180,
        ease: 'Back.easeOut'
      });
    }

    const comboActive = payload.chain >= 2;
    this.comboText.setVisible(comboActive);
    if (comboActive) {
      this.comboText.setText(`COMBO x${payload.multiplier.toFixed(1).replace(/\.0$/, '')}`);
    }

    this.comboBarTween?.stop();
    this.comboBarTween = undefined;
    if (payload.chain >= 1 && payload.comboRemainingSeconds > 0) {
      this.comboRatio.value = payload.comboRemainingSeconds / payload.comboWindowSeconds;
      this.comboBarTween = this.scene.tweens.add({
        targets: this.comboRatio,
        value: 0,
        duration: payload.comboRemainingSeconds * 1000,
        onUpdate: () => this.drawComboBar(),
        onComplete: () => {
          this.comboText.setVisible(false);
          this.drawComboBar();
        }
      });
    } else {
      this.comboRatio.value = 0;
      this.comboText.setVisible(false);
      this.drawComboBar();
    }
  }

  announceStreak(label: string, chain: number): void {
    this.streakTween?.stop();
    this.streakTween = undefined;
    this.streakText.setText(label).setVisible(true).setAlpha(1).setScale(0.4);
    this.streakText.setColor(cssColor(chain >= 4 ? COLORS.alertRed : COLORS.hazardAmberBright));
    this.streakTween = this.scene.tweens.chain({
      targets: this.streakText,
      tweens: [
        { scale: 1.06, duration: 160, ease: 'Back.easeOut' },
        { scale: 1, duration: 90 },
        { alpha: 0, duration: 420, delay: 620, ease: 'Cubic.easeIn' }
      ],
      onComplete: () => this.streakText.setVisible(false)
    });
  }

  destroy(): void {
    this.comboBarTween?.stop();
    this.streakTween?.stop();
    this.scene.tweens.killTweensOf(this.scoreText);
    this.scoreText.destroy();
    this.comboText.destroy();
    this.comboBar.destroy();
    this.streakText.destroy();
  }

  private drawComboBar(): void {
    this.comboBar.clear();
    if (this.comboRatio.value <= 0) {
      return;
    }
    const barWidth = 150;
    const x = this.centerX - barWidth / 2;
    const y = this.topY + 52;
    this.comboBar.fillStyle(COLORS.blacksitePanel, 0.7);
    this.comboBar.fillRect(x, y, barWidth, 5);
    this.comboBar.fillStyle(COLORS.systemCyan, 0.9);
    this.comboBar.fillRect(x, y, barWidth * this.comboRatio.value, 5);
  }

  private style(size: number, color: string): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: `${size}px`,
      fontStyle: '900',
      color,
      stroke: cssColor(COLORS.blacksiteNavy),
      strokeThickness: 4
    };
  }
}
