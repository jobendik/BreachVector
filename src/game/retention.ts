const STORAGE_KEY = 'breach-vector-retention';

export interface RetentionState {
  lastPlayedDay: string;
  streakDays: number;
  bestStreakDays: number;
  totalSessions: number;
}

export interface RetentionVisit {
  state: RetentionState;
  isNewDay: boolean;
  streakExtended: boolean;
  streakBroken: boolean;
}

export function recordVisit(now = new Date()): RetentionVisit {
  const state = loadRetention();
  const today = dayKey(now);
  if (state.lastPlayedDay === today) {
    return { state, isNewDay: false, streakExtended: false, streakBroken: false };
  }

  const yesterday = dayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const streakExtended = state.lastPlayedDay === yesterday;
  const streakBroken = state.lastPlayedDay !== '' && !streakExtended;
  const streakDays = streakExtended ? state.streakDays + 1 : 1;
  const next: RetentionState = {
    lastPlayedDay: today,
    streakDays,
    bestStreakDays: Math.max(state.bestStreakDays, streakDays),
    totalSessions: state.totalSessions + 1
  };
  saveRetention(next);
  return { state: next, isNewDay: true, streakExtended, streakBroken };
}

export function loadRetention(): RetentionState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyRetention();
    }
    const parsed = JSON.parse(raw) as Partial<RetentionState>;
    return {
      lastPlayedDay: typeof parsed.lastPlayedDay === 'string' ? parsed.lastPlayedDay : '',
      streakDays: positiveInt(parsed.streakDays),
      bestStreakDays: positiveInt(parsed.bestStreakDays),
      totalSessions: positiveInt(parsed.totalSessions)
    };
  } catch {
    return emptyRetention();
  }
}

function saveRetention(state: RetentionState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Retention is a convenience feature; gameplay continues without storage.
  }
}

function emptyRetention(): RetentionState {
  return { lastPlayedDay: '', streakDays: 0, bestStreakDays: 0, totalSessions: 0 };
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
}

function positiveInt(value: unknown): number {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number > 0 ? number : 0;
}
