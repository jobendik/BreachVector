import { COLORS, TextureKeys } from '../game/constants';
import type { PickupType } from '../game/types';

export interface PickupDefinition {
  type: PickupType;
  displayName: string;
  textureKey: string;
  color: number;
  log: string;
}

export const pickupDefinitions: Record<PickupType, PickupDefinition> = {
  medkit: {
    type: 'medkit',
    displayName: 'Medkit',
    textureKey: TextureKeys.Medkit,
    color: COLORS.operatorGreenBright,
    log: 'Medkit recovered'
  },
  ammo: {
    type: 'ammo',
    displayName: 'Ammo Cache',
    textureKey: TextureKeys.Ammo,
    color: COLORS.systemCyan,
    log: 'Ammo cache secured'
  },
  grenade: {
    type: 'grenade',
    displayName: 'Grenade',
    textureKey: TextureKeys.GrenadePickup,
    color: COLORS.hazardOrange,
    log: 'Grenade restocked'
  }
};
