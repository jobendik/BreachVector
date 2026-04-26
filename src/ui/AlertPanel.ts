import Phaser from 'phaser';
import { COLORS, DEPTHS } from '../game/constants';
import type { HudState } from '../game/types';
import { cssColor } from '../utils/colors';

export class AlertPanel {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly title: Phaser.GameObjects.Text;
  private readonly detail: Phaser.GameObjects.Text;
  private bounds = new Phaser.Geom.Rectangle();

  constructor(private readonly scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setScrollFactor(0).setDepth(DEPTHS.ui);
    this.title = scene.add
      .text(0, 0, '', this.textStyle(20, '#94a3b8'))
      .setScrollFactor(0)
      .setDepth(DEPTHS.ui + 1);
    this.detail = scene.add
      .text(0, 0, '', this.textStyle(11, '#94a3b8'))
      .setScrollFactor(0)
      .setDepth(DEPTHS.ui + 1);
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.bounds.setTo(x, y, width, height);
    this.title.setPosition(x + 16, y + 16);
    this.detail.setPosition(x + 16, y + 52);
  }

  update(state: HudState): void {
    const { x, y, width, height } = this.bounds;
    const color =
      state.alertState === 'detected'
        ? COLORS.alertRed
        : state.alertState === 'searching'
          ? COLORS.hazardAmber
          : COLORS.systemCyan;
    const pulse =
      state.alertState === 'detected'
        ? 0.62 + Math.sin(Date.now() / 95) * 0.22
        : state.alertState === 'searching'
          ? 0.48
          : 0.28;
    this.graphics.clear();
    this.graphics.fillStyle(COLORS.blacksitePanel, 0.88);
    this.graphics.fillRoundedRect(x, y, width, height, 8);
    this.graphics.lineStyle(1, color, pulse);
    this.graphics.strokeRoundedRect(x, y, width, height, 8);
    this.drawAnimatedBorder(x, y, width, height, color, state.alertState);
    this.graphics.fillStyle(color, state.alertState === 'detected' ? pulse : 0.9);
    this.graphics.fillRect(x, y, width, 4);
    this.drawCaptainBar(x + 16, y + 8, width - 62, state);
    this.drawSuspicionMeter(x + 16, y + height - 14, width - 62, state.enemySuspicion);
    this.drawSirenWaveform(x + width - 82, y + 17, color, state.alertState);
    this.drawAlertGlyph(x + width - 32, y + 42, color, state.alertState);
    this.title.setText(state.alertState.toUpperCase()).setColor(cssColor(color));
    this.detail.setText(state.debugEnabled ? `DEBUG ACTIVE - ${this.awarenessFor(state)}` : this.detailFor(state));
    this.detail.setColor(cssColor(state.alertState === 'hidden' ? COLORS.steelLight : color));
  }

  private detailFor(state: HudState): string {
    const awareness = this.awarenessFor(state);
    if (state.alertState === 'detected') return `emergency active - ${awareness}`;
    if (state.alertState === 'searching') {
      const lastSeen = this.lastSeenFor(state);
      return `${lastSeen ?? `awareness ${Math.round(state.enemySuspicion * 100)}%`} - ${awareness}`;
    }
    if (state.enemySuspicion > 0.08) return `awareness ${Math.round(state.enemySuspicion * 100)}% - ${awareness}`;
    return `silent approach - ${awareness}`;
  }

  private awarenessFor(state: HudState): string {
    const counts = state.enemyAwareness;
    return `unaware ${counts.unaware} / susp ${counts.suspicious} / engaged ${counts.engaged}`;
  }

  private lastSeenFor(state: HudState): string | undefined {
    if (state.lastSeenSeconds === undefined || !Number.isFinite(state.lastSeenSeconds)) {
      return undefined;
    }
    return `last seen ${Math.max(0, Math.floor(state.lastSeenSeconds))}s`;
  }

