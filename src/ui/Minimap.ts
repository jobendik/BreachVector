import Phaser from 'phaser';
import { DEPTHS } from '../game/constants';
import type { MinimapSnapshot } from '../game/types';

export class Minimap {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private bounds = new Phaser.Geom.Rectangle();
  private snapshot?: MinimapSnapshot;

  constructor(private readonly scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setScrollFactor(0).setDepth(DEPTHS.ui);
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.bounds.setTo(x, y, width, height);
    this.redraw();
  }

  update(snapshot: MinimapSnapshot): void {
    this.snapshot = snapshot;
    this.redraw();
  }

  private redraw(): void {
    const { x, y, width, height } = this.bounds;
    this.graphics.clear();
    this.graphics.fillStyle(0x020617, 0.72);
    this.graphics.fillRoundedRect(x, y, width, height, 8);
    this.graphics.lineStyle(1, 0x64748b, 0.85);
    this.graphics.strokeRoundedRect(x, y, width, height, 8);

    if (!this.snapshot) {
      return;
    }

    const scale = Math.min((width - 18) / this.snapshot.width, (height - 18) / this.snapshot.height);
    const ox = x + (width - this.snapshot.width * scale) / 2;
    const oy = y + (height - this.snapshot.height * scale) / 2;
    this.graphics.lineStyle(1, 0x334155, 0.85);
    this.graphics.strokeRect(ox, oy, this.snapshot.width * scale, this.snapshot.height * scale);

    this.graphics.fillStyle(0x64748b, 0.78);
    for (const wall of this.snapshot.walls) {
      this.graphics.fillRect(ox + wall.x * scale, oy + wall.y * scale, Math.max(1, wall.w * scale), Math.max(1, wall.h * scale));
    }

    for (const door of this.snapshot.doors) {
      this.graphics.fillStyle(door.open ? 0x22c55e : 0xf59e0b, door.open ? 0.55 : 0.85);
      this.graphics.fillRect(ox + door.x * scale, oy + door.y * scale, Math.max(2, door.w * scale), Math.max(2, door.h * scale));
    }

    this.graphics.fillStyle(this.snapshot.canExtract ? 0x34d399 : 0x475569, 0.92);
    const extract = this.snapshot.extraction;
    this.graphics.fillRect(ox + extract.x * scale, oy + extract.y * scale, extract.w * scale, extract.h * scale);

    for (const terminal of this.snapshot.terminals) {
      this.graphics.fillStyle(terminal.hacked ? 0x34d399 : 0x38bdf8, 0.95);
      this.graphics.fillCircle(ox + terminal.x * scale, oy + terminal.y * scale, 3);
    }

    for (const enemy of this.snapshot.enemies) {
      if (!enemy.visible) {
        continue;
      }
      this.graphics.fillStyle(enemy.captain ? 0x22c55e : 0xef4444, 0.95);
      this.graphics.fillRect(ox + enemy.x * scale - 2, oy + enemy.y * scale - 2, 4, 4);
    }

    this.graphics.fillStyle(0x34d399, 1);
    this.graphics.fillCircle(ox + this.snapshot.player.x * scale, oy + this.snapshot.player.y * scale, 4);
  }
}
