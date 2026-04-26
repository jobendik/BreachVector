import Phaser from 'phaser';
import type { Enemy } from '../entities/Enemy';
import type { Player } from '../entities/Player';
import { EnemyState, type TacticalLogCategory, type TacticalLogEmphasis } from '../game/types';
import type { AlertSystem } from './AlertSystem';
import type { PathfindingSystem } from './PathfindingSystem';
import type { VisionSystem } from './VisionSystem';
import type { WeaponSystem } from './WeaponSystem';

const PATH_RECOMPUTE_INTERVAL = 0.85;
const PATH_RECOMPUTE_JITTER = 0.35;
const PATH_TARGET_MOVED_SQ = 160 * 160;
const WAYPOINT_REACH_DIST = 30;
const SHORT_DIST = 90;
const SUSPICION_INVESTIGATE_THRESHOLD = 0.3;
const SUSPICION_DETECTED_THRESHOLD = 1;
const SUSPICION_FILL_RATE = 0.92;
const SUSPICION_DRAIN_RATE = 0.34;
const CAPTAIN_COMMAND_RANGE = 520;
const CAPTAIN_COMMAND_INTERVAL = 6.5;
const CAPTAIN_COMMAND_DURATION = 4.8;
const CAPTAIN_COMMAND_ARMOR = 8;

interface EnemyAIWorld {
  player: Player;
  enemiesList: Enemy[];
  coverPoints: Phaser.Math.Vector2[];
  vision: VisionSystem;
  alert: AlertSystem;
  weapons: WeaponSystem;
  pathfinding: PathfindingSystem;
  log(message: string, category?: TacticalLogCategory, emphasis?: TacticalLogEmphasis): void;
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
      enemy.recentlyVisible =
        debugEnabled ||
        this.world.alert.state === 'detected' ||
        this.world.vision.isVisibleFromPlayer(enemy.positionVector);

      this.updateSuspicion(enemy, seesPlayer, deltaSeconds);
      this.updateCaptainCommand(enemy);
      if (
        !seesPlayer &&
        (enemy.aiState === EnemyState.Attack || enemy.aiState === EnemyState.Flank) &&
        enemy.lostSightTimer <= 0
      ) {
        enemy.setAIState(EnemyState.Search);
      }

