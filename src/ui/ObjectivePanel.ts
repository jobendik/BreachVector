import Phaser from 'phaser';
import { DEPTHS } from '../game/constants';
import type { HudState, MissionObjective } from '../game/types';

export class ObjectivePanel {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly title: Phaser.GameObjects.Text;
  private readonly lines: Phaser.GameObjects.Text[] = [];
  private bounds = new Phaser.Geom.Rectangle();

  constructor(private readonly scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setScrollFactor(0).setDepth(DEPTHS.ui);
    this.title = scene.add
      .text(0, 0, 'OBJECTIVES', this.textStyle(13, '#34d399'))
      .setScrollFactor(0)
      .setDepth(DEPTHS.ui + 1);
    for (let i = 0; i < 5; i += 1) {
      this.lines.push(
        scene.add
          .text(0, 0, '', this.textStyle(12, '#cbd5e1'))
          .setScrollFactor(0)
          .setDepth(DEPTHS.ui + 1)
      );
    }
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.bounds.setTo(x, y, width, height);
    this.title.setPosition(x + 16, y + 12);
    this.lines.forEach((line, index) => line.setPosition(x + 16, y + 42 + index * 24));
  }

  update(state: HudState): void {
    const { x, y, width, height } = this.bounds;
    this.graphics.clear();
    this.graphics.fillStyle(0x07111f, 0.88);
    this.graphics.fillRoundedRect(x, y, width, height, 8);
    this.graphics.lineStyle(1, 0x34d399, 0.38);
    this.graphics.strokeRoundedRect(x, y, width, height, 8);
    this.graphics.fillStyle(0x34d399, 0.8);
    this.graphics.fillRect(x + width - 4, y, 4, height);

    this.lines.forEach((line, index) => {
      const objective = state.objectives[index];
      line.setText(objective ? this.format(objective) : '');
      line.setColor(objective ? this.color(objective) : '#cbd5e1');
    });
  }

  private format(objective: MissionObjective): string {
    return `${objective.completed ? '[x]' : '[ ]'} ${objective.label}`;
  }

  private color(objective: MissionObjective): string {
    if (objective.completed) return '#34d399';
    if (objective.emphasis === 'critical') return '#f87171';
    if (objective.emphasis === 'warning') return '#fbbf24';
    return '#cbd5e1';
  }

  private textStyle(size: number, color: string): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: `${size}px`,
      fontStyle: '700',
      color
    };
  }
}
