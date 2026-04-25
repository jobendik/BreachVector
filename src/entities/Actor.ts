import Phaser from 'phaser';
import type { DamageSource, Team } from '../game/types';

export interface ActorStats {
  maxHealth: number;
  maxArmor: number;
  armor: number;
  radius: number;
  speed: number;
}

export interface DamageResult {
  killed: boolean;
  appliedHealthDamage: number;
  absorbedArmor: number;
}

export abstract class Actor extends Phaser.Physics.Arcade.Sprite {
  readonly actorId: string;
  readonly team: Team;
  readonly collisionRadius: number;
  maxHealth: number;
  health: number;
  maxArmor: number;
  armor: number;
  moveSpeed: number;
  facing = new Phaser.Math.Vector2(1, 0);
  dead = false;
  lastDamageSource?: DamageSource;

  protected constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    team: Team,
    stats: ActorStats
  ) {
    super(scene, x, y, textureKey);
    this.actorId = Phaser.Utils.String.UUID();
    this.team = team;
    this.collisionRadius = stats.radius;
    this.maxHealth = stats.maxHealth;
    this.health = stats.maxHealth;
    this.maxArmor = stats.maxArmor;
    this.armor = stats.armor;
    this.moveSpeed = stats.speed;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCollideWorldBounds(true);
    body.setDamping(true);
    body.setDrag(0.86);
    body.setSize(stats.radius * 2, stats.radius * 2);
    body.setOffset(this.width / 2 - stats.radius, this.height / 2 - stats.radius);

    this.setDepth(20);
  }

  get positionVector(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.x, this.y);
  }

  setFacingVector(vector: Phaser.Math.Vector2): void {
    if (vector.lengthSq() <= 0.001) {
      return;
    }
    this.facing.copy(vector.clone().normalize());
    this.setRotation(this.facing.angle());
  }

  takeDamage(amount: number, source: DamageSource): DamageResult {
    if (this.dead) {
      return { killed: false, appliedHealthDamage: 0, absorbedArmor: 0 };
    }

    this.lastDamageSource = source;
    let remaining = amount;
    let absorbedArmor = 0;

    if (this.armor > 0) {
      absorbedArmor = Math.min(this.armor, remaining * 0.65);
      this.armor = Math.max(0, this.armor - absorbedArmor);
      remaining -= absorbedArmor;
    }

    this.health = Math.max(0, this.health - remaining);
    const killed = this.health <= 0;
    if (killed) {
      this.dead = true;
      this.disableBody(true, true);
    }

    return { killed, appliedHealthDamage: remaining, absorbedArmor };
  }

  restoreHealth(amount: number): void {
    this.health = Phaser.Math.Clamp(this.health + amount, 0, this.maxHealth);
  }

  restoreArmor(amount: number): void {
    this.armor = Phaser.Math.Clamp(this.armor + amount, 0, this.maxArmor);
  }
}
