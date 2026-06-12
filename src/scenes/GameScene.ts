import Phaser from 'phaser';
import { levels, getLevel } from '../data/levels';
import { missionText } from '../data/missionText';
import { DEPTHS, PLAYER_BALANCE, WORLD_BALANCE } from '../game/constants';
import { GameEvents, eventBus } from '../game/events';
import type {
  AlertState,
  EnemyAwarenessCounts,
  HudState,
  LevelData,
  MinimapZoomMode,
  PickupType,
  RectData,
  SectorGrade,
  SectorReport,
  StealthRating,
  TacticalLogCategory,
  TacticalLogEmphasis,
  TacticalLogEntry
} from '../game/types';
import { EnemyState } from '../game/types';
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
import { LightingSystem, type SteadyLight } from '../systems/LightingSystem';
import { MinimapSystem } from '../systems/MinimapSystem';
import { MissionSystem } from '../systems/MissionSystem';
import { PathfindingSystem } from '../systems/PathfindingSystem';
import { VisionSystem } from '../systems/VisionSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import { ScoreSystem } from '../systems/ScoreSystem';
import { loadSettings } from '../game/settings';

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
  lighting!: LightingSystem;
  pathfinding!: PathfindingSystem;
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
  score!: ScoreSystem;

  private visibilityGraphics!: Phaser.GameObjects.Graphics;
  private grenadeAimGraphics!: Phaser.GameObjects.Graphics;
  private extractionZone!: ExtractionZone;
  private interactionStatus: InteractionStatus = { kind: 'none', prompt: '', progress: 0 };
  private tacticalLog: TacticalLogEntry[] = [];
  private minimapTimer = 0;
  private sectorEnding = false;
  private sectorStartTime = 0;
  private enemiesTotal = 0;
  private enemiesKilled = 0;
  private shotsFired = 0;
  private shotsHit = 0;
  private damageTaken = 0;
  private highestAlertState: AlertState = 'hidden';
  private killBreakdown: Record<string, number> = {};
  private lowArmorLogged = false;
  minimapZoomMode: MinimapZoomMode = 'sector';

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
    this.sectorStartTime = this.time.now;
    this.enemiesTotal = 0;
    this.enemiesKilled = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.damageTaken = 0;
    this.highestAlertState = 'hidden';
    this.killBreakdown = {};
    this.lowArmorLogged = false;
    this.minimapZoomMode = 'sector';

    this.physics.world.setBounds(0, 0, this.level.width, this.level.height);
    this.cameras.main.setBounds(0, 0, this.level.width, this.level.height);
    this.cameras.main.setBackgroundColor(0x020617);

    this.createGroups();
    this.renderEnvironment();
    this.buildLevelEntities();
    this.enemiesTotal = this.enemyEntities.length;
    this.createSystems();
    this.collisions.setup();

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1);

    this.scene.launch('UIScene');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanupScene, this);
    this.log(`Sector: ${this.level.name}`, 'system');
    this.log(this.level.briefing, 'objective');
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
      this.log(debugEnabled ? 'Debug overlay enabled' : 'Debug overlay disabled', 'system');
    }

    if (this.inputSystem.minimapZoomPressed()) {
      this.toggleMinimapZoomMode();
    }

    const pointerWorld = this.inputSystem.pointerWorld(this.cameras.main);
    const movement = this.inputSystem.movementVector();

    this.player.updateTimers(deltaSeconds);
    this.player.aimAt(pointerWorld);
    this.player.applyMovement(movement, this.inputSystem.slowWalkHeld(), deltaSeconds);

    const weaponIndex = this.inputSystem.weaponPressed();
    if (weaponIndex !== null && this.player.switchWeapon(weaponIndex)) {
      this.log(`Weapon: ${this.player.selectedWeapon.definition.displayName}`, 'system');
    }

    if (this.inputSystem.dashPressed() && this.player.tryDash(movement)) {
      this.audio.play('dash');
      this.effects.shake(2.4);
      this.emitNoise(this.player.positionVector, 260, true);
    }

    if (this.inputSystem.reloadPressed()) {
      this.weapons.startReload(this.player);
    }

    if (
      this.weapons.tryFirePlayer(
        this.player,
        pointerWorld,
        this.inputSystem.primaryHeld(),
        this.inputSystem.consumePrimaryPressed()
      )
    ) {
      this.shotsFired += 1;
    }

    if (this.inputSystem.consumeSecondaryPressed()) {
      this.weapons.throwGrenade(this.player, pointerWorld);
    }

    if (this.inputSystem.meleePressed()) {
      this.handleMelee();
    }

    this.interactionStatus = this.interaction.update(deltaSeconds);
    this.enemyAI.update(deltaSeconds, this.debug.enabled);
    this.debug.drawEnemyOverlay(this.enemyEntities);
    this.debug.drawSuspicionIndicators(this.enemyEntities);
    this.drawGrenadeAim(pointerWorld);
    this.updateProjectiles(deltaSeconds);
    this.updateGrenades(deltaSeconds);
    this.alert.update(deltaSeconds);
    this.score.update(deltaSeconds);
    this.trackAlertState();
    this.updateVisibility(time / 1000);
    this.updateLighting(deltaSeconds, time / 1000);
    this.updateCameraAim(pointerWorld);
    this.mission.updateExtraction(time / 1000);
    this.cleanupInactiveEntities();
    this.emitHudState();
    this.emitMinimap(deltaSeconds);
  }

  spawnProjectile(projectile: Projectile): void {
    this.projectileGroup.add(projectile);
    projectile.launch();
    this.projectileEntities.push(projectile);
  }

  spawnGrenade(grenade: Grenade): void {
    this.grenadeGroup.add(grenade);
    grenade.launch();
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

  grenadeThreatenedActors(grenade: Grenade): Array<Player | Enemy> {
    const origin = new Phaser.Math.Vector2(grenade.x, grenade.y);
    return [this.player, ...this.enemyEntities].filter((actor) => {
      if (actor.dead) {
        return false;
      }
      const distance = Phaser.Math.Distance.Between(origin.x, origin.y, actor.x, actor.y);
      return distance <= grenade.radius && this.hasLineOfSight(origin, actor.positionVector);
    });
  }

  enemyAwarenessCounts(): EnemyAwarenessCounts {
    const counts: EnemyAwarenessCounts = { unaware: 0, suspicious: 0, engaged: 0 };
    for (const enemy of this.enemyEntities) {
      if (enemy.dead) {
        continue;
      }
      if (
        enemy.aiState === EnemyState.Attack ||
        enemy.aiState === EnemyState.Flank ||
        enemy.aiState === EnemyState.Cover ||
        enemy.aiState === EnemyState.Reload ||
        enemy.suspicion >= 1
      ) {
        counts.engaged += 1;
      } else if (
        enemy.aiState === EnemyState.Search ||
        enemy.aiState === EnemyState.Suspicious ||
        enemy.suspicion > 0.08
      ) {
        counts.suspicious += 1;
      } else {
        counts.unaware += 1;
      }
    }
    return counts;
  }

  toggleMinimapZoomMode(): MinimapZoomMode {
    this.minimapZoomMode = this.minimapZoomMode === 'sector' ? 'local' : 'sector';
    this.minimapTimer = 0;
    this.log(`Minimap: ${this.minimapZoomMode.toUpperCase()}`, 'system');
    return this.minimapZoomMode;
  }

  onEnemyKilled(enemy: Enemy): void {
    this.log(`${enemy.config.displayName} neutralized`, 'combat');
    this.enemiesKilled += 1;
    const sourceLabel = enemy.lastDamageSource?.label ?? 'Unknown';
    this.killBreakdown[sourceLabel] = (this.killBreakdown[sourceLabel] ?? 0) + 1;

    const award = this.score.registerKill(enemy.role, this.alert.state === 'hidden');
    const multiplierSuffix = award.multiplier > 1 ? `  x${award.multiplier.toFixed(1).replace(/\.0$/, '')}` : '';
    const ghostSuffix = award.ghostBonus ? '  GHOST' : '';
    this.effects.floatingText(enemy.x, enemy.y - 42, `+${award.points}${multiplierSuffix}${ghostSuffix}`, 0xfbbf24);
    this.killZoomPunch(award.chain);

    if (enemy.role === 'captain') {
      this.mission.commandTargetKilled();
    }
    if (Math.random() < 0.28) {
      this.dropSupply(enemy.x, enemy.y);
    }
  }

  private killZoomPunch(chain: number): void {
    const settings = loadSettings();
    if (settings.reduceMotion) {
      return;
    }
    const camera = this.cameras.main;
    this.tweens.killTweensOf(camera);
    camera.setZoom(1);
    this.tweens.add({
      targets: camera,
      zoom: chain >= 3 ? 1.05 : 1.03,
      duration: 70,
      yoyo: true,
      ease: 'Sine.easeOut'
    });
  }

  onPlayerKilled(): void {
    if (this.sectorEnding) {
      return;
    }
    this.sectorEnding = true;
    this.log(missionText.gameOver, 'system');
    const report = this.createSectorReport(this.player.lastDamageSource);
    this.time.delayedCall(650, () => {
      this.scene.stop('UIScene');
      this.scene.start('GameOverScene', { levelIndex: this.levelIndex, report });
    });
  }

  log(message: string, category: TacticalLogCategory = 'system', emphasis: TacticalLogEmphasis = 'normal'): void {
    const entry: TacticalLogEntry = emphasis === 'critical' ? { message, category, emphasis } : { message, category };
    const previous = this.tacticalLog.at(-1);
    if (
      previous?.message === message &&
      previous.category === category &&
      (previous.emphasis ?? 'normal') === emphasis
    ) {
      previous.count = (previous.count ?? 1) + 1;
    } else {
      this.tacticalLog.push(entry);
    }
    this.tacticalLog = this.tacticalLog.slice(-8);
    eventBus.emit(
      GameEvents.TacticalLog,
      previous?.message === message && previous.category === category && (previous.emphasis ?? 'normal') === emphasis
        ? previous
        : entry
    );
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
    this.grenadeAimGraphics = this.add.graphics().setDepth(DEPTHS.effects - 2);
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
    this.pathfinding = new PathfindingSystem();
    this.pathfinding.buildFromLevel(this.level);
    this.pathfinding.applyDoors(this.getClosedDoorRects());

    this.lighting = new LightingSystem(this);
    this.effects = new EffectsSystem(this, this.lighting);
    this.score = new ScoreSystem();
    this.audio = new AudioSystem();
    this.inputSystem = new InputSystem(this);
    this.alert = new AlertSystem();
    this.mission = new MissionSystem({
      level: this.level,
      player: this.player,
      extractionZone: this.extractionZone,
      audio: this.audio,
      log: (message, category, emphasis) => this.log(message, category, emphasis),
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
      onPlayerDamage: (amount) => {
        this.damageTaken += amount;
      },
      onPlayerHitConfirmed: () => {
        this.shotsHit += 1;
      },
      emitNoise: (point, radius, important) => this.emitNoise(point, radius, important)
    });

    this.interaction = new InteractionSystem({
      player: this.player,
      level: this.level,
      terminals: this.terminalEntities,
      doors: this.doorEntities,
      input: this.inputSystem,
      mission: {
        terminalHacked: (id: string) => {
          this.mission.terminalHacked(id);
          this.score.addObjectiveScore(250);
          const terminal = this.terminalEntities.find((entry) => entry.terminalId === id);
          if (terminal) {
            this.effects.floatingText(terminal.x, terminal.y - 30, '+250 HACK', 0x22d3ee);
          }
        },
        canExtract: () => this.mission.canExtract()
      },
      audio: this.audio,
      effects: this.effects,
      emitNoise: (point, radius, important) => this.emitNoise(point, radius, important),
      log: (message, category, emphasis) => this.log(message, category, emphasis),
      onDoorOpened: () => this.pathfinding.applyDoors(this.getClosedDoorRects())
    });

    this.enemyAI = new EnemyAISystem({
      player: this.player,
      enemiesList: this.enemyEntities,
      coverPoints: this.coverPoints,
      vision: this.vision,
      alert: this.alert,
      weapons: this.weapons,
      pathfinding: this.pathfinding,
      log: (message, category, emphasis) => this.log(message, category, emphasis)
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
      log: (message, category, emphasis) => this.log(message, category, emphasis),
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
      this.drawGrenadeFuse(grenade);
      if (grenade.update(deltaSeconds)) {
        const point = new Phaser.Math.Vector2(grenade.x, grenade.y);
        grenade.destroy();
        this.combat.explosion(point, grenade.radius, grenade.damage, grenade.ownerTeam);
      }
    }
  }

  private drawGrenadeAim(pointerWorld: Phaser.Math.Vector2): void {
    this.grenadeAimGraphics.clear();
    if (!this.inputSystem.secondaryHeld() || this.player.grenades <= 0) {
      return;
    }

    const preview = this.weapons.grenadePreview(this.player, pointerWorld);
    const target = preview.target;
    const radius = 22 + Math.sin(this.time.now / 90) * 2;
    this.grenadeAimGraphics.lineStyle(1, 0xf97316, 0.42);
    this.grenadeAimGraphics.lineBetween(this.player.x, this.player.y, target.x, target.y);
    this.grenadeAimGraphics.lineStyle(2, 0xf97316, 0.8);
    this.grenadeAimGraphics.strokeCircle(target.x, target.y, radius);
    this.grenadeAimGraphics.lineStyle(1, 0xfed7aa, 0.56);
    this.grenadeAimGraphics.strokeCircle(target.x, target.y, 170);
    this.grenadeAimGraphics.fillStyle(0xf97316, 0.8);
    this.grenadeAimGraphics.fillTriangle(
      target.x,
      target.y - 8,
      target.x - 7,
      target.y + 5,
      target.x + 7,
      target.y + 5
    );
  }

  private drawGrenadeFuse(grenade: Grenade): void {
    const ratio = Phaser.Math.Clamp(grenade.fuseRemaining / WORLD_BALANCE.grenadeFuse, 0, 1);
    this.drawGrenadeWarning(grenade, ratio);
    const arcEnd = -Math.PI / 2 + Math.PI * 2 * ratio;
    this.grenadeAimGraphics.lineStyle(3, ratio < 0.32 ? 0xef4444 : 0xf59e0b, 0.9);
    this.grenadeAimGraphics.beginPath();
    this.grenadeAimGraphics.arc(grenade.x, grenade.y - 18, 8, -Math.PI / 2, arcEnd);
    this.grenadeAimGraphics.strokePath();
  }

  private drawGrenadeWarning(grenade: Grenade, fuseRatio: number): void {
    const threatenedActors = this.grenadeThreatenedActors(grenade);
    if (fuseRatio > 0.82 && threatenedActors.length === 0) {
      return;
    }

    const urgency = 1 - fuseRatio;
    const playerThreatened = threatenedActors.some((actor) => actor.team === 'player');
    const color = playerThreatened ? 0xef4444 : 0xf97316;
    const alpha = Phaser.Math.Clamp(0.16 + urgency * 0.58 + threatenedActors.length * 0.05, 0.18, 0.74);
    const pulse = Math.sin(this.time.now / 70) * 4;

    this.grenadeAimGraphics.lineStyle(2, color, alpha);
    this.grenadeAimGraphics.strokeCircle(grenade.x, grenade.y, grenade.radius + pulse);
    this.grenadeAimGraphics.lineStyle(1, 0xfed7aa, alpha * 0.7);
    this.grenadeAimGraphics.strokeCircle(grenade.x, grenade.y, Math.max(18, grenade.radius * 0.55 + pulse * 0.5));

    for (const actor of threatenedActors) {
      const markerY = actor.y - actor.collisionRadius - 18;
      this.grenadeAimGraphics.fillStyle(actor.team === 'player' ? 0xef4444 : 0xf97316, 0.9);
      this.grenadeAimGraphics.fillTriangle(actor.x, markerY - 9, actor.x - 8, markerY + 7, actor.x + 8, markerY + 7);
      this.grenadeAimGraphics.lineStyle(2, 0xfef2f2, 0.82);
      this.grenadeAimGraphics.strokeTriangle(actor.x, markerY - 9, actor.x - 8, markerY + 7, actor.x + 8, markerY + 7);
    }
  }

  private updateVisibility(timeSeconds: number): void {
    this.visibilityGraphics.clear();
    const detected = this.alert.state === 'detected';
    if (detected) {
      this.visibilityGraphics.fillStyle(0xef4444, 0.055);
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

  private updateLighting(deltaSeconds: number, timeSeconds: number): void {
    const lights: SteadyLight[] = [];
    const alertState = this.alert.state;

    // Player ambient light — color shifts with alert state
    const playerColor = alertState === 'detected' ? 0xef4444 : alertState === 'searching' ? 0xf59e0b : 0x10b981;
    lights.push({ x: this.player.x, y: this.player.y, radius: 92, color: playerColor, intensity: 0.18 });

    // Terminal lights
    for (const terminal of this.terminalEntities) {
      if (terminal.hacked) {
        lights.push({ x: terminal.x, y: terminal.y, radius: 38, color: 0x10b981, intensity: 0.18 });
      } else {
        lights.push({ x: terminal.x, y: terminal.y, radius: 46, color: 0x38bdf8, intensity: 0.22, pulseHz: 1.2 });
      }
    }

    // Door lights — red for locked, green for unlocked
    for (const door of this.doorEntities) {
      if (!door.open) {
        const cx = door.rect.x + door.rect.w / 2;
        const cy = door.rect.y + door.rect.h / 2;
        if (door.locked) {
          lights.push({ x: cx, y: cy, radius: 34, color: 0xef4444, intensity: 0.16, pulseHz: 0.8 });
        } else {
          lights.push({ x: cx, y: cy, radius: 30, color: 0x10b981, intensity: 0.14 });
        }
      }
    }

    // Extraction zone — bright green pulse when mission ready
    if (this.mission.canExtract()) {
      const ez = this.level.extraction;
      lights.push({
        x: ez.x + ez.w / 2,
        y: ez.y + ez.h / 2,
        radius: 72,
        color: 0x4ade80,
        intensity: 0.24,
        pulseHz: 1.6
      });
    }

    this.lighting.update(lights, deltaSeconds, timeSeconds);
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
    const captain = this.enemyEntities.find((enemy) => enemy.role === 'captain' && !enemy.dead);
    this.updateLowArmorWarning();
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
      enemySuspicion: Math.max(0, ...this.enemyEntities.filter((enemy) => !enemy.dead).map((enemy) => enemy.suspicion)),
      lastSeenSeconds: this.alert.lastSeenSeconds,
      enemyAwareness: this.enemyAwarenessCounts(),
      objectives: this.mission.objectives(),
      interactionKind: this.interactionStatus.kind,
      interactionPrompt: this.interactionStatus.prompt,
      interactionProgress: this.interactionStatus.progress,
      tacticalLog: this.tacticalLog,
      debugEnabled: this.debug.enabled,
      enemiesAlive: this.enemyEntities.filter((enemy) => !enemy.dead).length,
      captainHealthRatio: captain ? captain.health / captain.maxHealth : undefined,
      captainCommandActive: this.enemyEntities.some((enemy) => !enemy.dead && enemy.commandPulseTimer > 0)
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

  private updateLowArmorWarning(): void {
    const armorRatio = this.player.armor / Math.max(1, this.player.maxArmor);
    if (!this.lowArmorLogged && armorRatio <= 0.25) {
      this.lowArmorLogged = true;
      this.log('LOW ARMOR', 'combat', 'critical');
    } else if (this.lowArmorLogged && armorRatio >= 0.45) {
      this.lowArmorLogged = false;
    }
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
        this.debug.enabled,
        this.minimapZoomMode
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
    const report = this.createSectorReport();
    this.time.delayedCall(650, () => {
      this.scene.stop('UIScene');
      this.scene.start('VictoryScene', { levelIndex: this.levelIndex, report });
    });
  }

  private trackAlertState(): void {
    if (this.highestAlertState === 'detected') {
      return;
    }
    if (this.alert.state === 'detected' || (this.alert.state === 'searching' && this.highestAlertState === 'hidden')) {
      this.highestAlertState = this.alert.state;
    }
  }

  private createSectorReport(deathSource?: { label: string }): SectorReport {
    const objectives = this.mission.objectives();
    const completionTimeSeconds = Math.max(0, (this.time.now - this.sectorStartTime) / 1000);
    const accuracy = this.shotsFired > 0 ? this.shotsHit / this.shotsFired : 1;
    const stealthRating = this.stealthRating();
    const deathCause = deathSource?.label;
    const base = {
      levelIndex: this.levelIndex,
      levelName: this.level.name,
      completionTimeSeconds,
      enemiesKilled: this.enemiesKilled,
      enemiesTotal: this.enemiesTotal,
      shotsFired: this.shotsFired,
      shotsHit: this.shotsHit,
      accuracy,
      damageTaken: this.damageTaken,
      objectivesCompleted: objectives.filter((objective) => objective.completed).length,
      objectivesTotal: objectives.length,
      stealthRating,
      grade: this.gradeSector(completionTimeSeconds, accuracy, stealthRating),
      killBreakdown: { ...this.killBreakdown },
      deathCause,
      tacticalAdvice: deathCause ? this.tacticalAdvice(deathCause) : undefined
    };
    const scoreBreakdown = deathCause
      ? {
          combatScore: this.score.totalScore,
          stealthBonus: 0,
          accuracyBonus: 0,
          timeBonus: 0,
          untouchableBonus: 0,
          total: this.score.totalScore
        }
      : this.score.finalizeReport(base);
    return { ...base, score: scoreBreakdown.total, scoreBreakdown };
  }

  private stealthRating(): StealthRating {
    if (this.highestAlertState === 'detected') {
      return 'Full Breach';
    }
    if (this.highestAlertState === 'searching') {
      return 'Compromised';
    }
    return 'Silent';
  }

  private gradeSector(timeSeconds: number, accuracy: number, stealthRating: StealthRating): SectorGrade {
    let score = 100;
    score -= Math.min(30, timeSeconds / 18);
    score -= Math.min(30, this.damageTaken / 8);
    score += Math.min(12, accuracy * 12);
    if (stealthRating === 'Compromised') {
      score -= 12;
    } else if (stealthRating === 'Full Breach') {
      score -= 24;
    }
    if (score >= 88) return 'S';
    if (score >= 74) return 'A';
    if (score >= 58) return 'B';
    return 'C';
  }

  private tacticalAdvice(cause: string): string {
    const normalized = cause.toLowerCase();
    if (normalized.includes('explosion')) {
      return 'Keep blast doors, barrels, and grenade arcs out of your retreat path.';
    }
    if (normalized.includes('sniper')) {
      return 'Break long sightlines before reloading or hacking exposed terminals.';
    }
    if (normalized.includes('heavy')) {
      return 'Use cover and explosives before trading with armored targets.';
    }
    if (normalized.includes('flanker')) {
      return 'Watch side corridors after loud shots; flankers punish tunnel vision.';
    }
    return 'Slow-walk into contact, clear angles, and avoid fighting from the open.';
  }

  private cleanupScene(): void {
    this.scene.stop('UIScene');
    this.grenadeAimGraphics?.destroy();
    this.debug?.destroy();
    this.lighting?.destroy();
    this.collisions?.destroy();
    this.inputSystem?.destroy();
    this.audio?.destroy();
  }
}
