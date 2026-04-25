import { missionText } from '../data/missionText';
import type { ExtractionZone } from '../entities/ExtractionZone';
import type { Player } from '../entities/Player';
import { GameEvents, eventBus } from '../game/events';
import type { LevelData, MissionObjective } from '../game/types';
import { pointInRect } from '../utils/geometry';

interface MissionWorld {
  level: LevelData;
  player: Player;
  extractionZone: ExtractionZone;
  audio: {
    play(id: 'complete'): void;
  };
  log(message: string): void;
  onSectorComplete(): void;
}

export class MissionSystem {
  private readonly terminalFlags = new Map<string, boolean>();
  private readonly level: LevelData;
  private extractionComplete = false;
  captainKilled = false;

  constructor(private readonly world: MissionWorld) {
    this.level = world.level;
    for (const id of this.level.requiredTerminalIds) {
      this.terminalFlags.set(id, false);
    }
    this.emit();
  }

  terminalHacked(id: string): void {
    if (!this.terminalFlags.has(id) || this.terminalFlags.get(id)) {
      return;
    }
    this.terminalFlags.set(id, true);
    eventBus.emit(GameEvents.TacticalLog, { message: missionText.terminalComplete(id) });
    if (this.terminalsComplete() && !this.level.requiresCaptainKill) {
      eventBus.emit(GameEvents.TacticalLog, { message: missionText.extractionReady });
    }
    this.emit();
  }

  commandTargetKilled(): void {
    if (this.captainKilled) {
      return;
    }
    this.captainKilled = true;
    eventBus.emit(GameEvents.TacticalLog, { message: missionText.captainDown });
    if (this.canExtract()) {
      eventBus.emit(GameEvents.TacticalLog, { message: missionText.extractionReady });
    }
    this.emit();
  }

  terminalsComplete(): boolean {
    return [...this.terminalFlags.values()].every(Boolean);
  }

  canExtract(): boolean {
    return this.terminalsComplete() && (!this.level.requiresCaptainKill || this.captainKilled);
  }

  updateExtraction(timeSeconds: number): void {
    const canExtract = this.canExtract();
    this.world.extractionZone.setExtractionReady(canExtract);
    this.world.extractionZone.pulse(timeSeconds);
    if (!canExtract || this.extractionComplete || !pointInRect(this.world.player, this.level.extraction)) {
      return;
    }

    this.extractionComplete = true;
    this.world.audio.play('complete');
    this.world.log(missionText.sectorClear);
    this.world.onSectorComplete();
  }

  objectives(): MissionObjective[] {
    const terminalObjectives = [...this.terminalFlags.entries()].map(([id, completed]) => ({
      id: `terminal-${id}`,
      label: `Hack terminal ${id.toUpperCase()}`,
      completed,
      emphasis: completed ? ('success' as const) : ('normal' as const)
    }));

    const captainObjective: MissionObjective = {
      id: 'captain',
      label: 'Neutralize command unit',
      completed: !this.level.requiresCaptainKill || this.captainKilled,
      emphasis: this.captainKilled ? 'success' : 'critical'
    };

    const extractObjective: MissionObjective = {
      id: 'extract',
      label: 'Reach extraction zone',
      completed: false,
      emphasis: this.canExtract() ? 'warning' : 'normal'
    };

    return [...terminalObjectives, captainObjective, extractObjective];
  }

  emit(): void {
    eventBus.emit(GameEvents.MissionUpdated, this.objectives());
  }
}
