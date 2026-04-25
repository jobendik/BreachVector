export const GAME_TITLE = 'BREACH VECTOR: BLACKSITE';

export const VIEWPORT = {
  width: 1280,
  height: 720
} as const;

export const DEPTHS = {
  floor: -20,
  decals: -10,
  props: 5,
  terminals: 8,
  pickups: 9,
  actors: 20,
  projectiles: 25,
  effects: 35,
  fog: 45,
  debug: 1000,
  ui: 2000
} as const;

export const COLORS = {
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
  slate: 0x64748b,
  white: 0xe5eefb,
  black: 0x020617
} as const;

export const TextureKeys = {
  Player: 'operator-player',
  EnemyAssault: 'enemy-assault',
  EnemySniper: 'enemy-sniper',
  EnemyFlanker: 'enemy-flanker',
  EnemyHeavy: 'enemy-heavy',
  EnemyCaptain: 'enemy-captain',
  Bullet: 'round-bullet',
  Pellet: 'scatter-pellet',
  Rail: 'rail-shot',
  Grenade: 'frag-grenade',
  Door: 'security-door',
  Terminal: 'security-terminal',
  Crate: 'cover-crate',
  Barrel: 'explosive-barrel',
  Medkit: 'pickup-medkit',
  Ammo: 'pickup-ammo',
  GrenadePickup: 'pickup-grenade',
  Extraction: 'extraction-zone',
  Particle: 'particle-dot',
  Spark: 'particle-spark',
  Muzzle: 'muzzle-flash'
} as const;

export const PLAYER_BALANCE = {
  maxHealth: 120,
  maxArmor: 60,
  startingArmor: 50,
  radius: 13,
  speed: 235,
  slowMultiplier: 0.55,
  acceleration: 15,
  braking: 18,
  dashSpeed: 820,
  dashDuration: 0.14,
  dashCooldown: 0.95,
  startingGrenades: 3,
  maxGrenades: 3,
  interactRange: 74,
  meleeRange: 50,
  meleeDamage: 92,
  quietNoiseMultiplier: 0.2
} as const;

export const WORLD_BALANCE = {
  projectileLifetime: 1.5,
  grenadeFuse: 1.45,
  grenadeRadius: 170,
  grenadeDamage: 110,
  barrelRadius: 155,
  barrelDamage: 120,
  extractionPulseSeconds: 1.3
} as const;
