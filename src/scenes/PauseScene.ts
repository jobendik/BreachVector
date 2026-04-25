import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import type { AlertState, MissionObjective } from '../game/types';
import { cssColor } from '../utils/colors';

interface PauseSceneData {
  levelIndex?: number;
  alertState?: AlertState;
  enemiesAlive?: number;
  objectives?: MissionObjective[];
}

type PausePanel = 'status' | 'controls' | 'settings';

interface PauseButton {
  bg: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
  label: string;
}

export class PauseScene extends Phaser.Scene {
  private levelIndex = 0;
  private alertState: AlertState = 'hidden';
  private enemiesAlive = 0;
  private objectives: MissionObjective[] = [];
  private panel: PausePanel = 'status';
  private restartArmed = false;
  private panelGraphics!: Phaser.GameObjects.Graphics;
  private panelTitle!: Phaser.GameObjects.Text;
  private panelBody!: Phaser.GameObjects.Text;
  private restartButton?: PauseButton;
  private buttons: PauseButton[] = [];

  constructor() {
    super('PauseScene');
  }

  create(data: PauseSceneData): void {
    this.levelIndex = data.levelIndex ?? 0;
    this.alertState = data.alertState ?? 'hidden';
    this.enemiesAlive = data.enemiesAlive ?? 0;
    this.objectives = data.objectives ?? [];

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.blacksiteNavy, 0.74);
    this.drawBackdrop();
    this.panelGraphics = this.add.graphics();

    this.add
      .text(width / 2, height / 2 - 214, 'TACTICAL PAUSE', this.textStyle(38, cssColor(COLORS.systemCyanSoft), '900'))
      .setOrigin(0.5);

    this.panelTitle = this.add.text(
      width / 2 - 286,
      height / 2 - 144,
      '',
      this.textStyle(14, cssColor(COLORS.operatorGreenBright), '900')
    );
    this.panelBody = this.add.text(width / 2 - 286, height / 2 - 108, '', {
      ...this.textStyle(13, cssColor(COLORS.textMuted), '700'),
      lineSpacing: 8,
      wordWrap: { width: 360 }
    });

    this.createButtons();
    this.drawPanelFrame();
    this.renderPanel();
    this.refreshButtons();

