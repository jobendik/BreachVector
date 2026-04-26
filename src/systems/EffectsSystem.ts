import Phaser from 'phaser';
import { ExplosionEffect } from '../effects/ExplosionEffect';
import { FloatingText } from '../effects/FloatingText';
import { HitMarker } from '../effects/HitMarker';
import { MuzzleFlash, type MuzzleFlashOptions } from '../effects/MuzzleFlash';
import { TextureKeys } from '../game/constants';
import { loadSettings } from '../game/settings';
import type { LightingSystem } from './LightingSystem';
import { cssColor } from '../utils/colors';

export interface TracerOptions {
  alpha?: number;
  duration?: number;
  glowWidth?: number;
  glowAlpha?: number;
  afterimage?: boolean;
  sparkColor?: number;
}

export class EffectsSystem {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly lighting?: LightingSystem
  ) {}

  muzzleFlash(x: number, y: number, angle: number, color: number, options: MuzzleFlashOptions = {}): void {
    new MuzzleFlash(this.scene, x, y, angle, color, options);
    this.lighting?.addTransient(x, y, (options.length ?? 48) * 1.5, color, 1.1, (options.duration ?? 95) / 950);
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

  tracer(
    from: Phaser.Math.Vector2,
    to: Phaser.Math.Vector2,
    color: number,
    width: number,
    options: TracerOptions = {}
  ): void {
    const line = this.scene.add.graphics();
    if (options.glowWidth && options.glowWidth > width) {
      line.lineStyle(options.glowWidth, color, options.glowAlpha ?? 0.18);
      line.beginPath();
      line.moveTo(from.x, from.y);
      line.lineTo(to.x, to.y);
      line.strokePath();
    }
    line.lineStyle(width, color, options.alpha ?? 0.82);
    line.beginPath();
    line.moveTo(from.x, from.y);
    line.lineTo(to.x, to.y);
    line.strokePath();
    line.setDepth(34);
    if (options.afterimage) {
      const ghost = this.scene.add.graphics();
      ghost.lineStyle(Math.max(1, width * 0.55), 0xffffff, 0.34);
      ghost.beginPath();
      ghost.moveTo(from.x, from.y);
      ghost.lineTo(to.x, to.y);
      ghost.strokePath();
      ghost.setDepth(35);
      this.scene.tweens.add({
        targets: ghost,
        alpha: 0,
        scaleX: 1.015,
        duration: Math.max(90, (options.duration ?? 110) * 1.35),
        onComplete: () => ghost.destroy()
      });
    }
    if (options.sparkColor) {
      const particles = this.scene.add.particles(to.x, to.y, TextureKeys.Spark, {
        speed: { min: 12, max: 44 },
        lifespan: { min: 60, max: 140 },
        quantity: 2,
        scale: { start: 0.45, end: 0 },
        tint: options.sparkColor,
        blendMode: Phaser.BlendModes.ADD
      });
      this.scene.time.delayedCall(150, () => particles.destroy());
    }
    this.scene.tweens.add({
      targets: line,
      alpha: 0,
      duration: options.duration ?? 110,
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
