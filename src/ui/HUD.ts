import Phaser from 'phaser';
import type { HudState, MinimapSnapshot } from '../game/types';
import { HealthArmorPanel } from './HealthArmorPanel';
import { WeaponPanel } from './WeaponPanel';
import { ObjectivePanel } from './ObjectivePanel';
import { AlertPanel } from './AlertPanel';
import { TacticalLog } from './TacticalLog';
import { Minimap } from './Minimap';

export class HUD {
  private readonly health: HealthArmorPanel;
  private readonly weapon: WeaponPanel;
  private readonly objectives: ObjectivePanel;
  private readonly alert: AlertPanel;
  private readonly log: TacticalLog;
  private readonly minimap: Minimap;
  private readonly prompt: Phaser.GameObjects.Text;

  private messages: string[] = [];

  constructor(private readonly scene: Phaser.Scene) {
    this.health = new HealthArmorPanel(scene);
    this.weapon = new WeaponPanel(scene);
    this.objectives = new ObjectivePanel(scene);
    this.alert = new AlertPanel(scene);
    this.log = new TacticalLog(scene);
    this.minimap = new Minimap(scene);

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

    this.prompt.setPosition(width / 2, height - 22);
  }

  updateState(state: HudState): void {
    this.health.update(state);
    this.weapon.update(state);
    this.objectives.update(state);
    this.alert.update(state);

    this.prompt.setText(
      state.interactionPrompt || 'WASD move  |  Mouse aim  |  LMB fire  |  RMB grenade  |  E interact  |  Tab debug'
    );

    this.log.update(this.messages);
  }

  pushLog(message: string): void {
    this.messages.push(message);
    this.messages = this.messages.slice(-8);
    this.log.update(this.messages);
  }

  updateMinimap(snapshot: MinimapSnapshot): void {
    this.minimap.update(snapshot);
  }

  destroy(): void {
    this.scene.scale.off('resize', this.layout, this);

    this.prompt.destroy();

    // Optional, only if these classes have destroy() methods:
    // this.health.destroy();
    // this.weapon.destroy();
    // this.objectives.destroy();
    // this.alert.destroy();
    // this.log.destroy();
    // this.minimap.destroy();
  }
}
