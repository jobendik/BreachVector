import Phaser from 'phaser';
import { GameEvents, eventBus, type GameEventMap } from '../game/events';
import type { HudState, MinimapSnapshot, TacticalLogEntry } from '../game/types';
import { HUD } from '../ui/HUD';

export class UIScene extends Phaser.Scene {
  private hud?: HUD;
  private readonly onHud = (state: HudState) => this.hud?.updateState(state);
  private readonly onLog = (entry: TacticalLogEntry) => this.hud?.pushLog(entry);
  private readonly onMinimap = (snapshot: MinimapSnapshot) => this.hud?.updateMinimap(snapshot);
  private readonly onScore = (payload: GameEventMap[typeof GameEvents.ScoreChanged]) =>
    this.hud?.updateScore(payload);
  private readonly onStreak = (payload: GameEventMap[typeof GameEvents.KillStreak]) =>
    this.hud?.announceStreak(payload.label, payload.chain);

  constructor() {
    super('UIScene');
  }

  create(): void {
    this.hud = new HUD(this);
    eventBus.on(GameEvents.HudState, this.onHud);
    eventBus.on(GameEvents.TacticalLog, this.onLog);
    eventBus.on(GameEvents.MinimapSnapshot, this.onMinimap);
    eventBus.on(GameEvents.ScoreChanged, this.onScore);
    eventBus.on(GameEvents.KillStreak, this.onStreak);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  private cleanup(): void {
    eventBus.off(GameEvents.HudState, this.onHud);
    eventBus.off(GameEvents.TacticalLog, this.onLog);
    eventBus.off(GameEvents.MinimapSnapshot, this.onMinimap);
    eventBus.off(GameEvents.ScoreChanged, this.onScore);
    eventBus.off(GameEvents.KillStreak, this.onStreak);
    this.hud?.destroy();
  }
}
