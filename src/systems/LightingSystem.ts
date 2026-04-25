import Phaser from 'phaser';
import { DEPTHS } from '../game/constants';

const RINGS = 8;
const RING_ALPHA_SCALE = 0.16;

export interface SteadyLight {
  x: number;
  y: number;
  radius: number;
  color: number;
  intensity: number;
  pulseHz?: number;
}

interface TransientLight {
  x: number;
  y: number;
  radius: number;
  color: number;
  intensity: number;
  remaining: number;
  duration: number;
}

export class LightingSystem {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly transients: TransientLight[] = [];

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(DEPTHS.floor + 1);
    this.graphics.setBlendMode(Phaser.BlendModes.ADD);
  }

  addTransient(x: number, y: number, radius: number, color: number, intensity: number, duration: number): void {
    this.transients.push({ x, y, radius, color, intensity, remaining: duration, duration });
  }

  update(steady: SteadyLight[], deltaSeconds: number, timeSeconds: number): void {
    this.graphics.clear();

    for (const light of steady) {
      const i =
        light.pulseHz !== undefined
          ? light.intensity * (0.72 + Math.sin(timeSeconds * Math.PI * 2 * light.pulseHz) * 0.28)
          : light.intensity;
      this.drawLight(light.x, light.y, light.radius, light.color, i);
    }

    for (let i = this.transients.length - 1; i >= 0; i--) {
      const t = this.transients[i];
      t.remaining -= deltaSeconds;
      if (t.remaining <= 0) {
        this.transients.splice(i, 1);
        continue;
      }
      const frac = t.remaining / t.duration;
      // Slightly expand radius as it fades for an "bloom out" feel
      const r = t.radius * (1 + (1 - frac) * 0.4);
      this.drawLight(t.x, t.y, r, t.color, t.intensity * frac);
    }
  }

  destroy(): void {
    this.graphics.destroy();
    this.transients.length = 0;
  }

  private drawLight(x: number, y: number, maxRadius: number, color: number, intensity: number): void {
    // Draw RINGS concentric filled circles from largest (dim) to smallest (bright).
    // With ADD blend mode each ring adds its color contribution independently.
    for (let r = 1; r <= RINGS; r++) {
      const ratio = r / RINGS;
      const alpha = Phaser.Math.Clamp(intensity, 0, 1) * (1 - ratio) * RING_ALPHA_SCALE;
      if (alpha < 0.004) continue;
      this.graphics.fillStyle(color, alpha);
      this.graphics.fillCircle(x, y, maxRadius * ratio);
    }
  }
}
