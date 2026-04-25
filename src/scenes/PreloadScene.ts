import Phaser from 'phaser';
import { COLORS, TextureKeys } from '../game/constants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  create(): void {
    this.generateTextures();
    this.scene.start('MenuScene');
  }

  private generateTextures(): void {
    this.actorTexture(TextureKeys.Player, COLORS.greenBright, COLORS.cyan, true);
    this.actorTexture(TextureKeys.EnemyAssault, COLORS.red, 0xfca5a5);
    this.actorTexture(TextureKeys.EnemySniper, COLORS.orange, 0xfed7aa);
    this.actorTexture(TextureKeys.EnemyFlanker, COLORS.violet, 0xddd6fe);
    this.actorTexture(TextureKeys.EnemyHeavy, COLORS.amber, 0xfef3c7, false, 19);
    this.actorTexture(TextureKeys.EnemyCaptain, COLORS.green, 0xbbf7d0, false, 17, true);

    this.simpleCircle(TextureKeys.Bullet, 12, COLORS.cyan);
    this.simpleCircle(TextureKeys.Pellet, 10, COLORS.amber);
    this.simpleCircle(TextureKeys.Rail, 18, COLORS.violet);
    this.simpleCircle(TextureKeys.Grenade, 18, COLORS.orange);
    this.simpleCircle(TextureKeys.Particle, 8, 0xffffff);
    this.simpleCircle(TextureKeys.Spark, 6, COLORS.amber);

    this.doorTexture();
    this.terminalTexture();
    this.crateTexture();
    this.barrelTexture();
    this.pickupTexture(TextureKeys.Medkit, COLORS.greenBright, '+');
    this.pickupTexture(TextureKeys.Ammo, COLORS.cyan, 'A');
    this.pickupTexture(TextureKeys.GrenadePickup, COLORS.orange, 'G');
    this.simpleCircle(TextureKeys.Muzzle, 30, 0xffffff);
  }

  private withGraphics(key: string, width: number, height: number, draw: (g: Phaser.GameObjects.Graphics) => void): void {
    if (this.textures.exists(key)) {
      return;
    }
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    draw(g);
    g.generateTexture(key, width, height);
    g.destroy();
  }

  private actorTexture(
    key: string,
    fill: number,
    outline: number,
    player = false,
    radius = 15,
    captain = false
  ): void {
    this.withGraphics(key, 64, 64, (g) => {
      g.fillStyle(0x020617, 0);
      g.fillRect(0, 0, 64, 64);
      g.lineStyle(captain ? 4 : 3, outline, 0.95);
      g.fillStyle(fill, 0.92);
      g.fillCircle(32, 32, radius);
      g.strokeCircle(32, 32, radius);
      g.fillStyle(outline, 0.95);
      g.fillTriangle(36, 22, 56, 32, 36, 42);
      if (player) {
        g.lineStyle(2, 0xffffff, 0.85);
        g.beginPath();
        g.arc(32, 32, radius + 6, -0.55, 0.55);
        g.strokePath();
      }
      if (captain) {
        g.fillStyle(0xffffff, 0.95);
        g.fillRect(28, 21, 8, 22);
        g.fillRect(21, 28, 22, 8);
      }
    });
  }

  private simpleCircle(key: string, size: number, color: number): void {
    this.withGraphics(key, size, size, (g) => {
      g.fillStyle(color, 1);
      g.fillCircle(size / 2, size / 2, size / 2);
    });
  }

  private doorTexture(): void {
    this.withGraphics(TextureKeys.Door, 64, 64, (g) => {
      g.fillStyle(0x172033, 1);
      g.fillRoundedRect(6, 4, 52, 56, 4);
      g.lineStyle(3, COLORS.cyan, 0.9);
      g.strokeRoundedRect(6, 4, 52, 56, 4);
      g.lineStyle(2, COLORS.amber, 0.75);
      g.lineBetween(12, 18, 52, 18);
      g.lineBetween(12, 46, 52, 46);
    });
  }

  private terminalTexture(): void {
    this.withGraphics(TextureKeys.Terminal, 54, 54, (g) => {
      g.fillStyle(0x07111f, 1);
      g.fillRoundedRect(7, 6, 40, 42, 6);
      g.lineStyle(3, COLORS.cyan, 0.9);
      g.strokeRoundedRect(7, 6, 40, 42, 6);
      g.fillStyle(COLORS.greenBright, 0.95);
      g.fillRect(15, 14, 24, 12);
      g.fillStyle(COLORS.cyan, 0.85);
      g.fillCircle(20, 36, 4);
      g.fillCircle(34, 36, 4);
    });
  }

  private crateTexture(): void {
    this.withGraphics(TextureKeys.Crate, 80, 80, (g) => {
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(6, 10, 68, 58, 4);
      g.lineStyle(3, 0x94a3b8, 0.8);
      g.strokeRoundedRect(6, 10, 68, 58, 4);
      g.lineStyle(2, 0x38bdf8, 0.35);
      g.lineBetween(16, 20, 64, 58);
      g.lineBetween(64, 20, 16, 58);
    });
  }

  private barrelTexture(): void {
    this.withGraphics(TextureKeys.Barrel, 44, 44, (g) => {
      g.fillStyle(0x7c2d12, 1);
      g.fillCircle(22, 22, 17);
      g.lineStyle(3, COLORS.orange, 0.9);
      g.strokeCircle(22, 22, 17);
      g.lineStyle(2, COLORS.amber, 0.8);
      g.lineBetween(13, 22, 31, 22);
      g.lineBetween(22, 13, 22, 31);
    });
  }

  private pickupTexture(key: string, color: number, glyph: string): void {
    this.withGraphics(key, 42, 42, (g) => {
      g.fillStyle(0x020617, 0.95);
      g.fillCircle(21, 21, 16);
      g.lineStyle(3, color, 0.95);
      g.strokeCircle(21, 21, 16);
      g.fillStyle(color, 0.95);
      if (glyph === '+') {
        g.fillRect(18, 11, 6, 20);
        g.fillRect(11, 18, 20, 6);
      } else if (glyph === 'A') {
        g.fillTriangle(21, 10, 12, 31, 30, 31);
        g.fillStyle(0x020617, 1);
        g.fillRect(17, 22, 8, 4);
      } else {
        g.fillCircle(21, 23, 8);
        g.fillRect(19, 10, 4, 9);
      }
    });
  }
}
