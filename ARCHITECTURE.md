# Architecture

## Scene Structure

- `BootScene`: minimal startup and handoff.
- `PreloadScene`: generates all placeholder textures at runtime.
- `MenuScene`: Phaser-rendered title, briefing, controls, and start action.
- `GameScene`: owns active-sector lifecycle, system orchestration, camera behavior, and the gameplay loop.
- `UIScene`: runs alongside gameplay and renders HUD panels from typed events.
- `PauseScene`: modal overlay for resume, restart, and menu.
- `GameOverScene`: restart flow after player death.
- `VictoryScene`: sector-clear and campaign-complete flow.

## Entity Structure

`Actor` is the shared base for `Player` and `Enemy`. It owns health, armor, facing, collision radius, team, and damage application. Other world entities are focused classes: `Projectile`, `Grenade`, `Door`, `Terminal`, `Pickup`, `Prop`, and `ExtractionZone`.

## Systems

- `InputSystem`: keyboard, pointer, weapon keys, pause, and debug toggles.
- `WeaponSystem`: firing, reloads, weapon switching support, projectile spawning, recoil, muzzle flashes, and noise.
- `CollisionSystem`: Arcade Physics colliders, overlap rules, and swept projectile hit checks.
- `CombatSystem`: actor damage, prop damage, explosions, barrel chain reactions, death callbacks, and feedback.
- `EnemyAISystem`: patrol, guard, suspicious, search, attack, flank, cover, and reload behavior.
- `VisionSystem`: line-of-sight, enemy vision checks, visibility polygon support, and fog readability.
- `MissionSystem`: terminal flags, command target state, extraction unlock, extraction completion, and objective events.
- `InteractionSystem`: terminal, door, and extraction prompt interaction logic.
- `AlertSystem`: hidden, searching, and detected states.
- `DebugSystem`: debug toggle state, debug event emission, enemy vision overlay, and reused debug labels.
- `EffectsSystem`: tracers, muzzle flashes, hit markers, floating text, explosions, and camera shake.
- `AudioSystem`: procedural Web Audio sound cues.
- `MinimapSystem`: converts world state into HUD-friendly minimap snapshots.

## Level Construction

Static level rendering is split out of `GameScene`:

- `EnvironmentRenderer`: floor grid, walls, visibility graphics, and debug graphics.
- `LevelBuilder`: doors, terminals, props, pickups, player, enemies, extraction zone, and generated cover points.

`GameScene` creates physics groups, asks these helpers to build the sector, then wires systems together.

## Lifecycle And Cleanup

Scene ownership rules:

- `GameScene` starts each sector from fresh entity arrays, physics groups, systems, mission state, minimap timer, tactical log, and interaction prompt.
- `UIScene` subscribes to the typed event bus on create and unsubscribes on shutdown.
- Systems that own listeners, reusable debug labels, colliders, input keys, or audio resources expose `destroy()`.
- `GameScene` calls system cleanup from its shutdown handler before sector restart, game over, victory, or return to menu.
- Playwright smoke tests cover boot, start, projectile firing, and pause/restart listener counts.

## Data-Driven Level Design

Level data lives in `src/data/levels.ts`. Each level defines dimensions, spawn, extraction, walls, doors, terminals, props, pickups, enemies, required terminals, and captain requirements. `LevelBuilder` reads the data and builds the world without hard-coding sector geometry in `GameScene`.

## Event Flow

`src/game/events.ts` exposes a typed event bus. Systems and scenes emit HUD state, tactical log messages, alert changes, debug changes, mission updates, and minimap snapshots. `UIScene` subscribes and delegates rendering to UI classes under `src/ui`.

## Weapons

Weapon definitions live in `src/data/weapons.ts`. A weapon includes magazine size, reserve ammo, fire rate, reload time, damage, projectile speed, spread, projectile count, color, noise radius, recoil, screen shake, pierce, and automatic/semi-auto behavior. `Player` stores weapon state, while `WeaponSystem` owns weapon behavior.

## AI

Enemy role tuning lives in `src/data/enemies.ts`. `Enemy` stores role state and memory, while `EnemyAISystem` updates tactical state each frame. The system keeps behavior readable rather than hiding it inside a large behavior tree.

## Mission Objectives

`MissionSystem` tracks required terminals and command unit completion. Doors are unlocked by matching terminal IDs. Extraction becomes valid only when mission objectives are complete.

## Visibility And Line Of Sight

`VisionSystem` checks segments against walls, closed doors, and line-of-sight blocking props. The game keeps darkness atmospheric but readable by dimming the world and enemies rather than fully hiding the playfield.

## Add A New Enemy

1. Add role tuning to `src/data/enemies.ts`.
2. Add a generated texture in `PreloadScene` or point the role to a real asset key.
3. Add enemy spawn entries to a level in `src/data/levels.ts`.
4. Extend `EnemyAISystem` only if the role needs unique behavior.

## Add A New Weapon

1. Add a `WeaponDefinition` to `src/data/weapons.ts`.
2. Generate or load a projectile texture key.
3. Tune damage, spread, recoil, noise, and fire rate.
4. `WeaponSystem` will automatically handle ammo, reload, firing, recoil, noise, and projectiles.

## Add A New Level

1. Add a `LevelData` object to `src/data/levels.ts`.
2. Define walls, doors, terminals, props, pickups, enemies, spawn, and extraction.
3. Set `requiredTerminalIds` and `requiresCaptainKill`.
4. Victory flow will advance to it automatically based on array order.
