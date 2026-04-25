import Phaser from 'phaser';
import { DEPTHS, PLAYER_BALANCE } from '../game/constants';
import type { PickupData, PickupType } from '../game/types';
import { pickupDefinitions } from '../data/pickups';
import type { Player } from './Player';

export class Pickup extends Phaser.Physics.Arcade.Sprite {
  readonly pickupType: PickupType;

  constructor(scene: Phaser.Scene, data: PickupData) {
    const definition = pickupDefinitions[data.type];
    super(scene, data.x, data.y, definition.textureKey);
    this.pickupType = data.type;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCircle(13);
    this.setTint(definition.color);
    this.setDepth(DEPTHS.pickups);
  }

  apply(player: Player): string {
    if (this.pickupType === 'medkit') {
      player.restoreHealth(45);
      player.restoreArmor(10);
    } else if (this.pickupType === 'ammo') {
      for (const state of player.weaponStates) {
        state.reserveAmmo += Math.ceil(state.definition.magazineSize * 0.7);
      }
    } else {
      player.grenades = Phaser.Math.Clamp(player.grenades + 1, 0, PLAYER_BALANCE.maxGrenades);
    }
    this.disableBody(true, true);
    return pickupDefinitions[this.pickupType].log;
  }
}
