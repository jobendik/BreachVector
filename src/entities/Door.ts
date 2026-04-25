import Phaser from 'phaser';
import { DEPTHS, TextureKeys } from '../game/constants';
import type { DoorData, RectData } from '../game/types';

export class Door extends Phaser.Physics.Arcade.Sprite {
  readonly doorId: string;
  readonly rect: RectData;
  locked: boolean;
  open = false;

  constructor(scene: Phaser.Scene, data: DoorData) {
    super(scene, data.x + data.w / 2, data.y + data.h / 2, TextureKeys.Door);
    this.doorId = data.id;
    this.rect = { x: data.x, y: data.y, w: data.w, h: data.h };
    this.locked = data.locked;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(data.w, data.h);
    body.setOffset(this.width / 2 - data.w / 2, this.height / 2 - data.h / 2);
    this.setDisplaySize(data.w, data.h);
    this.setDepth(DEPTHS.props);
  }

  unlock(): void {
    this.locked = false;
    this.setTint(0x34d399);
  }

  openDoor(): void {
    if (this.locked || this.open) {
      return;
    }
    this.open = true;
    this.disableBody(true, false);
    this.setAlpha(0.18);
    this.setTint(0x22c55e);
  }
}
