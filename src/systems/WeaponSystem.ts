import Phaser from 'phaser';
import type { WeaponDefinition, WeaponId } from '../game/types';
import { WORLD_BALANCE } from '../game/constants';
import { Grenade } from '../entities/Grenade';
import { Projectile } from '../entities/Projectile';
import type { Enemy } from '../entities/Enemy';
import { EnemyState } from '../game/types';
import type { Player } from '../entities/Player';
import type { MuzzleFlashOptions } from '../effects/MuzzleFlash';
import type { TracerOptions } from './EffectsSystem';

const GRENADE_MIN_RANGE = 150;
const GRENADE_MAX_RANGE = 560;
const GRENADE_SPEED_BONUS = 36;

interface WeaponWorld {
  effects: {
    muzzleFlash(x: number, y: number, angle: number, color: number, options?: MuzzleFlashOptions): void;
    tracer(
      from: Phaser.Math.Vector2,
      to: Phaser.Math.Vector2,
      color: number,
      width: number,
      options?: TracerOptions
    ): void;
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
    const preview = this.grenadePreview(player, target);
    const angle = Phaser.Math.Angle.Between(player.x, player.y, preview.target.x, preview.target.y);
    const spawn = player.positionVector.add(player.facing.clone().scale(22));
    const grenade = new Grenade(this.world.scene, spawn.x, spawn.y, angle, 'player', preview.speed);
    this.world.spawnGrenade(grenade);
    this.world.emitNoise(player.positionVector, 300, true);
    return true;
  }

  grenadePreview(player: Player, target: Phaser.Math.Vector2): { target: Phaser.Math.Vector2; speed: number } {
    const offset = target.clone().subtract(player.positionVector);
    const distance = Phaser.Math.Clamp(offset.length(), GRENADE_MIN_RANGE, GRENADE_MAX_RANGE);
    const direction = offset.lengthSq() > 0.001 ? offset.normalize() : player.facing.clone();
    return {
      target: player.positionVector.add(direction.scale(distance)),
      speed: distance / WORLD_BALANCE.grenadeFuse + GRENADE_SPEED_BONUS
    };
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

    enemy.fireCooldown = (1 / enemy.config.fireRate) * (enemy.commandBoostTimer > 0 ? 0.72 : 1);
    enemy.shotsUntilReload -= 1;
    const muzzle = enemy.positionVector.add(enemy.facing.clone().scale(enemy.collisionRadius + 8));
    for (let i = 0; i < enemy.config.burstCount; i += 1) {
      const angle =
        Phaser.Math.Angle.Between(muzzle.x, muzzle.y, target.x, target.y) +
        Phaser.Math.FloatBetween(
          -enemy.config.accuracy * (enemy.commandBoostTimer > 0 ? 0.72 : 1),
          enemy.config.accuracy * (enemy.commandBoostTimer > 0 ? 0.72 : 1)
        );
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
      this.world.effects.tracer(muzzle, trailEnd, enemy.config.color, 2, {
        duration: 95,
        glowWidth: enemy.commandBoostTimer > 0 ? 6 : 4,
        glowAlpha: enemy.commandBoostTimer > 0 ? 0.2 : 0.12
      });
    }
    this.world.effects.muzzleFlash(muzzle.x, muzzle.y, enemy.facing.angle(), enemy.config.color, {
      length: enemy.commandBoostTimer > 0 ? 48 : 38,
      width: enemy.commandBoostTimer > 0 ? 8 : 6,
      coreRadius: 4,
      duration: 85
    });
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
      const trail = this.tracerProfile(definition.id);
      const trailEnd = muzzle
        .clone()
        .add(new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).scale(trail.length));
      this.world.effects.tracer(muzzle, trailEnd, definition.color, trail.width, trail.options);
    }
    this.world.effects.muzzleFlash(muzzle.x, muzzle.y, baseAngle, definition.color, this.muzzleProfile(definition.id));
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

  private tracerProfile(id: WeaponId): { length: number; width: number; options: TracerOptions } {
    if (id === 'silenced-pistol') {
      return {
        length: 92,
        width: 1.5,
        options: { alpha: 0.62, duration: 80, glowWidth: 3, glowAlpha: 0.08 }
      };
    }
    if (id === 'pulse-rifle') {
      return {
        length: 136,
        width: 2.4,
        options: { alpha: 0.88, duration: 105, glowWidth: 7, glowAlpha: 0.18, sparkColor: 0x38bdf8 }
      };
    }
    if (id === 'scattergun') {
      return {
        length: 88,
        width: 2.8,
        options: { alpha: 0.72, duration: 120, glowWidth: 5, glowAlpha: 0.1, sparkColor: 0xfbbf24 }
      };
    }
    return {
      length: 230,
      width: 6,
      options: { alpha: 0.96, duration: 170, glowWidth: 15, glowAlpha: 0.24, afterimage: true, sparkColor: 0xc084fc }
    };
  }

  private muzzleProfile(id: WeaponId): MuzzleFlashOptions {
    if (id === 'silenced-pistol') {
      return { length: 26, width: 4, coreRadius: 3, duration: 65, stretch: 1.18, fadeScaleY: 0.42 };
    }
    if (id === 'pulse-rifle') {
      return { length: 44, width: 7, coreRadius: 5, duration: 85, stretch: 1.35, fadeScaleY: 0.34 };
    }
    if (id === 'scattergun') {
      return { length: 56, width: 13, coreRadius: 7, duration: 120, stretch: 1.25, fadeScaleY: 0.5 };
    }
    return { length: 76, width: 10, coreRadius: 8, duration: 150, stretch: 1.55, fadeScaleY: 0.28 };
  }
}
