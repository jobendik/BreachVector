import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __BREACH_VECTOR_GAME__?: {
      scene: {
        isActive(sceneKey: string): boolean;
        getScene(sceneKey: string): unknown;
      };
    };
    __BREACH_VECTOR_DIAGNOSTICS__?: {
      eventListenerCount(event: string): number;
    };
  }
}

async function collectRuntimeErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  return errors;
}

async function waitForScene(page: Page, sceneKey: string): Promise<void> {
  await page.waitForFunction((key) => window.__BREACH_VECTOR_GAME__?.scene.isActive(key), sceneKey);
}

test('menu boots without runtime errors', async ({ page }) => {
  const errors = await collectRuntimeErrors(page);
  await page.goto('/?renderer=canvas');
  await waitForScene(page, 'MenuScene');
  await expect(page.locator('canvas')).toBeVisible();
  expect(errors).toEqual([]);
});

test('start operation activates game and UI scenes', async ({ page }) => {
  const errors = await collectRuntimeErrors(page);
  await page.goto('/?renderer=canvas');
  await waitForScene(page, 'MenuScene');
  await page.mouse.click(640, 526);
  await waitForScene(page, 'GameScene');
  await waitForScene(page, 'UIScene');
  expect(errors).toEqual([]);
});

test('player can fire a projectile without runtime errors', async ({ page }) => {
  const errors = await collectRuntimeErrors(page);
  await page.goto('/?renderer=canvas');
  await waitForScene(page, 'MenuScene');
  await page.keyboard.press('Enter');
  await waitForScene(page, 'GameScene');

  const before = await selectedAmmo(page);
  await page.mouse.move(720, 360);
  await page.mouse.down();
  await page.waitForTimeout(120);
  await page.mouse.up();
  await expect.poll(() => selectedAmmo(page)).toBeLessThan(before);
  expect(errors).toEqual([]);
});

test('grenade preview clamps range and launches at predicted speed', async ({ page }) => {
  const errors = await collectRuntimeErrors(page);
  await page.goto('/?renderer=canvas');
  await waitForScene(page, 'MenuScene');
  await page.keyboard.press('Enter');
  await waitForScene(page, 'GameScene');

  const result = await page.evaluate(() => {
    type VectorLike = { x: number; y: number };
    type VectorConstructor = new (x: number, y: number) => VectorLike;
    type PlayerLike = {
      x: number;
      y: number;
      grenades: number;
      positionVector: VectorLike;
      body: { reset(x: number, y: number): void };
      setPosition(x: number, y: number): void;
    };
    type GrenadeLike = {
      x: number;
      y: number;
      radius: number;
      active: boolean;
      body: { velocity: { x: number; y: number } };
      registerBounce(): boolean;
    };
    type GameSceneLike = {
      player: PlayerLike;
      grenadeEntities: GrenadeLike[];
      grenadeThreatenedActors(grenade: GrenadeLike): Array<{ team: string }>;
      weapons: {
        grenadePreview(player: PlayerLike, target: VectorLike): { target: VectorLike; speed: number };
        throwGrenade(player: PlayerLike, target: VectorLike): boolean;
      };
    };

    const scene = window.__BREACH_VECTOR_GAME__?.scene.getScene('GameScene') as GameSceneLike;
    scene.player.setPosition(240, 920);
    scene.player.body.reset(240, 920);
    scene.player.grenades = 3;

    const Vector2 = scene.player.positionVector.constructor as VectorConstructor;
    const pointer = new Vector2(scene.player.x + 1200, scene.player.y);
    const preview = scene.weapons.grenadePreview(scene.player, pointer);
    const previewDistance = Math.hypot(preview.target.x - scene.player.x, preview.target.y - scene.player.y);
    const grenadesBefore = scene.player.grenades;
    const launched = scene.weapons.throwGrenade(scene.player, pointer);
    const grenade = scene.grenadeEntities.find((candidate) => candidate.active);
    if (!grenade) {
      throw new Error('Expected active grenade after throw');
    }
    const threatenedTeams = scene.grenadeThreatenedActors(grenade).map((actor) => actor.team);

    return {
      launched,
      grenadesBefore,
      grenadesAfter: scene.player.grenades,
      previewDistance,
      previewSpeed: preview.speed,
      actualSpeed: Math.hypot(grenade.body.velocity.x, grenade.body.velocity.y),
      bounceAudible: grenade.registerBounce(),
      speedAfterBounce: Math.hypot(grenade.body.velocity.x, grenade.body.velocity.y),
      threatenedTeams
    };
  });

  expect(result.launched).toBe(true);
  expect(result.grenadesAfter).toBe(result.grenadesBefore - 1);
  expect(result.previewDistance).toBeLessThanOrEqual(560);
  expect(result.actualSpeed).toBeCloseTo(result.previewSpeed, 1);
  expect(result.bounceAudible).toBe(true);
  expect(result.speedAfterBounce).toBeLessThan(result.actualSpeed);
  expect(result.threatenedTeams).toContain('player');
  expect(errors).toEqual([]);
});