  private drawSuspicionMeter(x: number, y: number, width: number, suspicion: number): void {
    const ratio = Phaser.Math.Clamp(suspicion, 0, 1);
    this.graphics.fillStyle(COLORS.steelDark, 0.58);
    this.graphics.fillRoundedRect(x, y, width, 4, 2);
    if (ratio <= 0.01) {
      return;
    }
    const color = ratio > 0.72 ? COLORS.alertRed : ratio > 0.3 ? COLORS.hazardOrange : COLORS.hazardAmberBright;
    this.graphics.fillStyle(color, 0.9);
    this.graphics.fillRoundedRect(x, y, width * ratio, 4, 2);
  }

  private drawCaptainBar(x: number, y: number, width: number, state: HudState): void {
    if (state.captainHealthRatio === undefined) {
      return;
    }
    const ratio = Phaser.Math.Clamp(state.captainHealthRatio, 0, 1);
    const color = state.captainCommandActive ? COLORS.hazardAmberBright : COLORS.alertRed;
    this.graphics.fillStyle(COLORS.black, 0.38);
    this.graphics.fillRoundedRect(x, y, width, 5, 2);
    this.graphics.fillStyle(color, state.captainCommandActive ? 0.95 : 0.82);
    this.graphics.fillRoundedRect(x, y, width * ratio, 5, 2);
    if (state.captainCommandActive) {
      this.graphics.lineStyle(1, color, 0.8);
      this.graphics.strokeRoundedRect(x - 2, y - 2, width + 4, 9, 3);
    }
  }

  private drawSirenWaveform(x: number, y: number, color: number, state: HudState['alertState']): void {
    if (state !== 'detected') {
      return;
    }

    const t = Date.now() / 100;
    this.graphics.lineStyle(2, color, 0.72 + Math.sin(t) * 0.14);
    for (let i = 0; i < 5; i += 1) {
      const barX = x + i * 7;
      const height = 5 + Math.abs(Math.sin(t + i * 0.85)) * 14;
      this.graphics.lineBetween(barX, y + 10 - height / 2, barX, y + 10 + height / 2);
    }

    this.graphics.lineStyle(1, COLORS.hazardAmberBright, 0.44);
    this.graphics.beginPath();
    this.graphics.arc(x + 17, y + 10, 28 + Math.sin(t * 1.4) * 3, -0.42, 0.42);
    this.graphics.strokePath();
  }

  private drawAnimatedBorder(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    state: HudState['alertState']
  ): void {
    const t = Date.now() / 1000;
    if (state === 'hidden') {
      this.graphics.lineStyle(1, color, 0.18 + Math.sin(t * 4) * 0.05);
      for (let sx = x + 16; sx < x + width - 18; sx += 22) {
        this.graphics.lineBetween(sx, y + height - 7, sx + 10, y + height - 7);
      }
      return;
    }
    if (state === 'searching') {
      const sweepX = x + 8 + ((Date.now() / 14) % (width - 16));
      this.graphics.lineStyle(1, color, 0.42);
      this.graphics.lineBetween(sweepX, y + 8, sweepX + 16, y + 8);
      this.graphics.lineBetween(sweepX - 12, y + height - 8, sweepX + 4, y + height - 8);
      return;
    }
    this.graphics.lineStyle(2, color, 0.48 + Math.sin(t * 12) * 0.18);
    this.graphics.strokeRect(x + 5, y + 5, width - 10, height - 10);
  }

  private drawAlertGlyph(x: number, y: number, color: number, state: HudState['alertState']): void {
    this.graphics.lineStyle(2, color, 0.9);
    if (state === 'detected') {
      this.graphics.strokeTriangle(x, y - 11, x - 12, y + 10, x + 12, y + 10);
      this.graphics.lineBetween(x, y - 3, x, y + 4);
      this.graphics.fillStyle(color, 0.9);
      this.graphics.fillCircle(x, y + 8, 2);
      return;
    }
    if (state === 'searching') {
      this.graphics.strokeCircle(x, y, 10);
      this.graphics.lineBetween(x + 8, y + 8, x + 15, y + 15);
      return;
    }
    this.graphics.beginPath();
    this.graphics.arc(x, y, 12, -0.7, 0.7);
    this.graphics.strokePath();
    this.graphics.fillStyle(color, 0.72);
    this.graphics.fillCircle(x + 9, y, 2);
  }

  private textStyle(size: number, color: string): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: `${size}px`,
      fontStyle: '700',
      color
    };
  }
}
