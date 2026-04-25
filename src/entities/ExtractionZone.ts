import Phaser from 'phaser';
import { DEPTHS } from '../game/constants';
import type { RectData } from '../game/types';

export class ExtractionZone extends Phaser.GameObjects.Zone {
  readonly rect: RectData;
  private readonly graphics: Phaser.GameObjects.Graphics;
  private enabledForExtraction = false;

  constructor(scene: Phaser.Scene, rect: RectData) {
    super(scene, rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w, rect.h);
    this.rect = rect;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(rect.w, rect.h);

    this.graphics = scene.add.graphics();
    this.graphics.setDepth(DEPTHS.pickups);
    this.redraw(false, 0);
  }

  setExtractionReady(ready: boolean): void {
    if (this.enabledForExtraction === ready) {
      return;
    }
    this.enabledForExtraction = ready;
    this.redraw(ready, 0);
  }

  pulse(timeSeconds: number): void {
    this.redraw(this.enabledForExtraction, timeSeconds);
  }

  private redraw(ready: boolean, timeSeconds: number): void {
    const alpha = ready ? 0.16 + Math.sin(timeSeconds * 4) * 0.06 : 0.06;
    this.graphics.clear();
    this.graphics.fillStyle(ready ? 0x10b981 : 0x334155, alpha);
    this.graphics.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    this.graphics.lineStyle(ready ? 3 : 2, ready ? 0x34d399 : 0x64748b, ready ? 0.95 : 0.45);
    this.graphics.strokeRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
  }

  destroy(fromScene?: boolean): void {
    this.graphics.destroy();
    super.destroy(fromScene);
  }
}