test('pickup types play distinct feedback sounds', async ({ page }) => {
  const errors = await collectRuntimeErrors(page);
  await page.goto('/?renderer=canvas');
  await waitForScene(page, 'MenuScene');
  await page.keyboard.press('Enter');
  await waitForScene(page, 'GameScene');

  const result = await page.evaluate(() => {
    type PickupLike = {
      x: number;
      y: number;
      pickupType: 'medkit' | 'ammo' | 'grenade';
      active: boolean;
      setPosition(x: number, y: number): void;
    };
    type GameSceneLike = {
      player: {
        x: number;
        y: number;
        health: number;
        grenades: number;
        setPosition(x: number, y: number): void;
      };
      tacticalLog: Array<{ message: string; category: string }>;
      audio: {
        play(id: string): void;
      };
      pickupGroup: {
        getChildren(): unknown[];
      };
      collisions: {
        pickupHit(player: unknown, pickup: PickupLike): void;
      };
    };

    const scene = window.__BREACH_VECTOR_GAME__?.scene.getScene('GameScene') as GameSceneLike;
    const played: string[] = [];
    scene.audio.play = (id: string) => {
      played.push(id);
    };
    scene.player.health = 60;
    scene.player.grenades = 2;

    const pickups = scene.pickupGroup.getChildren() as PickupLike[];
    for (const type of ['medkit', 'ammo', 'grenade'] as const) {
      const pickup = pickups.find((candidate) => candidate.pickupType === type && candidate.active);
      if (!pickup) {
        throw new Error(`Expected active ${type} pickup`);
      }
      scene.player.setPosition(pickup.x, pickup.y);
      scene.collisions.pickupHit(scene.player, pickup);
    }

    return {
      played,
      lastLog: scene.tacticalLog.at(-1)
    };
  });

  expect(result.played).toEqual(['pickupMedkit', 'pickupAmmo', 'pickupGrenade']);
  expect(result.lastLog?.category).toBe('pickup');
  expect(result.lastLog?.message).toContain('Grenade');
  expect(errors).toEqual([]);
});

test('full pickups show prompt and stay available', async ({ page }) => {
  const errors = await collectRuntimeErrors(page);
  await page.goto('/?renderer=canvas');
  await waitForScene(page, 'MenuScene');
  await page.keyboard.press('Enter');
  await waitForScene(page, 'GameScene');

  const result = await page.evaluate(() => {
    type PickupLike = {
      x: number;
      y: number;
      pickupType: 'medkit' | 'ammo' | 'grenade';
      active: boolean;
      setPosition(x: number, y: number): void;
    };
    type GameSceneLike = {
      player: {
        health: number;
        maxHealth: number;
        armor: number;
        maxArmor: number;
        grenades: number;
        setPosition(x: number, y: number): void;
      };
      audio: {
        play(id: string): void;
      };
      effects: {
        floatingText(x: number, y: number, value: string, color: number): void;
      };
      pickupGroup: {
        getChildren(): unknown[];
      };
      collisions: {
        pickupHit(player: unknown, pickup: PickupLike): void;
      };
    };

    const scene = window.__BREACH_VECTOR_GAME__?.scene.getScene('GameScene') as GameSceneLike;
    const played: string[] = [];
    const prompts: string[] = [];
    scene.audio.play = (id: string) => {
      played.push(id);
    };
    scene.effects.floatingText = (_x: number, _y: number, value: string) => {
      prompts.push(value);
    };
    scene.player.health = scene.player.maxHealth;
    scene.player.armor = scene.player.maxArmor;
    scene.player.grenades = 3;

    const pickups = scene.pickupGroup.getChildren() as PickupLike[];
    const medkit = pickups.find((candidate) => candidate.pickupType === 'medkit' && candidate.active);
    const grenade = pickups.find((candidate) => candidate.pickupType === 'grenade' && candidate.active);
    if (!medkit || !grenade) {
      throw new Error('Expected active medkit and grenade pickups');
    }

    scene.player.setPosition(medkit.x, medkit.y);
    scene.collisions.pickupHit(scene.player, medkit);
    scene.player.setPosition(grenade.x, grenade.y);
    scene.collisions.pickupHit(scene.player, grenade);

    return {
      played,
      prompts,
      medkitActive: medkit.active,
      grenadeActive: grenade.active
    };
  });

  expect(result.played).toEqual([]);
  expect(result.prompts).toEqual(['HP / ARMOR FULL', 'GRENADES FULL']);
  expect(result.medkitActive).toBe(true);
  expect(result.grenadeActive).toBe(true);
  expect(errors).toEqual([]);
});

