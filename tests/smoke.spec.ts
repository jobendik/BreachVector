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

  const before = await projectileCount(page);
  await page.mouse.move(720, 360);
  await page.mouse.down();
  await page.waitForTimeout(120);
  await page.mouse.up();
  await expect.poll(() => projectileCount(page)).toBeGreaterThan(before);
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

async function projectileCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const gameScene = window.__BREACH_VECTOR_GAME__?.scene.getScene('GameScene') as
      | { projectileEntities?: unknown[] }
      | undefined;
    return gameScene?.projectileEntities?.length ?? 0;
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
