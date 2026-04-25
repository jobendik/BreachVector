import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { type AppSettings, loadSettings, resetSettings, updateSettings } from '../game/settings';
import { cssColor } from '../utils/colors';

type SettingKey = keyof AppSettings;

interface SettingsButton {
  bg: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
}

export class SettingsScene extends Phaser.Scene {
  private panel!: Phaser.GameObjects.Graphics;
  private settings: AppSettings = loadSettings();
  private rows: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('SettingsScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.blacksiteNavy, 0.72);
    this.panel = this.add.graphics();
    this.drawPanel();

    this.add
      .text(width / 2, height / 2 - 244, 'SETTINGS', this.textStyle(38, cssColor(COLORS.systemCyanSoft), '900'))
      .setOrigin(0.5);
    this.add
      .text(
        width / 2,
        height / 2 - 204,
        'Persistent local prototype settings',
        this.textStyle(12, cssColor(COLORS.steelLight), '700')
      )
      .setOrigin(0.5);

    this.createRows();
    this.button(width / 2 - 150, height / 2 + 230, 'RESET DEFAULTS', () => {
      this.settings = resetSettings();
      this.refreshRows();
    });
    this.button(width / 2 + 150, height / 2 + 230, 'CLOSE', () => this.scene.stop());
    this.input.keyboard?.once('keydown-ESC', () => this.scene.stop());
  }

  private createRows(): void {
    const { width, height } = this.scale;
    const x = width / 2 - 265;
    const startY = height / 2 - 150;
    const rows: Array<{ label: string; key: SettingKey; kind: 'quality' | 'slider' | 'toggle' }> = [
      { label: 'Graphics Quality', key: 'graphicsQuality', kind: 'quality' },
      { label: 'Master Volume', key: 'masterVolume', kind: 'slider' },
      { label: 'Music Volume', key: 'musicVolume', kind: 'slider' },
      { label: 'SFX Volume', key: 'sfxVolume', kind: 'slider' },
      { label: 'UI Volume', key: 'uiVolume', kind: 'slider' },
      { label: 'Screen Shake', key: 'screenShake', kind: 'slider' },
      { label: 'Flash Intensity', key: 'flashIntensity', kind: 'slider' },
      { label: 'Colorblind Mode', key: 'colorblindMode', kind: 'toggle' },
      { label: 'Reduce Motion', key: 'reduceMotion', kind: 'toggle' }
    ];

    rows.forEach((row, index) => {
      const y = startY + index * 36;
      this.add.text(x, y, row.label.toUpperCase(), this.textStyle(12, cssColor(COLORS.textMuted), '700'));
      const value = this.add.text(x + 265, y, '', this.textStyle(12, cssColor(COLORS.operatorGreenBright), '900'));
      this.rows.push(value);
      if (row.kind === 'slider') {
        this.smallButton(x + 470, y + 8, '-', () => this.adjustSlider(row.key, -0.1));
        this.smallButton(x + 510, y + 8, '+', () => this.adjustSlider(row.key, 0.1));
      } else if (row.kind === 'quality') {
        this.smallButton(x + 490, y + 8, 'TOGGLE', () => this.toggle(row.key, 'quality'));
      } else {
        this.smallButton(x + 490, y + 8, 'TOGGLE', () => this.toggle(row.key, 'toggle'));
      }
    });
    this.refreshRows();
  }

  private refreshRows(): void {
    const values: string[] = [
      this.settings.graphicsQuality,
      this.percent(this.settings.masterVolume),
      this.percent(this.settings.musicVolume),
      this.percent(this.settings.sfxVolume),
      this.percent(this.settings.uiVolume),
      this.percent(this.settings.screenShake),
      this.percent(this.settings.flashIntensity),
      this.settings.colorblindMode ? 'ON' : 'OFF',
      this.settings.reduceMotion ? 'ON' : 'OFF'
    ];
    this.rows.forEach((row, index) => row.setText(values[index] ?? ''));
  }

  private adjustSlider(key: SettingKey, amount: number): void {
    const value = this.settings[key];
    if (typeof value !== 'number') {
      return;
    }
    this.settings = updateSettings({ [key]: Phaser.Math.Clamp(value + amount, 0, 1) });
    this.refreshRows();
  }

  private toggle(key: SettingKey, kind: 'quality' | 'toggle'): void {
    if (kind === 'quality') {
      const next =
        this.settings.graphicsQuality === 'High'
          ? 'Medium'
          : this.settings.graphicsQuality === 'Medium'
            ? 'Low'
            : 'High';
      this.settings = updateSettings({ graphicsQuality: next });
    } else {
      const value = this.settings[key];
      if (typeof value === 'boolean') {
        this.settings = updateSettings({ [key]: !value });
      }
    }
    this.refreshRows();
  }

  private drawPanel(): void {
    const { width, height } = this.scale;
    const x = width / 2 - 330;
    const y = height / 2 - 278;
    this.panel.fillStyle(COLORS.blacksitePanel, 0.92);
    this.panel.fillRoundedRect(x, y, 660, 548, 8);
    this.panel.lineStyle(1, COLORS.systemCyan, 0.56);
    this.panel.strokeRoundedRect(x, y, 660, 548, 8);
    this.panel.fillStyle(COLORS.systemCyan, 0.74);
    this.panel.fillRect(x, y, 4, 548);
  }

  private button(x: number, y: number, label: string, onClick: () => void): SettingsButton {
    const bg = this.add
      .rectangle(x, y, 230, 42, COLORS.blacksitePanelLight, 0.96)
      .setStrokeStyle(2, COLORS.systemCyan, 0.5);
    const text = this.add.text(x, y, label, this.textStyle(13, cssColor(COLORS.textPrimary), '900')).setOrigin(0.5);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      bg.setFillStyle(COLORS.systemCyan, 0.9);
      text.setColor(cssColor(COLORS.blacksiteNavy));
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(COLORS.blacksitePanelLight, 0.96);
      text.setColor(cssColor(COLORS.textPrimary));
    });
    bg.on('pointerdown', onClick);
    return { bg, text };
  }

  private smallButton(x: number, y: number, label: string, onClick: () => void): void {
    const bg = this.add
      .rectangle(x, y, label === 'TOGGLE' ? 74 : 30, 24, COLORS.blacksitePanelLight, 0.96)
      .setStrokeStyle(1, COLORS.systemCyan, 0.46);
    const text = this.add.text(x, y, label, this.textStyle(11, cssColor(COLORS.systemCyanSoft), '900')).setOrigin(0.5);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', onClick);
    bg.on('pointerover', () => text.setColor(cssColor(COLORS.blacksiteNavy)));
    bg.on('pointerover', () => bg.setFillStyle(COLORS.systemCyan, 0.9));
    bg.on('pointerout', () => text.setColor(cssColor(COLORS.systemCyanSoft)));
    bg.on('pointerout', () => bg.setFillStyle(COLORS.blacksitePanelLight, 0.96));
  }

  private percent(value: number): string {
    return `${Math.round(value * 100)}%`;
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
