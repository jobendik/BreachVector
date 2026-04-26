export type Team = 'player' | 'enemy' | 'neutral';

export type AlertState = 'hidden' | 'searching' | 'detected';

export type WeaponId = 'silenced-pistol' | 'pulse-rifle' | 'scattergun' | 'rail-piercer';

export type LevelId = 'blacksite-approach' | 'vault-core';

export type EnemyRole = 'assault' | 'sniper' | 'flanker' | 'heavy' | 'captain';

export enum EnemyState {
  Guard = 'guard',
  Patrol = 'patrol',
  Suspicious = 'suspicious',
  Search = 'search',
  Attack = 'attack',
  Flank = 'flank',
  Cover = 'cover',
  Reload = 'reload',
  Dead = 'dead'
}

export type PickupType = 'medkit' | 'ammo' | 'grenade';

export type PropKind = 'crate' | 'barrel';

export type TacticalLogCategory = 'objective' | 'combat' | 'alert' | 'pickup' | 'system';

export type TacticalLogEmphasis = 'normal' | 'critical';

export interface TacticalLogEntry {
  message: string;
  category: TacticalLogCategory;
  emphasis?: TacticalLogEmphasis;
  count?: number;
}

export interface VectorData {
  x: number;
  y: number;
}

export interface RectData extends VectorData {
  w: number;
  h: number;
}

export interface WeaponDefinition {
  id: WeaponId;
  displayName: string;
  magazineSize: number;
  reserveAmmo: number;
  fireRate: number;
  reloadTime: number;
  damage: number;
  projectileSpeed: number;
  spread: number;
  projectileCount: number;
  color: number;
  noiseRadius: number;
  recoil: number;
  screenShake: number;
  pierce: number;
  automatic: boolean;
  tracerWidth: number;
  projectileTexture: string;
}

export interface WeaponState {
  definition: WeaponDefinition;
  ammo: number;
  reserveAmmo: number;
  cooldown: number;
  reloadRemaining: number;
}

export interface EnemyDefinition {
  role: EnemyRole;
  displayName: string;
  textureKey: string;
  health: number;
  armor: number;
  speed: number;
  radius: number;
  visionDistance: number;
  fov: number;
  preferredRange: number;
  attackRange: number;
  accuracy: number;
  damage: number;
  projectileSpeed: number;
  fireRate: number;
  burstCount: number;
  color: number;
  noiseRadius: number;
  reloadTime: number;
}

export interface EnemySpawnData extends VectorData {
  role: EnemyRole;
  angle?: number;
  patrol?: VectorData[];
}

export interface DoorData extends RectData {
  id: string;
  locked: boolean;
}

export interface TerminalData extends VectorData {
  id: string;
  prompt: string;
  hackTime: number;
}

export interface PropData extends VectorData {
  kind: PropKind;
  w?: number;
  h?: number;
}

export interface PickupData extends VectorData {
  type: PickupType;
}

export interface LevelData {
  id: LevelId;
  name: string;
  briefing: string;
  width: number;
  height: number;
  spawn: VectorData;
  extraction: RectData;
  walls: RectData[];
  doors: DoorData[];
  terminals: TerminalData[];
  props: PropData[];
  pickups: PickupData[];
  enemies: EnemySpawnData[];
  requiredTerminalIds: string[];
  requiresCaptainKill: boolean;
}

export interface MissionObjective {
  id: string;
  label: string;
  completed: boolean;
  emphasis?: 'normal' | 'warning' | 'critical' | 'success';
}

export interface EnemyAwarenessCounts {
  unaware: number;
  suspicious: number;
  engaged: number;
}

export interface HudState {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  dashRatio: number;
  grenades: number;
  maxGrenades: number;
  weaponId: WeaponId;
  weaponName: string;
  weaponColor: number;
  magazineSize: number;
  weaponFireMode: 'AUTO' | 'SEMI';
  weaponNoiseLevel: 'QUIET' | 'LOUD' | 'BREACH';
  ammo: number;
  reserveAmmo: number;
  reloading: boolean;
  reloadRatio: number;
  alertState: AlertState;
  enemySuspicion: number;
  lastSeenSeconds?: number;
  enemyAwareness: EnemyAwarenessCounts;
  objectives: MissionObjective[];
  interactionKind: 'none' | 'terminal' | 'door' | 'extraction';
  interactionPrompt: string;
  interactionProgress: number;
  tacticalLog: TacticalLogEntry[];
  debugEnabled: boolean;
  enemiesAlive: number;
  captainHealthRatio?: number;
  captainCommandActive: boolean;
}

export interface MinimapActor {
  x: number;
  y: number;
  role?: EnemyRole;
  visible: boolean;
  captain?: boolean;
}

export interface MinimapPickup extends VectorData {
  type: PickupType;
}

export interface MinimapPlayer extends VectorData {
  facing: VectorData;
}

export type MinimapZoomMode = 'sector' | 'local';

export interface MinimapSnapshot {
  width: number;
  height: number;
  zoomMode: MinimapZoomMode;
  alertState: AlertState;
  walls: RectData[];
  doors: Array<DoorData & { open: boolean }>;
  terminals: Array<TerminalData & { hacked: boolean }>;
  pickups: MinimapPickup[];
  extraction: RectData;
  canExtract: boolean;
  player: MinimapPlayer;
  enemies: MinimapActor[];
  debugEnabled: boolean;
}

export interface DamageSource {
  team: Team;
  label: string;
  position?: VectorData;
}

export type SectorGrade = 'S' | 'A' | 'B' | 'C';

export type StealthRating = 'Silent' | 'Compromised' | 'Full Breach';

export interface SectorReport {
  levelIndex: number;
  levelName: string;
  completionTimeSeconds: number;
  enemiesKilled: number;
  enemiesTotal: number;
  shotsFired: number;
  shotsHit: number;
  accuracy: number;
  damageTaken: number;
  objectivesCompleted: number;
  objectivesTotal: number;
  stealthRating: StealthRating;
  grade: SectorGrade;
  killBreakdown: Record<string, number>;
  deathCause?: string;
  tacticalAdvice?: string;
}