      this.updateState(enemy, deltaSeconds);
    }
  }

  private updateCaptainCommand(enemy: Enemy): void {
    if (enemy.role !== 'captain' || enemy.commandCooldown > 0 || this.world.alert.state === 'hidden') {
      return;
    }

    enemy.commandCooldown = CAPTAIN_COMMAND_INTERVAL + Math.random() * 1.4;
    enemy.commandPulseTimer = 1.05;
    enemy.commandBoostTimer = CAPTAIN_COMMAND_DURATION;
    enemy.armor = Math.min(enemy.maxArmor, enemy.armor + CAPTAIN_COMMAND_ARMOR);

    let boosted = 0;
    for (const ally of this.world.enemiesList) {
      if (ally.dead || ally === enemy) {
        continue;
      }
      const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, ally.x, ally.y);
      if (distance > CAPTAIN_COMMAND_RANGE) {
        continue;
      }
      boosted += 1;
      ally.commandBoostTimer = CAPTAIN_COMMAND_DURATION;
      ally.armor = Math.min(ally.maxArmor, ally.armor + CAPTAIN_COMMAND_ARMOR);
      ally.suspicion = Math.max(ally.suspicion, this.world.alert.state === 'detected' ? 0.75 : 0.44);
      ally.lastKnownPlayer = this.world.player.positionVector;
      if (
        ally.aiState !== EnemyState.Attack &&
        ally.aiState !== EnemyState.Flank &&
        ally.aiState !== EnemyState.Cover &&
        ally.aiState !== EnemyState.Reload
      ) {
        ally.investigatePoint = this.world.player.positionVector;
        ally.setAIState(this.world.alert.state === 'detected' ? EnemyState.Search : EnemyState.Suspicious);
      }
    }

    this.world.alert.raiseSearch(4.2);
    this.world.log(boosted > 0 ? `Command pulse boosted ${boosted} hostiles` : 'Command pulse active', 'alert');
  }

  private updateSuspicion(enemy: Enemy, seesPlayer: boolean, deltaSeconds: number): void {
    const combatState =
      enemy.aiState === EnemyState.Attack ||
      enemy.aiState === EnemyState.Flank ||
      enemy.aiState === EnemyState.Cover ||
      enemy.aiState === EnemyState.Reload;

    if (seesPlayer) {
      enemy.lastKnownPlayer = this.world.player.positionVector;

      if (combatState || this.world.alert.state === 'detected') {
        enemy.suspicion = SUSPICION_DETECTED_THRESHOLD;
        enemy.lostSightTimer = 1.4;
        if (enemy.aiState !== EnemyState.Cover && enemy.aiState !== EnemyState.Reload) {
          enemy.setAIState(enemy.role === 'flanker' ? EnemyState.Flank : EnemyState.Attack);
        }
        this.world.alert.raiseDetected(3.4);
        return;
      }

      const previousSuspicion = enemy.suspicion;
      const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.world.player.x, this.world.player.y);
      const visibleDistance = enemy.config.visionDistance * (this.world.player.noiseMultiplier < 0.5 ? 0.88 : 1);
      const closeness = Phaser.Math.Clamp(1 - distance / visibleDistance, 0, 1);
      const distanceMultiplier = Phaser.Math.Linear(0.45, 1.25, closeness);
      const movementMultiplier = Phaser.Math.Linear(0.58, 1, this.world.player.noiseMultiplier);
      const alertMultiplier =
        this.world.alert.state === 'searching' ||
        enemy.aiState === EnemyState.Search ||
        enemy.aiState === EnemyState.Suspicious
          ? 1.35
          : 1;
      const roleMultiplier =
        enemy.role === 'captain' ? 1.18 : enemy.role === 'sniper' ? 1.08 : enemy.role === 'heavy' ? 0.88 : 1;

      enemy.suspicion = Phaser.Math.Clamp(
        enemy.suspicion +
          deltaSeconds *
            SUSPICION_FILL_RATE *
            distanceMultiplier *
            movementMultiplier *
            alertMultiplier *
            roleMultiplier,
        0,
        SUSPICION_DETECTED_THRESHOLD
      );

      if (enemy.suspicion >= SUSPICION_DETECTED_THRESHOLD) {
        enemy.lostSightTimer = 1.4;
        enemy.setAIState(enemy.role === 'flanker' ? EnemyState.Flank : EnemyState.Attack);
        this.world.alert.raiseDetected(3.4);
        return;
      }

      if (enemy.suspicion >= SUSPICION_INVESTIGATE_THRESHOLD) {
        enemy.investigatePoint = this.world.player.positionVector;
        if (previousSuspicion < SUSPICION_INVESTIGATE_THRESHOLD) {
          enemy.setAIState(EnemyState.Suspicious);
          this.world.alert.raiseSearch(2.6);
        }
      }
      return;
    }

    if ((enemy.aiState === EnemyState.Attack || enemy.aiState === EnemyState.Flank) && enemy.lostSightTimer > 0) {
      enemy.suspicion = SUSPICION_DETECTED_THRESHOLD;
      return;
    }

    const drainMultiplier = enemy.aiState === EnemyState.Search || enemy.aiState === EnemyState.Suspicious ? 0.72 : 1;
    enemy.suspicion = Math.max(0, enemy.suspicion - deltaSeconds * SUSPICION_DRAIN_RATE * drainMultiplier);
  }

  private updateState(enemy: Enemy, deltaSeconds: number): void {
    if (enemy.reloadRemaining > 0) {
      enemy.stopMoving();
      return;
    }

    switch (enemy.aiState) {
      case EnemyState.Guard:
        enemy.stopMoving();
        return;
      case EnemyState.Patrol:
        this.updatePatrol(enemy);
        return;
      case EnemyState.Suspicious:
        this.updateSuspicious(enemy);
        return;
      case EnemyState.Search:
        this.updateSearch(enemy, deltaSeconds);
        return;
      case EnemyState.Flank:
        this.updateFlank(enemy);
        return;
      case EnemyState.Cover:
        this.updateCover(enemy);
        return;
      case EnemyState.Attack:
        this.updateAttack(enemy);
        return;
      case EnemyState.Reload:
      case EnemyState.Dead:
        enemy.stopMoving();
        return;
    }

    assertNever(enemy.aiState);
  }

  private updatePatrol(enemy: Enemy): void {
    if (enemy.patrolPoints.length <= 1) {
      enemy.stopMoving();
      return;
    }
    const target = enemy.patrolPoints[enemy.patrolIndex];
    this.navigateTo(enemy, target, 0.75);
    if (Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y) < 24) {
      enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrolPoints.length;
      enemy.navPath = [];
    }
  }

  private updateSuspicious(enemy: Enemy): void {
    const target = enemy.investigatePoint ?? enemy.lastKnownPlayer;
    if (!target) {
      enemy.setAIState(EnemyState.Patrol);
      return;
    }
    this.navigateTo(enemy, target, 0.9);
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
    if (
      !enemy.investigatePoint ||
      Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.investigatePoint.x, enemy.investigatePoint.y) < 28
    ) {
      enemy.investigatePoint = enemy.lastKnownPlayer
        .clone()
        .add(new Phaser.Math.Vector2(Phaser.Math.Between(-120, 120), Phaser.Math.Between(-120, 120)));
      enemy.navPath = [];
    }
    this.navigateTo(enemy, enemy.investigatePoint, 0.8);
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
      this.navigateTo(enemy, target, enemy.role === 'heavy' ? 0.75 : 1);
    } else if (distance < enemy.config.preferredRange * 0.52) {
      const away = enemy.positionVector
        .subtract(target)
        .normalize()
        .scale(enemy.moveSpeed * 0.85);
      const body = enemy.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(away.x, away.y);
    } else {
      enemy.stopMoving();
    }

    if (
      distance <= enemy.config.attackRange &&
      this.world.vision.hasLineOfSight(enemy.positionVector, player.positionVector)
    ) {
      this.world.weapons.tryFireEnemy(enemy, player.positionVector);
    }
  }

  private updateFlank(enemy: Enemy): void {
    const player = this.world.player;
    const toPlayer = player.positionVector.clone().subtract(enemy.positionVector);
    const side = new Phaser.Math.Vector2(-toPlayer.y, toPlayer.x).normalize();
    if (Math.sin(enemy.x * 0.03 + enemy.y * 0.02) < 0) {
      side.scale(-1);
    }
    const flankTarget = player.positionVector.clone().add(side.scale(enemy.config.preferredRange * 0.82));
    this.navigateTo(enemy, flankTarget, 1.12);
    enemy.setFacingVector(player.positionVector.clone().subtract(enemy.positionVector));
    if (this.world.vision.hasLineOfSight(enemy.positionVector, player.positionVector)) {
      this.world.weapons.tryFireEnemy(enemy, player.positionVector);
    }
  }

  private updateCover(enemy: Enemy): void {
    if (!enemy.coverPoint) {
      enemy.setAIState(EnemyState.Attack);
      return;
    }
    this.navigateTo(enemy, enemy.coverPoint, 1);
    if (Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.coverPoint.x, enemy.coverPoint.y) < 22) {
      enemy.stopMoving();
      enemy.setFacingVector(this.world.player.positionVector.clone().subtract(enemy.positionVector));
      if (this.world.vision.hasLineOfSight(enemy.positionVector, this.world.player.positionVector)) {
        this.world.weapons.tryFireEnemy(enemy, this.world.player.positionVector);
      }
      if (enemy.fireCooldown <= 0.1) {
        enemy.setAIState(EnemyState.Attack);
      }
    }
  }

  private navigateTo(enemy: Enemy, target: Phaser.Math.Vector2, speedMultiplier = 1): void {
    const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y);

    if (dist < SHORT_DIST) {
      enemy.moveToward(target, speedMultiplier);
      return;
    }

    const tdx = target.x - enemy.navTargetX;
    const tdy = target.y - enemy.navTargetY;
    const targetMoved = tdx * tdx + tdy * tdy > PATH_TARGET_MOVED_SQ;
    const needsRecompute = enemy.navPath.length === 0 || targetMoved || enemy.navRecomputeTimer <= 0;

    if (needsRecompute) {
      enemy.navTargetX = target.x;
      enemy.navTargetY = target.y;
      enemy.navPath = this.world.pathfinding.findPath(enemy.x, enemy.y, target.x, target.y);
      enemy.navRecomputeTimer = PATH_RECOMPUTE_INTERVAL + Math.random() * PATH_RECOMPUTE_JITTER;
    }

    // LOS shortcutting: skip intermediate waypoints we can see directly
    while (enemy.navPath.length > 1) {
      if (this.world.vision.hasLineOfSight(enemy.positionVector, enemy.navPath[1])) {
        enemy.navPath.shift();
      } else {
        break;
      }
    }

    // Consume reached waypoints
    while (
      enemy.navPath.length > 0 &&
      Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.navPath[0].x, enemy.navPath[0].y) < WAYPOINT_REACH_DIST
    ) {
      enemy.navPath.shift();
    }

    enemy.moveToward(
      enemy.navPath.length > 0 ? enemy.navPath[0] : target,
      enemy.commandBoostTimer > 0 ? speedMultiplier * 1.12 : speedMultiplier
    );
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

function assertNever(value: never): never {
  throw new Error(`Unhandled enemy state: ${value}`);
}
