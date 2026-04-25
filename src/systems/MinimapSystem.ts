import type { Enemy } from '../entities/Enemy';
import type { Door } from '../entities/Door';
import type { Pickup } from '../entities/Pickup';
import type { Terminal } from '../entities/Terminal';
import type { AlertState, LevelData, MinimapSnapshot } from '../game/types';

export class MinimapSystem {
  constructor(private readonly level: LevelData) {}

  snapshot(
    player: { x: number; y: number; facing: { x: number; y: number } },
    enemies: Enemy[],
    doors: Door[],
    terminals: Terminal[],
    pickups: Pickup[],
    canExtract: boolean,
    alertState: AlertState,
    debugEnabled: boolean
  ): MinimapSnapshot {
    return {
      width: this.level.width,
      height: this.level.height,
      alertState,
      walls: this.level.walls,
      doors: doors.map((door) => ({ ...door.rect, id: door.doorId, locked: door.locked, open: door.open })),
      terminals: terminals.map((terminal) => ({
        id: terminal.terminalId,
        prompt: terminal.prompt,
        hackTime: terminal.hackTime,
        x: terminal.x,
        y: terminal.y,
        hacked: terminal.hacked
      })),
      pickups: pickups.map((pickup) => ({
        x: pickup.x,
        y: pickup.y,
        type: pickup.pickupType
      })),
      extraction: this.level.extraction,
      canExtract,
      player: { x: player.x, y: player.y, facing: { x: player.facing.x, y: player.facing.y } },
      enemies: enemies
        .filter((enemy) => !enemy.dead)
        .map((enemy) => ({
          x: enemy.x,
          y: enemy.y,
          role: enemy.role,
          visible: debugEnabled || alertState === 'detected' || enemy.recentlyVisible,
          captain: enemy.role === 'captain'
        })),
      debugEnabled
    };
  }
}
