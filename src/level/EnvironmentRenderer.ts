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
    floor.fillStyle(COLORS.floor, 1);
    floor.fillRect(0, 0, level.width, level.height);
    floor.lineStyle(1, COLORS.cyan, 0.08);

    for (let x = 0; x <= level.width; x += 100) {
      floor.lineBetween(x, 0, x, level.height);
    }
    for (let y = 0; y <= level.height; y += 100) {
      floor.lineBetween(0, y, level.width, y);
    }

    floor.lineStyle(1, COLORS.green, 0.08);
    for (let x = 50; x <= level.width; x += 200) {
      floor.lineBetween(x, 0, x, level.height);
    }
  }

  private drawWalls(walls: RectData[], wallGroup: Phaser.Physics.Arcade.StaticGroup): void {
    for (const wall of walls) {
      const rectangle = this.scene.add
        .rectangle(wall.x + wall.w / 2, wall.y + wall.h / 2, wall.w, wall.h, COLORS.wall, 1)
        .setStrokeStyle(2, COLORS.wallStroke, 0.26)
        .setDepth(DEPTHS.props);
      this.scene.physics.add.existing(rectangle, true);
      const body = rectangle.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(wall.w, wall.h);
      body.updateFromGameObject();
      wallGroup.add(rectangle);
    }
  }
}
