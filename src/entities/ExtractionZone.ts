import Phaser from 'phaser';
import { COLORS, DEPTHS } from '../game/constants';
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
    const accent = ready ? COLORS.operatorGreenBright : COLORS.steelSlate;
    const core = ready ? COLORS.operatorGreen : COLORS.steelDark;
    this.graphics.clear();
    this.graphics.fillStyle(core, alpha);
    this.graphics.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    this.graphics.lineStyle(ready ? 3 : 2, accent, ready ? 0.95 : 0.45);
    this.graphics.strokeRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    this.graphics.lineStyle(1, accent, ready ? 0.55 : 0.25);
    this.graphics.strokeCircle(
      this.rect.x + this.rect.w / 2,
      this.rect.y + this.rect.h / 2,
      Math.min(this.rect.w, this.rect.h) * 0.32
    );
    this.graphics.lineBetween(
      this.rect.x + 14,
      this.rect.y + this.rect.h / 2,
      this.rect.x + this.rect.w - 14,
      this.rect.y + this.rect.h / 2
    );
    this.graphics.lineBetween(
      this.rect.x + this.rect.w / 2,
      this.rect.y + 12,
      this.rect.x + this.rect.w / 2,
      this.rect.y + this.rect.h - 12
    );
    for (let x = this.rect.x + 18; x < this.rect.x + this.rect.w - 12; x += 26) {
      this.graphics.lineBetween(x, this.rect.y + 8, x + 12, this.rect.y + 20);
      this.graphics.lineBetween(x, this.rect.y + this.rect.h - 8, x + 12, this.rect.y + this.rect.h - 20);
    }
  }

  destroy(fromScene?: boolean): void {
    this.graphics.destroy();
    super.destroy(fromScene);
  }
}
