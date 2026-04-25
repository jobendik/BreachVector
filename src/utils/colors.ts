export function withAlpha(color: number, alpha: number): number {
  return (Math.round(alpha * 255) << 24) | color;
}

export function cssColor(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}
