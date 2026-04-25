import Phaser from 'phaser';
import { levels, getLevel } from '../data/levels';
import { missionText } from '../data/missionText';
import { DEPTHS, PLAYER_BALANCE } from '../game/constants';
import { GameEvents, eventBus } from '../game/events';
import type { HudState, LevelData, PickupType, RectData } from '../game/types';
import { Door } from '../entities/Door';
import { Enemy } from '../entities/Enemy';
import type { ExtractionZone } from '../entities/ExtractionZone';
import { Grenade } from '../entities/Grenade';
import { Pickup } from '../entities/Pickup';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { Prop } from '../entities/Prop';
import { Terminal } from '../entities/Terminal';
import { EnvironmentRenderer } from '../level/EnvironmentRenderer';
import { LevelBuilder } from '../level/LevelBuilder';
import { AlertSystem } from '../systems/AlertSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { DebugSystem } from '../systems/DebugSystem';
import { EffectsSystem } from '../systems/EffectsSystem';
import { EnemyAISystem } from '../systems/EnemyAISystem';
import { InputSystem } from '../systems/InputSystem';
import { InteractionSystem, type InteractionStatus } from '../systems/InteractionSystem';
import { MinimapSystem } from '../systems/MinimapSystem';
import { MissionSystem } from '../systems/MissionSystem';
import { VisionSystem } from '../systems/VisionSystem';
import { WeaponSystem } from '../systems/WeaponSystem';

export class GameScene extends Phaser.Scene {
  level!: LevelData;
  levelIndex = 0;
  player!: Player;

  wallGroup!: Phaser.Physics.Arcade.StaticGroup;
  doorGroup!: Phaser.Physics.Arcade.Group;
  enemyGroup!: Phaser.Physics.Arcade.Group;
  propsGroup!: Phaser.Physics.Arcade.Group;
  projectileGroup!: Phaser.Physics.Arcade.Group;
  grenadeGroup!: Phaser.Physics.Arcade.Group;
  pickupGroup!: Phaser.Physics.Arcade.Group;

  doorEntities: Door[] = [];
  terminalEntities: Terminal[] = [];
  propEntities: Prop[] = [];
  enemyEntities: Enemy[] = [];
  projectileEntities: Projectile[] = [];
  grenadeEntities: Grenade[] = [];
  coverPoints: Phaser.Math.Vector2[] = [];

  effects!: EffectsSystem;
  audio!: AudioSystem;
  inputSystem!: InputSystem;
  weapons!: WeaponSystem;
  combat!: CombatSystem;
  collisions!: CollisionSystem;
  interaction!: InteractionSystem;
  vision!: VisionSystem;
  mission!: MissionSystem;
  alert!: AlertSystem;
  enemyAI!: EnemyAISystem;
  minimap!: MinimapSystem;
  debug!: DebugSystem;

  private visibilityGraphics!: Phaser.GameObjects.Graphics;
  private extractionZone!: ExtractionZone;
  private interactionStatus: InteractionStatus = { kind: 'none', prompt: '', progress: 0 };
  private tacticalLog: string[] = [];
  private minimapTimer = 0;
  private sectorEnding = false;

  constructor() {
    super('GameScene');
  }

  create(data: { levelIndex?: number }): void {
    this.scene.stop('UIScene');
    this.levelIndex = Phaser.Math.Clamp(data.levelIndex ?? 0, 0, levels.length - 1);
    this.level = getLevel(this.levelIndex);
    this.sectorEnding = false;
    this.tacticalLog = [];
    this.interactionStatus = { kind: 'none', prompt: '', progress: 0 };

    this.physics.world.setBounds(0, 0, this.level.width, this.level.height);
    this.cameras.main.setBounds(0, 0, this.level.width, this.level.height);
    this.cameras.main.setBackgroundColor(0x020617);

    this.createGroups();
    this.renderEnvironment();
    this.buildLevelEntities();
    this.createSystems();
    this.collisions.setup();

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1);

