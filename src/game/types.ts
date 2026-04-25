export type Team = 'player' | 'enemy' | 'neutral';

export type AlertState = 'hidden' | 'searching' | 'detected';

export type WeaponId = 'silenced-pistol' | 'pulse-rifle' | 'scattergun' | 'rail-piercer';

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
  id: string;
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

export interface HudState {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  dashRatio: number;
  grenades: number;
  maxGrenades: number;
  weaponName: string;
  weaponColor: number;
  ammo: number;
  reserveAmmo: number;
  reloading: boolean;
  reloadRatio: number;
  alertState: AlertState;
  objectives: MissionObjective[];
  interactionPrompt: string;
  tacticalLog: string[];
  debugEnabled: boolean;
  enemiesAlive: number;
}

export interface MinimapActor {
  x: number;
  y: number;
  role?: EnemyRole;
  visible: boolean;
  captain?: boolean;
}

export interface MinimapSnapshot {
  width: number;
  height: number;
  walls: RectData[];
  doors: Array<DoorData & { open: boolean }>;
  terminals: Array<TerminalData & { hacked: boolean }>;
  extraction: RectData;
  canExtract: boolean;
  player: VectorData;
  enemies: MinimapActor[];
  debugEnabled: boolean;
}

export interface DamageSource {
  team: Team;
  label: string;
  position?: VectorData;
}
