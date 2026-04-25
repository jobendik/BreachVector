import type { EnemyState } from '../game/types';

export function formatEnemyState(state: EnemyState): string {
  return state.toUpperCase();
}

export function fpsLabel(fps: number): string {
  return `${Math.round(fps)} FPS`;
}
