import Phaser from 'phaser';
import type { Actor } from '../entities/Actor';
import { Enemy } from '../entities/Enemy';
import type { Player } from '../entities/Player';
import type { Prop } from '../entities/Prop';
import { WORLD_BALANCE } from '../game/constants';
import type { DamageSource, Team } from '../game/types';

interface CombatWorld {
  scene: Phaser.Scene;
  player: Player;
  enemies: Enemy[];
  props: Prop[];
  effects: {
    explosion(x: number, y: number, color?: number, scale?: number): void;
    floatingText(x: number, y: number, value: string, color: number): void;
    hit(x: number, y: number, color?: number): void;
    shake(intensity: number): void;
  };
  audio: {
    play(id: 'hit' | 'explode'): void;
  };
  hasLineOfSight(a: Phaser.Math.Vector2, b: Phaser.Math.Vector2): boolean;
  onEnemyKilled(enemy: Enemy): void;
  onPlayerKilled(): void;
  emitNoise(point: Phaser.Math.Vector2, radius: number, important?: boolean): void;
}

export class CombatSystem {
  constructor(private readonly world: CombatWorld) {}

  damageActor(actor: Actor, amount: number, source: DamageSource): void {
    if (actor.dead) {
      return;
    }
    const result = actor.takeDamage(amount, source);
    const damageColor = actor.team === 'player' ? 0xef4444 : 0xe5eefb;
    this.world.effects.floatingText(actor.x, actor.y - 22, `${Math.ceil(result.appliedHealthDamage)}`, damageColor);
    this.world.effects.hit(actor.x, actor.y, damageColor);
    this.world.audio.play('hit');

    if (result.killed) {
      this.world.effects.explosion(actor.x, actor.y, actor.team === 'player' ? 0xef4444 : 0xf97316, 0.65);
      if (actor.team === 'player') {
        this.world.onPlayerKilled();
      } else if (actor instanceof Enemy) {
        this.world.onEnemyKilled(actor);
      }
    }
  }

  damageProp(prop: Prop, amount: number, source: DamageSource): void {
    const destroyed = prop.takeDamage(amount, source);
    this.world.effects.hit(prop.x, prop.y, prop.explosive ? 0xf97316 : 0x94a3b8);
    if (destroyed && prop.explosive) {
      this.world.scene.time.delayedCall(45, () => {
        this.explosion(
          new Phaser.Math.Vector2(prop.x, prop.y),
          WORLD_BALANCE.barrelRadius,
          WORLD_BALANCE.barrelDamage,
          source.team,
          0xf97316
        );
      });
    } else if (destroyed) {
      this.world.effects.explosion(prop.x, prop.y, 0x64748b, 0.45);
    }
  }

  explosion(origin: Phaser.Math.Vector2, radius: number, damage: number, team: Team, color = 0xf97316): void {
    this.world.effects.explosion(origin.x, origin.y, color, radius / 150);
    this.world.effects.shake(radius / 22);
    this.world.audio.play('explode');
    this.world.emitNoise(origin, radius * 2.5, true);

    const source: DamageSource = {
      team,
      label: 'Explosion',
      position: { x: origin.x, y: origin.y }
    };

    const actors: Actor[] = [this.world.player, ...this.world.enemies].filter((actor) => !actor.dead);
    for (const actor of actors) {
      if (actor.team === team && actor.team !== 'player') {
        continue;
      }
      const distance = Phaser.Math.Distance.Between(origin.x, origin.y, actor.x, actor.y);
      if (distance > radius || !this.world.hasLineOfSight(origin, actor.positionVector)) {
        continue;
      }
      const falloff = Phaser.Math.Clamp(1 - distance / radius, 0.25, 1);
      this.damageActor(actor, damage * falloff, source);
    }

    for (const prop of [...this.world.props]) {
      if (prop.dead) {
        continue;
      }
      const distance = Phaser.Math.Distance.Between(origin.x, origin.y, prop.x, prop.y);
      if (distance <= radius && this.world.hasLineOfSight(origin, new Phaser.Math.Vector2(prop.x, prop.y))) {
        this.damageProp(prop, damage * Phaser.Math.Clamp(1 - distance / radius, 0.35, 1), source);
      }
    }
  }
}
