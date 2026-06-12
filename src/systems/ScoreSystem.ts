import { GameEvents, eventBus } from '../game/events';
import type { EnemyRole, ScoreBreakdown, SectorReport } from '../game/types';

const BASE_KILL_SCORE: Record<EnemyRole, number> = {
  assault: 100,
  flanker: 125,
  sniper: 150,
  heavy: 200,
  captain: 500
};

const STREAK_LABELS: Array<{ chain: number; label: string }> = [
  { chain: 2, label: 'DOUBLE KILL' },
  { chain: 3, label: 'TRIPLE KILL' },
  { chain: 4, label: 'RAMPAGE' },
  { chain: 5, label: 'MASSACRE' },
  { chain: 6, label: 'UNSTOPPABLE' }
];

export const COMBO_WINDOW_SECONDS = 5;
export const MAX_MULTIPLIER = 5;

export interface KillAward {
  points: number;
  multiplier: number;
  chain: number;
  ghostBonus: boolean;
  streakLabel?: string;
}

export class ScoreSystem {
  private score = 0;
  private chain = 0;
  private comboRemaining = 0;

  get totalScore(): number {
    return this.score;
  }

  update(deltaSeconds: number): void {
    if (this.chain === 0) {
      return;
    }
    this.comboRemaining -= deltaSeconds;
    if (this.comboRemaining <= 0) {
      this.chain = 0;
      this.comboRemaining = 0;
      this.emitScore(0);
    }
  }

  registerKill(role: EnemyRole, ghostKill: boolean): KillAward {
    this.chain += 1;
    this.comboRemaining = COMBO_WINDOW_SECONDS;
    const multiplier = Math.min(MAX_MULTIPLIER, 1 + (this.chain - 1) * 0.5);
    const base = BASE_KILL_SCORE[role];
    const ghostBonus = ghostKill;
    const points = Math.round(base * multiplier * (ghostBonus ? 1.5 : 1));
    this.score += points;

    const streakLabel = STREAK_LABELS.filter((entry) => entry.chain <= this.chain).at(-1)?.label;
    const announce = this.chain >= 2 ? (this.chain > 6 ? 'UNSTOPPABLE' : streakLabel) : undefined;
    this.emitScore(points);
    if (announce) {
      eventBus.emit(GameEvents.KillStreak, { label: announce, chain: this.chain });
    }
    return { points, multiplier, chain: this.chain, ghostBonus, streakLabel: announce };
  }

  addObjectiveScore(points: number): void {
    this.score += points;
    this.emitScore(points);
  }

  finalizeReport(report: Omit<SectorReport, 'score' | 'scoreBreakdown'>): ScoreBreakdown {
    const stealthBonus = report.stealthRating === 'Silent' ? 1000 : report.stealthRating === 'Compromised' ? 400 : 0;
    const accuracyBonus = Math.round(report.accuracy * 500);
    const timeBonus = Math.max(0, Math.round(1500 - report.completionTimeSeconds * 5));
    const untouchableBonus = report.damageTaken <= 0 ? 750 : 0;
    return {
      combatScore: this.score,
      stealthBonus,
      accuracyBonus,
      timeBonus,
      untouchableBonus,
      total: this.score + stealthBonus + accuracyBonus + timeBonus + untouchableBonus
    };
  }

  private emitScore(delta: number): void {
    eventBus.emit(GameEvents.ScoreChanged, {
      score: this.score,
      chain: this.chain,
      multiplier: Math.min(MAX_MULTIPLIER, this.chain === 0 ? 1 : 1 + (this.chain - 1) * 0.5),
      comboRemainingSeconds: this.comboRemaining,
      comboWindowSeconds: COMBO_WINDOW_SECONDS,
      delta
    });
  }
}
