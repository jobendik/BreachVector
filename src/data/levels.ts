import type { LevelData } from '../game/types';

export const levels: LevelData[] = [
  {
    id: 'blacksite-approach',
    name: 'Infiltrate Facility',
    briefing:
      'Enter the west service sector, compromise both security terminals, neutralize the command unit, and extract through the north-east pad.',
    width: 2100,
    height: 1400,
    spawn: { x: 170, y: 920 },
    extraction: { x: 1960, y: 180, w: 90, h: 90 },
    requiredTerminalIds: ['a', 'b'],
    requiresCaptainKill: true,
    walls: [
      { x: 0, y: 0, w: 2100, h: 28 },
      { x: 0, y: 1372, w: 2100, h: 28 },
      { x: 0, y: 0, w: 28, h: 1400 },
      { x: 2072, y: 0, w: 28, h: 1400 },
      { x: 260, y: 160, w: 40, h: 880 },
      { x: 260, y: 1160, w: 40, h: 212 },
      { x: 560, y: 160, w: 40, h: 460 },
      { x: 560, y: 760, w: 40, h: 612 },
      { x: 860, y: 28, w: 40, h: 350 },
      { x: 860, y: 520, w: 40, h: 360 },
      { x: 860, y: 1020, w: 40, h: 352 },
      { x: 1120, y: 250, w: 40, h: 820 },
      { x: 1340, y: 28, w: 40, h: 340 },
      { x: 1340, y: 500, w: 40, h: 370 },
      { x: 1340, y: 1010, w: 40, h: 362 },
      { x: 300, y: 160, w: 500, h: 36 },
      { x: 900, y: 160, w: 440, h: 36 },
      { x: 1380, y: 160, w: 520, h: 36 },
      { x: 600, y: 620, w: 380, h: 36 },
      { x: 1120, y: 620, w: 520, h: 36 },
      { x: 300, y: 1040, w: 460, h: 36 },
      { x: 900, y: 1040, w: 380, h: 36 },
      { x: 1520, y: 1040, w: 520, h: 36 },
      { x: 1640, y: 350, w: 36, h: 520 },
      { x: 1780, y: 760, w: 292, h: 36 }
    ],
    doors: [
      { id: 'a', x: 560, y: 620, w: 40, h: 140, locked: true },
      { id: 'b', x: 1340, y: 870, w: 40, h: 140, locked: true }
    ],
    terminals: [
      { id: 'a', x: 410, y: 420, prompt: 'Hack west terminal', hackTime: 1.4 },
      { id: 'b', x: 1510, y: 930, prompt: 'Hack east terminal', hackTime: 1.7 }
    ],
    props: [
      { kind: 'barrel', x: 430, y: 500 },
      { kind: 'barrel', x: 470, y: 500 },
      { kind: 'crate', x: 720, y: 720, w: 70, h: 44 },
      { kind: 'crate', x: 1020, y: 440, w: 65, h: 45 },
      { kind: 'barrel', x: 1490, y: 470 },
      { kind: 'crate', x: 1780, y: 920, w: 70, h: 70 },
      { kind: 'crate', x: 1840, y: 245, w: 80, h: 55 }
    ],
    pickups: [
      { x: 360, y: 1220, type: 'medkit' },
      { x: 1180, y: 740, type: 'ammo' },
      { x: 1900, y: 1110, type: 'grenade' }
    ],
    enemies: [
      {
        role: 'assault',
        x: 460,
        y: 330,
        patrol: [
          { x: 420, y: 330 },
          { x: 740, y: 330 }
        ],
        angle: 0
      },
      {
        role: 'flanker',
        x: 760,
        y: 850,
        patrol: [
          { x: 720, y: 850 },
          { x: 1040, y: 840 }
        ],
        angle: Math.PI
      },
      { role: 'sniper', x: 1260, y: 300, angle: Math.PI * 0.7 },
      {
        role: 'assault',
        x: 1520,
        y: 550,
        patrol: [
          { x: 1480, y: 550 },
          { x: 1880, y: 550 }
        ],
        angle: Math.PI
      },
      { role: 'heavy', x: 1240, y: 900, angle: Math.PI },
      { role: 'captain', x: 1880, y: 250, angle: Math.PI }
    ]
  },
  {
    id: 'vault-core',
    name: 'Purge The Vault',
    briefing:
      'Push through the blacksite vault, override the core and exit gate terminals, then burn the command uplink before extraction.',
    width: 2400,
    height: 1500,
    spawn: { x: 150, y: 1340 },
    extraction: { x: 2220, y: 120, w: 100, h: 100 },
    requiredTerminalIds: ['core', 'gate'],
    requiresCaptainKill: true,
    walls: [
      { x: 0, y: 0, w: 2400, h: 28 },
      { x: 0, y: 1472, w: 2400, h: 28 },
      { x: 0, y: 0, w: 28, h: 1500 },
      { x: 2372, y: 0, w: 28, h: 1500 },
      { x: 240, y: 210, w: 40, h: 620 },
      { x: 240, y: 1030, w: 40, h: 442 },
      { x: 520, y: 28, w: 40, h: 360 },
      { x: 520, y: 560, w: 40, h: 640 },
      { x: 760, y: 300, w: 460, h: 40 },
      { x: 760, y: 720, w: 500, h: 40 },
      { x: 760, y: 1140, w: 460, h: 40 },
      { x: 1220, y: 300, w: 40, h: 460 },
      { x: 1220, y: 940, w: 40, h: 532 },
      { x: 1500, y: 28, w: 40, h: 520 },
      { x: 1500, y: 760, w: 40, h: 480 },
      { x: 1780, y: 260, w: 40, h: 760 },
      { x: 2040, y: 500, w: 332, h: 40 },
      { x: 2040, y: 1040, w: 332, h: 40 }
    ],
    doors: [
      { id: 'core', x: 1220, y: 760, w: 40, h: 180, locked: true },
      { id: 'gate', x: 1500, y: 560, w: 40, h: 200, locked: true }
    ],
    terminals: [
      { id: 'core', x: 880, y: 930, prompt: 'Override vault core', hackTime: 1.9 },
      { id: 'gate', x: 1900, y: 760, prompt: 'Release exit gate', hackTime: 1.5 }
    ],
    props: [
      { kind: 'barrel', x: 660, y: 420 },
      { kind: 'barrel', x: 700, y: 420 },
      { kind: 'crate', x: 960, y: 510, w: 82, h: 50 },
      { kind: 'crate', x: 1340, y: 860, w: 90, h: 56 },
      { kind: 'barrel', x: 1660, y: 1090 },
      { kind: 'crate', x: 2050, y: 850, w: 82, h: 82 },
      { kind: 'barrel', x: 2160, y: 270 }
    ],
    pickups: [
      { x: 360, y: 1180, type: 'ammo' },
      { x: 1090, y: 1320, type: 'medkit' },
      { x: 1580, y: 410, type: 'grenade' },
      { x: 2190, y: 1160, type: 'medkit' }
    ],
    enemies: [
      {
        role: 'flanker',
        x: 410,
        y: 460,
        patrol: [
          { x: 350, y: 460 },
          { x: 460, y: 950 }
        ],
        angle: Math.PI / 2
      },
      { role: 'assault', x: 830, y: 220, angle: Math.PI / 2 },
      { role: 'sniper', x: 1130, y: 620, angle: Math.PI },
      {
        role: 'heavy',
        x: 980,
        y: 1000,
        patrol: [
          { x: 840, y: 1000 },
          { x: 1140, y: 1000 }
        ],
        angle: 0
      },
      {
        role: 'assault',
        x: 1660,
        y: 340,
        patrol: [
          { x: 1620, y: 340 },
          { x: 1940, y: 340 }
        ],
        angle: Math.PI
      },
      { role: 'flanker', x: 1660, y: 960, angle: Math.PI },
      { role: 'sniper', x: 2200, y: 690, angle: Math.PI },
      { role: 'captain', x: 2180, y: 250, angle: Math.PI }
    ]
  }
];

export function getLevel(index: number): LevelData {
  return levels[index] ?? levels[0];
}
