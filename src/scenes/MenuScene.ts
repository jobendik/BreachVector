import Phaser from 'phaser';
import { levels } from '../data/levels';
import { COLORS, GAME_TITLE, GAME_VERSION } from '../game/constants';
import { completedSectorCount, loadProgress, nextIncompleteLevelIndex } from '../game/progress';
import { cssColor } from '../utils/colors';

type MenuPanel = 'briefing' | 'controls' | 'settings' | 'credits';
type OperationMode = 'DEMO' | 'OPERATOR' | 'BLACKSITE';

interface MenuButton {
  bg: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
  label: string;
}

export class MenuScene extends Phaser.Scene {
  private backdrop!: Phaser.GameObjects.Graphics;
  private panelGraphics!: Phaser.GameObjects.Graphics;
  private title!: Phaser.GameObjects.Text;
  private titleGhost!: Phaser.GameObjects.Text;
  private subtitle!: Phaser.GameObjects.Text;
  private panelTitle!: Phaser.GameObjects.Text;
  private panelBody!: Phaser.GameObjects.Text;
  private footer!: Phaser.GameObjects.Text;
  private activePanel: MenuPanel = 'briefing';
  private selectedMode: OperationMode = 'DEMO';
  private buttons: MenuButton[] = [];
  private modeButtons: MenuButton[] = [];
  private progress = loadProgress();

  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.progress = loadProgress();
    this.buttons = [];
    this.modeButtons = [];
    this.cameras.main.setBackgroundColor(COLORS.blacksiteNavy);
    this.backdrop = this.add.graphics().setDepth(-20);
    this.panelGraphics = this.add.graphics().setDepth(-10);

    this.createTitle();
    this.createPanelText();
    this.createButtons();
    this.createModeSelector();
    this.layout();
    this.renderPanel();
    this.refreshButtons();

