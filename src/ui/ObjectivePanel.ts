import Phaser from 'phaser';
import { COLORS, DEPTHS } from '../game/constants';
import type { HudState, MissionObjective } from '../game/types';
import { cssColor } from '../utils/colors';

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
    this.lines.forEach((line, index) => line.setPosition(x + 42, y + 42 + index * 24));
  }

  update(state: HudState): void {
    const { x, y, width, height } = this.bounds;
    const nextIndex = state.objectives.findIndex((objective) => !objective.completed);
    this.graphics.clear();
    this.graphics.fillStyle(COLORS.blacksitePanel, 0.88);
    this.graphics.fillRoundedRect(x, y, width, height, 8);
    this.graphics.lineStyle(1, COLORS.operatorGreenBright, 0.38);
    this.graphics.strokeRoundedRect(x, y, width, height, 8);
    this.graphics.fillStyle(COLORS.operatorGreenBright, 0.8);
    this.graphics.fillRect(x + width - 4, y, 4, height);

    this.lines.forEach((line, index) => {
      const objective = state.objectives[index];
      const lineY = y + 48 + index * 24;
      if (objective && index === nextIndex) {
        this.graphics.fillStyle(COLORS.operatorGreenBright, 0.09);
        this.graphics.fillRoundedRect(x + 12, lineY - 8, width - 30, 20, 4);
      }
      if (objective) {
        this.drawObjectiveIcon(x + 25, lineY + 1, objective);
      }
      line.setText(objective ? this.format(objective) : '');
      line.setColor(objective ? this.color(objective) : '#cbd5e1');
    });
  }

  private format(objective: MissionObjective): string {
    return `${objective.completed ? 'DONE' : 'TODO'}  ${objective.label}`;
  }

  private color(objective: MissionObjective): string {
    if (objective.completed) return cssColor(COLORS.operatorGreenBright);
    if (objective.emphasis === 'critical') return cssColor(COLORS.alertRedSoft);
    if (objective.emphasis === 'warning') return cssColor(COLORS.hazardAmberBright);
    return cssColor(COLORS.textMuted);
  }

  private drawObjectiveIcon(x: number, y: number, objective: MissionObjective): void {
    const color = objective.completed
      ? COLORS.operatorGreenBright
      : objective.emphasis === 'critical'
        ? COLORS.alertRed
        : objective.emphasis === 'warning'
          ? COLORS.hazardAmberBright
          : COLORS.systemCyan;
    this.graphics.lineStyle(2, color, objective.completed ? 0.95 : 0.72);
    this.graphics.fillStyle(color, objective.completed ? 0.18 : 0.06);

    if (objective.id.startsWith('terminal')) {
      this.graphics.fillRect(x - 5, y - 5, 10, 10);
      this.graphics.strokeRect(x - 6, y - 6, 12, 12);
    } else if (objective.id === 'captain') {
      this.graphics.strokeCircle(x, y, 7);
      this.graphics.lineBetween(x - 5, y - 5, x + 5, y + 5);
      this.graphics.lineBetween(x + 5, y - 5, x - 5, y + 5);
    } else {
      this.graphics.strokeRect(x - 7, y - 5, 14, 10);
      this.graphics.lineBetween(x - 5, y, x + 5, y);
      this.graphics.lineBetween(x, y - 4, x, y + 4);
    }

    if (objective.completed) {
      this.graphics.lineStyle(2, COLORS.white, 0.9);
      this.graphics.lineBetween(x - 5, y, x - 1, y + 4);
      this.graphics.lineBetween(x - 1, y + 4, x + 7, y - 5);
    }
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
