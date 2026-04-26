import Phaser from 'phaser';
import { DEPTHS, TextureKeys, WORLD_BALANCE } from '../game/constants';
import type { Team } from '../game/types';

export class Grenade extends Phaser.Physics.Arcade.Sprite {
  readonly ownerTeam: Team;
  private readonly launchVelocity: Phaser.Math.Vector2;
  private bounceCooldown = 0;
  fuseRemaining = WORLD_BALANCE.grenadeFuse;
  radius = WORLD_BALANCE.grenadeRadius;
  damage = WORLD_BALANCE.grenadeDamage;

  constructor(scene: Phaser.Scene, x: number, y: number, angle: number, ownerTeam: Team, speed = 560) {
    super(scene, x, y, TextureKeys.Grenade);
    this.ownerTeam = ownerTeam;
    this.launchVelocity = new Phaser.Math.Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCircle(7);
    body.setBounce(0.22);
    body.setDrag(0.9);
    body.setVelocity(this.launchVelocity.x, this.launchVelocity.y);
    this.setDepth(DEPTHS.projectiles);
  }

  update(deltaSeconds: number): boolean {
    this.fuseRemaining -= deltaSeconds;
    this.bounceCooldown = Math.max(0, this.bounceCooldown - deltaSeconds);
    this.rotation += deltaSeconds * 7;
    return this.fuseRemaining <= 0;
  }

  launch(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(this.launchVelocity.x, this.launchVelocity.y);
  }

  registerBounce(): boolean {
    if (!this.active) {
      return false;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    const speed = Math.hypot(body.velocity.x, body.velocity.y);
    if (speed <= 36) {
      body.setVelocity(0, 0);
      return false;
    }

    if (this.bounceCooldown > 0) {
      return false;
    }

    body.setVelocity(body.velocity.x * 0.64, body.velocity.y * 0.64);
    this.bounceCooldown = 0.12;
    return speed > 92;
  }
}
