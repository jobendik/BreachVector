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
