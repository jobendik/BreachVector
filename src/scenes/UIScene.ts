import Phaser from 'phaser';
import { GameEvents, eventBus } from '../game/events';
import type { HudState, MinimapSnapshot } from '../game/types';
import { HUD } from '../ui/HUD';

export class UIScene extends Phaser.Scene {
  private hud?: HUD;
  private readonly onHud = (state: HudState) => this.hud?.updateState(state);
  private readonly onLog = (payload: { message: string }) => this.hud?.pushLog(payload.message);
  private readonly onMinimap = (snapshot: MinimapSnapshot) => this.hud?.updateMinimap(snapshot);

  constructor() {
    super('UIScene');
  }

  create(): void {
    this.hud = new HUD(this);
    eventBus.on(GameEvents.HudState, this.onHud);
    eventBus.on(GameEvents.TacticalLog, this.onLog);
    eventBus.on(GameEvents.MinimapSnapshot, this.onMinimap);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  private cleanup(): void {
    eventBus.off(GameEvents.HudState, this.onHud);
    eventBus.off(GameEvents.TacticalLog, this.onLog);
    eventBus.off(GameEvents.MinimapSnapshot, this.onMinimap);
    this.hud?.destroy();
  }
}
