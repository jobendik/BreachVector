import Phaser from 'phaser';
import { Door } from '../entities/Door';
import { Enemy } from '../entities/Enemy';
import { Pickup } from '../entities/Pickup';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { Prop } from '../entities/Prop';
import type { RectData } from '../game/types';
import { distanceToSegment, pointInRect, rayRect } from '../utils/geometry';
import type { CombatSystem } from './CombatSystem';

type ArcadeObject =
  | Phaser.Types.Physics.Arcade.GameObjectWithBody
  | Phaser.Physics.Arcade.Body
  | Phaser.Physics.Arcade.StaticBody
  | Phaser.Tilemaps.Tile;

interface CollisionWorld {
  scene: Phaser.Scene;
  player: Player;
  wallRects: RectData[];
  doorsList: Door[];
  enemiesList: Enemy[];
  propsList: Prop[];
  walls: Phaser.Physics.Arcade.StaticGroup;
  doors: Phaser.Physics.Arcade.Group;
  enemies: Phaser.Physics.Arcade.Group;
  propsGroup: Phaser.Physics.Arcade.Group;
  projectiles: Phaser.Physics.Arcade.Group;
  grenades: Phaser.Physics.Arcade.Group;
  pickups: Phaser.Physics.Arcade.Group;
  combat: CombatSystem;
  log(message: string): void;
  effects: {
    hit(x: number, y: number, color?: number): void;
  };
  audio: {
    play(id: 'pickup'): void;
  };
}

type SweepBase = {
  t: number;
  point: Phaser.Math.Vector2;
};

type ProjectileSweepHit =
  | (SweepBase & { kind: 'wall' })
  | (SweepBase & { kind: 'door'; door: Door })
  | (SweepBase & { kind: 'prop'; prop: Prop })
  | (SweepBase & { kind: 'enemy'; enemy: Enemy })
  | (SweepBase & { kind: 'player'; player: Player });

export class CollisionSystem {
  private readonly colliders: Phaser.Physics.Arcade.Collider[] = [];

  constructor(private readonly world: CollisionWorld) {}

  setup(): void {
    const physics = this.world.scene.physics;
    this.colliders.push(
      physics.add.collider(this.world.player, this.world.walls),
      physics.add.collider(this.world.player, this.world.doors, undefined, this.closedDoorProcess, this),
      physics.add.collider(this.world.player, this.world.propsGroup),
      physics.add.collider(this.world.enemies, this.world.walls),
      physics.add.collider(this.world.enemies, this.world.doors, undefined, this.closedDoorProcess, this),
      physics.add.collider(this.world.enemies, this.world.propsGroup),
      physics.add.collider(this.world.enemies, this.world.enemies),
      physics.add.collider(this.world.grenades, this.world.walls),
      physics.add.collider(this.world.grenades, this.world.doors, undefined, this.closedDoorProcess, this),
      physics.add.collider(this.world.grenades, this.world.propsGroup),
      physics.add.collider(this.world.projectiles, this.world.walls, this.projectileWallHit, undefined, this),
      physics.add.collider(
        this.world.projectiles,
        this.world.doors,
        this.projectileDoorHit,
        this.closedDoorProcess,
        this
      ),
      physics.add.collider(this.world.projectiles, this.world.propsGroup, this.projectilePropHit, undefined, this),
      physics.add.overlap(this.world.projectiles, this.world.enemies, this.projectileEnemyHit, undefined, this),
      physics.add.overlap(this.world.projectiles, this.world.player, this.projectilePlayerHit, undefined, this),
      physics.add.overlap(this.world.player, this.world.pickups, this.pickupHit, undefined, this)
    );
  }

  destroy(): void {
    for (const collider of this.colliders) {
      collider.destroy();
    }
    this.colliders.length = 0;
  }

