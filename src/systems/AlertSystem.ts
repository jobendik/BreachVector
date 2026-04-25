import { GameEvents, eventBus } from '../game/events';
import type { AlertState } from '../game/types';
import { missionText } from '../data/missionText';

export class AlertSystem {
  state: AlertState = 'hidden';
  private detectedTimer = 0;
  private searchingTimer = 0;

  update(deltaSeconds: number): void {
    this.detectedTimer = Math.max(0, this.detectedTimer - deltaSeconds);
    this.searchingTimer = Math.max(0, this.searchingTimer - deltaSeconds);
    const next: AlertState = this.detectedTimer > 0 ? 'detected' : this.searchingTimer > 0 ? 'searching' : 'hidden';
    this.setState(next);
  }

  raiseDetected(seconds = 3.2): void {
    this.detectedTimer = Math.max(this.detectedTimer, seconds);
    this.searchingTimer = Math.max(this.searchingTimer, seconds + 3);
    this.setState('detected');
  }

  raiseSearch(seconds = 4): void {
    if (this.state !== 'detected') {
      this.searchingTimer = Math.max(this.searchingTimer, seconds);
      this.setState('searching');
    }
  }

  private setState(next: AlertState): void {
    if (this.state === next) {
      return;
    }
    this.state = next;
    const detail =
      next === 'detected'
        ? missionText.alertDetected
        : next === 'searching'
          ? missionText.alertSearching
          : missionText.hidden;
    eventBus.emit(GameEvents.AlertChanged, { state: next, detail });
    if (next !== 'hidden') {
      eventBus.emit(GameEvents.TacticalLog, { message: detail });
    }
  }
}
