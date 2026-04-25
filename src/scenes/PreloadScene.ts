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
    this.playerTexture();
    this.assaultTexture();
    this.sniperTexture();
    this.flankerTexture();
    this.heavyTexture();
    this.captainTexture();

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

  private withGraphics(
    key: string,
    width: number,
    height: number,
    draw: (g: Phaser.GameObjects.Graphics) => void
  ): void {
    if (this.textures.exists(key)) {
      return;
    }
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    draw(g);
    g.generateTexture(key, width, height);
    g.destroy();
  }

  private playerTexture(): void {
    this.withGraphics(TextureKeys.Player, 64, 64, (g) => {
      this.clearTexture(g, 64, 64);
      g.lineStyle(2, COLORS.systemCyan, 0.38);
      g.strokeCircle(32, 32, 25);
      g.lineStyle(3, COLORS.operatorGreenSoft, 0.9);
      g.fillStyle(COLORS.operatorGreen, 0.88);
      g.fillCircle(31, 32, 15);
      g.strokeCircle(31, 32, 15);
      g.fillStyle(COLORS.blacksitePanel, 0.98);
      g.fillCircle(31, 32, 7);
      g.fillStyle(COLORS.operatorGreenBright, 0.92);
      g.fillTriangle(39, 22, 57, 32, 39, 42);
      g.fillStyle(COLORS.systemCyanSoft, 0.9);
      g.fillRect(40, 29, 18, 6);
      g.fillStyle(COLORS.textPrimary, 0.82);
      g.fillRect(21, 18, 7, 7);
      g.fillRect(21, 39, 7, 7);
      g.fillRect(12, 29, 8, 6);
      g.lineStyle(2, COLORS.white, 0.72);
      g.beginPath();
      g.arc(32, 32, 22, -0.58, 0.58);
      g.strokePath();
    });
  }

  private assaultTexture(): void {
    this.withGraphics(TextureKeys.EnemyAssault, 64, 64, (g) => {
      this.clearTexture(g, 64, 64);
      g.lineStyle(3, COLORS.alertRedSoft, 0.9);
      g.fillStyle(COLORS.alertRed, 0.9);
      g.fillTriangle(17, 17, 55, 32, 17, 47);
      g.strokeTriangle(17, 17, 55, 32, 17, 47);
      g.fillStyle(COLORS.blacksitePanel, 0.92);
      g.fillTriangle(25, 24, 43, 32, 25, 40);
      g.lineStyle(2, COLORS.alertRedSoft, 0.6);
      g.lineBetween(20, 20, 31, 32);
      g.lineBetween(20, 44, 31, 32);
    });
  }

  private sniperTexture(): void {
    this.withGraphics(TextureKeys.EnemySniper, 64, 64, (g) => {
      this.clearTexture(g, 64, 64);
      g.lineStyle(2, COLORS.hazardOrangeSoft, 0.9);
      g.fillStyle(COLORS.hazardOrange, 0.86);
      g.fillRoundedRect(18, 23, 24, 18, 4);
      g.strokeRoundedRect(18, 23, 24, 18, 4);
      g.fillStyle(COLORS.blacksitePanel, 0.92);
      g.fillRect(24, 27, 11, 10);
      g.lineStyle(5, COLORS.hazardOrangeSoft, 0.95);
      g.lineBetween(39, 32, 59, 32);
      g.lineStyle(1, COLORS.alertRed, 0.45);
      g.lineBetween(44, 30, 62, 30);
      g.lineBetween(44, 34, 62, 34);
    });
  }

  private flankerTexture(): void {
    this.withGraphics(TextureKeys.EnemyFlanker, 64, 64, (g) => {
      this.clearTexture(g, 64, 64);
      g.lineStyle(2, COLORS.hazardOrange, 0.42);
      g.lineBetween(8, 22, 24, 22);
      g.lineBetween(8, 42, 24, 42);
      g.fillStyle(COLORS.energyViolet, 0.9);
      g.beginPath();
      g.moveTo(15, 32);
      g.lineTo(30, 16);
      g.lineTo(54, 32);
      g.lineTo(30, 48);
      g.closePath();
      g.fillPath();
      g.lineStyle(3, COLORS.energyVioletSoft, 0.9);
      g.strokePath();
      g.fillStyle(COLORS.hazardOrange, 0.95);
      g.fillTriangle(38, 24, 56, 32, 38, 40);
      g.fillStyle(COLORS.blacksitePanel, 0.9);
      g.fillCircle(30, 32, 6);
    });
  }

  private heavyTexture(): void {
    this.withGraphics(TextureKeys.EnemyHeavy, 64, 64, (g) => {
      this.clearTexture(g, 64, 64);
      g.fillStyle(COLORS.hazardAmber, 0.9);
      g.fillRoundedRect(14, 14, 36, 36, 7);
      g.lineStyle(3, COLORS.hazardAmberSoft, 0.9);
      g.strokeRoundedRect(14, 14, 36, 36, 7);
      g.fillStyle(COLORS.blacksitePanel, 0.96);
      g.fillRoundedRect(22, 22, 20, 20, 4);
      g.fillStyle(COLORS.hazardAmberBright, 0.92);
      g.fillRect(42, 25, 11, 14);
      g.lineStyle(3, COLORS.systemCyanSoft, 0.72);
      g.beginPath();
      g.arc(36, 32, 23, -0.76, 0.76);
      g.strokePath();
    });
  }

  private captainTexture(): void {
    this.withGraphics(TextureKeys.EnemyCaptain, 72, 72, (g) => {
      this.clearTexture(g, 72, 72);
      g.lineStyle(3, COLORS.alertRed, 0.72);
      g.strokeCircle(36, 36, 28);
      g.lineStyle(2, COLORS.energyVioletSoft, 0.52);
      g.strokeCircle(36, 36, 22);
      g.fillStyle(COLORS.alertRed, 0.9);
      g.fillCircle(36, 36, 16);
      g.lineStyle(3, COLORS.alertRedSoft, 0.92);
      g.strokeCircle(36, 36, 16);
      g.fillStyle(COLORS.blacksitePanel, 0.95);
      g.fillCircle(36, 36, 7);
      g.fillStyle(COLORS.alertRedSoft, 0.95);
      g.fillTriangle(39, 24, 62, 36, 39, 48);
      g.fillStyle(COLORS.white, 0.92);
      g.fillRect(32, 18, 8, 10);
      g.fillTriangle(27, 19, 32, 10, 37, 19);
      g.fillTriangle(35, 18, 42, 8, 47, 19);
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
      g.fillStyle(COLORS.wallCore, 1);
      g.fillRoundedRect(6, 4, 52, 56, 4);
      g.lineStyle(3, COLORS.systemCyan, 0.9);
      g.strokeRoundedRect(6, 4, 52, 56, 4);
      g.lineStyle(1, COLORS.steelLight, 0.42);
      g.lineBetween(32, 7, 32, 57);
      for (let y = 14; y <= 49; y += 12) {
        g.lineBetween(11, y, 27, y);
        g.lineBetween(37, y, 53, y);
      }
      g.fillStyle(COLORS.hazardAmber, 0.85);
      for (let i = 0; i < 4; i += 1) {
        g.fillTriangle(10 + i * 12, 52, 16 + i * 12, 52, 10 + i * 12, 58);
      }
      g.fillStyle(COLORS.alertRed, 0.88);
      g.fillRect(27, 26, 10, 12);
    });
  }

  private terminalTexture(): void {
    this.withGraphics(TextureKeys.Terminal, 54, 54, (g) => {
      g.fillStyle(COLORS.blacksitePanel, 1);
      g.fillRoundedRect(7, 6, 40, 42, 6);
      g.lineStyle(3, COLORS.systemCyan, 0.9);
      g.strokeRoundedRect(7, 6, 40, 42, 6);
      g.fillStyle(COLORS.operatorGreenBright, 0.88);
      g.fillRect(14, 13, 26, 13);
      g.fillStyle(COLORS.blacksitePanel, 0.75);
      g.fillRect(17, 16, 20, 2);
      g.fillRect(17, 21, 14, 2);
      g.fillStyle(COLORS.systemCyan, 0.85);
      g.fillRect(14, 31, 26, 2);
      g.fillRect(14, 36, 18, 2);
      g.fillCircle(42, 36, 3);
    });
  }

  private crateTexture(): void {
    this.withGraphics(TextureKeys.Crate, 80, 80, (g) => {
      g.fillStyle(COLORS.steelDark, 1);
      g.fillRoundedRect(6, 10, 68, 58, 4);
      g.lineStyle(3, COLORS.steelLight, 0.8);
      g.strokeRoundedRect(6, 10, 68, 58, 4);
      g.lineStyle(2, COLORS.systemCyan, 0.35);
      g.lineBetween(16, 20, 64, 58);
      g.lineBetween(64, 20, 16, 58);
      g.lineStyle(2, COLORS.steelLight, 0.62);
      g.lineBetween(12, 18, 24, 18);
      g.lineBetween(12, 18, 12, 30);
      g.lineBetween(68, 18, 56, 18);
      g.lineBetween(68, 18, 68, 30);
      g.lineBetween(12, 62, 24, 62);
      g.lineBetween(12, 62, 12, 50);
      g.lineBetween(68, 62, 56, 62);
      g.lineBetween(68, 62, 68, 50);
      g.lineStyle(1, COLORS.blacksiteNavy, 0.8);
      g.lineBetween(31, 24, 27, 35);
      g.lineBetween(27, 35, 37, 43);
      g.lineBetween(50, 22, 47, 33);
    });
  }

  private barrelTexture(): void {
    this.withGraphics(TextureKeys.Barrel, 44, 44, (g) => {
      g.fillStyle(COLORS.hazardOrange, 0.18);
      g.fillCircle(22, 22, 21);
      g.fillStyle(0x7c2d12, 1);
      g.fillCircle(22, 22, 17);
      g.lineStyle(3, COLORS.hazardOrange, 0.9);
      g.strokeCircle(22, 22, 17);
      g.lineStyle(2, COLORS.hazardAmber, 0.8);
      g.lineBetween(13, 22, 31, 22);
      g.lineBetween(22, 13, 22, 31);
      g.lineStyle(1, COLORS.hazardAmberBright, 0.75);
      g.strokeTriangle(22, 12, 12, 31, 32, 31);
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

  private clearTexture(g: Phaser.GameObjects.Graphics, width: number, height: number): void {
    g.fillStyle(COLORS.blacksiteNavy, 0);
    g.fillRect(0, 0, width, height);
  }
}
