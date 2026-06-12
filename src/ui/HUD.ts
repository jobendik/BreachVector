import Phaser from 'phaser';
import { COLORS, DEPTHS } from '../game/constants';
import type { HudState, MinimapSnapshot, TacticalLogEntry } from '../game/types';
import { HealthArmorPanel } from './HealthArmorPanel';
import { WeaponPanel } from './WeaponPanel';
import { ObjectivePanel } from './ObjectivePanel';
import { AlertPanel } from './AlertPanel';
import { TacticalLog } from './TacticalLog';
import { Minimap } from './Minimap';
import { ScorePanel } from './ScorePanel';
import { cssColor } from '../utils/colors';

export class HUD {
  private readonly health: HealthArmorPanel;
  private readonly weapon: WeaponPanel;
  private readonly objectives: ObjectivePanel;
  private readonly alert: AlertPanel;
  private readonly log: TacticalLog;
  private readonly minimap: Minimap;
  private readonly score: ScorePanel;
  private readonly promptGraphics: Phaser.GameObjects.Graphics;
  private readonly prompt: Phaser.GameObjects.Text;

  private messages: TacticalLogEntry[] = [];

  constructor(private readonly scene: Phaser.Scene) {
    this.health = new HealthArmorPanel(scene);
    this.weapon = new WeaponPanel(scene);
    this.objectives = new ObjectivePanel(scene);
    this.alert = new AlertPanel(scene);
    this.log = new TacticalLog(scene);
    this.minimap = new Minimap(scene);
    this.score = new ScorePanel(scene);
    this.promptGraphics = scene.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(DEPTHS.ui + 190);

    this.prompt = scene.add
      .text(0, 0, '', {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: '12px',
        fontStyle: '700',
        color: '#e0f2fe',
        backgroundColor: '#020617cc',
        padding: { x: 12, y: 7 }
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(2200);

    this.layout();

    scene.scale.on('resize', this.layout, this);
  }

  layout(): void {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    this.health.layout(20, 20, 300, 140);
    this.objectives.layout(width - 370, 20, 350, 170);
    this.weapon.layout(20, height - 124, 300, 104);
    this.alert.layout(width - 330, height - 104, 310, 84);
    this.minimap.layout(width - 230, height - 270, 210, 145);
    this.log.layout(340, height - 104, Math.max(300, width - 700), 84);
    this.score.layout(width / 2, 20, height * 0.3);

    this.prompt.setPosition(width / 2, height - 22);
  }

  updateState(state: HudState): void {
    this.health.update(state);
    this.weapon.update(state);
    this.objectives.update(state);
    this.alert.update(state);

    const idlePrompt = 'WASD move  |  Mouse aim  |  LMB fire  |  RMB grenade  |  E interact  |  M map';
    const promptText = state.interactionPrompt || idlePrompt;
    this.prompt.setText(promptText);
    this.drawPromptFrame(state, promptText);

    this.log.update(this.messages);
  }

  pushLog(entry: TacticalLogEntry): void {
    const previous = this.messages.at(-1);
    if (
      previous?.message === entry.message &&
      previous.category === entry.category &&
      previous.emphasis === entry.emphasis
    ) {
      previous.count = entry.count ?? (previous.count ?? 1) + 1;
    } else {
      this.messages.push({ ...entry });
    }
    this.messages = this.messages.slice(-8);
    this.log.update(this.messages);
  }

  updateMinimap(snapshot: MinimapSnapshot): void {
    this.minimap.update(snapshot);
  }

  updateScore(payload: {
    score: number;
    chain: number;
    multiplier: number;
    comboRemainingSeconds: number;
    comboWindowSeconds: number;
    delta: number;
  }): void {
    this.score.updateScore(payload);
  }

  announceStreak(label: string, chain: number): void {
    this.score.announceStreak(label, chain);
  }

  destroy(): void {
    this.scene.scale.off('resize', this.layout, this);

    this.prompt.destroy();
    this.promptGraphics.destroy();
    this.score.destroy();

    // Optional, only if these classes have destroy() methods:
    // this.health.destroy();
    // this.weapon.destroy();
    // this.objectives.destroy();
    // this.alert.destroy();
    // this.log.destroy();
    // this.minimap.destroy();
  }

  private drawPromptFrame(state: HudState, promptText: string): void {
    const width = Math.min(this.scene.scale.width - 80, Math.max(360, promptText.length * 8.2 + 72));
    const height = 34;
    const x = this.scene.scale.width / 2 - width / 2;
    const y = this.scene.scale.height - 58;
    const active = state.interactionKind !== 'none';
    const accent = this.promptColor(state);

    this.promptGraphics.clear();
    this.promptGraphics.fillStyle(COLORS.blacksiteNavy, active ? 0.78 : 0.5);
    this.promptGraphics.fillRoundedRect(x, y, width, height, 8);
    this.promptGraphics.lineStyle(1, accent, active ? 0.72 : 0.24);
    this.promptGraphics.strokeRoundedRect(x, y, width, height, 8);

    if (active) {
      this.prompt.setColor(cssColor(accent));
      this.promptGraphics.fillStyle(accent, 0.16);
      this.promptGraphics.fillRoundedRect(
        x + 8,
        y + height - 7,
        (width - 16) * Phaser.Math.Clamp(state.interactionProgress, 0, 1),
        3,
        2
      );
      this.drawHoldRing(x + 22, y + height / 2, state.interactionProgress, accent);
      return;
    }

    this.prompt.setColor('#e0f2fe');
  }

  private drawHoldRing(x: number, y: number, ratio: number, color: number): void {
    this.promptGraphics.lineStyle(2, COLORS.steelDark, 0.86);
    this.promptGraphics.strokeCircle(x, y, 9);
    this.promptGraphics.lineStyle(3, color, 0.92);
    this.promptGraphics.beginPath();
    this.promptGraphics.arc(x, y, 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Phaser.Math.Clamp(ratio, 0, 1));
    this.promptGraphics.strokePath();
  }

  private promptColor(state: HudState): number {
    if (state.interactionKind === 'terminal') {
      return COLORS.systemCyan;
    }
    if (state.interactionKind === 'door') {
      return state.interactionProgress > 0 ? COLORS.hazardAmberBright : COLORS.alertRed;
    }
    if (state.interactionKind === 'extraction') {
      return state.interactionProgress > 0 ? COLORS.operatorGreenBright : COLORS.hazardAmber;
    }
    return COLORS.steelSlate;
  }
}
