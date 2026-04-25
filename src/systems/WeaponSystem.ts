import Phaser from 'phaser';
import type { WeaponDefinition } from '../game/types';
import { Grenade } from '../entities/Grenade';
import { Projectile } from '../entities/Projectile';
import type { Enemy } from '../entities/Enemy';
import { EnemyState } from '../game/types';
import type { Player } from '../entities/Player';

interface WeaponWorld {
  effects: {
    muzzleFlash(x: number, y: number, angle: number, color: number): void;
    tracer(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2, color: number, width: number): void;
    shake(intensity: number): void;
  };
  audio: {
    play(id: 'pistol' | 'rifle' | 'shotgun' | 'rail' | 'enemy' | 'reload' | 'dash'): void;
  };
  spawnProjectile(projectile: Projectile): void;
  spawnGrenade(grenade: Grenade): void;
  emitNoise(point: Phaser.Math.Vector2, radius: number, important?: boolean): void;
  scene: Phaser.Scene;
}

export class WeaponSystem {
  constructor(private readonly world: WeaponWorld) {}

  update(_deltaSeconds: number): void {
    // Player and enemy timers live on their owning actors so save/load and HUD stay simple.
  }

  tryFirePlayer(player: Player, target: Phaser.Math.Vector2, held: boolean, pressed: boolean): boolean {
    const state = player.selectedWeapon;
    const definition = state.definition;
    if (state.reloadRemaining > 0 || state.cooldown > 0 || state.ammo <= 0) {
      if (state.ammo <= 0 && state.reserveAmmo > 0) {
        this.startReload(player);
      }
      return false;
    }
    if (!definition.automatic && !pressed) {
      return false;
    }
    if (definition.automatic && !held) {
      return false;
    }

    state.ammo -= 1;
    state.cooldown = 1 / definition.fireRate;
    this.fireProjectiles(player.actorId, 'player', definition, player.positionVector, target);
    this.applyRecoil(player, target, definition.recoil);
    this.world.effects.shake(definition.screenShake);
    this.world.emitNoise(
      player.positionVector,
      definition.noiseRadius * player.noiseMultiplier,
      definition.noiseRadius > 500
    );
    this.world.audio.play(this.soundFor(definition));
    return true;
  }

  startReload(player: Player): boolean {
    const state = player.selectedWeapon;
    if (state.reloadRemaining > 0 || state.ammo >= state.definition.magazineSize || state.reserveAmmo <= 0) {
      return false;
    }
    state.reloadRemaining = state.definition.reloadTime;
    this.world.audio.play('reload');
    return true;
  }

  throwGrenade(player: Player, target: Phaser.Math.Vector2): boolean {
    if (player.grenades <= 0) {
      return false;
    }
    player.grenades -= 1;
    const angle = Phaser.Math.Angle.Between(player.x, player.y, target.x, target.y);
    const spawn = player.positionVector.add(player.facing.clone().scale(22));
    const grenade = new Grenade(this.world.scene, spawn.x, spawn.y, angle, 'player');
    this.world.spawnGrenade(grenade);
    this.world.emitNoise(player.positionVector, 300, true);
    return true;
  }

  tryFireEnemy(enemy: Enemy, target: Phaser.Math.Vector2): boolean {
    if (enemy.dead || enemy.reloadRemaining > 0 || enemy.fireCooldown > 0) {
      return false;
    }
    if (enemy.shotsUntilReload <= 0) {
      enemy.reloadRemaining = enemy.config.reloadTime;
      enemy.shotsUntilReload = Phaser.Math.Between(5, 10);
      enemy.setAIState(EnemyState.Reload);
      return false;
    }

    enemy.fireCooldown = 1 / enemy.config.fireRate;
    enemy.shotsUntilReload -= 1;
    const muzzle = enemy.positionVector.add(enemy.facing.clone().scale(enemy.collisionRadius + 8));
    for (let i = 0; i < enemy.config.burstCount; i += 1) {
      const angle =
        Phaser.Math.Angle.Between(muzzle.x, muzzle.y, target.x, target.y) +
        Phaser.Math.FloatBetween(-enemy.config.accuracy, enemy.config.accuracy);
      const projectile = new Projectile(this.world.scene, {
        ownerId: enemy.actorId,
        team: 'enemy',
        x: muzzle.x,
        y: muzzle.y,
        angle,
        speed: enemy.config.projectileSpeed,
        damage: enemy.config.damage,
        pierce: 0,
        color: enemy.config.color,
        textureKey: 'round-bullet',
        tracerWidth: 2,
        sourceLabel: enemy.config.displayName
      });
      this.world.spawnProjectile(projectile);
      const trailEnd = muzzle.clone().add(new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).scale(90));
      this.world.effects.tracer(muzzle, trailEnd, enemy.config.color, 2);
    }
    this.world.effects.muzzleFlash(muzzle.x, muzzle.y, enemy.facing.angle(), enemy.config.color);
    this.world.emitNoise(enemy.positionVector, enemy.config.noiseRadius, true);
    this.world.audio.play('enemy');
    return true;
  }

  private fireProjectiles(
    ownerId: string,
    team: 'player',
    definition: WeaponDefinition,
    origin: Phaser.Math.Vector2,
    target: Phaser.Math.Vector2
  ): void {
    const baseAngle = Phaser.Math.Angle.Between(origin.x, origin.y, target.x, target.y);
    const muzzle = origin.clone().add(new Phaser.Math.Vector2(Math.cos(baseAngle), Math.sin(baseAngle)).scale(24));
    for (let i = 0; i < definition.projectileCount; i += 1) {
      const pattern =
        definition.projectileCount > 1
          ? Phaser.Math.Linear(-definition.spread, definition.spread, i / Math.max(1, definition.projectileCount - 1))
          : 0;
      const angle = baseAngle + pattern + Phaser.Math.FloatBetween(-definition.spread * 0.28, definition.spread * 0.28);
      const projectile = new Projectile(this.world.scene, {
        ownerId,
        team,
        x: muzzle.x,
        y: muzzle.y,
        angle,
        speed: definition.projectileSpeed,
        damage: definition.damage,
        pierce: definition.pierce,
        color: definition.color,
        textureKey: definition.projectileTexture,
        tracerWidth: definition.tracerWidth,
        sourceLabel: definition.displayName
      });
      this.world.spawnProjectile(projectile);
      const trailEnd = muzzle.clone().add(new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).scale(125));
      this.world.effects.tracer(muzzle, trailEnd, definition.color, definition.tracerWidth);
    }
    this.world.effects.muzzleFlash(muzzle.x, muzzle.y, baseAngle, definition.color);
  }

  private applyRecoil(player: Player, target: Phaser.Math.Vector2, recoil: number): void {
    const body = player.body as Phaser.Physics.Arcade.Body;
    const angle = Phaser.Math.Angle.Between(player.x, player.y, target.x, target.y);
    body.velocity.x -= Math.cos(angle) * recoil;
    body.velocity.y -= Math.sin(angle) * recoil;
  }

  private soundFor(definition: WeaponDefinition): 'pistol' | 'rifle' | 'shotgun' | 'rail' {
    if (definition.id === 'silenced-pistol') return 'pistol';
    if (definition.id === 'scattergun') return 'shotgun';
    if (definition.id === 'rail-piercer') return 'rail';
    return 'rifle';
  }
}
