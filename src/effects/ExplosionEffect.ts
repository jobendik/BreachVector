import Phaser from 'phaser';
import { DEPTHS, TextureKeys } from '../game/constants';
import { loadSettings } from '../game/settings';

export class ExplosionEffect {
  static spawn(scene: Phaser.Scene, x: number, y: number, color: number, scale = 1): void {
    const settings = loadSettings();
    const qualityScale = settings.graphicsQuality === 'Low' ? 0.45 : settings.graphicsQuality === 'Medium' ? 0.72 : 1;
    const flashScale = settings.reduceMotion ? 0 : settings.flashIntensity;
    const ring = scene.add.circle(x, y, 20 * scale, color, 0.22);
    ring.setDepth(DEPTHS.effects);
    ring.setStrokeStyle(3, color, 0.75);
    scene.tweens.add({
      targets: ring,
      radius: 120 * scale,
      alpha: 0,
      duration: 360,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy()
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

    const particles = scene.add.particles(x, y, TextureKeys.Particle, {
      speed: { min: 60 * scale, max: 260 * scale },
      lifespan: { min: 240, max: 720 },
      quantity: Math.max(4, Math.round(26 * scale * qualityScale)),
      scale: { start: 1.8 * scale, end: 0 },
      rotate: { min: 0, max: 360 },
      tint: [color, 0x64748b, 0xf97316],
      blendMode: Phaser.BlendModes.ADD
    });
    particles.setDepth(DEPTHS.effects);
    scene.time.delayedCall(760, () => particles.destroy());
  }
}
