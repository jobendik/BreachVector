import type { Enemy } from '../entities/Enemy';
import type { Door } from '../entities/Door';
import type { Terminal } from '../entities/Terminal';
import type { LevelData, MinimapSnapshot } from '../game/types';

export class MinimapSystem {
  constructor(private readonly level: LevelData) {}

  snapshot(
    player: { x: number; y: number },
    enemies: Enemy[],
    doors: Door[],
    terminals: Terminal[],
    canExtract: boolean,
    debugEnabled: boolean
  ): MinimapSnapshot {
    return {
      width: this.level.width,
      height: this.level.height,
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
      extraction: this.level.extraction,
      canExtract,
      player: { x: player.x, y: player.y },
      enemies: enemies
        .filter((enemy) => !enemy.dead)
        .map((enemy) => ({
          x: enemy.x,
          y: enemy.y,
          role: enemy.role,
          visible: debugEnabled || enemy.recentlyVisible,
          captain: enemy.role === 'captain'
        })),
      debugEnabled
    };
  }
}
