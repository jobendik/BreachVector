import Phaser from 'phaser';
import { Door } from '../entities/Door';
import { Enemy } from '../entities/Enemy';
import { ExtractionZone } from '../entities/ExtractionZone';
import { Pickup } from '../entities/Pickup';
import { Player } from '../entities/Player';
import { Prop } from '../entities/Prop';
import { Terminal } from '../entities/Terminal';
import type { LevelData, RectData } from '../game/types';

export interface LevelBuildGroups {
  doors: Phaser.Physics.Arcade.Group;
  enemies: Phaser.Physics.Arcade.Group;
  props: Phaser.Physics.Arcade.Group;
  pickups: Phaser.Physics.Arcade.Group;
}

export interface LevelBuildResult {
  extractionZone: ExtractionZone;
  player: Player;
  doors: Door[];
  terminals: Terminal[];
  props: Prop[];
  enemies: Enemy[];
  coverPoints: Phaser.Math.Vector2[];
}

export class LevelBuilder {
  constructor(private readonly scene: Phaser.Scene) {}

  build(level: LevelData, groups: LevelBuildGroups): LevelBuildResult {
    const extractionZone = new ExtractionZone(this.scene, level.extraction);
    const doors = this.buildDoors(level, groups.doors);
    const terminals = this.buildTerminals(level);
    const props = this.buildProps(level, groups.props);
    this.buildPickups(level, groups.pickups);

    const player = new Player(this.scene, level.spawn.x, level.spawn.y);
    const enemies = this.buildEnemies(level, groups.enemies);
    const coverPoints = this.buildCoverPoints(level, props);

    return {
      extractionZone,
      player,
      doors,
      terminals,
      props,
      enemies,
      coverPoints
    };
  }

  private buildDoors(level: LevelData, group: Phaser.Physics.Arcade.Group): Door[] {
    return level.doors.map((doorData) => {
      const door = new Door(this.scene, doorData);
      group.add(door);
      return door;
    });
  }

  private buildTerminals(level: LevelData): Terminal[] {
    return level.terminals.map((terminalData) => new Terminal(this.scene, terminalData));
  }

  private buildProps(level: LevelData, group: Phaser.Physics.Arcade.Group): Prop[] {
    return level.props.map((propData) => {
      const prop = new Prop(this.scene, propData);
      group.add(prop);
      return prop;
    });
  }

  private buildPickups(level: LevelData, group: Phaser.Physics.Arcade.Group): void {
    for (const pickupData of level.pickups) {
      group.add(new Pickup(this.scene, pickupData));
    }
  }

  private buildEnemies(level: LevelData, group: Phaser.Physics.Arcade.Group): Enemy[] {
    return level.enemies.map((enemyData) => {
      const enemy = new Enemy(this.scene, enemyData);
      group.add(enemy);
      return enemy;
    });
  }

  private buildCoverPoints(level: LevelData, props: Prop[]): Phaser.Math.Vector2[] {
    const coverPoints: Phaser.Math.Vector2[] = [];
    const rects: RectData[] = [...level.walls, ...props.map((prop) => prop.rect)];

    for (const rect of rects) {
      const pad = 46;
      const points = [
        new Phaser.Math.Vector2(rect.x - pad, rect.y - pad),
        new Phaser.Math.Vector2(rect.x + rect.w + pad, rect.y - pad),
        new Phaser.Math.Vector2(rect.x - pad, rect.y + rect.h + pad),
        new Phaser.Math.Vector2(rect.x + rect.w + pad, rect.y + rect.h + pad)
      ];
      for (const point of points) {
        if (point.x > 40 && point.y > 40 && point.x < level.width - 40 && point.y < level.height - 40) {
          coverPoints.push(point);
        }
      }
    }

    return coverPoints;
  }
}
