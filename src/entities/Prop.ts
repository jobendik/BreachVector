import Phaser from 'phaser';
import { DEPTHS, TextureKeys } from '../game/constants';
import type { DamageSource, PropData, PropKind, RectData } from '../game/types';

export class Prop extends Phaser.Physics.Arcade.Sprite {
  readonly propKind: PropKind;
  readonly rect: RectData;
  readonly solid = true;
  readonly blocksLineOfSight: boolean;
  readonly explosive: boolean;
  health: number;
  dead = false;

  constructor(scene: Phaser.Scene, data: PropData) {
    const w = data.kind === 'barrel' ? 34 : data.w ?? 70;
    const h = data.kind === 'barrel' ? 34 : data.h ?? 50;
    super(scene, data.x, data.y, data.kind === 'barrel' ? TextureKeys.Barrel : TextureKeys.Crate);
    this.propKind = data.kind;
    this.rect = { x: data.x - w / 2, y: data.y - h / 2, w, h };
    this.blocksLineOfSight = data.kind === 'crate';
    this.explosive = data.kind === 'barrel';
    this.health = data.kind === 'barrel' ? 45 : 70;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(w, h);
    body.setOffset(this.width / 2 - w / 2, this.height / 2 - h / 2);
    this.setDisplaySize(w, h);
    this.setDepth(DEPTHS.props);
  }

  takeDamage(amount: number, _source: DamageSource): boolean {
    if (this.dead) {
      return false;
    }
    this.health -= amount;
    this.setTint(this.propKind === 'barrel' ? 0xf97316 : 0x94a3b8);
    if (this.health <= 0) {
      this.dead = true;
      this.disableBody(true, true);
      return true;
    }
    return false;
  }
}