test('overlapping pickups prioritize the most useful pickup', async ({ page }) => {
  const errors = await collectRuntimeErrors(page);
  await page.goto('/?renderer=canvas');
  await waitForScene(page, 'MenuScene');
  await page.keyboard.press('Enter');
  await waitForScene(page, 'GameScene');

  const result = await page.evaluate(() => {
    type PickupLike = {
      x: number;
      y: number;
      pickupType: 'medkit' | 'ammo' | 'grenade';
      active: boolean;
      setPosition(x: number, y: number): void;
    };
    type GameSceneLike = {
      player: {
        health: number;
        maxHealth: number;
        armor: number;
        maxArmor: number;
        setPosition(x: number, y: number): void;
      };
      audio: {
        play(id: string): void;
      };
      pickupGroup: {
        getChildren(): unknown[];
      };
      collisions: {
        pickupHit(player: unknown, pickup: PickupLike): void;
      };
    };

    const scene = window.__BREACH_VECTOR_GAME__?.scene.getScene('GameScene') as GameSceneLike;
    const played: string[] = [];
    scene.audio.play = (id: string) => {
      played.push(id);
    };
    scene.player.health = 30;
    scene.player.armor = 0;

    const pickups = scene.pickupGroup.getChildren() as PickupLike[];
    const medkit = pickups.find((candidate) => candidate.pickupType === 'medkit' && candidate.active);
    const ammo = pickups.find((candidate) => candidate.pickupType === 'ammo' && candidate.active);
    if (!medkit || !ammo) {
      throw new Error('Expected active medkit and ammo pickups');
    }

    medkit.setPosition(360, 360);
    ammo.setPosition(364, 360);
    scene.player.setPosition(362, 360);

    scene.collisions.pickupHit(scene.player, ammo);
    const afterAmmoAttempt = {
      played: [...played],
      medkitActive: medkit.active,
      ammoActive: ammo.active
    };

    scene.collisions.pickupHit(scene.player, medkit);

    return {
      afterAmmoAttempt,
      finalPlayed: played,
      medkitActive: medkit.active,
      ammoActive: ammo.active,
      playerHealth: scene.player.health,
      playerArmor: scene.player.armor
    };
  });

  expect(result.afterAmmoAttempt.played).toEqual([]);
  expect(result.afterAmmoAttempt.medkitActive).toBe(true);
  expect(result.afterAmmoAttempt.ammoActive).toBe(true);
  expect(result.finalPlayed).toEqual(['pickupMedkit']);
  expect(result.medkitActive).toBe(false);
  expect(result.ammoActive).toBe(true);
  expect(result.playerHealth).toBeGreaterThan(30);
  expect(result.playerArmor).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('tactical log collapses repeated categorized entries', async ({ page }) => {
  const errors = await collectRuntimeErrors(page);
  await page.goto('/?renderer=canvas');
  await waitForScene(page, 'MenuScene');
  await page.keyboard.press('Enter');
  await waitForScene(page, 'GameScene');

  const result = await page.evaluate(() => {
    const scene = window.__BREACH_VECTOR_GAME__?.scene.getScene('GameScene') as
      | {
          tacticalLog: Array<{ message: string; category: string; count?: number }>;
          log(message: string, category?: string): void;
        }
      | undefined;
    if (!scene) {
      throw new Error('GameScene unavailable');
    }
    const before = scene.tacticalLog.length;
    scene.log('Repeated contact', 'alert');
    scene.log('Repeated contact', 'alert');
    scene.log('Repeated contact', 'alert');
    const latest = scene.tacticalLog.at(-1);
    return {
      before,
      after: scene.tacticalLog.length,
      latest
    };
  });

  expect(result.after).toBe(result.before + 1);
  expect(result.latest).toEqual({ message: 'Repeated contact', category: 'alert', count: 3 });
  expect(errors).toEqual([]);
});

test('low armor emits a critical tactical log entry once', async ({ page }) => {
  const errors = await collectRuntimeErrors(page);
  await page.goto('/?renderer=canvas');
  await waitForScene(page, 'MenuScene');
  await page.keyboard.press('Enter');
  await waitForScene(page, 'GameScene');

  const result = await page.evaluate(() => {
    const scene = window.__BREACH_VECTOR_GAME__?.scene.getScene('GameScene') as
      | {
          player: { armor: number; maxArmor: number };
          tacticalLog: Array<{ message: string; category: string; emphasis?: string; count?: number }>;
          emitHudState(): void;
        }
      | undefined;
    if (!scene) {
      throw new Error('GameScene unavailable');
    }

    const before = scene.tacticalLog.length;
    scene.player.armor = scene.player.maxArmor * 0.2;
    scene.emitHudState();
    scene.emitHudState();

    return {
      before,
      after: scene.tacticalLog.length,
      latest: scene.tacticalLog.at(-1)
    };
  });

  expect(result.after).toBe(result.before + 1);
  expect(result.latest).toEqual({ message: 'LOW ARMOR', category: 'combat', emphasis: 'critical' });
  expect(errors).toEqual([]);
});

test('enemy awareness counts split unaware suspicious and engaged', async ({ page }) => {
  const errors = await collectRuntimeErrors(page);
  await page.goto('/?renderer=canvas');
  await waitForScene(page, 'MenuScene');
  await page.keyboard.press('Enter');
  await waitForScene(page, 'GameScene');

  const result = await page.evaluate(() => {
    const scene = window.__BREACH_VECTOR_GAME__?.scene.getScene('GameScene') as
      | {
          enemyEntities: Array<{
            dead: boolean;
            suspicion: number;
            setAIState(state: string): void;
          }>;
          enemyAwarenessCounts(): { unaware: number; suspicious: number; engaged: number };
        }
      | undefined;
    if (!scene || scene.enemyEntities.length < 3) {
      throw new Error('Expected GameScene with at least three enemies');
    }

    for (const enemy of scene.enemyEntities) {
      enemy.dead = false;
      enemy.suspicion = 0;
      enemy.setAIState('guard');
    }
    scene.enemyEntities[1].suspicion = 0.35;
    scene.enemyEntities[1].setAIState('suspicious');
    scene.enemyEntities[2].suspicion = 1;
    scene.enemyEntities[2].setAIState('attack');

    return scene.enemyAwarenessCounts();
  });

  expect(result).toEqual({ unaware: 4, suspicious: 1, engaged: 1 });
  expect(errors).toEqual([]);
});

test('alert system tracks last seen time after detected state', async ({ page }) => {
  const errors = await collectRuntimeErrors(page);
  await page.goto('/?renderer=canvas');
  await waitForScene(page, 'MenuScene');
  await page.keyboard.press('Enter');
  await waitForScene(page, 'GameScene');

  const result = await page.evaluate(() => {
    const scene = window.__BREACH_VECTOR_GAME__?.scene.getScene('GameScene') as
      | {
          alert: {
            state: string;
            lastSeenSeconds?: number;
            raiseDetected(seconds?: number): void;
            update(deltaSeconds: number): void;
          };
        }
      | undefined;
    if (!scene) {
      throw new Error('GameScene unavailable');
    }

    scene.alert.raiseDetected(0.2);
    scene.alert.update(0.1);
    const duringDetected = scene.alert.lastSeenSeconds;
    scene.alert.update(0.2);
    const afterDetected = scene.alert.lastSeenSeconds;
    scene.alert.update(1.1);

    return {
      state: scene.alert.state,
      duringDetected,
      afterDetected,
      later: scene.alert.lastSeenSeconds
    };
  });

  expect(result.state).toBe('searching');
  expect(result.duringDetected).toBe(0);
  expect(result.afterDetected).toBeCloseTo(0.2, 3);
  expect(result.later).toBeCloseTo(1.3, 3);
  expect(errors).toEqual([]);
});

test('minimap zoom mode toggles and is included in snapshots', async ({ page }) => {
  const errors = await collectRuntimeErrors(page);
  await page.goto('/?renderer=canvas');
  await waitForScene(page, 'MenuScene');
  await page.keyboard.press('Enter');
  await waitForScene(page, 'GameScene');

  const result = await page.evaluate(() => {
    const scene = window.__BREACH_VECTOR_GAME__?.scene.getScene('GameScene') as
      | {
          minimapZoomMode: 'sector' | 'local';
          toggleMinimapZoomMode(): 'sector' | 'local';
          minimap: {
            snapshot(
              player: unknown,
              enemies: unknown[],
              doors: unknown[],
              terminals: unknown[],
              pickups: unknown[],
              canExtract: boolean,
              alertState: string,
              debugEnabled: boolean,
              zoomMode: 'sector' | 'local'
            ): { zoomMode: 'sector' | 'local' };
          };
          player: unknown;
          enemyEntities: unknown[];
          doorEntities: unknown[];
          terminalEntities: unknown[];
          activePickups(): unknown[];
          mission: { canExtract(): boolean };
          alert: { state: string };
          debug: { enabled: boolean };
        }
      | undefined;
    if (!scene) {
      throw new Error('GameScene unavailable');
    }

    const initial = scene.minimapZoomMode;
    const toggled = scene.toggleMinimapZoomMode();
    const snapshot = scene.minimap.snapshot(
      scene.player,
      scene.enemyEntities,
      scene.doorEntities,
      scene.terminalEntities,
      scene.activePickups(),
      scene.mission.canExtract(),
      scene.alert.state,
      scene.debug.enabled,
      scene.minimapZoomMode
    );

    return {
      initial,
      toggled,
      snapshotMode: snapshot.zoomMode
    };
  });

  expect(result.initial).toBe('sector');
  expect(result.toggled).toBe('local');
  expect(result.snapshotMode).toBe('local');
  expect(errors).toEqual([]);
});

test('projectiles deal damage in both directions', async ({ page }) => {
  const errors = await collectRuntimeErrors(page);
  await page.goto('/?renderer=canvas');
  await waitForScene(page, 'MenuScene');
  await page.keyboard.press('Enter');
  await waitForScene(page, 'GameScene');

  const result = await page.evaluate(async () => {
    type VectorLike = { x: number; y: number };
    type ActorLike = {
      x: number;
      y: number;
      health: number;
      armor: number;
      dead: boolean;
      body: { reset(x: number, y: number): void };
      setPosition(x: number, y: number): void;
      positionVector: VectorLike;
    };
    type EnemyLike = ActorLike & {
      fireCooldown: number;
      shotsUntilReload: number;
      facing: { set(x: number, y: number): void };
      setRotation(rotation: number): void;
      setAIState(state: string): void;
      stopMoving(): void;
    };
    type PlayerLike = ActorLike & { selectedWeaponIndex: number };
    type GameSceneLike = {
      player: PlayerLike;
      enemyEntities: EnemyLike[];
      weapons: {
        tryFirePlayer(player: PlayerLike, target: VectorLike, held: boolean, pressed: boolean): boolean;
        tryFireEnemy(enemy: EnemyLike, target: VectorLike): boolean;
      };
      vision: { hasLineOfSight(a: VectorLike, b: VectorLike): boolean };
    };

    const scene = window.__BREACH_VECTOR_GAME__?.scene.getScene('GameScene') as GameSceneLike;
    const enemy = scene.enemyEntities.find((candidate) => !candidate.dead);
    if (!enemy) {
      throw new Error('Expected a live enemy in smoke test level');
    }

    scene.player.setPosition(170, 920);
    scene.player.body.reset(170, 920);
    scene.player.selectedWeaponIndex = 0;
    enemy.setPosition(235, 920);
    enemy.body.reset(235, 920);
    enemy.setAIState('guard');
    enemy.stopMoving();

    if (!scene.vision.hasLineOfSight(scene.player.positionVector, enemy.positionVector)) {
      throw new Error('Smoke test actors do not have line of sight');
    }

    const enemyBefore = enemy.health + enemy.armor;
    scene.weapons.tryFirePlayer(scene.player, { x: enemy.x, y: enemy.y }, true, true);

    await new Promise((resolve) => setTimeout(resolve, 350));
    const enemyAfter = enemy.health + enemy.armor;

    enemy.fireCooldown = 0;
    enemy.shotsUntilReload = 5;
    enemy.facing.set(-1, 0);
    enemy.setRotation(Math.PI);
    const playerBefore = scene.player.health + scene.player.armor;
    scene.weapons.tryFireEnemy(enemy, { x: scene.player.x, y: scene.player.y });

    await new Promise((resolve) => setTimeout(resolve, 350));
    const playerAfter = scene.player.health + scene.player.armor;

    return { enemyBefore, enemyAfter, playerBefore, playerAfter };
  });

  expect(result.enemyAfter).toBeLessThan(result.enemyBefore);
  expect(result.playerAfter).toBeLessThan(result.playerBefore);
  expect(errors).toEqual([]);
});

test('sector clear persists best progress and menu continues next sector', async ({ page }) => {
  const errors = await collectRuntimeErrors(page);
  await page.goto('/?renderer=canvas');
  await page.evaluate(() => window.localStorage.removeItem('breach-vector-progress'));
  await waitForScene(page, 'MenuScene');

  await page.evaluate(() => {
    const game = window.__BREACH_VECTOR_GAME__;
    game?.scene.getScene('MenuScene');
    const report = {
      levelIndex: 0,
      levelName: 'Infiltrate Facility',
      completionTimeSeconds: 42,
      enemiesKilled: 2,
      enemiesTotal: 6,
      shotsFired: 5,
      shotsHit: 4,
      accuracy: 0.8,
      damageTaken: 10,
      objectivesCompleted: 4,
      objectivesTotal: 4,
      stealthRating: 'Silent',
      grade: 'A',
      killBreakdown: { 'Silenced Pistol': 2 }
    };
    game?.scene.start('VictoryScene', { levelIndex: 0, report });
  });
  await waitForScene(page, 'VictoryScene');

  const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem('breach-vector-progress') ?? '{}'));
  expect(stored.sectors['blacksite-approach'].bestGrade).toBe('A');
  expect(stored.sectors['blacksite-approach'].bestTimeSeconds).toBe(42);
  expect(stored.sectors['blacksite-approach'].bestStealthRating).toBe('Silent');

  await page.evaluate(() => window.__BREACH_VECTOR_GAME__?.scene.start('MenuScene'));
  await waitForScene(page, 'MenuScene');
  const menuLabels = await page.evaluate(() => {
    const menu = window.__BREACH_VECTOR_GAME__?.scene.getScene('MenuScene') as
      | { buttons?: Array<{ label: string }> }
      | undefined;
    return menu?.buttons?.map((button) => button.label) ?? [];
  });
  expect(menuLabels).toContain('CONTINUE OPERATION');

  await page.keyboard.press('Enter');
  await waitForScene(page, 'GameScene');
  const levelIndex = await page.evaluate(() => {
    const scene = window.__BREACH_VECTOR_GAME__?.scene.getScene('GameScene') as { levelIndex?: number } | undefined;
    return scene?.levelIndex;
  });
  expect(levelIndex).toBe(1);
  expect(errors).toEqual([]);
});