  resolveProjectileSweeps(projectiles: Projectile[]): void {
    for (const projectile of projectiles) {
      if (!projectile.active) {
        continue;
      }

      const start = projectile.previousPosition.clone();
      const end = new Phaser.Math.Vector2(projectile.x, projectile.y);
      if (Phaser.Math.Distance.Squared(start.x, start.y, end.x, end.y) <= 0.01) {
        continue;
      }

      const hits = this.collectProjectileSweepHits(projectile, start, end).sort((a, b) => a.t - b.t);
      for (const hit of hits) {
        if (!projectile.active) {
          break;
        }
        this.resolveProjectileSweepHit(projectile, hit);
      }

      if (projectile.active) {
        projectile.setPosition(end.x, end.y);
      }
    }
  }

  private closedDoorProcess(_a: ArcadeObject, b: ArcadeObject): boolean {
    return !(b instanceof Door) || !b.open;
  }

  private projectileWallHit(projectileObject: ArcadeObject): void {
    if (!(projectileObject instanceof Projectile)) {
      return;
    }
    const projectile = projectileObject;
    if (!projectile.active) {
      return;
    }
    this.world.effects.hit(projectile.x, projectile.y, projectile.color);
    projectile.destroy();
  }

  private projectileDoorHit(projectileObject: ArcadeObject, doorObject: ArcadeObject): void {
    if (!(projectileObject instanceof Projectile) || !(doorObject instanceof Door)) {
      return;
    }
    const projectile = projectileObject;
    const door = doorObject;
    if (!projectile.active || door.open) {
      return;
    }
    this.world.effects.hit(projectile.x, projectile.y, projectile.color);
    projectile.destroy();
  }

  private projectilePropHit(projectileObject: ArcadeObject, propObject: ArcadeObject): void {
    if (!(projectileObject instanceof Projectile) || !(propObject instanceof Prop)) {
      return;
    }
    const projectile = projectileObject;
    const prop = propObject;
    if (!projectile.active || prop.dead || projectile.hitProps.has(prop)) {
      return;
    }
    projectile.hitProps.add(prop);
    this.world.combat.damageProp(prop, projectile.damage, projectile.damageSource);
    projectile.consumePierce();
  }

  private projectileEnemyHit(projectileObject: ArcadeObject, enemyObject: ArcadeObject): void {
    if (!(projectileObject instanceof Projectile) || !(enemyObject instanceof Enemy)) {
      return;
    }
    const projectile = projectileObject;
    const enemy = enemyObject;
    if (
      !projectile.active ||
      enemy.dead ||
      projectile.ownerTeam !== 'player' ||
      projectile.hitActors.has(enemy.actorId)
    ) {
      return;
    }
    projectile.hitActors.add(enemy.actorId);
    this.world.combat.damageActor(enemy, projectile.damage, projectile.damageSource);
    projectile.consumePierce();
  }

  private projectilePlayerHit(projectileObject: ArcadeObject, playerObject: ArcadeObject): void {
    if (!(projectileObject instanceof Projectile) || !(playerObject instanceof Player)) {
      return;
    }
    const projectile = projectileObject;
    const player = playerObject;
    if (!projectile.active || player.dead || projectile.ownerTeam !== 'enemy') {
      return;
    }
    this.world.combat.damageActor(player, projectile.damage, projectile.damageSource);
    projectile.destroy();
  }

  private pickupHit(playerObject: ArcadeObject, pickupObject: ArcadeObject): void {
    if (!(playerObject instanceof Player) || !(pickupObject instanceof Pickup)) {
      return;
    }
    const player = playerObject;
    const pickup = pickupObject;
    if (!pickup.active) {
      return;
    }
    const message = pickup.apply(player);
    this.world.audio.play('pickup');
    this.world.log(message);
  }

