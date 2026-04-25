import Phaser from 'phaser';
import { DEPTHS, WORLD_BALANCE } from '../game/constants';
import type { DamageSource, Team } from '../game/types';
import type { Prop } from './Prop';

export interface ProjectileConfig {
  ownerId: string;
  team: Team;
  x: number;
  y: number;
  angle: number;
  speed: number;
  damage: number;
  pierce: number;
  color: number;
  textureKey: string;
  tracerWidth: number;
  sourceLabel: string;
}

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  readonly ownerId: string;
  readonly ownerTeam: Team;
  readonly damage: number;
  readonly color: number;
  readonly tracerWidth: number;
  readonly sourceLabel: string;
  readonly hitActors = new Set<string>();
  readonly hitProps = new Set<Prop>();
  pierceRemaining: number;
  lifetime = WORLD_BALANCE.projectileLifetime;
  previousPosition: Phaser.Math.Vector2;

  constructor(scene: Phaser.Scene, config: ProjectileConfig) {
    super(scene, config.x, config.y, config.textureKey);
    this.ownerId = config.ownerId;
    this.ownerTeam = config.team;
    this.damage = config.damage;
    this.pierceRemaining = config.pierce;
    this.color = config.color;
    this.tracerWidth = config.tracerWidth;
    this.sourceLabel = config.sourceLabel;
    this.previousPosition = new Phaser.Math.Vector2(config.x, config.y);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(10, 6);
    body.setVelocity(Math.cos(config.angle) * config.speed, Math.sin(config.angle) * config.speed);
    this.setRotation(config.angle);
    this.setTint(config.color);
    this.setDepth(DEPTHS.projectiles);
  }

  get damageSource(): DamageSource {
    return {
      team: this.ownerTeam,
      label: this.sourceLabel,
      position: { x: this.x, y: this.y }
    };
  }

  update(deltaSeconds: number): void {
    this.previousPosition.set(this.x, this.y);
    this.lifetime -= deltaSeconds;
    if (this.lifetime <= 0) {
      this.destroy();
    }
  }

  consumePierce(): void {
    if (this.pierceRemaining <= 0) {
      this.destroy();
      return;
    }
    this.pierceRemaining -= 1;
  }
}
