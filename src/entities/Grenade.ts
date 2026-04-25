import Phaser from 'phaser';
import { DEPTHS, TextureKeys, WORLD_BALANCE } from '../game/constants';
import type { Team } from '../game/types';

export class Grenade extends Phaser.Physics.Arcade.Sprite {
  readonly ownerTeam: Team;
  fuseRemaining = WORLD_BALANCE.grenadeFuse;
  radius = WORLD_BALANCE.grenadeRadius;
  damage = WORLD_BALANCE.grenadeDamage;

  constructor(scene: Phaser.Scene, x: number, y: number, angle: number, ownerTeam: Team) {
    super(scene, x, y, TextureKeys.Grenade);
    this.ownerTeam = ownerTeam;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCircle(7);
    body.setBounce(0.35);
    body.setDrag(0.92);
    body.setVelocity(Math.cos(angle) * 560, Math.sin(angle) * 560);
    this.setDepth(DEPTHS.projectiles);
  }

  update(deltaSeconds: number): boolean {
    this.fuseRemaining -= deltaSeconds;
    this.rotation += deltaSeconds * 7;
    return this.fuseRemaining <= 0;
  }
}
