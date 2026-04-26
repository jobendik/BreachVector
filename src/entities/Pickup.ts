import Phaser from 'phaser';
import { DEPTHS, PLAYER_BALANCE } from '../game/constants';
import type { PickupData, PickupType } from '../game/types';
import { pickupDefinitions } from '../data/pickups';
import type { Player } from './Player';

export class Pickup extends Phaser.Physics.Arcade.Sprite {
  readonly pickupType: PickupType;
  private blockedFeedbackReadyAt = 0;

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

  canApply(player: Player): boolean {
    if (this.pickupType === 'medkit') {
      return player.health < player.maxHealth || player.armor < player.maxArmor;
    }
    if (this.pickupType === 'grenade') {
      return player.grenades < PLAYER_BALANCE.maxGrenades;
    }
    return true;
  }

  blockedMessage(): string {
    if (this.pickupType === 'medkit') {
      return 'HP / ARMOR FULL';
    }
    if (this.pickupType === 'grenade') {
      return 'GRENADES FULL';
    }
    return 'FULL';
  }

  consumeBlockedFeedback(nowMs: number): boolean {
    if (nowMs < this.blockedFeedbackReadyAt) {
      return false;
    }
    this.blockedFeedbackReadyAt = nowMs + 850;
    return true;
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