  private collectProjectileSweepHits(
    projectile: Projectile,
    start: Phaser.Math.Vector2,
    end: Phaser.Math.Vector2
  ): ProjectileSweepHit[] {
    const hits: ProjectileSweepHit[] = [];

    for (const rect of this.world.wallRects) {
      const hit = this.segmentRectHit(start, end, rect);
      if (hit) {
        hits.push({ kind: 'wall', ...hit });
      }
    }

    for (const door of this.world.doorsList) {
      if (door.open) {
        continue;
      }
      const hit = this.segmentRectHit(start, end, door.rect);
      if (hit) {
        hits.push({ kind: 'door', door, ...hit });
      }
    }

    for (const prop of this.world.propsList) {
      if (prop.dead || projectile.hitProps.has(prop)) {
        continue;
      }
      const hit = this.segmentRectHit(start, end, prop.rect);
      if (hit) {
        hits.push({ kind: 'prop', prop, ...hit });
      }
    }

    if (projectile.ownerTeam === 'player') {
      for (const enemy of this.world.enemiesList) {
        if (enemy.dead || projectile.hitActors.has(enemy.actorId)) {
          continue;
        }
        const hit = this.segmentActorHit(start, end, enemy);
        if (hit) {
          hits.push({ kind: 'enemy', enemy, ...hit });
        }
      }
    } else if (projectile.ownerTeam === 'enemy' && !this.world.player.dead) {
      const hit = this.segmentActorHit(start, end, this.world.player);
      if (hit) {
        hits.push({ kind: 'player', player: this.world.player, ...hit });
      }
    }

    return hits;
  }

  private resolveProjectileSweepHit(projectile: Projectile, hit: ProjectileSweepHit): void {
    projectile.setPosition(hit.point.x, hit.point.y);

    if (hit.kind === 'wall') {
      this.world.effects.hit(hit.point.x, hit.point.y, projectile.color);
      projectile.destroy();
      return;
    }

    if (hit.kind === 'door') {
      if (hit.door.open) {
        return;
      }
      this.world.effects.hit(hit.point.x, hit.point.y, projectile.color);
      projectile.destroy();
      return;
    }

    if (hit.kind === 'prop') {
      if (hit.prop.dead || projectile.hitProps.has(hit.prop)) {
        return;
      }
      projectile.hitProps.add(hit.prop);
      this.world.combat.damageProp(hit.prop, projectile.damage, projectile.damageSource);
      projectile.consumePierce();
      return;
    }

    if (hit.kind === 'enemy') {
      if (hit.enemy.dead || projectile.ownerTeam !== 'player' || projectile.hitActors.has(hit.enemy.actorId)) {
        return;
      }
      projectile.hitActors.add(hit.enemy.actorId);
      this.world.combat.damageActor(hit.enemy, projectile.damage, projectile.damageSource);
      projectile.consumePierce();
      return;
    }

    if (!hit.player.dead && projectile.ownerTeam === 'enemy') {
      this.world.combat.damageActor(hit.player, projectile.damage, projectile.damageSource);
      projectile.destroy();
    }
  }

  private segmentRectHit(start: Phaser.Math.Vector2, end: Phaser.Math.Vector2, rect: RectData): SweepBase | undefined {
    if (pointInRect(start, rect)) {
      return { t: 0, point: start.clone() };
    }

    const point = rayRect(start, end, rect);
    if (!point) {
      return undefined;
    }

    return {
      t: this.segmentProgress(start, end, point),
      point
    };
  }

  private segmentActorHit(
    start: Phaser.Math.Vector2,
    end: Phaser.Math.Vector2,
    actor: Enemy | Player
  ): SweepBase | undefined {
    const center = actor.positionVector;
    if (distanceToSegment(start, end, center) > actor.collisionRadius + 5) {
      return undefined;
    }

    const t = this.segmentProgress(start, end, center);
    return {
      t,
      point: new Phaser.Math.Vector2(Phaser.Math.Linear(start.x, end.x, t), Phaser.Math.Linear(start.y, end.y, t))
    };
  }

  private segmentProgress(start: Phaser.Math.Vector2, end: Phaser.Math.Vector2, point: Phaser.Math.Vector2): number {
    const segmentX = end.x - start.x;
    const segmentY = end.y - start.y;
    const lengthSquared = segmentX * segmentX + segmentY * segmentY;
    if (lengthSquared <= 0.0001) {
      return 0;
    }
    return Phaser.Math.Clamp(((point.x - start.x) * segmentX + (point.y - start.y) * segmentY) / lengthSquared, 0, 1);
  }
}
