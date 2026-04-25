import Phaser from 'phaser';
import type { LevelData, RectData } from '../game/types';

const CELL = 32;
const WALL_PAD = 18;
const DOOR_PAD = 14;
const DIAG = Math.SQRT2;
const MAX_OPEN = 3000;

interface ANode {
  gx: number;
  gy: number;
  g: number;
  h: number;
  f: number;
  parent: ANode | null;
}

const DIRS: [number, number, number][] = [
  [0, -1, 1],
  [1, 0, 1],
  [0, 1, 1],
  [-1, 0, 1],
  [1, -1, DIAG],
  [1, 1, DIAG],
  [-1, 1, DIAG],
  [-1, -1, DIAG]
];

export class PathfindingSystem {
  private cols = 0;
  private rows = 0;
  private baseGrid!: Uint8Array;
  private grid!: Uint8Array;

  buildFromLevel(level: LevelData): void {
    this.cols = Math.ceil(level.width / CELL);
    this.rows = Math.ceil(level.height / CELL);
    this.baseGrid = new Uint8Array(this.cols * this.rows).fill(1);
    for (const wall of level.walls) {
      this.block(this.baseGrid, wall.x - WALL_PAD, wall.y - WALL_PAD, wall.w + WALL_PAD * 2, wall.h + WALL_PAD * 2);
    }
    this.grid = new Uint8Array(this.baseGrid);
  }

  applyDoors(closedDoors: RectData[]): void {
    this.grid.set(this.baseGrid);
    for (const door of closedDoors) {
      this.block(this.grid, door.x - DOOR_PAD, door.y - DOOR_PAD, door.w + DOOR_PAD * 2, door.h + DOOR_PAD * 2);
    }
  }

  findPath(fromX: number, fromY: number, toX: number, toY: number): Phaser.Math.Vector2[] {
    if (!this.grid) return [];

    let sx = Phaser.Math.Clamp(Math.floor(fromX / CELL), 0, this.cols - 1);
    let sy = Phaser.Math.Clamp(Math.floor(fromY / CELL), 0, this.rows - 1);
    let ex = Phaser.Math.Clamp(Math.floor(toX / CELL), 0, this.cols - 1);
    let ey = Phaser.Math.Clamp(Math.floor(toY / CELL), 0, this.rows - 1);

    if (!this.isOpen(ex, ey)) {
      const found = this.nearest(ex, ey);
      if (!found) return [];
      [ex, ey] = found;
    }
    if (!this.isOpen(sx, sy)) {
      const found = this.nearest(sx, sy);
      if (!found) return [];
      [sx, sy] = found;
    }

    if (sx === ex && sy === ey) {
      return [new Phaser.Math.Vector2(toX, toY)];
    }

    return this.astar(sx, sy, ex, ey, toX, toY);
  }

  private astar(sx: number, sy: number, ex: number, ey: number, toX: number, toY: number): Phaser.Math.Vector2[] {
    const open: ANode[] = [];
    const closed = new Uint8Array(this.cols * this.rows);
    const inOpen = new Map<number, ANode>();

    const start: ANode = { gx: sx, gy: sy, g: 0, h: this.octile(sx, sy, ex, ey), f: 0, parent: null };
    start.f = start.h;
    open.push(start);
    inOpen.set(this.key(sx, sy), start);

    while (open.length > 0) {
      let bi = 0;
      for (let i = 1; i < open.length; i++) {
        if (open[i].f < open[bi].f) bi = i;
      }
      const cur = open.splice(bi, 1)[0];
      inOpen.delete(this.key(cur.gx, cur.gy));
      const ck = this.key(cur.gx, cur.gy);
      closed[ck] = 1;

      if (cur.gx === ex && cur.gy === ey) {
        return this.tracePath(cur, toX, toY);
      }

      for (const [dx, dy, cost] of DIRS) {
        const nx = cur.gx + dx;
        const ny = cur.gy + dy;
        if (nx < 0 || ny < 0 || nx >= this.cols || ny >= this.rows) continue;
        if (!this.isOpen(nx, ny)) continue;
        const nk = this.key(nx, ny);
        if (closed[nk]) continue;
        if (dx !== 0 && dy !== 0 && (!this.isOpen(cur.gx + dx, cur.gy) || !this.isOpen(cur.gx, cur.gy + dy))) {
          continue;
        }

        const g = cur.g + cost;
        const ex2 = inOpen.get(nk);
        if (ex2) {
          if (g < ex2.g) {
            ex2.g = g;
            ex2.f = g + ex2.h;
            ex2.parent = cur;
          }
        } else {
          const node: ANode = { gx: nx, gy: ny, g, h: this.octile(nx, ny, ex, ey), f: 0, parent: cur };
          node.f = node.g + node.h;
          open.push(node);
          inOpen.set(nk, node);
        }
      }

      if (open.length > MAX_OPEN) return [];
    }

    return [];
  }

  private tracePath(end: ANode, toX: number, toY: number): Phaser.Math.Vector2[] {
    const path: Phaser.Math.Vector2[] = [];
    let node: ANode | null = end;
    while (node) {
      path.unshift(new Phaser.Math.Vector2(node.gx * CELL + CELL / 2, node.gy * CELL + CELL / 2));
      node = node.parent;
    }
    if (path.length > 0) {
      path[path.length - 1].set(toX, toY);
    }
    return path;
  }

  private octile(ax: number, ay: number, bx: number, by: number): number {
    const dx = Math.abs(ax - bx);
    const dy = Math.abs(ay - by);
    return Math.max(dx, dy) + (DIAG - 1) * Math.min(dx, dy);
  }

  private block(grid: Uint8Array, rx: number, ry: number, rw: number, rh: number): void {
    const cx0 = Math.max(0, Math.floor(rx / CELL));
    const cy0 = Math.max(0, Math.floor(ry / CELL));
    const cx1 = Math.min(this.cols - 1, Math.floor((rx + rw) / CELL));
    const cy1 = Math.min(this.rows - 1, Math.floor((ry + rh) / CELL));
    for (let cy = cy0; cy <= cy1; cy++) {
      for (let cx = cx0; cx <= cx1; cx++) {
        grid[this.key(cx, cy)] = 0;
      }
    }
  }

  private nearest(gx: number, gy: number): [number, number] | null {
    for (let r = 1; r < 6; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const nx = gx + dx;
          const ny = gy + dy;
          if (nx >= 0 && ny >= 0 && nx < this.cols && ny < this.rows && this.isOpen(nx, ny)) {
            return [nx, ny];
          }
        }
      }
    }
    return null;
  }

  private isOpen(gx: number, gy: number): boolean {
    return this.grid[this.key(gx, gy)] === 1;
  }

  private key(gx: number, gy: number): number {
    return gy * this.cols + gx;
  }
}
