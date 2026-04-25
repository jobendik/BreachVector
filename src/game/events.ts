import Phaser from 'phaser';
import type { AlertState, HudState, MinimapSnapshot, MissionObjective } from './types';

export const GameEvents = {
  HudState: 'hud-state',
  MissionUpdated: 'mission-updated',
  AlertChanged: 'alert-changed',
  TacticalLog: 'tactical-log',
  MinimapSnapshot: 'minimap-snapshot',
  DebugChanged: 'debug-changed'
} as const;

export interface GameEventMap {
  [GameEvents.HudState]: HudState;
  [GameEvents.MissionUpdated]: MissionObjective[];
  [GameEvents.AlertChanged]: { state: AlertState; detail: string };
  [GameEvents.TacticalLog]: { message: string };
  [GameEvents.MinimapSnapshot]: MinimapSnapshot;
  [GameEvents.DebugChanged]: { enabled: boolean };
}

class TypedEventBus {
  private readonly emitter = new Phaser.Events.EventEmitter();

  emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): boolean {
    return this.emitter.emit(event as string, payload);
  }

  on<K extends keyof GameEventMap>(event: K, fn: (payload: GameEventMap[K]) => void, context?: object): this {
    this.emitter.on(event as string, fn, context);
    return this;
  }

  off<K extends keyof GameEventMap>(event: K, fn?: (payload: GameEventMap[K]) => void, context?: object): this {
    this.emitter.off(event as string, fn, context);
    return this;
  }

  listenerCount<K extends keyof GameEventMap>(event: K): number {
    return this.emitter.listenerCount(event as string);
  }
}

export const eventBus = new TypedEventBus();
