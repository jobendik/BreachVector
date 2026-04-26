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

    const view = this.viewport(width, height);
    const scale = Math.min((width - 18) / view.width, (height - 18) / view.height);
    const ox = x + (width - view.width * scale) / 2;
    const oy = y + (height - view.height * scale) / 2;
    const mapWidth = view.width * scale;
    const mapHeight = view.height * scale;
    this.graphics.fillStyle(0x07111f, 0.82);
    this.graphics.fillRect(ox, oy, mapWidth, mapHeight);
    this.graphics.lineStyle(1, 0x38bdf8, 0.34);
    this.graphics.strokeRect(ox, oy, mapWidth, mapHeight);
    this.drawModeLabel(x + 12, y + 10);

    this.graphics.fillStyle(0x94a3b8, 0.92);
    for (const wall of this.snapshot.walls) {
      this.fillWorldRect(ox, oy, scale, view, wall, 1);
    }

    if (this.snapshot.alertState === 'detected') {
      this.drawAlertSweep(ox, oy, mapWidth, mapHeight);
    }

    for (const door of this.snapshot.doors) {
      const color = door.open ? 0x22c55e : door.locked ? 0xef4444 : 0xf59e0b;
      this.graphics.fillStyle(color, door.open ? 0.42 : 0.9);
      this.fillWorldRect(ox, oy, scale, view, door, 3);
      this.graphics.lineStyle(1, color, 0.95);
      this.strokeWorldRect(ox, oy, scale, view, door, 3);
    }

    this.graphics.fillStyle(this.snapshot.canExtract ? 0x34d399 : 0x475569, this.snapshot.canExtract ? 0.24 : 0.2);
    const extract = this.snapshot.extraction;
    const clippedExtraction = this.clipWorldRect(view, extract);
    if (clippedExtraction) {
      const ex = ox + (clippedExtraction.x - view.x) * scale;
      const ey = oy + (clippedExtraction.y - view.y) * scale;
      const ew = clippedExtraction.w * scale;
      const eh = clippedExtraction.h * scale;
      this.graphics.fillRect(ex, ey, ew, eh);
      this.graphics.lineStyle(
        1,
        this.snapshot.canExtract ? 0x34d399 : 0x64748b,
        this.snapshot.canExtract ? 0.95 : 0.65
      );
      this.graphics.strokeRect(ex, ey, ew, eh);
      this.graphics.lineBetween(ex + 3, ey + eh / 2, ex + ew - 3, ey + eh / 2);
      this.graphics.lineBetween(ex + ew / 2, ey + 3, ex + ew / 2, ey + eh - 3);
    }

    for (const terminal of this.snapshot.terminals) {
      if (!this.pointInView(view, terminal.x, terminal.y)) {
        continue;
      }
      const tx = ox + (terminal.x - view.x) * scale;
      const ty = oy + (terminal.y - view.y) * scale;
      this.graphics.fillStyle(terminal.hacked ? 0x34d399 : 0x38bdf8, 0.95);
      this.graphics.fillRect(tx - 3, ty - 3, 6, 6);
      this.graphics.lineStyle(1, 0xe0f2fe, terminal.hacked ? 0.45 : 0.75);
      this.graphics.strokeRect(tx - 4, ty - 4, 8, 8);
    }

    for (const pickup of this.snapshot.pickups) {
      if (this.pointInView(view, pickup.x, pickup.y)) {
        this.drawPickupIcon(ox + (pickup.x - view.x) * scale, oy + (pickup.y - view.y) * scale, pickup.type);
      }
    }

    for (const enemy of this.snapshot.enemies) {
      if (!enemy.visible) {
        continue;
      }
      if (!this.pointInView(view, enemy.x, enemy.y)) {
        continue;
      }
      const exn = ox + (enemy.x - view.x) * scale;
      const eyn = oy + (enemy.y - view.y) * scale;
      this.graphics.fillStyle(enemy.captain ? 0xa855f7 : 0xef4444, 0.95);
      this.drawTriangle(exn, eyn, 5, -Math.PI / 2);
      if (enemy.captain) {
        this.graphics.lineStyle(1, 0xef4444, 0.85);
        this.graphics.strokeCircle(exn, eyn, 6);
      }
    }

    const playerX = ox + (this.snapshot.player.x - view.x) * scale;
    const playerY = oy + (this.snapshot.player.y - view.y) * scale;
    this.drawPlayerCone(playerX, playerY, this.snapshot.player.facing);
    this.graphics.fillStyle(0x34d399, 1);
    this.graphics.fillCircle(playerX, playerY, 4);
    this.graphics.lineStyle(1, 0xe0f2fe, 0.9);
    this.graphics.strokeCircle(playerX, playerY, 5);
  }

  private viewport(panelWidth: number, panelHeight: number): { x: number; y: number; width: number; height: number } {
    if (!this.snapshot || this.snapshot.zoomMode === 'sector') {
      return { x: 0, y: 0, width: this.snapshot?.width ?? 1, height: this.snapshot?.height ?? 1 };
    }

    const aspect = (panelWidth - 18) / Math.max(1, panelHeight - 18);
    const viewWidth = Math.min(820, this.snapshot.width);
    const viewHeight = Math.min(this.snapshot.height, viewWidth / aspect);
    const x = Phaser.Math.Clamp(this.snapshot.player.x - viewWidth / 2, 0, this.snapshot.width - viewWidth);
    const y = Phaser.Math.Clamp(this.snapshot.player.y - viewHeight / 2, 0, this.snapshot.height - viewHeight);
    return { x, y, width: viewWidth, height: viewHeight };
  }

  private drawModeLabel(x: number, y: number): void {
    if (!this.snapshot) {
      return;
    }
    const color = this.snapshot.zoomMode === 'local' ? 0x34d399 : 0x38bdf8;
    this.graphics.fillStyle(color, 0.9);
    this.graphics.fillRect(x, y, 22, 3);
    this.graphics.lineStyle(1, color, 0.55);
    this.graphics.strokeRect(x - 2, y - 3, 26, 9);
  }

  private fillWorldRect(
    ox: number,
    oy: number,
    scale: number,
    view: { x: number; y: number; width: number; height: number },
    rect: { x: number; y: number; w: number; h: number },
    minSize: number
  ): void {
    const clipped = this.clipWorldRect(view, rect);
    if (!clipped) {
      return;
    }
    this.graphics.fillRect(
      ox + (clipped.x - view.x) * scale,
      oy + (clipped.y - view.y) * scale,
      Math.max(minSize, clipped.w * scale),
      Math.max(minSize, clipped.h * scale)
    );
  }

  private strokeWorldRect(
    ox: number,
    oy: number,
    scale: number,
    view: { x: number; y: number; width: number; height: number },
    rect: { x: number; y: number; w: number; h: number },
    minSize: number
  ): void {
    const clipped = this.clipWorldRect(view, rect);
    if (!clipped) {
      return;
    }
    this.graphics.strokeRect(
      ox + (clipped.x - view.x) * scale,
      oy + (clipped.y - view.y) * scale,
      Math.max(minSize, clipped.w * scale),
      Math.max(minSize, clipped.h * scale)
    );
  }

  private clipWorldRect(
    view: { x: number; y: number; width: number; height: number },
    rect: { x: number; y: number; w: number; h: number }
  ): { x: number; y: number; w: number; h: number } | undefined {
    const x1 = Math.max(view.x, rect.x);
    const y1 = Math.max(view.y, rect.y);
    const x2 = Math.min(view.x + view.width, rect.x + rect.w);
    const y2 = Math.min(view.y + view.height, rect.y + rect.h);
    if (x2 <= x1 || y2 <= y1) {
      return undefined;
    }
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  }

  private pointInView(view: { x: number; y: number; width: number; height: number }, x: number, y: number): boolean {
    return x >= view.x && x <= view.x + view.width && y >= view.y && y <= view.y + view.height;
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