test('captain command pulse boosts nearby hostiles', async ({ page }) => {
  const errors = await collectRuntimeErrors(page);
  await page.goto('/?renderer=canvas');
  await waitForScene(page, 'MenuScene');
  await page.keyboard.press('Enter');
  await waitForScene(page, 'GameScene');

  const result = await page.evaluate(() => {
    const scene = window.__BREACH_VECTOR_GAME__?.scene.getScene('GameScene') as
      | {
          alert: { raiseSearch(seconds?: number): void };
          enemyAI: { update(deltaSeconds: number, debugEnabled: boolean): void };
          player: { x: number; y: number; positionVector: { x: number; y: number } };
          enemyEntities: Array<{
            role: string;
            dead: boolean;
            x: number;
            y: number;
            armor: number;
            maxArmor: number;
            commandCooldown: number;
            commandPulseTimer: number;
            commandBoostTimer: number;
            body: { reset(x: number, y: number): void };
            setPosition(x: number, y: number): void;
          }>;
        }
      | undefined;
    if (!scene) {
      throw new Error('GameScene unavailable');
    }
    const captain = scene.enemyEntities.find((enemy) => enemy.role === 'captain' && !enemy.dead);
    const ally = scene.enemyEntities.find((enemy) => enemy.role !== 'captain' && !enemy.dead);
    if (!captain || !ally) {
      throw new Error('Expected captain and ally in smoke test level');
    }

    captain.setPosition(420, 420);
    captain.body.reset(420, 420);
    captain.commandCooldown = 0;
    captain.armor = 0;
    ally.setPosition(460, 420);
    ally.body.reset(460, 420);
    ally.commandBoostTimer = 0;
    ally.armor = 0;

    scene.alert.raiseSearch(3);
    scene.enemyAI.update(0.016, false);

    return {
      captainPulse: captain.commandPulseTimer,
      captainArmor: captain.armor,
      allyBoost: ally.commandBoostTimer,
      allyArmor: ally.armor
    };
  });

  expect(result.captainPulse).toBeGreaterThan(0);
  expect(result.captainArmor).toBeGreaterThan(0);
  expect(result.allyBoost).toBeGreaterThan(0);
  expect(result.allyArmor).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('pause restart keeps one game UI listener set', async ({ page }) => {
  const errors = await collectRuntimeErrors(page);
  await page.goto('/?renderer=canvas');
  await waitForScene(page, 'MenuScene');
  await page.keyboard.press('Enter');
  await waitForScene(page, 'GameScene');
  await waitForScene(page, 'UIScene');
  await expect.poll(() => hudListenerCounts(page)).toEqual([1, 1, 1]);

  await page.evaluate(() => {
    const gameScene = window.__BREACH_VECTOR_GAME__?.scene.getScene('GameScene') as
      | {
          scene: {
            launch(sceneKey: string, data?: unknown): void;
            pause(): void;
          };
        }
      | undefined;
    gameScene?.scene.launch('PauseScene', { levelIndex: 0 });
    gameScene?.scene.pause();
  });
  await waitForScene(page, 'PauseScene');
  await page.evaluate(() => {
    const pauseScene = window.__BREACH_VECTOR_GAME__?.scene.getScene('PauseScene') as
      | {
          scene: {
            start(sceneKey: string, data?: unknown): void;
            stop(sceneKey?: string): void;
          };
        }
      | undefined;
    pauseScene?.scene.stop('UIScene');
    pauseScene?.scene.stop('GameScene');
    pauseScene?.scene.start('GameScene', { levelIndex: 0 });
  });
  await waitForScene(page, 'GameScene');
  await waitForScene(page, 'UIScene');

  await expect.poll(() => hudListenerCounts(page)).toEqual([1, 1, 1]);
  expect(errors).toEqual([]);
});

async function selectedAmmo(page: Page): Promise<number> {
  return page.evaluate(() => {
    const gameScene = window.__BREACH_VECTOR_GAME__?.scene.getScene('GameScene') as
      | {
          player?: {
            selectedWeapon?: {
              ammo?: number;
            };
          };
        }
      | undefined;
    return gameScene?.player?.selectedWeapon?.ammo ?? -1;
  });
}

async function hudListenerCounts(page: Page): Promise<number[]> {
  return page.evaluate(() => {
    const diagnostics = window.__BREACH_VECTOR_DIAGNOSTICS__;
    return [
      diagnostics?.eventListenerCount('hud-state') ?? -1,
      diagnostics?.eventListenerCount('tactical-log') ?? -1,
      diagnostics?.eventListenerCount('minimap-snapshot') ?? -1
    ];
  });
}
