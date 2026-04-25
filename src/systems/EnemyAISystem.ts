import Phaser from 'phaser';
import type { Enemy } from '../entities/Enemy';
import type { Player } from '../entities/Player';
import { EnemyState } from '../game/types';
import type { AlertSystem } from './AlertSystem';
import type { VisionSystem } from './VisionSystem';
import type { WeaponSystem } from './WeaponSystem';

interface EnemyAIWorld {
  player: Player;
  enemiesList: Enemy[];
  coverPoints: Phaser.Math.Vector2[];
  vision: VisionSystem;
  alert: AlertSystem;
  weapons: WeaponSystem;
}

export class EnemyAISystem {
  constructor(private readonly world: EnemyAIWorld) {}

  update(deltaSeconds: number, debugEnabled: boolean): void {
    for (const enemy of this.world.enemiesList) {
      if (enemy.dead) {
        continue;
      }

      enemy.updateTimers(deltaSeconds);
      if (enemy.reloadRemaining === 0 && enemy.aiState === EnemyState.Reload) {
        enemy.setAIState(enemy.lastKnownPlayer ? EnemyState.Search : EnemyState.Patrol);
      }

      const seesPlayer = this.world.vision.canEnemySeePlayer(enemy, this.world.player);
      enemy.recentlyVisible = debugEnabled || this.world.alert.state === 'detected' || this.world.vision.isVisibleFromPlayer(enemy.positionVector);
      if (seesPlayer) {
        enemy.lastKnownPlayer = this.world.player.positionVector;
        enemy.lostSightTimer = 1.4;
        enemy.setAIState(enemy.role === 'flanker' ? EnemyState.Flank : EnemyState.Attack);
        this.world.alert.raiseDetected(3.4);
      } else if ((enemy.aiState === EnemyState.Attack || enemy.aiState === EnemyState.Flank) && enemy.lostSightTimer <= 0) {
        enemy.setAIState(EnemyState.Search);
      }

      this.updateState(enemy, deltaSeconds);
    }
  }

  private updateState(enemy: Enemy, deltaSeconds: number): void {
    if (enemy.reloadRemaining > 0) {
      enemy.stopMoving();
      return;
    }

    switch (enemy.aiState) {
      case EnemyState.Guard:
        enemy.stopMoving();
        break;
      case EnemyState.Patrol:
        this.updatePatrol(enemy);
        break;
      case EnemyState.Suspicious:
        this.updateSuspicious(enemy);
        break;
      case EnemyState.Search:
        this.updateSearch(enemy, deltaSeconds);
        break;
      case EnemyState.Flank:
        this.updateFlank(enemy);
        break;
      case EnemyState.Cover:
        this.updateCover(enemy);
        break;
      case EnemyState.Attack:
      default:
        this.updateAttack(enemy);
        break;
    }
  }

