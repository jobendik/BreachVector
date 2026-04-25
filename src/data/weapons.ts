import { TextureKeys } from '../game/constants';
import type { WeaponDefinition, WeaponId } from '../game/types';

export const weapons: WeaponDefinition[] = [
  {
    id: 'silenced-pistol',
    displayName: 'Silenced Pistol',
    magazineSize: 12,
    reserveAmmo: 48,
    fireRate: 4.2,
    reloadTime: 1.0,
    damage: 32,
    projectileSpeed: 1120,
    spread: 0.025,
    projectileCount: 1,
    color: 0xa7f3d0,
    noiseRadius: 150,
    recoil: 34,
    screenShake: 1.8,
    pierce: 0,
    automatic: false,
    tracerWidth: 2,
    projectileTexture: TextureKeys.Bullet
  },
  {
    id: 'pulse-rifle',
    displayName: 'Pulse Rifle',
    magazineSize: 30,
    reserveAmmo: 120,
    fireRate: 10.5,
    reloadTime: 1.25,
    damage: 17,
    projectileSpeed: 1240,
    spread: 0.055,
    projectileCount: 1,
    color: 0x38bdf8,
    noiseRadius: 620,
    recoil: 50,
    screenShake: 2.4,
    pierce: 0,
    automatic: true,
    tracerWidth: 2,
    projectileTexture: TextureKeys.Bullet
  },
  {
    id: 'scattergun',
    displayName: 'Scattergun',
    magazineSize: 6,
    reserveAmmo: 30,
    fireRate: 1.25,
    reloadTime: 1.55,
    damage: 12,
    projectileSpeed: 860,
    spread: 0.23,
    projectileCount: 8,
    color: 0xfbbf24,
    noiseRadius: 760,
    recoil: 115,
    screenShake: 5.2,
    pierce: 0,
    automatic: false,
    tracerWidth: 3,
    projectileTexture: TextureKeys.Pellet
  },
  {
    id: 'rail-piercer',
    displayName: 'Rail Piercer',
    magazineSize: 3,
    reserveAmmo: 12,
    fireRate: 0.82,
    reloadTime: 2.0,
    damage: 120,
    projectileSpeed: 2600,
    spread: 0,
    projectileCount: 1,
    color: 0xc084fc,
    noiseRadius: 980,
    recoil: 155,
    screenShake: 6,
    pierce: 4,
    automatic: false,
    tracerWidth: 5,
    projectileTexture: TextureKeys.Rail
  }
];

export const weaponById: Record<WeaponId, WeaponDefinition> = weapons.reduce(
  (lookup, weapon) => {
    lookup[weapon.id] = weapon;
    return lookup;
  },
  {} as Record<WeaponId, WeaponDefinition>
);
