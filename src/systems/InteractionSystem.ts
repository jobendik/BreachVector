import Phaser from 'phaser';
import type { Door } from '../entities/Door';
import type { Player } from '../entities/Player';
import type { Terminal } from '../entities/Terminal';
import { PLAYER_BALANCE } from '../game/constants';
import type { LevelData, TacticalLogCategory, TacticalLogEmphasis } from '../game/types';
import { pointInRect, rectCenter } from '../utils/geometry';

export interface InteractionStatus {
  kind: 'none' | 'terminal' | 'door' | 'extraction';
  prompt: string;
  progress: number;
}

interface InteractionWorld {
  player: Player;
  level: LevelData;
  terminals: Terminal[];
  doors: Door[];
  input: {
    interactHeld(): boolean;
  };
  mission: {
    terminalHacked(id: string): void;
    canExtract(): boolean;
  };
  audio: {
    play(id: 'interact'): void;
  };
  effects: {
    explosion(x: number, y: number, color?: number, scale?: number): void;
  };
  emitNoise(point: Phaser.Math.Vector2, radius: number, important?: boolean): void;
  log(message: string, category?: TacticalLogCategory, emphasis?: TacticalLogEmphasis): void;
  onDoorOpened?(): void;
}

export class InteractionSystem {
  private status: InteractionStatus = { kind: 'none', prompt: '', progress: 0 };

  constructor(private readonly world: InteractionWorld) {}

  update(deltaSeconds: number): InteractionStatus {
    this.status = { kind: 'none', prompt: '', progress: 0 };
    const terminal = this.nearestTerminal();
    const door = this.nearestDoor();

    for (const candidate of this.world.terminals) {
      if (candidate !== terminal) {
        candidate.relax(deltaSeconds);
      }
    }

    if (terminal && !terminal.hacked) {
      this.updateTerminal(terminal, deltaSeconds);
      return this.status;
    }

    if (door && !door.open) {
      this.updateDoor(door);
      return this.status;
    }

    if (pointInRect(this.world.player, this.world.level.extraction)) {
      const canExtract = this.world.mission.canExtract();
      this.status = {
        kind: 'extraction',
        prompt: canExtract ? 'EXTRACTION READY' : 'EXTRACTION LOCKED: COMPLETE OBJECTIVES',
        progress: canExtract ? 1 : 0
      };
    }

    return this.status;
  }

  private updateTerminal(terminal: Terminal, deltaSeconds: number): void {
    const ratio = terminal.progress / terminal.hackTime;
    const progress = Math.round(ratio * 100);
    this.status = {
      kind: 'terminal',
      prompt: `[E] HOLD ${terminal.prompt.toUpperCase()} ${progress}%`,
      progress: ratio
    };
    if (!this.world.input.interactHeld()) {
      return;
    }

    const wasHacked = terminal.hacked;
    const done = terminal.advance(deltaSeconds);
    terminal.setScale(1 + (terminal.progress / terminal.hackTime) * 0.08);
    if (!done || wasHacked) {
      return;
    }

    this.world.audio.play('interact');
    this.world.effects.explosion(terminal.x, terminal.y, 0x38bdf8, 0.45);
    this.world.mission.terminalHacked(terminal.terminalId);
    for (const matchingDoor of this.world.doors.filter((door) => door.doorId === terminal.terminalId)) {
      matchingDoor.unlock();
      matchingDoor.openDoor();
      this.world.onDoorOpened?.();
    }
    this.world.emitNoise(new Phaser.Math.Vector2(terminal.x, terminal.y), 260, true);
  }

  private updateDoor(door: Door): void {
    this.status = {
      kind: 'door',
      prompt: door.locked ? `LOCKED: REQUIRES TERMINAL ${door.doorId.toUpperCase()}` : '[E] OPEN SECURITY DOOR',
      progress: door.locked ? 0 : 1
    };
    if (door.locked || !this.world.input.interactHeld()) {
      return;
    }

    door.openDoor();
    this.world.audio.play('interact');
    this.world.onDoorOpened?.();
    this.world.log(`Door ${door.doorId.toUpperCase()} opened`, 'objective');
  }

  private nearestTerminal(): Terminal | undefined {
    return this.world.terminals
      .filter((terminal) => !terminal.hacked)
      .find(
        (terminal) =>
          Phaser.Math.Distance.Between(this.world.player.x, this.world.player.y, terminal.x, terminal.y) <=
          PLAYER_BALANCE.interactRange
      );
  }

  private nearestDoor(): Door | undefined {
    return this.world.doors.find((door) => {
      if (door.open) {
        return false;
      }
      const center = rectCenter(door.rect);
      return (
        Phaser.Math.Distance.Between(this.world.player.x, this.world.player.y, center.x, center.y) <=
        PLAYER_BALANCE.interactRange + 20
      );
    });
  }
}