    this.scale.on('resize', this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.layout, this);
    });
    this.input.keyboard?.once('keydown-ENTER', () => this.startOperation());
  }

  update(time: number): void {
    this.drawBackdrop(time / 1000);
    this.drawPanelFrame(time / 1000);

    const glitch = Math.sin(time / 130) > 0.92;
    this.titleGhost.setAlpha(glitch ? 0.42 : 0.12);
    this.titleGhost.setX(this.title.x + (glitch ? Phaser.Math.Between(-5, 5) : 2));
  }

  private createTitle(): void {
    this.titleGhost = this.add
      .text(0, 0, GAME_TITLE, this.textStyle(48, cssColor(COLORS.alertRed), '900'))
      .setOrigin(0.5)
      .setDepth(2);
    this.title = this.add
      .text(0, 0, GAME_TITLE, this.textStyle(48, cssColor(COLORS.operatorGreenBright), '900'))
      .setOrigin(0.5)
      .setDepth(3);
    this.subtitle = this.add
      .text(
        0,
        0,
        'TACTICAL BREACH PROTOTYPE / GENERATED BLACKSITE BUILD',
        this.textStyle(14, cssColor(COLORS.systemCyanSoft), '700')
      )
      .setOrigin(0.5)
      .setDepth(3);
    this.footer = this.add
      .text(0, 0, '', this.textStyle(11, cssColor(COLORS.steelLight), '700'))
      .setOrigin(0.5)
      .setDepth(3);
  }

  private createPanelText(): void {
    this.panelTitle = this.add
      .text(0, 0, '', this.textStyle(15, cssColor(COLORS.operatorGreenBright), '900'))
      .setDepth(3);
    this.panelBody = this.add.text(0, 0, '', {
      ...this.textStyle(13, cssColor(COLORS.textMuted), '700'),
      lineSpacing: 8,
      wordWrap: { width: 520 }
    });
    this.panelBody.setDepth(3);
  }

  private createButtons(): void {
    this.buttons = [
      this.button(
        this.primaryActionLabel(),
        () => this.startOperation(),
        COLORS.operatorGreenBright,
        COLORS.blacksiteNavy
      ),
      this.button('CONTROLS', () => this.setPanel('controls'), COLORS.systemCyan, COLORS.textPrimary),
      this.button('SETTINGS', () => this.scene.launch('SettingsScene'), COLORS.hazardAmberBright, COLORS.textPrimary),
      this.button('CREDITS', () => this.setPanel('credits'), COLORS.energyVioletBright, COLORS.textPrimary)
    ];
  }

  private createModeSelector(): void {
    this.modeButtons = [
      this.button('DEMO', () => this.setMode('DEMO'), COLORS.operatorGreenBright, COLORS.blacksiteNavy),
      this.button('OPERATOR', () => this.setMode('OPERATOR'), COLORS.systemCyan, COLORS.textPrimary),
      this.button('BLACKSITE', () => this.setMode('BLACKSITE'), COLORS.alertRed, COLORS.textPrimary)
    ];
  }

  private layout(): void {
    const { width, height } = this.scale;
    this.title.setFontSize(Math.min(52, Math.max(34, width / 17)));
    this.titleGhost.setFontSize(Math.min(52, Math.max(34, width / 17)));
    this.title.setPosition(width / 2, height * 0.14);
    this.titleGhost.setPosition(width / 2 + 2, height * 0.14);
    this.subtitle.setPosition(width / 2, height * 0.225);
    this.footer
      .setText(`v${GAME_VERSION}  /  PHASER 3 + TYPESCRIPT  /  MODE: ${this.selectedMode}`)
      .setPosition(width / 2, height - 24);

    const panelX = Math.max(36, width / 2 - 335);
    const panelY = height * 0.31;
    this.panelTitle.setPosition(panelX + 26, panelY + 24);
    this.panelBody.setPosition(panelX + 26, panelY + 62);
    this.panelBody.setWordWrapWidth(Math.min(560, width - 120));

    const startY = height * 0.73;
    this.positionButton(this.buttons[0], width / 2, startY, 308, 54);
    for (let i = 1; i < this.buttons.length; i += 1) {
      this.positionButton(this.buttons[i], width / 2 - 190 + (i - 1) * 190, startY + 72, 168, 42);
    }

    const modeY = height * 0.62;
    for (let i = 0; i < this.modeButtons.length; i += 1) {
      this.positionButton(this.modeButtons[i], width / 2 - 170 + i * 170, modeY, 142, 38);
    }
  }

  private setPanel(panel: MenuPanel): void {
    this.activePanel = panel;
    this.renderPanel();
    this.refreshButtons();
  }

  private setMode(mode: OperationMode): void {
    this.selectedMode = mode;
    this.footer.setText(`v${GAME_VERSION}  /  PHASER 3 + TYPESCRIPT  /  MODE: ${this.selectedMode}`);
    this.refreshButtons();
  }

  private startOperation(): void {
    this.progress = loadProgress();
    this.scene.start('GameScene', { levelIndex: nextIncompleteLevelIndex(this.progress) });
  }

  private renderPanel(): void {
    const content = this.panelContent(this.activePanel);
    this.panelTitle.setText(content.title);
    this.panelBody.setText(content.body);
  }

  private panelContent(panel: MenuPanel): { title: string; body: string } {
    if (panel === 'controls') {
      return {
        title: 'CONTROLS',
        body:
          'WASD move   Mouse aim   LMB fire   RMB grenade\n' +
          'R reload   Space dash   Shift slow walk\n' +
          'E hack/open   F takedown   1-4 weapons   Esc pause   Tab debug'
      };
    }
    if (panel === 'settings') {
      return {
        title: 'SETTINGS PRESET',
        body:
          'Graphics: High tactical FX\n' +
          'Motion: Full camera shake and HUD pulse\n' +
          'Audio: Procedural SFX enabled\n\n' +
          'Dedicated sliders and accessibility toggles are tracked in the roadmap.'
      };
    }
    if (panel === 'credits') {
      return {
        title: 'CREDITS',
        body:
          'Design, code, generated visuals, procedural audio, and documentation by the project author.\n\n' +
          'Built as a GitHub portfolio vertical slice: TypeScript, Phaser 3, Vite, typed events, modular systems, and automated smoke tests.'
      };
    }
    return {
      title: 'OPERATOR BRIEFING',
      body:
        `${levels[0].briefing}\n\n` +
        'Mission loop: infiltrate, hack terminal systems, open locked routes, neutralize command, and extract before the blacksite fully mobilizes.' +
        this.progressSummary()
    };
  }

  private drawBackdrop(timeSeconds: number): void {
    const { width, height } = this.scale;
    const drift = (timeSeconds * 18) % 48;
    this.backdrop.clear();
    this.backdrop.fillGradientStyle(
      COLORS.blacksiteNavy,
      COLORS.blacksitePanel,
      COLORS.blacksiteNavy,
      COLORS.blacksitePanelLight,
      1
    );
    this.backdrop.fillRect(0, 0, width, height);

    this.backdrop.lineStyle(1, COLORS.systemCyan, 0.07);
    for (let x = -48 + drift; x < width + 48; x += 48) {
      this.backdrop.lineBetween(x, 0, x, height);
    }
    for (let y = -48 + drift * 0.5; y < height + 48; y += 48) {
      this.backdrop.lineBetween(0, y, width, y);
    }

    this.backdrop.lineStyle(1, COLORS.operatorGreenBright, 0.12);
    const sweepX = ((timeSeconds * 90) % (width + 240)) - 120;
    this.backdrop.lineBetween(sweepX, 0, sweepX + 170, height);
    this.backdrop.fillStyle(COLORS.alertRed, 0.06 + Math.sin(timeSeconds * 2) * 0.025);
    this.backdrop.fillRect(width * 0.72, 0, width * 0.28, height);

    for (let i = 0; i < 12; i += 1) {
      const x = (i * 157 + timeSeconds * 22) % width;
      const y = (i * 83 + Math.sin(timeSeconds + i) * 12) % height;
      this.backdrop.fillStyle(i % 3 === 0 ? COLORS.hazardAmber : COLORS.systemCyan, 0.18);
      this.backdrop.fillRect(x, y, 3, 3);
    }
  }

  private drawPanelFrame(timeSeconds: number): void {
    const { width, height } = this.scale;
    const panelWidth = Math.min(670, width - 72);
    const panelHeight = 190;
    const x = width / 2 - panelWidth / 2;
    const y = height * 0.31;
    const pulse = 0.32 + Math.sin(timeSeconds * 3) * 0.08;

    this.panelGraphics.clear();
    this.panelGraphics.fillStyle(COLORS.blacksitePanel, 0.84);
    this.panelGraphics.fillRoundedRect(x, y, panelWidth, panelHeight, 8);
    this.panelGraphics.lineStyle(1, COLORS.systemCyan, pulse);
    this.panelGraphics.strokeRoundedRect(x, y, panelWidth, panelHeight, 8);
    this.panelGraphics.fillStyle(COLORS.operatorGreenBright, 0.7);
    this.panelGraphics.fillRect(x, y, 4, panelHeight);
    this.panelGraphics.lineStyle(1, COLORS.steelLight, 0.18);
    for (let sx = x + 18; sx < x + panelWidth - 18; sx += 34) {
      this.panelGraphics.lineBetween(sx, y + panelHeight - 14, sx + 16, y + panelHeight - 14);
    }
  }

  private button(label: string, onClick: () => void, accent: number, textColor: number): MenuButton {
    const bg = this.add
      .rectangle(0, 0, 10, 10, COLORS.blacksitePanelLight, 0.94)
      .setStrokeStyle(2, accent, 0.56)
      .setDepth(1);
    const text = this.add
      .text(0, 0, label, this.textStyle(13, cssColor(textColor), '900'))
      .setOrigin(0.5)
      .setDepth(2);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      bg.setFillStyle(accent, 0.92);
      text.setColor(cssColor(COLORS.blacksiteNavy));
    });
    bg.on('pointerout', () => this.refreshButtons());
    bg.on('pointerdown', onClick);
    return { bg, text, label };
  }

  private positionButton(button: MenuButton, x: number, y: number, width: number, height: number): void {
    button.bg.setPosition(x, y).setSize(width, height);
    button.text.setPosition(x, y);
  }

  private refreshButtons(): void {
    for (const button of this.buttons) {
      const active =
        button.label.toLowerCase() === this.activePanel ||
        ((button.label === 'START OPERATION' || button.label === 'CONTINUE OPERATION') &&
          this.activePanel === 'briefing');
      const color = active ? COLORS.operatorGreenBright : COLORS.systemCyan;
      button.bg.setFillStyle(active ? color : COLORS.blacksitePanelLight, active ? 0.78 : 0.94);
      button.bg.setStrokeStyle(2, color, active ? 0.9 : 0.5);
      button.text.setColor(cssColor(active ? COLORS.blacksiteNavy : COLORS.textPrimary));
    }
    for (const button of this.modeButtons) {
      const active = button.label === this.selectedMode;
      const color =
        button.label === 'BLACKSITE'
          ? COLORS.alertRed
          : button.label === 'OPERATOR'
            ? COLORS.systemCyan
            : COLORS.operatorGreenBright;
      button.bg.setFillStyle(active ? color : COLORS.blacksitePanelLight, active ? 0.82 : 0.9);
      button.bg.setStrokeStyle(2, color, active ? 0.95 : 0.44);
      button.text.setColor(cssColor(active ? COLORS.blacksiteNavy : COLORS.textPrimary));
    }
  }

  private primaryActionLabel(): string {
    return completedSectorCount(this.progress) > 0 ? 'CONTINUE OPERATION' : 'START OPERATION';
  }

  private progressSummary(): string {
    const completed = completedSectorCount(this.progress);
    if (completed === 0) {
      return '';
    }
    const next = levels[nextIncompleteLevelIndex(this.progress)];
    return `\n\nProgress: ${completed}/${levels.length} sectors cleared. Next operation: ${next.name}.`;
  }

  private textStyle(size: number, color: string, weight: string): Phaser.Types.GameObjects.Text.TextStyle {
    const bold = Number(weight) >= 700;
    return {
      fontFamily: 'Consolas, Menlo, monospace',
      fontSize: `${size}px`,
      fontStyle: bold ? 'bold' : 'normal',
      color,
      stroke: cssColor(COLORS.blacksiteNavy),
      strokeThickness: size > 30 ? 8 : 2,
      shadow: {
        offsetX: 0,
        offsetY: 1,
        color: cssColor(COLORS.black),
        blur: size > 30 ? 8 : 3,
        fill: true,
        stroke: true
      }
    };
  }
}
