import { levels } from '../data/levels';
import type { SectorGrade, SectorReport, StealthRating } from './types';

const STORAGE_KEY = 'breach-vector-progress';

const GRADE_SCORE: Record<SectorGrade, number> = {
  S: 4,
  A: 3,
  B: 2,
  C: 1
};

const STEALTH_SCORE: Record<StealthRating, number> = {
  Silent: 3,
  Compromised: 2,
  'Full Breach': 1
};

export interface SectorBest {
  levelIndex: number;
  levelName: string;
  bestGrade: SectorGrade;
  bestTimeSeconds: number;
  bestStealthRating: StealthRating;
  bestAccuracy: number;
  leastDamageTaken: number;
  completions: number;
  updatedAt: string;
}

export interface ProgressState {
  sectors: Record<string, SectorBest>;
}

export interface ProgressUpdate {
  progress: ProgressState;
  sector: SectorBest;
  newBestGrade: boolean;
  newBestTime: boolean;
  newBestStealth: boolean;
  firstClear: boolean;
}

export function loadProgress(): ProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyProgress();
    }
    return normalizeProgress(JSON.parse(raw) as Partial<ProgressState>);
  } catch {
    return emptyProgress();
  }
}

export function saveSectorReport(report: SectorReport): ProgressUpdate {
  const progress = loadProgress();
  const key = sectorKey(report.levelIndex);
  const previous = progress.sectors[key];
  const firstClear = !previous;
  const newBestGrade = !previous || GRADE_SCORE[report.grade] > GRADE_SCORE[previous.bestGrade];
  const newBestTime = !previous || report.completionTimeSeconds < previous.bestTimeSeconds;
  const newBestStealth = !previous || STEALTH_SCORE[report.stealthRating] > STEALTH_SCORE[previous.bestStealthRating];

  const sector: SectorBest = {
    levelIndex: report.levelIndex,
    levelName: report.levelName,
    bestGrade: newBestGrade ? report.grade : previous.bestGrade,
    bestTimeSeconds: newBestTime ? report.completionTimeSeconds : previous.bestTimeSeconds,
    bestStealthRating: newBestStealth ? report.stealthRating : previous.bestStealthRating,
    bestAccuracy: previous ? Math.max(previous.bestAccuracy, report.accuracy) : report.accuracy,
    leastDamageTaken: previous ? Math.min(previous.leastDamageTaken, report.damageTaken) : report.damageTaken,
    completions: (previous?.completions ?? 0) + 1,
    updatedAt: new Date().toISOString()
  };

  progress.sectors[key] = sector;
  saveProgress(progress);
  return { progress, sector, newBestGrade, newBestTime, newBestStealth, firstClear };
}

export function nextIncompleteLevelIndex(progress = loadProgress()): number {
  for (let index = 0; index < levels.length; index += 1) {
    if (!progress.sectors[sectorKey(index)]) {
      return index;
    }
  }
  return 0;
}

export function completedSectorCount(progress = loadProgress()): number {
  return Object.keys(progress.sectors).length;
}

export function resetProgress(): ProgressState {
  const progress = emptyProgress();
  saveProgress(progress);
  return progress;
}

function saveProgress(progress: ProgressState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Progress is a convenience feature; gameplay should continue if storage is unavailable.
  }
}

function emptyProgress(): ProgressState {
  return { sectors: {} };
}

function normalizeProgress(progress: Partial<ProgressState>): ProgressState {
  const sectors: Record<string, SectorBest> = {};
  for (const [key, value] of Object.entries(progress.sectors ?? {})) {
    if (!value || typeof value !== 'object') {
      continue;
    }
    const levelIndex = Number(value.levelIndex);
    const level = levels[levelIndex];
    if (!Number.isInteger(levelIndex) || !level) {
      continue;
    }
    sectors[key] = {
      levelIndex,
      levelName: value.levelName || level.name,
      bestGrade: normalizeGrade(value.bestGrade),
      bestTimeSeconds: positiveNumber(value.bestTimeSeconds),
      bestStealthRating: normalizeStealth(value.bestStealthRating),
      bestAccuracy: clamp01(value.bestAccuracy),
      leastDamageTaken: Math.max(0, Number(value.leastDamageTaken) || 0),
      completions: Math.max(1, Math.floor(Number(value.completions) || 1)),
      updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date(0).toISOString()
    };
  }
  return { sectors };
}

function sectorKey(levelIndex: number): string {
  return levels[levelIndex]?.id ?? `sector-${levelIndex}`;
}

function normalizeGrade(value: unknown): SectorGrade {
  return value === 'S' || value === 'A' || value === 'B' || value === 'C' ? value : 'C';
}

function normalizeStealth(value: unknown): StealthRating {
  return value === 'Silent' || value === 'Compromised' || value === 'Full Breach' ? value : 'Full Breach';
}

function positiveNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : Number.POSITIVE_INFINITY;
}

function clamp01(value: unknown): number {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 0;
  }
  return Math.max(0, Math.min(1, number));
}
