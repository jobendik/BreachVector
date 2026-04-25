import Phaser from 'phaser';
import { PLAYER_BALANCE, TextureKeys } from '../game/constants';
import type { WeaponState } from '../game/types';
import { weapons } from '../data/weapons';
import { Actor } from './Actor';

export class Player extends Actor {
  weaponStates: WeaponState[];
  selectedWeaponIndex = 1;
  grenades: number = PLAYER_BALANCE.startingGrenades;
  dashCooldownRemaining = 0;
  dashRemaining = 0;
  meleeCooldown = 0;
  noiseMultiplier = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TextureKeys.Player, 'player', {
      maxHealth: PLAYER_BALANCE.maxHealth,
      maxArmor: PLAYER_BALANCE.maxArmor,
      armor: PLAYER_BALANCE.startingArmor,
      radius: PLAYER_BALANCE.radius,
      speed: PLAYER_BALANCE.speed
    });

    this.weaponStates = weapons.map((definition) => ({
      definition,
      ammo: definition.magazineSize,
      reserveAmmo: definition.reserveAmmo,
      cooldown: 0,
      reloadRemaining: 0
    }));
    this.setDepth(25);
  }

  get selectedWeapon(): WeaponState {
    return this.weaponStates[this.selectedWeaponIndex];
  }

  get dashRatio(): number {
    return 1 - Phaser.Math.Clamp(this.dashCooldownRemaining / PLAYER_BALANCE.dashCooldown, 0, 1);
  }

  updateTimers(deltaSeconds: number): void {
    this.dashCooldownRemaining = Math.max(0, this.dashCooldownRemaining - deltaSeconds);
    this.dashRemaining = Math.max(0, this.dashRemaining - deltaSeconds);
    this.meleeCooldown = Math.max(0, this.meleeCooldown - deltaSeconds);

    for (const state of this.weaponStates) {
      state.cooldown = Math.max(0, state.cooldown - deltaSeconds);
      if (state.reloadRemaining > 0) {
        state.reloadRemaining = Math.max(0, state.reloadRemaining - deltaSeconds);
        if (state.reloadRemaining === 0) {
          const needed = state.definition.magazineSize - state.ammo;
          const loaded = Math.min(needed, state.reserveAmmo);
          state.ammo += loaded;
          state.reserveAmmo -= loaded;
        }
      }
    }
  }

  aimAt(worldPoint: Phaser.Math.Vector2): void {
    this.setFacingVector(worldPoint.clone().subtract(this.positionVector));
  }

  applyMovement(direction: Phaser.Math.Vector2, slowWalk: boolean, deltaSeconds: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.noiseMultiplier = slowWalk ? PLAYER_BALANCE.quietNoiseMultiplier : 1;

    if (this.dashRemaining > 0) {
      return;
    }

    const moving = direction.lengthSq() > 0.001;
    const speed = this.moveSpeed * (slowWalk ? PLAYER_BALANCE.slowMultiplier : 1);
    const desired = moving ? direction.clone().normalize().scale(speed) : new Phaser.Math.Vector2();
    const response = moving ? PLAYER_BALANCE.acceleration : PLAYER_BALANCE.braking;
    const t = Phaser.Math.Clamp(deltaSeconds * response, 0, 1);
    body.setVelocity(
      Phaser.Math.Linear(body.velocity.x, desired.x, t),
      Phaser.Math.Linear(body.velocity.y, desired.y, t)
    );
  }

  tryDash(direction: Phaser.Math.Vector2): boolean {
    if (this.dashCooldownRemaining > 0 || direction.lengthSq() <= 0.001) {
      return false;
    }
    const body = this.body as Phaser.Physics.Arcade.Body;
    const dash = direction.clone().normalize().scale(PLAYER_BALANCE.dashSpeed);
    body.setVelocity(dash.x, dash.y);
    this.dashRemaining = PLAYER_BALANCE.dashDuration;
    this.dashCooldownRemaining = PLAYER_BALANCE.dashCooldown;
    return true;
  }

  switchWeapon(index: number): boolean {
    if (index < 0 || index >= this.weaponStates.length || this.selectedWeaponIndex === index) {
      return false;
    }
    this.selectedWeaponIndex = index;
    return true;
  }
}
