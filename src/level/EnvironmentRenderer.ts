import Phaser from 'phaser';
import { COLORS, DEPTHS } from '../game/constants';
import type { LevelData, RectData } from '../game/types';

export interface EnvironmentRenderResult {
  visibilityGraphics: Phaser.GameObjects.Graphics;
  debugGraphics: Phaser.GameObjects.Graphics;
}

export class EnvironmentRenderer {
  constructor(private readonly scene: Phaser.Scene) {}

  render(level: LevelData, wallGroup: Phaser.Physics.Arcade.StaticGroup): EnvironmentRenderResult {
    this.drawFloor(level);
    this.drawWalls(level.walls, wallGroup);

    return {
      visibilityGraphics: this.scene.add.graphics().setDepth(DEPTHS.actors - 2),
      debugGraphics: this.scene.add.graphics().setDepth(DEPTHS.debug)
    };
  }

  private drawFloor(level: LevelData): void {
    const floor = this.scene.add.graphics().setDepth(DEPTHS.floor);
    floor.fillStyle(COLORS.floorPlate, 1);
    floor.fillRect(0, 0, level.width, level.height);
    floor.lineStyle(1, COLORS.systemCyan, 0.08);

    for (let x = 0; x <= level.width; x += 100) {
      floor.lineBetween(x, 0, x, level.height);
    }
    for (let y = 0; y <= level.height; y += 100) {
      floor.lineBetween(0, y, level.width, y);
    }

    floor.lineStyle(1, COLORS.operatorGreen, 0.08);
    for (let x = 50; x <= level.width; x += 200) {
      floor.lineBetween(x, 0, x, level.height);
    }

    this.drawFloorPanels(floor, level);
    this.drawCableRuns(floor, level);
    this.drawVents(floor, level);
  }

  private drawWalls(walls: RectData[], wallGroup: Phaser.Physics.Arcade.StaticGroup): void {
    const wallDetails = this.scene.add.graphics().setDepth(DEPTHS.props + 0.2);
    for (const wall of walls) {
      this.scene.add
        .rectangle(wall.x + wall.w / 2 + 4, wall.y + wall.h / 2 + 4, wall.w, wall.h, COLORS.black, 0.22)
        .setDepth(DEPTHS.props - 0.1);
      const rectangle = this.scene.add
        .rectangle(wall.x + wall.w / 2, wall.y + wall.h / 2, wall.w, wall.h, COLORS.wallCore, 1)
        .setStrokeStyle(2, COLORS.wallEdge, 0.28)
        .setDepth(DEPTHS.props);
      this.scene.physics.add.existing(rectangle, true);
      const body = rectangle.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(wall.w, wall.h);
      body.updateFromGameObject();
      wallGroup.add(rectangle);

      wallDetails.lineStyle(1, COLORS.systemCyanSoft, 0.16);
      wallDetails.lineBetween(wall.x + 2, wall.y + 2, wall.x + wall.w - 2, wall.y + 2);
      wallDetails.lineBetween(wall.x + 2, wall.y + 2, wall.x + 2, wall.y + wall.h - 2);
      wallDetails.lineStyle(2, COLORS.blacksiteNavy, 0.36);
      wallDetails.lineBetween(wall.x + 2, wall.y + wall.h - 2, wall.x + wall.w - 2, wall.y + wall.h - 2);
      wallDetails.lineBetween(wall.x + wall.w - 2, wall.y + 2, wall.x + wall.w - 2, wall.y + wall.h - 2);
    }
  }

  private drawFloorPanels(floor: Phaser.GameObjects.Graphics, level: LevelData): void {
    for (let y = 24; y < level.height; y += 160) {
      for (let x = 24; x < level.width; x += 240) {
        const offset = ((x / 240 + y / 160) % 2) * 18;
        floor.fillStyle(COLORS.blacksitePanel, 0.12);
        floor.fillRect(x + offset, y, 190, 104);
        floor.lineStyle(1, COLORS.steelSlate, 0.12);
        floor.strokeRect(x + offset, y, 190, 104);
        floor.lineStyle(1, COLORS.blacksiteNavy, 0.28);
        floor.lineBetween(x + offset + 18, y + 18, x + offset + 172, y + 18);
        floor.lineBetween(x + offset + 18, y + 86, x + offset + 172, y + 86);
      }
    }
  }

  private drawCableRuns(floor: Phaser.GameObjects.Graphics, level: LevelData): void {
    floor.lineStyle(3, COLORS.systemCyan, 0.1);
    for (let y = 120; y < level.height; y += 360) {
      floor.lineBetween(0, y, level.width, y);
      floor.lineBetween(0, y + 10, level.width, y + 10);
    }
    floor.lineStyle(2, COLORS.hazardAmber, 0.12);
    for (let x = 170; x < level.width; x += 440) {
      floor.lineBetween(x, 0, x, level.height);
    }
  }

  private drawVents(floor: Phaser.GameObjects.Graphics, level: LevelData): void {
    for (let y = 92; y < level.height; y += 300) {
      for (let x = 130; x < level.width; x += 360) {
        floor.fillStyle(COLORS.blacksiteNavy, 0.42);
        floor.fillRect(x, y, 58, 28);
        floor.lineStyle(1, COLORS.steelLight, 0.2);
        floor.strokeRect(x, y, 58, 28);
        for (let i = 8; i <= 48; i += 10) {
          floor.lineBetween(x + i, y + 5, x + i, y + 23);
        }
      }
    }
  }
}