    this.scene.launch('UIScene');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanupScene, this);
    this.log(`Sector: ${this.level.name}`);
    this.log(this.level.briefing);
    this.mission.emit();
  }

  update(time: number, deltaMs: number): void {
    if (!this.player || this.player.dead || this.sectorEnding) {
      return;
    }
    const deltaSeconds = Math.min(deltaMs / 1000, 0.05);
    this.inputSystem.update();
    this.audio.resume();

    if (this.inputSystem.pausePressed()) {
      this.scene.launch('PauseScene', {
        levelIndex: this.levelIndex,
        alertState: this.alert.state,
        enemiesAlive: this.enemyEntities.filter((enemy) => !enemy.dead).length,
        objectives: this.mission.objectives()
      });
      this.scene.pause();
      return;
    }

    if (this.inputSystem.debugPressed()) {
      const debugEnabled = this.debug.toggle();
      this.log(debugEnabled ? 'Debug overlay enabled' : 'Debug overlay disabled');
    }

    const pointerWorld = this.inputSystem.pointerWorld(this.cameras.main);
    const movement = this.inputSystem.movementVector();

    this.player.updateTimers(deltaSeconds);
    this.player.aimAt(pointerWorld);
    this.player.applyMovement(movement, this.inputSystem.slowWalkHeld(), deltaSeconds);

    const weaponIndex = this.inputSystem.weaponPressed();
    if (weaponIndex !== null && this.player.switchWeapon(weaponIndex)) {
      this.log(`Weapon: ${this.player.selectedWeapon.definition.displayName}`);
    }

    if (this.inputSystem.dashPressed() && this.player.tryDash(movement)) {
      this.audio.play('dash');
      this.effects.shake(2.4);
      this.emitNoise(this.player.positionVector, 260, true);
    }

    if (this.inputSystem.reloadPressed()) {
      this.weapons.startReload(this.player);
    }

    this.weapons.tryFirePlayer(
      this.player,
      pointerWorld,
      this.inputSystem.primaryHeld(),
      this.inputSystem.consumePrimaryPressed()
    );

    if (this.inputSystem.consumeSecondaryPressed()) {
      this.weapons.throwGrenade(this.player, pointerWorld);
    }

    if (this.inputSystem.meleePressed()) {
      this.handleMelee();
    }

    this.interactionStatus = this.interaction.update(deltaSeconds);
    this.enemyAI.update(deltaSeconds, this.debug.enabled);
    this.debug.drawEnemyOverlay(this.enemyEntities);
    this.updateProjectiles(deltaSeconds);
    this.updateGrenades(deltaSeconds);
    this.alert.update(deltaSeconds);
    this.updateVisibility(time / 1000);
    this.updateCameraAim(pointerWorld);
    this.mission.updateExtraction(time / 1000);
    this.cleanupInactiveEntities();
    this.emitHudState();
    this.emitMinimap(deltaSeconds);
  }

  spawnProjectile(projectile: Projectile): void {
    this.projectileGroup.add(projectile);
    this.projectileEntities.push(projectile);
  }

  spawnGrenade(grenade: Grenade): void {
    this.grenadeGroup.add(grenade);
    this.grenadeEntities.push(grenade);
  }

  emitNoise(point: Phaser.Math.Vector2, radius: number, important = false): void {
    const ring = this.add.circle(point.x, point.y, 8).setDepth(DEPTHS.effects);
    ring.setStrokeStyle(2, important ? 0xef4444 : 0x94a3b8, important ? 0.5 : 0.28);
    ring.setFillStyle(0x000000, 0);
    this.tweens.add({
      targets: ring,
      radius,
      alpha: 0,
      duration: important ? 620 : 460,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy()
    });

    for (const enemy of this.enemyEntities) {
      if (enemy.dead) {
        continue;
      }
      if (Phaser.Math.Distance.Between(point.x, point.y, enemy.x, enemy.y) <= radius) {
        enemy.hearNoise(point, important);
      }
    }
    if (important) {
      this.alert.raiseSearch(3.2);
    }
  }

  getClosedDoorRects(): RectData[] {
    return this.doorEntities.filter((door) => !door.open).map((door) => door.rect);
  }

  getSolidPropRects(blockLosOnly = false): RectData[] {
    return this.propEntities
      .filter((prop) => !prop.dead && (!blockLosOnly || prop.blocksLineOfSight))
      .map((prop) => prop.rect);
  }

  hasLineOfSight(a: Phaser.Math.Vector2, b: Phaser.Math.Vector2): boolean {
    return this.vision.hasLineOfSight(a, b);
  }

  onEnemyKilled(enemy: Enemy): void {
    this.log(`${enemy.config.displayName} neutralized`);
    if (enemy.role === 'captain') {
      this.mission.commandTargetKilled();
    }
    if (Math.random() < 0.28) {
      this.dropSupply(enemy.x, enemy.y);
    }
  }

  onPlayerKilled(): void {
    if (this.sectorEnding) {
      return;
    }
    this.sectorEnding = true;
    this.log(missionText.gameOver);
    this.time.delayedCall(650, () => {
      this.scene.stop('UIScene');
      this.scene.start('GameOverScene', { levelIndex: this.levelIndex });
    });
  }

  log(message: string): void {
    this.tacticalLog.push(message);
    this.tacticalLog = this.tacticalLog.slice(-8);
    eventBus.emit(GameEvents.TacticalLog, { message });
  }

  private createGroups(): void {
    this.wallGroup = this.physics.add.staticGroup();
    this.doorGroup = this.physics.add.group();
    this.enemyGroup = this.physics.add.group();
    this.propsGroup = this.physics.add.group();
    this.projectileGroup = this.physics.add.group();
    this.grenadeGroup = this.physics.add.group();
    this.pickupGroup = this.physics.add.group();

    this.doorEntities = [];
    this.terminalEntities = [];
    this.propEntities = [];
    this.enemyEntities = [];
    this.projectileEntities = [];
    this.grenadeEntities = [];
    this.coverPoints = [];
  }

  private renderEnvironment(): void {
    const environment = new EnvironmentRenderer(this).render(this.level, this.wallGroup);
    this.visibilityGraphics = environment.visibilityGraphics;
    this.debug = new DebugSystem(environment.debugGraphics);
  }

  private buildLevelEntities(): void {
    const levelEntities = new LevelBuilder(this).build(this.level, {
      doors: this.doorGroup,
      enemies: this.enemyGroup,
      props: this.propsGroup,
      pickups: this.pickupGroup
    });

    this.extractionZone = levelEntities.extractionZone;
    this.player = levelEntities.player;
    this.doorEntities = levelEntities.doors;
    this.terminalEntities = levelEntities.terminals;
    this.propEntities = levelEntities.props;
    this.enemyEntities = levelEntities.enemies;
    this.coverPoints = levelEntities.coverPoints;
  }

  private createSystems(): void {
    this.effects = new EffectsSystem(this);
    this.audio = new AudioSystem();
    this.inputSystem = new InputSystem(this);
    this.alert = new AlertSystem();
    this.mission = new MissionSystem({
      level: this.level,
      player: this.player,
      extractionZone: this.extractionZone,
      audio: this.audio,
      log: (message) => this.log(message),
      onSectorComplete: () => this.completeSector()
    });
    this.vision = new VisionSystem(this);
    this.minimap = new MinimapSystem(this.level);

    this.weapons = new WeaponSystem({
      scene: this,
      effects: this.effects,
      audio: this.audio,
      spawnProjectile: (projectile) => this.spawnProjectile(projectile),
      spawnGrenade: (grenade) => this.spawnGrenade(grenade),
      emitNoise: (point, radius, important) => this.emitNoise(point, radius, important)
    });

    this.combat = new CombatSystem({
      scene: this,
      player: this.player,
      enemies: this.enemyEntities,
      props: this.propEntities,
      effects: this.effects,
      audio: this.audio,
      hasLineOfSight: (a, b) => this.hasLineOfSight(a, b),
      onEnemyKilled: (enemy) => this.onEnemyKilled(enemy),
      onPlayerKilled: () => this.onPlayerKilled(),
      emitNoise: (point, radius, important) => this.emitNoise(point, radius, important)
    });

    this.interaction = new InteractionSystem({
      player: this.player,
      level: this.level,
      terminals: this.terminalEntities,
      doors: this.doorEntities,
      input: this.inputSystem,
      mission: this.mission,
      audio: this.audio,
      effects: this.effects,
      emitNoise: (point, radius, important) => this.emitNoise(point, radius, important),
      log: (message) => this.log(message)
    });

    this.enemyAI = new EnemyAISystem({
      player: this.player,
      enemiesList: this.enemyEntities,
      coverPoints: this.coverPoints,
      vision: this.vision,
      alert: this.alert,
      weapons: this.weapons
    });

    this.collisions = new CollisionSystem({
      scene: this,
      player: this.player,
      wallRects: this.level.walls,
      doorsList: this.doorEntities,
      enemiesList: this.enemyEntities,
      propsList: this.propEntities,
      walls: this.wallGroup,
      doors: this.doorGroup,
      enemies: this.enemyGroup,
      propsGroup: this.propsGroup,
      projectiles: this.projectileGroup,
      grenades: this.grenadeGroup,
      pickups: this.pickupGroup,
      combat: this.combat,
      log: (message) => this.log(message),
      effects: this.effects,
      audio: this.audio
    });
  }

  private handleMelee(): void {
    if (this.player.meleeCooldown > 0) {
      return;
    }
    const target = this.enemyEntities
      .filter((enemy) => !enemy.dead)
      .sort(
        (a, b) =>
          Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y) -
          Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y)
      )[0];
    if (
      !target ||
      Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y) > PLAYER_BALANCE.meleeRange
    ) {
      return;
    }
    this.player.meleeCooldown = 0.65;
    this.combat.damageActor(target, PLAYER_BALANCE.meleeDamage, {
      team: 'player',
      label: 'Takedown',
      position: { x: this.player.x, y: this.player.y }
    });
    this.effects.shake(2.5);
    this.emitNoise(this.player.positionVector, this.inputSystem.slowWalkHeld() ? 120 : 260, false);
  }

  private updateProjectiles(deltaSeconds: number): void {
    this.collisions.resolveProjectileSweeps(this.projectileEntities);
    for (const projectile of this.projectileEntities) {
      if (projectile.active) {
        projectile.update(deltaSeconds);
      }
    }
  }

  private updateGrenades(deltaSeconds: number): void {
    for (const grenade of this.grenadeEntities) {
      if (!grenade.active) {
        continue;
      }
      if (grenade.update(deltaSeconds)) {
        const point = new Phaser.Math.Vector2(grenade.x, grenade.y);
        grenade.destroy();
        this.combat.explosion(point, grenade.radius, grenade.damage, grenade.ownerTeam);
      }
    }
  }

  private updateVisibility(timeSeconds: number): void {
    this.visibilityGraphics.clear();
    const detected = this.alert.state === 'detected';
    if (detected) {
      this.visibilityGraphics.fillStyle(0xef4444, 0.1);
      this.visibilityGraphics.fillRect(0, 0, this.level.width, this.level.height);
      for (const enemy of this.enemyEntities) {
        enemy.setAlpha(enemy.dead ? 0 : 1);
      }
      return;
    }

    this.visibilityGraphics.fillStyle(0x020617, this.alert.state === 'searching' ? 0.22 : 0.32);
    this.visibilityGraphics.fillRect(0, 0, this.level.width, this.level.height);
    const polygon = this.vision.visibilityPolygon(this.player.positionVector, 780);
    if (polygon.length > 2) {
      this.visibilityGraphics.fillStyle(0x10b981, 0.035);
      this.visibilityGraphics.beginPath();
      this.visibilityGraphics.moveTo(polygon[0].x, polygon[0].y);
      for (const point of polygon.slice(1)) {
        this.visibilityGraphics.lineTo(point.x, point.y);
      }
      this.visibilityGraphics.closePath();
      this.visibilityGraphics.fillPath();
      this.visibilityGraphics.lineStyle(2, this.alert.state === 'searching' ? 0xf59e0b : 0x10b981, 0.25);
      this.visibilityGraphics.strokePath();
    }
    this.visibilityGraphics.lineStyle(1, 0x38bdf8, 0.24 + Math.sin(timeSeconds * 4) * 0.06);
    this.visibilityGraphics.strokeCircle(this.player.x, this.player.y, 180);

    for (const enemy of this.enemyEntities) {
      if (enemy.dead) {
        enemy.setAlpha(0);
      } else {
        const visible =
          this.debug.enabled || this.vision.isVisibleFromPlayer(enemy.positionVector) || enemy.recentlyVisible;
        enemy.setAlpha(visible ? 1 : 0.18);
      }
    }
  }

  private updateCameraAim(pointerWorld: Phaser.Math.Vector2): void {
    const offset = pointerWorld.subtract(this.player.positionVector).scale(0.16);
    this.cameras.main.setFollowOffset(-offset.x, -offset.y);
  }

  private cleanupInactiveEntities(): void {
    this.projectileEntities = this.projectileEntities.filter((projectile) => projectile.active);
    this.grenadeEntities = this.grenadeEntities.filter((grenade) => grenade.active);
  }

  private emitHudState(): void {
    const weaponState = this.player.selectedWeapon;
    const reloadRatio =
      weaponState.reloadRemaining > 0 ? 1 - weaponState.reloadRemaining / weaponState.definition.reloadTime : 0;
    const state: HudState = {
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      armor: this.player.armor,
      maxArmor: this.player.maxArmor,
      dashRatio: this.player.dashRatio,
      grenades: this.player.grenades,
      maxGrenades: PLAYER_BALANCE.maxGrenades,
      weaponId: weaponState.definition.id,
      weaponName: weaponState.definition.displayName,
      weaponColor: weaponState.definition.color,
      magazineSize: weaponState.definition.magazineSize,
      weaponFireMode: weaponState.definition.automatic ? 'AUTO' : 'SEMI',
      weaponNoiseLevel: this.weaponNoiseLevel(weaponState.definition.noiseRadius),
      ammo: weaponState.ammo,
      reserveAmmo: weaponState.reserveAmmo,
      reloading: weaponState.reloadRemaining > 0,
      reloadRatio,
      alertState: this.alert.state,
      objectives: this.mission.objectives(),
      interactionKind: this.interactionStatus.kind,
      interactionPrompt: this.interactionStatus.prompt,
      interactionProgress: this.interactionStatus.progress,
      tacticalLog: this.tacticalLog,
      debugEnabled: this.debug.enabled,
      enemiesAlive: this.enemyEntities.filter((enemy) => !enemy.dead).length
    };
    eventBus.emit(GameEvents.HudState, state);
  }

  private weaponNoiseLevel(noiseRadius: number): HudState['weaponNoiseLevel'] {
    if (noiseRadius < 250) {
      return 'QUIET';
    }
    if (noiseRadius > 720) {
      return 'BREACH';
    }
    return 'LOUD';
  }

  private emitMinimap(deltaSeconds: number): void {
    this.minimapTimer -= deltaSeconds;
    if (this.minimapTimer > 0) {
      return;
    }
    this.minimapTimer = 0.12;
    eventBus.emit(
      GameEvents.MinimapSnapshot,
      this.minimap.snapshot(
        this.player,
        this.enemyEntities,
        this.doorEntities,
        this.terminalEntities,
        this.activePickups(),
        this.mission.canExtract(),
        this.alert.state,
        this.debug.enabled
      )
    );
  }

  private activePickups(): Pickup[] {
    return this.pickupGroup
      .getChildren()
      .filter((child): child is Pickup => child instanceof Pickup && child.active && child.visible);
  }

  private dropSupply(x: number, y: number): void {
    const roll = Math.random();
    const type: PickupType = roll < 0.45 ? 'ammo' : roll < 0.75 ? 'medkit' : 'grenade';
    const pickup = new Pickup(this, {
      x: x + Phaser.Math.Between(-18, 18),
      y: y + Phaser.Math.Between(-18, 18),
      type
    });
    this.pickupGroup.add(pickup);
  }

  private completeSector(): void {
    if (this.sectorEnding) {
      return;
    }
    this.sectorEnding = true;
    this.time.delayedCall(650, () => {
      this.scene.stop('UIScene');
      this.scene.start('VictoryScene', { levelIndex: this.levelIndex });
    });
  }

  private cleanupScene(): void {
    this.scene.stop('UIScene');
    this.debug?.destroy();
    this.collisions?.destroy();
    this.inputSystem?.destroy();
    this.audio?.destroy();
  }
}
