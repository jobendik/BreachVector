# BREACH VECTOR: BLACKSITE

`Breach Vector: Blacksite` is a playable Phaser 3 + TypeScript tactical shooter prototype and portfolio vertical slice in progress. It demonstrates modular game architecture, typed events, data-driven content, enemy AI, stealth alert states, swept projectile collision, procedural visuals/audio, HUD systems, persistent progress, and automated browser smoke tests.

Current status: **playable technical prototype / Sector 1 polish pass next**.

## Pitch

Infiltrate hostile blacksites, move between stealth and emergency combat, hack terminals, open security doors, destroy cover and barrels, neutralize command units, and extract under escalating alert conditions.

## Why This Project Is Interesting

- Rebuilt from a single-file canvas experiment into a modular Phaser 3 + TypeScript project.
- Uses generated placeholder textures and procedural Web Audio, so the game runs without external art/audio assets.
- Keeps gameplay data editable through TypeScript data files for weapons, enemy roles, pickups, mission text, and levels.
- Includes real tactical systems: line of sight, suspicion buildup, alert escalation, A* pathfinding, swept projectile collision, grenade prediction, destructible props, and extraction-based mission flow.
- Ships with Playwright smoke tests that verify important runtime behavior, not just boot success.

## Implemented Features

- Scene flow: boot, preload, menu, settings, gameplay, UI, pause, game over, and victory.
- Two data-driven sectors with walls, doors, terminals, props, pickups, enemies, and extraction zones.
- Four weapons: Silenced Pistol, Pulse Rifle, Scattergun, and Rail Piercer.
- Enemy roles: assault, sniper, flanker, heavy, and captain command unit.
- Enemy AI states for patrol, guard, suspicious, search, attack, flank, cover, reload, and dead.
- A* navigation with path smoothing and door/prop grid refresh.
- Gradual suspicion detection instead of instant binary spotting.
- Hidden, Searching, and Detected alert states.
- Swept projectile hit detection for player and enemy shots.
- Grenade preview with clamped range, fuse indicator, bounce feedback, danger marker, and line-of-sight explosion damage.
- Destructible crates and explosive barrels.
- HUD with segmented health, armor, dash, ammo, reload, grenades, objectives, alert state, tactical log, minimap, interaction prompt, captain status, and awareness counts.
- Arcade scoring: role-based kill points, chained combo multipliers up to x5, ghost (undetected) kill bonuses, kill-streak callouts, and terminal hack rewards.
- End-of-sector score breakdown with stealth, accuracy, speed, and untouchable bonuses, plus animated score count-up and new-high-score celebration.
- Daily operative streak tracking with a menu banner and a return-tomorrow hook on the victory screen.
- Minimap sector/local zoom toggle.
- Sector clear report with grade, stealth rating, kill breakdown, accuracy, damage taken, tactical advice, and best-progress persistence including per-sector high scores.
- Persistent local settings for graphics quality, master/music/SFX/UI volume, screen shake, flash intensity, colorblind mode, and reduced motion.

## Architecture Highlights

- `src/scenes`: Phaser scene lifecycle and screen flow.
- `src/entities`: world objects such as player, enemies, projectiles, grenades, doors, terminals, pickups, props, and extraction zones.
- `src/systems`: gameplay logic for input, weapons, collision, combat, AI, vision, mission state, alert state, effects, audio, lighting, pathfinding, debug, and minimap.
- `src/data`: hand-editable weapon, enemy, level, pickup, and mission definitions.
- `src/ui`: HUD panels, tactical log, objective panel, alert panel, weapon panel, health/armor panel, and minimap rendering.
- `src/effects`: short-lived feedback effects.
- `src/level`: level construction and environment rendering helpers.
- `src/game`: typed events, settings, progress, constants, and shared types.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for deeper extension notes.

## Systems Demonstrated

- Typed event bus for HUD, tactical log, mission, alert, debug, and minimap updates.
- Data-driven weapon definitions and enemy role tuning.
- Visibility and line-of-sight checks against walls, doors, and blocking props.
- Per-enemy suspicion meter that escalates into search/combat behavior.
- A* pathfinding over generated walkability data.
- Swept projectile collision to reduce tunneling at high projectile speeds.
- Persistent localStorage progress for sector bests and continue flow.
- Playwright smoke tests for gameplay and scene lifecycle behavior.

## Controls

See [CONTROLS.md](./CONTROLS.md) for the full control table.

Quick reference:

- `WASD`: move
- Mouse: aim
- Left mouse: fire
- Right mouse: grenade
- `R`: reload
- `Space`: dash
- `Shift`: slow walk
- `E`: interact
- `1-4`: switch weapons
- `M`: minimap zoom
- `Esc`: pause
- `Tab`: debug overlay

## Tech Stack

- Vite
- TypeScript
- Phaser 3
- Arcade Physics
- Playwright
- ESLint
- Prettier
- Modern ES modules
- Procedural/generated placeholder visuals and sounds

## Run

```bash
npm install
npm run dev
```

## Check And Test

```bash
npm run check
npm run test:smoke
```

`npm run check` runs TypeScript, ESLint, Prettier check, and a production build.

`npm run test:smoke` runs Playwright browser smoke tests covering menu boot, gameplay start, projectile firing, grenade preview, pickups, tactical log behavior, alert state, minimap zoom, sector progress persistence, captain command pulse, and pause/restart listener cleanup.

## Build

```bash
npm run build
```

The Vite build uses `base: './'`, so the `dist` folder is suitable for static hosting such as GitHub Pages.

## Media

Screenshots, GIFs, and a live demo are planned after the Sector 1 polish pass. The repository intentionally does not include placeholder marketing media yet.

## Roadmap

The active roadmap is [BREACH_VECTOR_EPIC_IMPROVEMENTS.md](./BREACH_VECTOR_EPIC_IMPROVEMENTS.md).

Current priority:

1. Polish Sector 1 into a memorable vertical slice.
2. Improve weapon-specific muzzle/tracer/audio feedback.
3. Improve explosion, damage, death, captain, and extraction feedback.
4. Capture screenshots/GIFs.
5. Publish a GitHub Pages demo.

Deferred until the vertical slice is stronger:

- More sectors.
- Heavy meta-progression.
- Full reward archetypes.
- Tiled production pipeline.
- Controller/touch support.
- Imported final art/audio assets.

## Portfolio Note

The current art and sound are intentionally generated placeholders. The code is prepared for real sprite sheets, tilemaps, particle textures, UI art, and audio without rewriting the gameplay loop, but the current goal is to make the generated vertical slice feel polished before expanding scope.