    this.input.keyboard?.once('keydown-ESC', () => this.resumeGame());
  }

  private createButtons(): void {
    const { width, height } = this.scale;
    const x = width / 2 + 210;
    const y = height / 2 - 118;
    this.buttons = [
      this.button(x, y, 'RESUME', () => this.resumeGame(), COLORS.operatorGreenBright),
      this.button(x, y + 56, 'RESTART SECTOR', () => this.confirmRestart(), COLORS.hazardAmberBright),
      this.button(x, y + 112, 'CONTROLS', () => this.setPanel('controls'), COLORS.systemCyan),
      this.button(x, y + 168, 'SETTINGS', () => this.scene.launch('SettingsScene'), COLORS.energyVioletBright),
      this.button(x, y + 224, 'QUIT TO MENU', () => this.quitToMenu(), COLORS.alertRed)
    ];
    this.restartButton = this.buttons[1];
  }

  private resumeGame(): void {
    this.scene.resume('GameScene');
    this.scene.stop();
  }

  private confirmRestart(): void {
    if (!this.restartArmed) {
      this.restartArmed = true;
      this.restartButton?.text.setText('CONFIRM RESTART');
      this.restartButton?.bg.setStrokeStyle(2, COLORS.alertRed, 0.92);
      this.time.delayedCall(2600, () => {
        if (!this.restartArmed) {
          return;
        }
        this.restartArmed = false;
        this.restartButton?.text.setText('RESTART SECTOR');
        this.refreshButtons();
      });
      return;
    }
    this.scene.stop('UIScene');
    this.scene.stop('GameScene');
    this.scene.start('GameScene', { levelIndex: this.levelIndex });
  }

  private quitToMenu(): void {
    this.scene.stop('UIScene');
    this.scene.stop('GameScene');
    this.scene.start('MenuScene');
  }

  private setPanel(panel: PausePanel): void {
    this.panel = panel;
    this.restartArmed = false;
    this.restartButton?.text.setText('RESTART SECTOR');
    this.renderPanel();
    this.refreshButtons();
  }

  private renderPanel(): void {
    const content = this.panelContent();
    this.panelTitle.setText(content.title);
    this.panelBody.setText(content.body);
  }

  private panelContent(): { title: string; body: string } {
    if (this.panel === 'controls') {
      return {
        title: 'KEYBIND REMINDER',
        body:
          'WASD move   Mouse aim   LMB fire   RMB grenade\n' +
          'R reload   Space dash   Shift slow walk\n' +
          'E interact   F takedown   1-4 weapons\n' +
          'Esc resume   Tab debug overlay'
      };
    }
    if (this.panel === 'settings') {
      return {
        title: 'SESSION SETTINGS',
        body:
          'Graphics preset: High\n' +
          'Motion: Full tactical feedback\n' +
          'Audio: Procedural SFX active\n\n' +
          'Dedicated sliders and accessibility toggles are planned in the settings roadmap.'
      };
    }

    const objectiveLines = this.objectives.length
      ? this.objectives
          .slice(0, 5)
          .map((objective) => `${objective.completed ? 'DONE' : 'TODO'}  ${objective.label}`)
          .join('\n')
      : 'Objectives unavailable during scene transition.';
    return {
      title: 'CURRENT OPERATION',
      body: `Alert: ${this.alertState.toUpperCase()}\nHostiles active: ${this.enemiesAlive}\n\n${objectiveLines}`
    };
  }

  private drawBackdrop(): void {
    const { width, height } = this.scale;
    const g = this.add.graphics();
    g.lineStyle(1, COLORS.systemCyan, 0.08);
    for (let x = 0; x < width; x += 36) {
      g.lineBetween(x, 0, x + height * 0.18, height);
    }
    g.lineStyle(2, COLORS.alertRed, 0.12);
    g.lineBetween(width * 0.08, height * 0.18, width * 0.92, height * 0.82);
    g.lineBetween(width * 0.92, height * 0.18, width * 0.08, height * 0.82);
  }

  private drawPanelFrame(): void {
    const { width, height } = this.scale;
    const x = width / 2 - 320;
    const y = height / 2 - 168;
    this.panelGraphics.clear();
    this.panelGraphics.fillStyle(COLORS.blacksitePanel, 0.9);
    this.panelGraphics.fillRoundedRect(x, y, 424, 306, 8);
    this.panelGraphics.lineStyle(1, COLORS.systemCyan, 0.44);
    this.panelGraphics.strokeRoundedRect(x, y, 424, 306, 8);
    this.panelGraphics.fillStyle(COLORS.operatorGreenBright, 0.72);
    this.panelGraphics.fillRect(x, y, 4, 306);
  }

  private button(x: number, y: number, label: string, onClick: () => void, accent: number): PauseButton {
    const bg = this.add.rectangle(x, y, 250, 46, COLORS.blacksitePanelLight, 0.96).setStrokeStyle(2, accent, 0.45);
    const text = this.add.text(x, y, label, this.textStyle(14, cssColor(COLORS.textPrimary), '900')).setOrigin(0.5);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      bg.setFillStyle(accent, 0.9);
      text.setColor(cssColor(COLORS.blacksiteNavy));
    });
    bg.on('pointerout', () => this.refreshButtons());
    bg.on('pointerdown', onClick);
    return { bg, text, label };
  }

  private refreshButtons(): void {
    for (const button of this.buttons) {
      const active =
        (button.label === 'CONTROLS' && this.panel === 'controls') ||
        (button.label === 'SETTINGS' && this.panel === 'settings');
      const accent =
        button.label === 'QUIT TO MENU'
          ? COLORS.alertRed
          : button.label === 'RESTART SECTOR'
            ? COLORS.hazardAmberBright
            : button.label === 'SETTINGS'
              ? COLORS.energyVioletBright
              : button.label === 'RESUME'
                ? COLORS.operatorGreenBright
                : COLORS.systemCyan;
      button.bg.setFillStyle(active ? accent : COLORS.blacksitePanelLight, active ? 0.8 : 0.96);
      button.bg.setStrokeStyle(2, accent, active ? 0.86 : 0.45);
      button.text.setColor(cssColor(active ? COLORS.blacksiteNavy : COLORS.textPrimary));
    }
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
