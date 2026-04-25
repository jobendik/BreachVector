export const COLORS = {
  blacksiteNavy: 0x020617,
  blacksitePanel: 0x07111f,
  blacksitePanelLight: 0x0f172a,
  floorPlate: 0x06111f,
  wallCore: 0x162033,
  wallEdge: 0x38bdf8,
  systemCyan: 0x38bdf8,
  systemCyanSoft: 0xa5f3fc,
  operatorGreen: 0x10b981,
  operatorGreenBright: 0x34d399,
  operatorGreenSoft: 0xa7f3d0,
  alertRed: 0xef4444,
  alertRedSoft: 0xfca5a5,
  hazardOrange: 0xf97316,
  hazardOrangeSoft: 0xfed7aa,
  hazardAmber: 0xf59e0b,
  hazardAmberBright: 0xfbbf24,
  hazardAmberSoft: 0xfef3c7,
  energyViolet: 0xa855f7,
  energyVioletBright: 0xc084fc,
  energyVioletSoft: 0xddd6fe,
  steelSlate: 0x64748b,
  steelDark: 0x334155,
  steelMid: 0x475569,
  steelLight: 0x94a3b8,
  textPrimary: 0xe5eefb,
  textBright: 0xf8fafc,
  textMuted: 0xcbd5e1,
  white: 0xffffff,
  black: 0x000000,

  background: 0x020617,
  floor: 0x06111f,
  wall: 0x162033,
  wallStroke: 0x38bdf8,
  cyan: 0x38bdf8,
  green: 0x10b981,
  greenBright: 0x34d399,
  red: 0xef4444,
  orange: 0xf97316,
  amber: 0xf59e0b,
  violet: 0xa855f7,
  slate: 0x64748b
} as const;

export const FACTION_COLORS = {
  operator: COLORS.operatorGreenBright,
  assault: COLORS.alertRed,
  sniper: COLORS.hazardOrange,
  flanker: COLORS.energyViolet,
  heavy: COLORS.hazardAmber,
  captain: COLORS.alertRed,
  neutral: COLORS.steelSlate
} as const;

export const GAMEPLAY_COLORS = {
  objective: COLORS.operatorGreenBright,
  system: COLORS.systemCyan,
  warning: COLORS.hazardAmberBright,
  danger: COLORS.alertRed,
  explosive: COLORS.hazardOrange,
  energy: COLORS.energyVioletBright,
  armor: COLORS.systemCyanSoft,
  health: COLORS.operatorGreenBright
} as const;

export function withAlpha(color: number, alpha: number): number {
  return (Math.round(alpha * 255) << 24) | color;
}

export function cssColor(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}
