# BREACH VECTOR: BLACKSITE

`BREACH VECTOR: BLACKSITE` is a Phaser 3 + TypeScript top-down tactical shooter prototype rebuilt from a single-file canvas experiment into a modular browser game project.

## Screenshot

Add screenshots or GIFs here after capturing gameplay:

- `docs/screenshots/menu.png`
- `docs/screenshots/combat.gif`
- `docs/screenshots/sector-clear.png`

## Pitch

Infiltrate hostile blacksites, move between stealth and emergency combat, hack terminals, open security doors, destroy cover and barrels, neutralize command units, and extract under escalating alert conditions.

## Features

- Phaser 3 scene flow: boot, preload, menu, gameplay, UI, pause, game over, and victory.
- Data-driven weapons, enemy roles, levels, doors, terminals, props, pickups, and mission objectives.
- Four distinct weapons: Silenced Pistol, Pulse Rifle, Scattergun, and Rail Piercer.
- Role-based enemies: assault, sniper, flanker, heavy, and captain command unit.
- Tactical stealth readability with line-of-sight checks, dimmed enemies, search states, and emergency alert lighting.
- Centralized systems for input, weapons, collision, combat, AI, vision, mission state, alert state, effects, audio, and minimap.
- Generated placeholder textures and procedural Web Audio so the game runs with no external assets.
- HUD with health, armor, dash, ammo, grenades, objectives, alert state, tactical log, interaction prompt, and minimap.

## Controls

See [CONTROLS.md](./CONTROLS.md) for the full table.

## Tech Stack

- Vite
- TypeScript
- Phaser 3
- Arcade Physics
- Modern ES modules
- Procedural/generated placeholder visuals and sounds

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The Vite build uses `base: './'`, so the `dist` folder is suitable for static hosting such as GitHub Pages.

## Architecture Overview

The project is split by responsibility:

- `src/scenes`: Phaser scene lifecycle and screen flow.
- `src/entities`: world objects such as player, enemies, projectiles, grenades, doors, terminals, pickups, props, and extraction zones.
- `src/systems`: gameplay logic that coordinates entities without turning scenes into god classes.
- `src/data`: hand-editable weapon, enemy, level, pickup, and mission data.
- `src/ui`: HUD panels and minimap rendering.
- `src/effects`: short-lived game feel effects.
- `src/utils`: math, geometry, colors, and debug helpers.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for extension notes.

## Why This Project Exists

This project is designed as a portfolio-ready game architecture sample: a playable tactical action prototype that shows TypeScript structure, Phaser fluency, data-driven design, and game-feel polish without depending on commercial assets.

## Portfolio Note

The current art and sound are intentionally generated placeholders. The code is prepared for real sprite sheets, tilemaps, particle textures, UI art, and audio without rewriting the gameplay loop.

## Roadmap

- Add real sprite atlases and animation states.
- Replace rectangle level geometry with Tiled maps.
- Add authored sound effects and adaptive music.
- Improve AI cover selection with navigation data.
- Add mission scoring, sector modifiers, and saveable progression.
- Add automated Playwright smoke tests for menu/start/gameplay boot.
