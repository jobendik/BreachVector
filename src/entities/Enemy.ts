import Phaser from 'phaser';
import { enemyDefinitions } from '../data/enemies';
import { DEPTHS } from '../game/constants';
import { EnemyState, type EnemyDefinition, type EnemyRole, type EnemySpawnData, type VectorData } from '../game/types';
import { Actor } from './Actor';

export class Enemy extends Actor {
  readonly role: EnemyRole;
  readonly config: EnemyDefinition;
  aiState: EnemyState;
  patrolPoints: Phaser.Math.Vector2[];
  patrolIndex = 0;
  spawnFacing: number;
  lastKnownPlayer?: Phaser.Math.Vector2;
  investigatePoint?: Phaser.Math.Vector2;
  searchTimer = 0;
  fireCooldown = Phaser.Math.FloatBetween(0.1, 0.8);
  reloadRemaining = 0;
  burstRemaining = 0;
  shotsUntilReload = Phaser.Math.Between(5, 10);
  lostSightTimer = 0;
  coverPoint?: Phaser.Math.Vector2;
  recentlyVisible = false;
  suspicion = 0;
  navPath: Phaser.Math.Vector2[] = [];
  navTargetX = 0;
  navTargetY = 0;
  navRecomputeTimer = 0;

  constructor(scene: Phaser.Scene, spawn: EnemySpawnData) {
    const definition = enemyDefinitions[spawn.role];
    super(scene, spawn.x, spawn.y, definition.textureKey, 'enemy', {
      maxHealth: definition.health,
      maxArmor: definition.armor,
      armor: definition.armor,
      radius: definition.radius,
      speed: definition.speed
    });

    this.role = spawn.role;
    this.config = definition;
    this.aiState = spawn.patrol?.length ? EnemyState.Patrol : EnemyState.Guard;
    this.patrolPoints = (spawn.patrol ?? [{ x: spawn.x, y: spawn.y }]).map(
      (point: VectorData) => new Phaser.Math.Vector2(point.x, point.y)
    );
    this.spawnFacing = spawn.angle ?? 0;
    this.setRotation(this.spawnFacing);
    this.facing.set(Math.cos(this.spawnFacing), Math.sin(this.spawnFacing));
    this.setDepth(DEPTHS.actors);
  }

  get stateLabel(): string {
    return this.aiState.toUpperCase();
  }

  setAIState(next: EnemyState): void {
    if (this.dead) {
      this.aiState = EnemyState.Dead;
      return;
    }
    if (this.aiState !== next) {
      this.aiState = next;
      this.searchTimer = next === EnemyState.Search ? Phaser.Math.FloatBetween(2, 4) : this.searchTimer;
      this.navPath = [];
      this.navRecomputeTimer = 0;
    }
  }

  hearNoise(point: Phaser.Math.Vector2, important = false): void {
    if (
      this.dead ||
      this.aiState === EnemyState.Attack ||
      this.aiState === EnemyState.Flank ||
      this.aiState === EnemyState.Cover
    ) {
      return;
    }
    this.suspicion = Math.max(this.suspicion, important ? 0.52 : 0.24);
    this.investigatePoint = point.clone();
    this.lastKnownPlayer = point.clone();
    this.setAIState(important ? EnemyState.Search : EnemyState.Suspicious);
  }

  updateTimers(deltaSeconds: number): void {
    this.fireCooldown = Math.max(0, this.fireCooldown - deltaSeconds);
    this.reloadRemaining = Math.max(0, this.reloadRemaining - deltaSeconds);
    this.lostSightTimer = Math.max(0, this.lostSightTimer - deltaSeconds);
    this.navRecomputeTimer = Math.max(0, this.navRecomputeTimer - deltaSeconds);
    if (this.searchTimer > 0) {
      this.searchTimer = Math.max(0, this.searchTimer - deltaSeconds);
    }
  }

  moveToward(point: Phaser.Math.Vector2, speedMultiplier = 1): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const direction = point.clone().subtract(this.positionVector);
    if (direction.lengthSq() < 12 * 12) {
      body.setVelocity(0, 0);
      return;
    }
    const normalized = direction.normalize();
    body.setVelocity(normalized.x * this.moveSpeed * speedMultiplier, normalized.y * this.moveSpeed * speedMultiplier);
    this.setFacingVector(normalized);
  }

  stopMoving(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }
}