  private updatePatrol(enemy: Enemy): void {
    if (enemy.patrolPoints.length <= 1) {
      enemy.stopMoving();
      return;
    }
    const target = enemy.patrolPoints[enemy.patrolIndex];
    enemy.moveToward(target, 0.75);
    if (Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y) < 24) {
      enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrolPoints.length;
    }
  }

  private updateSuspicious(enemy: Enemy): void {
    const target = enemy.investigatePoint ?? enemy.lastKnownPlayer;
    if (!target) {
      enemy.setAIState(EnemyState.Patrol);
      return;
    }
    enemy.moveToward(target, 0.9);
    if (Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y) < 36) {
      enemy.setAIState(EnemyState.Search);
      this.world.alert.raiseSearch(3);
    }
  }

  private updateSearch(enemy: Enemy, deltaSeconds: number): void {
    if (!enemy.lastKnownPlayer) {
      enemy.setAIState(EnemyState.Patrol);
      return;
    }
    if (!enemy.investigatePoint || Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.investigatePoint.x, enemy.investigatePoint.y) < 28) {
      enemy.investigatePoint = enemy.lastKnownPlayer
        .clone()
        .add(new Phaser.Math.Vector2(Phaser.Math.Between(-120, 120), Phaser.Math.Between(-120, 120)));
    }
    enemy.moveToward(enemy.investigatePoint, 0.8);
    enemy.searchTimer -= deltaSeconds;
    if (enemy.searchTimer <= 0) {
      enemy.setAIState(enemy.patrolPoints.length > 1 ? EnemyState.Patrol : EnemyState.Guard);
      enemy.investigatePoint = undefined;
    }
  }

  private updateAttack(enemy: Enemy): void {
    const player = this.world.player;
    const target = player.positionVector;
    const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
    enemy.setFacingVector(target.clone().subtract(enemy.positionVector));

    if (enemy.health / enemy.maxHealth < 0.38 && enemy.role !== 'heavy' && Math.random() < 0.006) {
      const cover = this.findCover(enemy);
      if (cover) {
        enemy.coverPoint = cover;
        enemy.setAIState(EnemyState.Cover);
        return;
      }
    }

    if (distance > enemy.config.preferredRange * 1.12) {
      enemy.moveToward(target, enemy.role === 'heavy' ? 0.75 : 1);
    } else if (distance < enemy.config.preferredRange * 0.52) {
      const away = enemy.positionVector.subtract(target).normalize().scale(enemy.moveSpeed * 0.85);
      const body = enemy.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(away.x, away.y);
    } else {
      enemy.stopMoving();
    }

    if (distance <= enemy.config.attackRange && this.world.vision.hasLineOfSight(enemy.positionVector, player.positionVector)) {
      this.world.weapons.tryFireEnemy(enemy, player.positionVector);
    }
  }

  private updateFlank(enemy: Enemy): void {
    const player = this.world.player;
    const toPlayer = player.positionVector.subtract(enemy.positionVector);
    const side = new Phaser.Math.Vector2(-toPlayer.y, toPlayer.x).normalize();
    if (Math.sin(enemy.x * 0.03 + enemy.y * 0.02) < 0) {
      side.scale(-1);
    }
    const flankTarget = player.positionVector.add(side.scale(enemy.config.preferredRange * 0.82));
    enemy.moveToward(flankTarget, 1.12);
    enemy.setFacingVector(player.positionVector.subtract(enemy.positionVector));
    if (this.world.vision.hasLineOfSight(enemy.positionVector, player.positionVector)) {
      this.world.weapons.tryFireEnemy(enemy, player.positionVector);
    }
  }

  private updateCover(enemy: Enemy): void {
    if (!enemy.coverPoint) {
      enemy.setAIState(EnemyState.Attack);
      return;
    }
    enemy.moveToward(enemy.coverPoint, 1);
    if (Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.coverPoint.x, enemy.coverPoint.y) < 22) {
      enemy.stopMoving();
      enemy.setFacingVector(this.world.player.positionVector.subtract(enemy.positionVector));
      if (this.world.vision.hasLineOfSight(enemy.positionVector, this.world.player.positionVector)) {
        this.world.weapons.tryFireEnemy(enemy, this.world.player.positionVector);
      }
      if (enemy.fireCooldown <= 0.1) {
        enemy.setAIState(EnemyState.Attack);
      }
    }
  }

  private findCover(enemy: Enemy): Phaser.Math.Vector2 | undefined {
    const player = this.world.player.positionVector;
    let best: Phaser.Math.Vector2 | undefined;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const point of this.world.coverPoints) {
      const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, point.x, point.y);
      if (distance > 420) {
        continue;
      }
      const blockedFromPlayer = !this.world.vision.hasLineOfSight(player, point);
      const score = distance + (blockedFromPlayer ? -180 : 220);
      if (score < bestScore) {
        best = point;
        bestScore = score;
      }
    }
    return best;
  }
}
