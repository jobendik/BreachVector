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
    const frameColor =
      this.snapshot?.alertState === 'detected'
        ? 0xef4444
        : this.snapshot?.alertState === 'searching'
          ? 0xf59e0b
          : 0x38bdf8;
    this.graphics.clear();
    this.graphics.fillStyle(0x020617, 0.78);
    this.graphics.fillRoundedRect(x, y, width, height, 8);
    this.graphics.lineStyle(1, frameColor, this.snapshot?.alertState === 'hidden' ? 0.45 : 0.85);
    this.graphics.strokeRoundedRect(x, y, width, height, 8);

    if (!this.snapshot) {
      return;
    }

    const scale = Math.min((width - 18) / this.snapshot.width, (height - 18) / this.snapshot.height);
    const ox = x + (width - this.snapshot.width * scale) / 2;
    const oy = y + (height - this.snapshot.height * scale) / 2;
    const mapWidth = this.snapshot.width * scale;
    const mapHeight = this.snapshot.height * scale;
    this.graphics.fillStyle(0x07111f, 0.82);
    this.graphics.fillRect(ox, oy, mapWidth, mapHeight);
    this.graphics.lineStyle(1, 0x38bdf8, 0.34);
    this.graphics.strokeRect(ox, oy, mapWidth, mapHeight);

    this.graphics.fillStyle(0x94a3b8, 0.92);
    for (const wall of this.snapshot.walls) {
      this.graphics.fillRect(
        ox + wall.x * scale,
        oy + wall.y * scale,
        Math.max(1, wall.w * scale),
        Math.max(1, wall.h * scale)
      );
    }

    if (this.snapshot.alertState === 'detected') {
      this.drawAlertSweep(ox, oy, mapWidth, mapHeight);
    }

    for (const door of this.snapshot.doors) {
      const color = door.open ? 0x22c55e : door.locked ? 0xef4444 : 0xf59e0b;
      this.graphics.fillStyle(color, door.open ? 0.42 : 0.9);
      this.graphics.fillRect(
        ox + door.x * scale,
        oy + door.y * scale,
        Math.max(3, door.w * scale),
        Math.max(3, door.h * scale)
      );
      this.graphics.lineStyle(1, color, 0.95);
      this.graphics.strokeRect(
        ox + door.x * scale,
        oy + door.y * scale,
        Math.max(3, door.w * scale),
        Math.max(3, door.h * scale)
      );
    }

    this.graphics.fillStyle(this.snapshot.canExtract ? 0x34d399 : 0x475569, this.snapshot.canExtract ? 0.24 : 0.2);
    const extract = this.snapshot.extraction;
    const ex = ox + extract.x * scale;
    const ey = oy + extract.y * scale;
    const ew = extract.w * scale;
    const eh = extract.h * scale;
    this.graphics.fillRect(ex, ey, ew, eh);
    this.graphics.lineStyle(1, this.snapshot.canExtract ? 0x34d399 : 0x64748b, this.snapshot.canExtract ? 0.95 : 0.65);
    this.graphics.strokeRect(ex, ey, ew, eh);
    this.graphics.lineBetween(ex + 3, ey + eh / 2, ex + ew - 3, ey + eh / 2);
    this.graphics.lineBetween(ex + ew / 2, ey + 3, ex + ew / 2, ey + eh - 3);

    for (const terminal of this.snapshot.terminals) {
      const tx = ox + terminal.x * scale;
      const ty = oy + terminal.y * scale;
      this.graphics.fillStyle(terminal.hacked ? 0x34d399 : 0x38bdf8, 0.95);
      this.graphics.fillRect(tx - 3, ty - 3, 6, 6);
      this.graphics.lineStyle(1, 0xe0f2fe, terminal.hacked ? 0.45 : 0.75);
      this.graphics.strokeRect(tx - 4, ty - 4, 8, 8);
    }

    for (const pickup of this.snapshot.pickups) {
      this.drawPickupIcon(ox + pickup.x * scale, oy + pickup.y * scale, pickup.type);
    }

    for (const enemy of this.snapshot.enemies) {
      if (!enemy.visible) {
        continue;
      }
      const exn = ox + enemy.x * scale;
      const eyn = oy + enemy.y * scale;
      this.graphics.fillStyle(enemy.captain ? 0xa855f7 : 0xef4444, 0.95);
      this.drawTriangle(exn, eyn, 5, -Math.PI / 2);
      if (enemy.captain) {
        this.graphics.lineStyle(1, 0xef4444, 0.85);
        this.graphics.strokeCircle(exn, eyn, 6);
      }
    }

    const playerX = ox + this.snapshot.player.x * scale;
    const playerY = oy + this.snapshot.player.y * scale;
    this.drawPlayerCone(playerX, playerY, this.snapshot.player.facing);
    this.graphics.fillStyle(0x34d399, 1);
    this.graphics.fillCircle(playerX, playerY, 4);
    this.graphics.lineStyle(1, 0xe0f2fe, 0.9);
    this.graphics.strokeCircle(playerX, playerY, 5);
  }

  private drawAlertSweep(x: number, y: number, width: number, height: number): void {
    const sweepX = x + ((Date.now() / 14) % width);
    this.graphics.lineStyle(1, 0xef4444, 0.5);
    this.graphics.lineBetween(sweepX, y + 2, sweepX, y + height - 2);
    this.graphics.fillStyle(0xef4444, 0.08);
    this.graphics.fillRect(Math.max(x, sweepX - 22), y + 1, Math.min(44, x + width - sweepX + 22), height - 2);
  }

  private drawPickupIcon(x: number, y: number, type: string): void {
    const color = type === 'medkit' ? 0x22c55e : type === 'ammo' ? 0x38bdf8 : 0xf97316;
    this.graphics.lineStyle(1, color, 0.88);
    this.graphics.fillStyle(color, 0.15);
    this.graphics.strokeCircle(x, y, 4);

    if (type === 'medkit') {
      this.graphics.lineBetween(x - 2, y, x + 2, y);
      this.graphics.lineBetween(x, y - 2, x, y + 2);
    } else if (type === 'ammo') {
      this.graphics.lineBetween(x - 2, y - 2, x + 2, y - 2);
      this.graphics.lineBetween(x - 2, y, x + 2, y);
      this.graphics.lineBetween(x - 2, y + 2, x + 2, y + 2);
    } else {
      this.graphics.fillCircle(x, y + 1, 2);
      this.graphics.lineBetween(x, y - 4, x + 2, y - 2);
    }
  }

  private drawPlayerCone(x: number, y: number, facing: { x: number; y: number }): void {
    const angle = Math.atan2(facing.y, facing.x);
    const radius = 23;
    const spread = 0.48;
    this.graphics.fillStyle(0x34d399, 0.16);
    this.graphics.beginPath();
    this.graphics.moveTo(x, y);
    this.graphics.lineTo(x + Math.cos(angle - spread) * radius, y + Math.sin(angle - spread) * radius);
    this.graphics.lineTo(x + Math.cos(angle + spread) * radius, y + Math.sin(angle + spread) * radius);
    this.graphics.closePath();
    this.graphics.fillPath();
  }

  private drawTriangle(x: number, y: number, radius: number, angle: number): void {
    this.graphics.beginPath();
    for (let i = 0; i < 3; i += 1) {
      const pointAngle = angle + (i / 3) * Math.PI * 2;
      const px = x + Math.cos(pointAngle) * radius;
      const py = y + Math.sin(pointAngle) * radius;
      if (i === 0) {
        this.graphics.moveTo(px, py);
      } else {
        this.graphics.lineTo(px, py);
      }
    }
    this.graphics.closePath();
    this.graphics.fillPath();
  }
}
