import Phaser from 'phaser';
import { ExplosionEffect } from '../effects/ExplosionEffect';
import { FloatingText } from '../effects/FloatingText';
import { HitMarker } from '../effects/HitMarker';
import { MuzzleFlash } from '../effects/MuzzleFlash';
import { TextureKeys } from '../game/constants';
import { loadSettings } from '../game/settings';
import type { LightingSystem } from './LightingSystem';
import { cssColor } from '../utils/colors';

export class EffectsSystem {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly lighting?: LightingSystem
  ) {}

  muzzleFlash(x: number, y: number, angle: number, color: number): void {
    new MuzzleFlash(this.scene, x, y, angle, color);
    this.lighting?.addTransient(x, y, 72, color, 1.1, 0.1);
  }

  explosion(x: number, y: number, color = 0xf97316, scale = 1): void {
    ExplosionEffect.spawn(this.scene, x, y, color, scale);
    this.lighting?.addTransient(x, y, 200 * scale, color, 1.4, 0.5);
  }

  hit(x: number, y: number, color = 0xe5eefb): void {
    new HitMarker(this.scene, x, y, color);
    const particles = this.scene.add.particles(x, y, TextureKeys.Spark, {
      speed: { min: 30, max: 130 },
      lifespan: { min: 100, max: 260 },
      quantity: 6,
      scale: { start: 0.9, end: 0 },
      tint: color,
      blendMode: Phaser.BlendModes.ADD
    });
    this.scene.time.delayedCall(280, () => particles.destroy());
  }

  floatingText(x: number, y: number, value: string, color: number): void {
    new FloatingText(this.scene, x, y, value, cssColor(color));
  }

  tracer(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2, color: number, width: number): void {
    const line = this.scene.add.graphics();
    line.lineStyle(width, color, 0.82);
    line.beginPath();
    line.moveTo(from.x, from.y);
    line.lineTo(to.x, to.y);
    line.strokePath();
    line.setDepth(34);
    this.scene.tweens.add({
      targets: line,
      alpha: 0,
      duration: 110,
      onComplete: () => line.destroy()
    });
  }

  shake(intensity: number): void {
    const settings = loadSettings();
    if (settings.reduceMotion || settings.screenShake <= 0) {
      return;
    }
    this.scene.cameras.main.shake(95, Phaser.Math.Clamp((intensity / 100) * settings.screenShake, 0.002, 0.016));
  }
}
