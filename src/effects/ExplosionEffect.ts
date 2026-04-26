import Phaser from 'phaser';
import { DEPTHS, TextureKeys } from '../game/constants';
import { loadSettings } from '../game/settings';

export class ExplosionEffect {
  static spawn(scene: Phaser.Scene, x: number, y: number, color: number, scale = 1): void {
    const settings = loadSettings();
    const qualityScale = settings.graphicsQuality === 'Low' ? 0.45 : settings.graphicsQuality === 'Medium' ? 0.72 : 1;
    const flashScale = settings.reduceMotion ? 0 : settings.flashIntensity;
    const hotCore = scene.add.circle(x, y, 18 * scale, 0xffffff, 0.72 * flashScale);
    hotCore.setDepth(DEPTHS.effects + 2);
    scene.tweens.add({
      targets: hotCore,
      radius: 46 * scale,
      alpha: 0,
      duration: settings.reduceMotion ? 70 : 120,
      ease: 'Quad.easeOut',
      onComplete: () => hotCore.destroy()
    });

    const innerRing = scene.add.circle(x, y, 18 * scale, color, 0.18);
    innerRing.setDepth(DEPTHS.effects + 1);
    innerRing.setStrokeStyle(4, color, 0.82);
    scene.tweens.add({
      targets: innerRing,
      radius: 82 * scale,
      alpha: 0,
      duration: settings.reduceMotion ? 150 : 260,
      ease: 'Cubic.easeOut',
      onComplete: () => innerRing.destroy()
    });

    const shockwave = scene.add.circle(x, y, 26 * scale, color, 0.08);
    shockwave.setDepth(DEPTHS.effects);
    shockwave.setStrokeStyle(2, 0xffffff, 0.42 * flashScale);
    scene.tweens.add({
      targets: shockwave,
      radius: 140 * scale,
      alpha: 0,
      duration: settings.reduceMotion ? 220 : 420,
      ease: 'Cubic.easeOut',
      onComplete: () => shockwave.destroy()
    });

    if (flashScale > 0) {
      const flash = scene.add.circle(x, y, 22 * scale, 0xffffff, 0.85 * flashScale);
      flash.setDepth(DEPTHS.effects + 1);
      scene.tweens.add({
        targets: flash,
        radius: 72 * scale,
        alpha: 0,
        duration: settings.reduceMotion ? 80 : 130,
        onComplete: () => flash.destroy()
      });
    }

    const sparks = scene.add.particles(x, y, TextureKeys.Spark, {
      speed: { min: 160 * scale, max: 420 * scale },
      lifespan: { min: 120, max: 420 },
      quantity: Math.max(4, Math.round(18 * scale * qualityScale)),
      scale: { start: 0.9 * scale, end: 0 },
      rotate: { min: 0, max: 360 },
      tint: [0xffffff, color, 0xfbbf24],
      blendMode: Phaser.BlendModes.ADD
    });
    sparks.setDepth(DEPTHS.effects + 1);
    scene.time.delayedCall(460, () => sparks.destroy());

    const debris = scene.add.particles(x, y, TextureKeys.Particle, {
      speed: { min: 60 * scale, max: 260 * scale },
      lifespan: { min: 240, max: 720 },
      quantity: Math.max(4, Math.round(26 * scale * qualityScale)),
      scale: { start: 1.8 * scale, end: 0 },
      rotate: { min: 0, max: 360 },
      tint: [color, 0x64748b, 0xf97316],
      blendMode: Phaser.BlendModes.ADD
    });
    debris.setDepth(DEPTHS.effects);
    scene.time.delayedCall(760, () => debris.destroy());

    if (settings.graphicsQuality !== 'Low') {
      const smoke = scene.add.particles(x, y, TextureKeys.Particle, {
        speed: { min: 18 * scale, max: 92 * scale },
        lifespan: { min: 520, max: 980 },
        quantity: Math.max(3, Math.round(14 * scale * qualityScale)),
        scale: { start: 2.4 * scale, end: 4.8 * scale },
        alpha: { start: 0.18, end: 0 },
        rotate: { min: 0, max: 360 },
        tint: [0x334155, 0x475569, 0x64748b]
      });
      smoke.setDepth(DEPTHS.effects - 1);
      scene.time.delayedCall(1040, () => smoke.destroy());
    }
  }
}
