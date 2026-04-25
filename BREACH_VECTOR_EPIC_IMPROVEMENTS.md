# BREACH VECTOR: BLACKSITE — Epic Improvement Plan

> **Game Overview**: Breach Vector: Blacksite is a Phaser 3 + TypeScript top-down tactical shooter / stealth-action prototype with neon sci-fi presentation, procedural placeholder art, generated Web Audio, data-driven weapons, role-based enemies, terminals, doors, destructible props, alert states, tactical visibility, and extraction-based mission flow.

This document is the master checklist for every improvement needed to make the game feel like a true GitHub portfolio gem. Each section covers one development domain; each checklist item is a discrete, implementable task.

The purpose is not to randomly add more features. The purpose is to turn a strong playable prototype into a polished, readable, technically impressive, professionally presented browser game.

---

## ✅ PHASE 0 COMPLETED — Foundation From Single-File Prototype

The project has already crossed the most important first threshold: it is no longer a disposable single-file experiment. It has been rebuilt as a modular Phaser + TypeScript project with scenes, systems, entities, data, UI, documentation, and a Vite build pipeline.

| # | Feature | Details |
|---|---------|---------|
| 0-A | **Phaser + TypeScript conversion** | Rebuilt from a custom Canvas prototype into a Vite + Phaser 3 + TypeScript project. |
| 0-B | **Scene architecture** | Boot, Preload, Menu, Game, UI, Pause, GameOver, and Victory scenes exist as separate responsibilities. |
| 0-C | **Data-driven content** | Weapons, enemies, levels, pickups, and mission text are separated into data files. |
| 0-D | **Entity split** | Player, Enemy, Projectile, Grenade, Door, Terminal, Pickup, Prop, and ExtractionZone are separated into focused classes. |
| 0-E | **System split** | Input, weapons, combat, collisions, AI, vision, mission, alert, effects, audio, and minimap are separated into systems. |
| 0-F | **HUD separation** | UIScene and UI classes handle HUD panels rather than hard-coding all HUD rendering into GameScene. |
| 0-G | **Generated placeholders** | The game runs without external assets by generating placeholder textures and procedural audio. |
| 0-H | **Portfolio documentation** | README, ASSETS, CONTROLS, and ARCHITECTURE documents exist and explain the project. |

---

## ✅ PHASE 1 COMPLETED — Playable Tactical Prototype

The current build already demonstrates the core playable loop.

| # | Feature | Details |
|---|---------|---------|
| 1-A | **Core movement and aiming** | WASD movement, mouse aiming, dash, slow walk, reload, weapon switching, grenade throw, and interaction. |
| 1-B | **Four-weapon kit** | Silenced Pistol, Pulse Rifle, Scattergun, and Rail Piercer are present with distinct tuning values. |
| 1-C | **Enemy roles** | Assault, Sniper, Flanker, Heavy, and Captain roles exist with different combat identities. |
| 1-D | **Mission structure** | Hack terminals, open security doors, neutralize command target, then extract. |
| 1-E | **Alert loop** | Hidden, Searching, and Detected alert states give the game stealth/combat pacing. |
| 1-F | **Destructible tactical props** | Crates and explosive barrels support cover destruction and chain reactions. |
| 1-G | **HUD readability** | Health, armor, dash, ammo, grenades, objectives, alert state, tactical log, interaction prompt, and minimap exist. |
| 1-H | **Two-sector content base** | At least two playable levels exist as hand-editable level data. |

**Next: Phase 2 — Professional Hardening & Presentation**

---

## TABLE OF CONTENTS

1. [Architecture & Code Quality](#1-architecture--code-quality)
2. [Rendering & Graphics](#2-rendering--graphics)
3. [Visual FX & Juice](#3-visual-fx--juice)
4. [Game Feel & Feedback](#4-game-feel--feedback)
5. [HUD & Tactical Interface](#5-hud--tactical-interface)
6. [UI/UX & Menus](#6-uiux--menus)
7. [Player Mechanics](#7-player-mechanics)
8. [Weapon Design & Combat Depth](#8-weapon-design--combat-depth)
9. [Enemy Design & AI](#9-enemy-design--ai)
10. [Stealth, Vision & Alert Design](#10-stealth-vision--alert-design)
11. [Mission Design & Tactical Objectives](#11-mission-design--tactical-objectives)
12. [Physics, Collision & Navigation](#12-physics-collision--navigation)
13. [Audio & Soundscape](#13-audio--soundscape)
14. [Content & Level Design](#14-content--level-design)
15. [Progression, Scoring & Replayability](#15-progression-scoring--replayability)
16. [Performance & Technical Polish](#16-performance--technical-polish)
17. [Accessibility & Settings](#17-accessibility--settings)
18. [GitHub Portfolio Presentation](#18-github-portfolio-presentation)

---

## 1. ARCHITECTURE & CODE QUALITY

The project already has a good file/folder structure. The next step is making the architecture feel truly senior-level rather than just “split into folders.”

### 1.1 GameScene Responsibility Reduction
- [x] Move level construction from `GameScene` into a dedicated `LevelFactory` or `LevelBuilder`.
- [x] Move environment/background rendering into an `EnvironmentRenderer` or `LevelRenderer`.
- [x] Move extraction overlap and extraction state handling fully into `MissionSystem`.
- [x] Move all interaction range logic into an `InteractionSystem`.
- [x] Move debug drawing into a dedicated `DebugSystem`.
- [ ] Keep `GameScene` focused on scene lifecycle, system orchestration, and level transitions.

### 1.2 Type Safety & Interfaces
- [x] Remove all `unknown as` style casts from core systems.
- [x] Expand `VisionWorld`, `CombatWorld`, `MissionWorld`, and related interfaces so systems receive explicit dependencies.
- [x] Create typed event payloads for every game event.
- [x] Replace loose string event names with a strongly typed event map.
- [x] Make enemy states a strict enum or const union with exhaustive handling.
- [x] Make weapon IDs, pickup IDs, enemy role IDs, and level IDs strict literal types.
- [x] Ensure `npm run typecheck` passes from a clean clone.

### 1.3 Lifecycle & Cleanup
- [x] Add explicit `destroy()` methods to systems that register events, timers, or scene listeners.
- [x] Ensure UIScene unsubscribes from event bus listeners on shutdown.
- [ ] Ensure GameScene fully resets projectiles, particles, enemies, minimap data, audio state, and mission state between sectors.
- [x] Prevent duplicate scene listeners when restarting a sector.
- [x] Add a `SceneCleanupChecklist.md` or document lifecycle ownership in `ARCHITECTURE.md`.

### 1.4 Repository Professionalism
- [x] Add ESLint + TypeScript ESLint with a practical ruleset.
- [x] Add Prettier or equivalent formatting config.
- [x] Add `npm run lint`.
- [x] Add `npm run check` that runs typecheck + lint + build.
- [x] Add a GitHub Actions workflow that validates the project on push.
- [x] Add a `.nvmrc` or document the recommended Node version.
- [x] Add a clean issue template or TODO roadmap for future tasks.

### 1.5 Automated Smoke Testing
- [x] Add Playwright or Vitest browser smoke test that confirms the menu boots.
- [x] Add test that clicks Start and confirms GameScene + UIScene are active.
- [x] Add test that player can fire at least one projectile without runtime errors.
- [x] Add test that pause and restart do not duplicate scenes or event listeners.
- [ ] Add a small `debug/testLevel.ts` with predictable geometry for testing collisions and interactions.

---

## 2. RENDERING & GRAPHICS

The current generated placeholder style is useful, but the game needs a stronger visual identity before it becomes a true portfolio gem.

### 2.1 Tactical Neon Art Direction
- [x] Define a strict palette: blacksite navy, cyan systems light, green operator light, red alert light, amber hazard light, violet high-tech energy.
- [x] Move all colors into `src/utils/colors.ts` or a visual theme file.
- [x] Ensure every faction and gameplay category has a consistent visual language.
- [x] Use shape + color together so important information is not color-only.
- [x] Add a one-page `VISUAL_STYLE.md` with palette, shape language, and examples.

### 2.2 Generated Placeholder Art Upgrade
- [x] Replace simple circles/rectangles with multi-part generated sprites.
- [x] Player should have body core, armor plates, weapon mount, facing indicator, and dash glow.
- [x] Assault enemies should have compact triangular combat silhouettes.
- [x] Snipers should have thin long-barrel silhouettes and laser sight telegraphs.
- [x] Flankers should have angular orange shapes and motion trails.
- [x] Heavies should have broad armored silhouettes and shield arcs.
- [x] Captains should have a distinct command aura, crown-like antenna shape, or red command ring.
- [x] Terminals should animate with scanning bars and small blinking glyph-like shapes, but no unreadable text dependency.
- [x] Doors should look like security barriers with segmented locks and warning stripes.
- [x] Crates should have panel lines, corner brackets, and damage cracks.
- [x] Barrels should pulse subtly and show hazard glow before exploding.

### 2.3 Level Environment Rendering
- [x] Add layered floor panels instead of one flat floor color.
- [x] Add subtle tile seams, cable paths, vents, grates, stains, and circuit traces.
- [ ] Add sector-specific environment themes: Data Vault, Reactor Hall, Cryo Lab, Command Core, Exterior Dock.
- [x] Add wall bevels and inner shadows so walls read as physical structures.
- [ ] Add ambient occlusion darkening near wall corners and door frames.
- [ ] Add animated security lights along corridors.
- [ ] Add broken panels, exposed wires, smoke vents, sparks, and small environmental details.
- [x] Make extraction zone feel like a real landing pad / breach corridor, not just a rectangle.

### 2.4 Lighting System
- [ ] Add a dynamic light layer rendered with additive/screen blending.
- [ ] Player flashlight/vision cone emits a soft green-cyan cone in stealth state.
- [ ] Muzzle flashes emit brief weapon-colored light.
- [ ] Explosions emit expanding orange light that fades over 0.3–0.6s.
- [ ] Terminals emit cyan/green light depending on state.
- [ ] Locked doors emit red light; unlocked doors emit blue or green.
- [ ] Alert state activates red emergency strobes across the map.
- [ ] Low-health player state adds a subtle red vignette and heartbeat pulse.
- [ ] Implement a quality toggle for full lighting vs simplified lighting.

### 2.5 Camera & Composition
- [x] Add subtle camera look-ahead toward the cursor.
- [ ] Add smooth zoom when entering combat or using Rail Piercer.
- [ ] Add cinematic camera snap/zoom on sector completion.
- [ ] Add bounded camera dead-zone so movement feels stable but reactive.
- [ ] Add optional tactical zoom-out key for reading the arena.
- [ ] Add screen-edge indicators for off-screen enemies during alert.

---

## 3. VISUAL FX & JUICE

Every player action should produce a readable, satisfying response.

### 3.1 Projectile FX
- [x] Add tracer trails with per-weapon colors and fading alpha.
- [ ] Silenced Pistol gets small clean suppressed streaks.
- [ ] Pulse Rifle gets bright cyan bullet streaks with small muzzle particles.
- [ ] Scattergun gets multiple amber pellet trails and dust impacts.
- [ ] Rail Piercer gets a thick violet-white beam trail with afterimage and screen flash.
- [x] Enemy bullets get red/orange hostile tracers so the player can read incoming fire.
- [x] Projectiles should spawn small impact sparks when hitting walls, doors, props, or armor.
- [ ] Projectiles that hit shields/armor should produce blue-white ricochet sparks.

### 3.2 Muzzle, Impact & Hit Effects
- [x] Add directional cone muzzle flashes, not just circular flashes.
- [ ] Add weapon-specific muzzle flash size and color.
- [x] Add hit markers at impact position.
- [ ] Add floating damage numbers with different tiers.
- [ ] Add armor damage numbers in blue/white and health damage in red/orange.
- [ ] Add enemy death bursts using enemy role color.
- [ ] Add small blood/oil/energy decals depending on enemy type.
- [ ] Add a special captain death effect with red command signal collapse.

### 3.3 Explosion FX
- [ ] Grenade explosion gets multi-ring shockwave, hot core, sparks, smoke, and debris.
- [ ] Barrel explosion gets larger orange fireball plus secondary sparks.
- [ ] Chain explosions should visually link with delayed shockwaves.
- [ ] Explosion light should briefly illuminate nearby walls and props.
- [ ] Explosion damage falloff should be visible through particle density and ring radius.
- [ ] Large explosions should briefly desaturate or flash the screen.

### 3.4 Stealth/Alert FX
- [ ] Hidden state gets cool cyan/green scanline ambience.
- [ ] Searching state gets amber sweep lights and enemy question/exclamation indicators.
- [ ] Detected state gets red emergency strobe, siren pulse, and full-level readability.
- [ ] Enemy vision cones should be visible in debug mode and subtly telegraphed in normal mode for fairness.
- [ ] Last-known-position marker should briefly flicker where enemies think the player is.
- [ ] Noise rings should expand from loud actions and fade through walls differently than vision.

### 3.5 UI FX
- [ ] Objective completion should animate with a checkmark sweep and tactical log entry.
- [ ] Ammo count should pulse when low.
- [ ] Reloading should show a circular or segmented progress indicator.
- [ ] Alert panel should shift from cyan → amber → red with animated edges.
- [ ] Minimap should flicker/enhance when detected.
- [ ] Damage to player should shake HUD panels slightly.
- [ ] Sector complete should trigger a dramatic extraction screen transition.

---

## 4. GAME FEEL & FEEDBACK

Game feel is what will make the project memorable when someone plays it for 60 seconds.

### 4.1 Movement Feel
- [ ] Tune acceleration and deceleration so movement feels responsive but weighty.
- [ ] Add dash afterimage trails.
- [ ] Add dash start burst and dash end skid particles.
- [ ] Add subtle footstep/dust particles when moving.
- [ ] Add different movement noise feedback when walking vs slow-walking.
- [ ] Add collision slide smoothing so the player glides along walls instead of snagging.
- [ ] Add accessibility option to reduce dash effects.

### 4.2 Weapon Feel
- [x] Add per-weapon recoil impulse.
- [x] Add per-weapon camera shake profiles.
- [ ] Add per-weapon muzzle flash scale and duration.
- [ ] Add per-weapon reload rhythm and audio cue.
- [ ] Add fire-mode feel: Pistol precise, Rifle steady, Scattergun punchy, Rail Piercer heavy and dramatic.
- [ ] Add brief hit stop on heavy kills or Rail Piercer kills.
- [ ] Add screen chromatic pulse or bloom pulse on Rail Piercer fire.

### 4.3 Damage Feedback
- [ ] Player damage should produce directional red edge indicator from source direction.
- [ ] Armor hit should produce blue shield flash.
- [ ] Health hit should produce red vignette pulse.
- [ ] Low health should add subtle heartbeat sound and HUD pulse.
- [ ] Enemy hit should flash enemy sprite briefly.
- [ ] Enemy armor/shield hit should use a distinct spark effect.
- [ ] Killing an enemy should feel more dramatic than merely damaging one.

### 4.4 Time Manipulation & Impact
- [ ] Add 2–4 frame hit stop on melee takedowns.
- [ ] Add micro slow-motion on captain death.
- [ ] Add tactical slow-down for 0.15s when player health drops below critical threshold for the first time.
- [ ] Add slow-motion extraction moment after final objective completion.
- [ ] Make time effects optional under reduced motion settings.

### 4.5 Feedback Clarity
- [ ] Every failed interaction should explain why it failed: locked, too far, objective incomplete, no ammo, reloading.
- [ ] Every objective update should create tactical log entry + HUD animation.
- [ ] Every alert change should have sound + color + text feedback.
- [ ] Enemy special actions should be telegraphed before they happen.
- [ ] Player should never wonder why they died; add death recap later.

---

## 5. HUD & TACTICAL INTERFACE

The HUD should look like a real tactical operator interface without becoming cluttered.

### 5.1 Health, Armor & Dash Panel
- [x] Health, armor, and dash data exist in HUD.
- [x] Replace plain bars with segmented tactical bars.
- [x] Health bar should change color and pulse below 30%.
- [ ] Armor bar should show shield absorption with a brief white-blue flash.
- [x] Dash bar should refill with a moving highlight sweep.
- [x] Add small icons for health, armor, and dash.
- [x] Add accessibility-friendly labels, not icon-only information.

### 5.2 Weapon Panel
- [x] Weapon name, ammo, reserve ammo, grenades, and reload state exist.
- [x] Add weapon silhouette/placeholder icon.
- [x] Add current fire mode and noise level indicator.
- [x] Add reload progress animation.
- [x] Add magazine visualization using bullet ticks or segmented cells.
- [x] Add low-ammo warning.
- [ ] Add grenade cooldown/fuse indicator.
- [ ] Add weapon switch animation when pressing 1–4.

### 5.3 Objective Panel
- [x] Objective checklist exists.
- [x] Add objective icons: terminal, door, command unit, extraction.
- [ ] Add objective distance markers.
- [ ] Add animated objective completion transitions.
- [x] Add “next recommended objective” highlight.
- [ ] Add optional compass arrow to nearest incomplete objective.
- [ ] Add mission briefing text per sector.

### 5.4 Alert Panel
- [x] Hidden, Searching, and Detected states exist.
- [ ] Add alert meter showing how close enemies are to full detection.
- [x] Add state-specific animated border: cool scan, amber pulse, red emergency.
- [ ] Add enemy awareness count: unaware / suspicious / engaged.
- [ ] Add “last seen” timer when returning from Detected to Searching.
- [ ] Add siren icon or waveform during Detected.

### 5.5 Tactical Log
- [x] Tactical log exists.
- [ ] Add categories: Objective, Combat, Alert, Pickup, System.
- [ ] Color-code log entries by category.
- [ ] Add fading stack behavior with max visible entries.
- [ ] Add critical event emphasis: CAPTAIN DOWN, EXTRACTION OPEN, LOW ARMOR.
- [ ] Add optional log expansion key.

### 5.6 Minimap
- [x] Minimap exists.
- [x] Show walls with stronger contrast.
- [x] Show terminals, doors, pickups, and extraction with distinct icons.
- [x] Show enemies only when detected, recently seen, or debug mode is active.
- [x] Add alert sweep animation on minimap during Detected.
- [x] Add player facing cone.
- [ ] Add minimap zoom modes.
- [ ] Add sector objective pings.

### 5.7 Interaction Prompts
- [x] Interaction prompt exists.
- [x] Add hold-progress ring for terminal hacking.
- [x] Add terminal-specific prompt text.
- [x] Add locked-door prompt: “Requires Terminal A.”
- [x] Add extraction prompt explaining incomplete objectives.
- [ ] Add pickup prompt if inventory full.
- [ ] Add F takedown prompt only when enemy is in valid range/angle.

---

## 6. UI/UX & MENUS

Menus are part of the portfolio impression. They should feel like a finished game shell.

### 6.1 Main Menu
- [x] Phaser-rendered menu exists.
- [x] Add animated blacksite background with slow-moving security grid.
- [x] Add title glitch/scanline animation.
- [x] Add operator briefing card with mission premise.
- [x] Add menu buttons: Start Operation, Controls, Settings, Credits.
- [ ] Add “Continue” once persistence exists.
- [x] Add difficulty/mode selector.
- [x] Add version number and GitHub-friendly presentation text.

### 6.2 Sector Select Screen
- [ ] Add sector select scene after menu.
- [ ] Represent sectors as nodes on a tactical operations map.
- [ ] Show completed/incomplete sectors.
- [ ] Show sector modifiers, threat level, and objective type.
- [ ] Add locked future sectors with silhouettes.
- [ ] Add sector preview mini-map.
- [ ] Add best score/time per sector once scoring exists.

### 6.3 Pause Menu
- [x] Pause scene exists.
- [x] Add resume, restart, controls, settings, quit to menu.
- [x] Add blurred/dimmed game background.
- [x] Add tactical pause readout: current objectives, active alert state, enemies remaining.
- [x] Add keybind reminder panel.
- [x] Add “Restart Sector” confirmation to prevent accidents.

### 6.4 Game Over Screen
- [x] GameOver scene exists.
- [ ] Add death recap: killed by enemy type / explosion / barrel / sniper.
- [ ] Add stats: enemies killed, shots fired, accuracy, damage taken, objectives completed.
- [ ] Add animated signal-loss effect.
- [ ] Add restart, sector select, and menu options.
- [ ] Add “tactical advice” based on cause of death.

### 6.5 Victory / Sector Clear Screen
- [x] Victory/Sector clear flow exists.
- [ ] Add sector clear grade: S/A/B/C based on time, damage taken, stealth, accuracy, objectives.
- [ ] Add reward choice or upgrade choice after sector completion.
- [ ] Add kill breakdown by weapon.
- [ ] Add stealth rating: Silent / Compromised / Full Breach.
- [ ] Add animated extraction ship/data uplink effect.
- [ ] Add next sector preview.

### 6.6 Settings Menu
- [ ] Add settings scene or overlay.
- [ ] Graphics quality: Low, Medium, High.
- [ ] Audio sliders: Master, Music, SFX, UI.
- [ ] Screen shake intensity.
- [ ] Flash intensity.
- [ ] Colorblind mode.
- [ ] Reduce motion mode.
- [ ] Keybinds later.

---

## 7. PLAYER MECHANICS

The player should feel like a skilled tactical operator, not merely a green circle with weapons.

### 7.1 Operator Movement
- [x] WASD movement exists.
- [x] Dash exists.
- [x] Slow walk exists.
- [ ] Add movement acceleration curve tuning constants.
- [ ] Add tactical lean/strafe visual direction based on movement vs aim.
- [ ] Add dash invulnerability window or damage reduction, if balanced.
- [ ] Add stamina/dash tradeoff: repeated dashes increase noise.
- [ ] Add crouch/cover posture near walls, if useful.
- [ ] Add contextual vault/slide around small obstacles only if it improves flow.

### 7.2 Interaction System
- [x] Terminal interaction exists.
- [ ] Add hold-to-hack progress with cancellation if player moves too far.
- [ ] Hacking should create noise or risk depending on alert state.
- [ ] Hacking during Detected should take longer or trigger reinforcement timer.
- [ ] Add door interaction feedback.
- [ ] Add optional sabotage interaction on alarm panels.
- [ ] Add pickup prioritization if multiple objects are nearby.

### 7.3 Melee / Takedown
- [ ] Make takedown a full mechanic rather than optional prototype behavior.
- [ ] Add clear takedown prompt when valid.
- [ ] Takedown only works from behind or while enemy is unaware/suspicious.
- [ ] Add high-impact animation, hit stop, sound, and enemy collapse.
- [ ] Failed frontal takedown should stagger player or raise alert.
- [ ] Takedown restores a small amount of armor/health only if balanced.
- [ ] Add non-lethal variant later if stealth scoring benefits from it.

### 7.4 Player Survival Tools
- [ ] Add armor plates pickup or manual armor repair.
- [ ] Add one-use stim or medkit inventory option.
- [ ] Add temporary shield powerup.
- [ ] Add smoke grenade or flashbang as alternate tactical item.
- [ ] Add emergency cloak/overdrive as a rare sector reward.

---

## 8. WEAPON DESIGN & COMBAT DEPTH

The existing four weapons are a strong base. The goal now is making each weapon tactically meaningful.

### 8.1 Existing Weapon Identity
- [x] Silenced Pistol exists.
- [x] Pulse Rifle exists.
- [x] Scattergun exists.
- [x] Rail Piercer exists.
- [ ] Silenced Pistol should be the stealth-control tool: low noise, weak against armor, high headshot/crit potential.
- [ ] Pulse Rifle should be the flexible default: reliable, medium alert cost, good against normal enemies.
- [ ] Scattergun should be the panic/room-clear tool: strong knockback, high noise, close-range dominance.
- [ ] Rail Piercer should be the commitment weapon: slow, loud, pierces enemies and light cover, huge visual feedback.

### 8.2 Combat Systems
- [ ] Add armor classes: unarmored, light armor, heavy armor, shielded.
- [ ] Add weapon effectiveness vs armor types.
- [ ] Add weak points or rear damage bonus for stealth attacks.
- [ ] Add suppression: sustained fire near enemies reduces their accuracy/movement for a short time.
- [ ] Add stagger: heavy hits briefly interrupt enemy firing.
- [ ] Add knockback for Scattergun and explosives.
- [ ] Add friendly fire rules or explicitly document none.

### 8.3 Weapon Upgrade System
- [ ] Add sector rewards that modify weapon behavior.
- [ ] Pistol upgrades: subsonic rounds, armor-piercing rounds, execution refund, laser sight.
- [ ] Rifle upgrades: burst mode, extended magazine, stability module, smart rounds.
- [ ] Scattergun upgrades: incendiary shells, flechette spread, breacher rounds, recoil dampener.
- [ ] Rail upgrades: capacitor overcharge, wall pierce, chain arc, charge shot.
- [ ] Add upgrade rarity tiers and clear UI presentation.
- [ ] Ensure upgrades are data-driven.

### 8.4 Ammunition Economy
- [ ] Separate ammo types if it adds depth: light, energy, shells, rail cells.
- [ ] Or keep universal ammo but tune scarcity carefully.
- [ ] Add ammo caches as level objects, not only pickups.
- [ ] Add reload cancel rules and animation clarity.
- [ ] Add “empty click” sound and HUD flash when out of ammo.
- [ ] Add tactical reason to switch weapons instead of always using best weapon.

### 8.5 New Weapon Candidates
- [ ] Arc Cutter: short-range electric beam that chains through wet/metal surfaces.
- [ ] Needle SMG: stealth automatic weapon with low damage and low noise.
- [ ] Breach Hammer: slow melee shock weapon for armor and doors.
- [ ] Drone Beacon: deployable turret/drone that distracts enemies.
- [ ] EMP Launcher: disables shields, doors, cameras, and heavy units.
- [ ] Thermite Charge: placed explosive for doors/cover/objectives.

---

## 9. ENEMY DESIGN & AI

The current AI is functional. To become impressive, enemies need stronger navigation, clearer roles, and more readable tactical choices.

### 9.1 AI Architecture
- [x] Role-based enemy system exists.
- [x] Patrol/search/attack/flank/cover/reload states exist.
- [ ] Add an explicit perception memory model: seen player, heard noise, took damage, ally died, door opened.
- [ ] Add state transition logging in debug mode.
- [ ] Add suspicion meter per enemy rather than instant binary state.
- [ ] Add squad alert propagation: nearby enemies become suspicious when one enemy sees the player.
- [ ] Add enemy morale or confidence modifiers for captain alive/dead.
- [ ] Add AI update LOD so far-away enemies update at lower frequency.

### 9.2 Navigation & Pathfinding
- [ ] Replace direct movement toward target with grid-based A* or navmesh-style waypoint navigation.
- [ ] Generate navigation grid from level walls, doors, and props.
- [ ] Recalculate paths when doors open or props are destroyed.
- [ ] Add path smoothing so enemies do not look robotic.
- [ ] Add local avoidance so enemies do not stack.
- [ ] Add “unstuck” behavior if an enemy fails to progress.
- [ ] Add debug overlay for current path and next waypoint.

### 9.3 Enemy Roles
- [ ] Assault enemies should push player position and use cover if available.
- [ ] Snipers should seek long sight lines, telegraph shots, and relocate after firing.
- [ ] Flankers should choose side routes and attack from angles, not simply move sideways.
- [ ] Heavies should act as pressure units with shield/armor facing and slow suppression fire.
- [ ] Captains should buff nearby enemies, call reinforcements, or maintain alarm systems.
- [ ] Add Medic/Engineer enemy that repairs props, heals allies, or re-locks doors.
- [ ] Add Drone enemy that patrols quickly and raises alert without heavy damage.
- [ ] Add Shield Trooper that forces player repositioning.

### 9.4 Enemy Combat Behavior
- [ ] Enemies should have reaction time rather than instant perfect aim.
- [ ] Add accuracy affected by distance, movement, suppression, and alert state.
- [ ] Add reload animations/telegraphs.
- [ ] Add burst-fire patterns by role.
- [ ] Add grenade-throwing enemy later, with clear telegraph.
- [ ] Add retreat behavior for wounded non-heavy enemies.
- [ ] Add regroup behavior around captain or alarm panels.

### 9.5 Boss / Captain Improvement
- [x] Captain command unit exists as mission-critical enemy.
- [ ] Give captain a dedicated boss-style health bar.
- [ ] Give captain unique abilities: command pulse, reinforcement call, shield boost, door lockdown.
- [ ] Captain should attempt to retreat toward command room when wounded.
- [ ] Captain death should disable reinforcements or reduce enemy morale.
- [ ] Captain arena should have special visual treatment.
- [ ] Add unique death animation and mission log update.

### 9.6 AI Debugging & Portfolio Value
- [ ] Add debug labels for enemy state, target, path, suspicion, and weapon cooldown.
- [ ] Add toggle for vision cones.
- [ ] Add toggle for hearing/noise radii.
- [ ] Add toggle for cover points.
- [ ] Add toggle for nav grid / path nodes.
- [ ] Add a README section explaining the AI architecture with screenshots.

---

## 10. STEALTH, VISION & ALERT DESIGN

This is one of the game’s strongest identity hooks. It should become a defining feature.

### 10.1 Visibility Readability
- [x] Tactical visibility exists.
- [x] Hidden/searching/detected alert states exist.
- [ ] Never allow darkness to hide critical geometry near the player.
- [ ] Add minimum ambient visibility floor.
- [ ] Add player flashlight/scan cone with soft edges.
- [ ] Add recently seen enemies as fading silhouettes.
- [ ] Add enemy flashlights or scanning cones.
- [ ] Add occlusion mask that respects walls and closed doors.
- [ ] Add visibility quality setting.

### 10.2 Detection Model
- [ ] Add enemy suspicion meter over time instead of instant detection.
- [ ] Player sprinting/firing/hacking generates different noise levels.
- [ ] Corpses or destroyed props should increase suspicion if discovered.
- [ ] Lights, cameras, or sensors should affect detection later.
- [ ] Add “soft detection” state where enemies investigate but do not know exact position.
- [ ] Add “hard detection” when line of sight is maintained long enough or player fires loud weapon.

### 10.3 Noise System
- [ ] Make every noisy action emit a visible debug noise radius.
- [ ] Slow walk emits almost no noise.
- [ ] Dash emits moderate noise.
- [ ] Rifle/scattergun/rail piercer emit large noise pulses.
- [ ] Grenades and barrels trigger global alert or sector-wide suspicion.
- [ ] Doors opening and terminals hacking emit small local noise.
- [ ] Add environmental noise masking later: vents, machinery, alarm sirens.

### 10.4 Alert State Evolution
- [ ] Hidden: low ambient tension, cool lighting, patrol behavior.
- [ ] Suspicious: local enemy investigation, amber UI, partial emergency lights.
- [ ] Searching: enemies move to last known position and sweep rooms.
- [ ] Detected: red emergency lights, combat AI, minimap enemy pings.
- [ ] Lockdown: optional higher state where doors close and reinforcements arrive.
- [ ] Add smooth transitions and audio cues between states.

### 10.5 Stealth Rewards
- [ ] Add stealth score at end of sector.
- [ ] Add bonus for never triggering Detected.
- [ ] Add bonus for silent takedowns.
- [ ] Add bonus for avoiding civilian/neutral systems if added later.
- [ ] Add reward choices that favor stealth builds.
- [ ] Add unlockable stealth-focused weapons/tools.

---

## 11. MISSION DESIGN & TACTICAL OBJECTIVES

The current mission loop is already better than “kill all enemies.” Build on that.

### 11.1 Objective Variety
- [x] Hack terminals.
- [x] Open doors.
- [x] Neutralize command target.
- [x] Extract.
- [ ] Add optional secondary objectives: collect intel, destroy server rack, rescue asset, plant beacon.
- [ ] Add timed objective: hack before reinforcements arrive.
- [ ] Add stealth objective: avoid detection until terminal hacked.
- [ ] Add sabotage objective: disable cameras/alarms.
- [ ] Add courier objective: carry data core to extraction, limiting weapon use or dash.
- [ ] Add power reroute objective: open one door but lock another.

### 11.2 Level-Specific Mission Themes
- [ ] Sector 1: Training breach / Security Wing — basic terminal + captain.
- [ ] Sector 2: Data Vault — multiple terminals and locked rooms.
- [ ] Sector 3: Reactor Hall — environmental hazards and overheating machinery.
- [ ] Sector 4: Cryo Lab — visibility fog and dormant enemies.
- [ ] Sector 5: Command Core — captain boss, reinforcements, lockdown.
- [ ] Sector 6: Exterior Extraction — final sprint with waves of enemies.

### 11.3 Dynamic Objectives
- [ ] If player triggers alarm early, add optional “disable alarm panel” objective.
- [ ] If captain escapes to command room, add “prevent lockdown” objective.
- [ ] If barrel explosion damages server room, add “recover backup drive” objective.
- [ ] If player stays hidden, unlock alternate quiet extraction.
- [ ] If player goes loud, spawn reinforcement wave but allow combat bonus rewards.

### 11.4 Mission Scoring
- [ ] Track completion time.
- [ ] Track damage taken.
- [ ] Track shots fired and accuracy.
- [ ] Track stealth state: never detected / briefly detected / full combat.
- [ ] Track enemies killed vs bypassed.
- [ ] Track optional objectives completed.
- [ ] Generate rank: S, A, B, C.
- [ ] Save best rank per sector.

---

## 12. PHYSICS, COLLISION & NAVIGATION

The game needs robust collision and hit detection to feel professional.

### 12.1 Projectile Reliability
- [x] Replace high-speed projectile overlap with segment/raycast hit detection.
- [x] Use previous position → current position sweep for bullets.
- [ ] Rail Piercer should use immediate raycast or swept beam logic.
- [x] Projectiles should not tunnel through thin walls/enemies at low frame rate.
- [ ] Add debug overlay showing projectile rays and hits.
- [ ] Add test level for projectile collision edge cases.

### 12.2 Actor Collision
- [ ] Improve sliding along walls.
- [ ] Prevent enemies from pushing player through geometry.
- [ ] Add actor separation for enemies.
- [ ] Add body-size differences per enemy role that matter tactically.
- [ ] Add soft avoidance around explosive barrels so AI does not accidentally destroy itself unless intended.
- [ ] Ensure closed doors block movement and line-of-sight consistently.

### 12.3 Cover System
- [x] Add explicit cover points generated from walls/props.
- [ ] Score cover based on line-of-sight break, distance, flank exposure, and enemy role.
- [ ] Snipers prefer long-range cover.
- [ ] Assault enemies prefer mid-range cover.
- [ ] Wounded enemies prefer safe retreat cover.
- [ ] Cover points should update when props are destroyed.
- [ ] Debug overlay should show cover point quality.

### 12.4 Grenade Physics
- [ ] Tune grenade throw arc/speed to feel predictable.
- [ ] Add visible landing marker while aiming grenade.
- [ ] Add fuse indicator on grenade sprite.
- [ ] Add bounce sounds and reduced bounce energy.
- [x] Add explosion line-of-sight damage validation.
- [ ] Add grenade warning indicator for player/enemies.

### 12.5 Pathfinding
- [ ] Add walkability grid derived from level geometry.
- [ ] Implement A* pathfinding for enemy navigation.
- [ ] Cache paths where possible.
- [ ] Rebuild/revalidate grid when doors open or props destroyed.
- [ ] Add path smoothing.
- [ ] Add local avoidance.
- [ ] Consider EasyStar.js only if custom pathfinding becomes too much; otherwise implement lightweight A* internally.

---

## 13. AUDIO & SOUNDSCAPE

The game already uses generated audio, but it needs more identity, mixing, and atmosphere.

### 13.1 Procedural SFX Upgrade
- [ ] Unique fire sound for each weapon.
- [ ] Unique enemy weapon sounds by role.
- [ ] Distinct reload sounds for light/medium/heavy weapons.
- [ ] Dash sound with whoosh + low thump.
- [ ] Terminal hack progress blips and completion chime.
- [ ] Door unlock/open/close sounds.
- [ ] Pickup sounds differentiated by med/ammo/grenade.
- [ ] Armor hit vs health hit sounds.
- [ ] Enemy death sounds by role.
- [ ] Captain death command-signal collapse sound.

### 13.2 Ambient Soundscape
- [ ] Add low blacksite hum in gameplay.
- [ ] Add distant machinery loops per sector theme.
- [ ] Add subtle electrical buzz near terminals.
- [ ] Add alarm siren layer during Detected.
- [ ] Add muffled heartbeat layer at low health.
- [ ] Add extraction zone engine/uplink hum when available.
- [ ] Fade ambient layers smoothly between alert states.

### 13.3 Music System
- [ ] Add simple adaptive music layers: stealth layer, search layer, combat layer, extraction layer.
- [ ] Combat layer fades in during Detected.
- [ ] Music ducks briefly during explosions and captain death.
- [ ] Add sector clear sting.
- [ ] Add game over sting.
- [ ] Keep architecture ready for imported OGG/MP3 later.

### 13.4 Audio Mixing
- [ ] Add master gain, music gain, SFX gain, and UI gain.
- [ ] Add limiter/compressor to prevent clipping.
- [ ] Add voice caps for rapid-fire weapons/explosions.
- [ ] Add stereo panning based on screen position.
- [ ] Add low-pass filtering under pause menu or near-death state.
- [ ] Add mute-on-blur option.

---

## 14. CONTENT & LEVEL DESIGN

The game needs a polished vertical slice more than it needs endless unfinished levels.

### 14.1 Level Design Principles
- [ ] Every level should have a clear stealth path and a clear combat path.
- [ ] Every level should have at least one tactical decision around doors/terminals.
- [ ] Every level should have at least one explosive opportunity.
- [ ] Every level should have at least one enemy patrol route the player can read and exploit.
- [ ] Every level should have a memorable set-piece.
- [ ] Every level should teach or test one primary mechanic.

### 14.2 Sector 1 Polish Pass
- [ ] Make Sector 1 a perfect tutorial-quality vertical slice.
- [ ] Add clear first terminal objective near player.
- [ ] Add one patrol enemy that demonstrates stealth.
- [ ] Add one explosive barrel opportunity.
- [ ] Add one locked door route and one longer alternate route.
- [ ] Add captain encounter that teaches final objective requirement.
- [ ] Add extraction zone in a visually satisfying location.

### 14.3 Additional Sectors
- [ ] Sector 2: Data Vault — tighter rooms, more terminals, more snipers.
- [ ] Sector 3: Reactor Hall — hazards, barrels, heat vents, heavies.
- [ ] Sector 4: Cryo Lab — fog/vision modifiers, dormant enemies, stealth emphasis.
- [ ] Sector 5: Command Core — captain boss and reinforcements.
- [ ] Sector 6: Extraction Run — escape under full alert after completing objective.

### 14.4 Tiled / Real Asset Pipeline
- [ ] Decide whether to use Tiled maps for production levels.
- [ ] Create `assets/tilesets/` convention.
- [ ] Add tile collision layer support.
- [ ] Add object layer support for spawn points, terminals, doors, pickups, props, patrol points, extraction.
- [ ] Document Tiled workflow in `ASSETS.md` or `LEVEL_DESIGN.md`.
- [ ] Keep current data-driven levels as fallback/debug levels.

### 14.5 Encounter Design
- [ ] Add hand-authored enemy groups.
- [ ] Add patrol timing variety.
- [ ] Add enemy role combinations: sniper + assault, heavy + flanker, captain + guards.
- [ ] Add optional silent route around hard combat encounters.
- [ ] Add alarm-triggered reinforcement closets/doors.
- [ ] Add “breach room” set-piece with multiple entry angles.

---

## 15. PROGRESSION, SCORING & REPLAYABILITY

For a portfolio prototype, light progression is enough. It should add replay value without derailing scope.

### 15.1 Sector Scoring
- [ ] Add sector score based on time, stealth, damage taken, objectives, accuracy, and style.
- [ ] Add rank badges S/A/B/C.
- [ ] Add best score saved to localStorage.
- [ ] Add best stealth rank saved per sector.
- [ ] Add best completion time saved per sector.
- [ ] Add score summary screen after extraction.

### 15.2 Run Rewards
- [ ] Add reward choice after sector completion.
- [ ] Rewards can modify weapons, armor, dash, grenades, stealth, hacking, or pickups.
- [ ] Make rewards data-driven.
- [ ] Add rarity tiers: Common, Uncommon, Rare, Prototype.
- [ ] Add simple card-style reward UI.
- [ ] Add reroll option later.

### 15.3 Tactical Build Archetypes
- [ ] Stealth build: lower noise, faster hacking, better pistol/takedown.
- [ ] Assault build: more armor, rifle stability, faster reload.
- [ ] Breacher build: better grenades, scattergun, door explosives.
- [ ] Tech build: terminal hacks disable enemies, reveal map, open routes.
- [ ] Marksman build: Rail Piercer, crits, penetration, sniper counterplay.

### 15.4 Meta Progression
- [ ] Keep meta-progression light at first.
- [ ] Add unlockable sector modifiers after finishing campaign once.
- [ ] Add challenge mode with fixed seed.
- [ ] Add daily/weekly seed only if project remains active.
- [ ] Add achievement badges for GitHub screenshots: Silent Breach, No Damage, Captain Down, Full Clear.

---

## 16. PERFORMANCE & TECHNICAL POLISH

Polish means the game remains smooth and stable as effects increase.

### 16.1 Rendering Performance
- [ ] Use Phaser containers/layers deliberately to avoid excessive depth sorting.
- [ ] Pool particles, projectiles, floating texts, and muzzle flashes.
- [x] Avoid creating/destroying debug text every frame.
- [ ] Cache static level geometry into a render texture if needed.
- [ ] Add graphics quality presets that reduce particles/lights/shadows.
- [ ] Measure FPS and object counts in debug overlay.

### 16.2 Object Pooling
- [ ] Add `Pool<T>` utility.
- [ ] Pool Projectile instances.
- [ ] Pool FloatingText instances.
- [ ] Pool particle bursts.
- [ ] Pool temporary debug markers.
- [ ] Document pool lifecycle and reset rules.

### 16.3 Memory & Garbage Collection
- [ ] Avoid per-frame allocation in hot AI loops.
- [ ] Reuse vectors where practical.
- [ ] Avoid repeated arrays in line-of-sight checks if possible.
- [ ] Avoid creating Phaser Text objects every frame.
- [ ] Add optional dev counter for allocations or object creation.

### 16.4 Build & Deployment
- [x] Verify clean `npm install` and `npm run build`.
- [ ] Add GitHub Actions deploy to Pages.
- [ ] Add production build badge to README.
- [ ] Add live demo link once deployed.
- [ ] Ensure Vite `base` is compatible with GitHub Pages.
- [ ] Add `docs/screenshots` and `docs/gifs` folders.

### 16.5 Save / Load
- [ ] Save settings to localStorage.
- [ ] Save best scores/ranks to localStorage.
- [ ] Save completed sectors.
- [ ] Add reset progress button.
- [ ] Consider mid-sector save only if the game grows into longer sessions.

---

## 17. ACCESSIBILITY & SETTINGS

Accessibility also makes the project look more professional.

### 17.1 Visual Accessibility
- [ ] Colorblind mode: distinguish enemies/weapons/objectives with shape and icon differences.
- [ ] High contrast mode.
- [ ] Reduce motion mode.
- [ ] Screen shake slider.
- [ ] Flash intensity slider.
- [ ] UI scale options.
- [ ] Minimap scale options.
- [ ] Persistent objective text clarity.

### 17.2 Controls
- [ ] Rebindable keyboard controls.
- [ ] Mouse sensitivity/aim offset settings.
- [ ] Toggle vs hold slow-walk option.
- [ ] Toggle vs hold interact option.
- [ ] Controller support later if worth it.
- [ ] Touch controls only if mobile becomes a goal.

### 17.3 Audio Accessibility
- [ ] Subtitles or event captions for important sounds: ALARM, SNIPER AIMING, GRENADE, DOOR UNLOCKED.
- [ ] Separate sliders for Master, Music, SFX, UI.
- [ ] Visual alert cues for players who mute audio.
- [ ] Optional reduced harsh-sound mode.

### 17.4 Difficulty Accessibility
- [ ] Difficulty presets: Recruit, Operator, Blacksite.
- [ ] Assist toggles: slower enemy reaction, more health, more ammo, larger interaction range.
- [ ] Separate “Portfolio Demo Mode” that makes the first sector easy and cinematic for reviewers.
- [ ] Make difficulty transparent and not hidden.

---

## 18. GITHUB PORTFOLIO PRESENTATION

This section is critical. The repository should communicate professionalism before anyone even runs the game.

### 18.1 README Upgrade
- [ ] Add hero banner image.
- [ ] Add animated gameplay GIF near the top.
- [ ] Add live demo link.
- [ ] Add clear “Why this project is impressive” section.
- [ ] Add “Architecture highlights” section with bullet points.
- [ ] Add “Systems demonstrated” section: AI, visibility, weapons, missions, UI, Phaser architecture.
- [ ] Add short code snippets from the best systems.
- [ ] Add roadmap with checked/unchecked items.
- [ ] Add “Current status: Playable prototype / vertical slice” label.

### 18.2 Screenshots & GIFs
- [ ] Capture title screen.
- [ ] Capture stealth visibility moment.
- [ ] Capture emergency combat moment.
- [ ] Capture grenade/barrel explosion.
- [ ] Capture terminal hacking / door opening.
- [ ] Capture sector clear screen.
- [ ] Capture debug overlay showing AI/vision/pathing once improved.

### 18.3 Documentation Expansion
- [x] README exists.
- [x] ARCHITECTURE exists.
- [x] ASSETS exists.
- [x] CONTROLS exists.
- [ ] Add `GAME_DESIGN.md` describing the design pillars.
- [ ] Add `AI_DESIGN.md` explaining enemy states and future pathfinding.
- [ ] Add `LEVEL_DESIGN.md` explaining level data and Tiled workflow.
- [ ] Add `ROADMAP.md` or use this document as roadmap.
- [ ] Add `CHANGELOG.md` once development continues.

### 18.4 Code Review Impression
- [ ] Ensure no generated/temporary comments remain.
- [ ] Ensure no unused files remain.
- [ ] Ensure names are professional and consistent.
- [ ] Ensure imports are clean.
- [ ] Ensure README instructions work from a fresh clone.
- [ ] Ensure the first screen looks impressive within 3 seconds.
- [ ] Ensure the first sector demonstrates the best mechanics within 60 seconds.

### 18.5 Public Repository Strategy
- [ ] Keep repository public only after build and README are polished.
- [ ] Add topic tags: `phaser`, `typescript`, `game-development`, `top-down-shooter`, `stealth-game`, `vite`.
- [ ] Add GitHub Pages demo.
- [ ] Pin repository on profile.
- [ ] Add short LinkedIn/GitHub profile description linking to the project.
- [ ] Avoid overclaiming; call it a polished prototype / vertical slice, not a finished commercial game.

---

## IMPLEMENTATION PRIORITY ORDER

### Phase 2 — Professional Hardening
1. Fix TypeScript casts and event typing.
2. Reduce GameScene responsibility.
3. Add clean system lifecycle cleanup.
4. Replace fast projectile overlap with swept/raycast hit detection.
5. Improve debug rendering so it does not allocate text every frame.
6. Remove or wire unused systems/events.
7. Confirm clean build from fresh clone.
8. Add GitHub Actions check.

### Phase 3 — Visual Identity Pass
1. Upgrade generated sprites into multi-part procedural silhouettes.
2. Add dynamic lighting layer.
3. Add stronger floor/wall/door/terminal visuals.
4. Add weapon-specific projectile trails and muzzle flashes.
5. Add explosion shockwaves, smoke, debris, and light.
6. Add alert-state lighting: stealth cyan, search amber, detected red.
7. Add title screen animation.
8. Add screenshots/GIFs to README.

### Phase 4 — Tactical Gameplay Depth
1. Add reliable enemy pathfinding.
2. Add suspicion meter and richer detection model.
3. Add better cover selection and role-specific tactics.
4. Add captain abilities and boss-style presentation.
5. Add stealth rewards and end-of-sector rating.
6. Add weapon upgrades/reward choices.
7. Add optional secondary objectives.
8. Add polished Sector 1 vertical slice.

### Phase 5 — Content Expansion
1. Create 3–5 polished sectors.
2. Add sector themes and environmental hazards.
3. Add new enemy roles: Drone, Shield Trooper, Engineer/Medic.
4. Add new tactical tools: EMP, smoke, flashbang, thermite.
5. Add reward card system.
6. Add scoring and best-rank persistence.
7. Add sector select screen.
8. Add final command-core mission.

### Phase 6 — Portfolio Finalization
1. Add live GitHub Pages demo.
2. Add gameplay GIFs and screenshots.
3. Add GAME_DESIGN, AI_DESIGN, and LEVEL_DESIGN docs.
4. Add accessibility/settings screen.
5. Add audio mixer and quality presets.
6. Add polished main menu and sector clear screens.
7. Add README architecture highlights.
8. Pin repo on GitHub profile.

---

## TOP 20 “TRUE GEM” TASKS

If development time is limited, prioritize these. They will produce the strongest portfolio impact.

1. Make Sector 1 a polished vertical slice with perfect pacing.
2. Add dynamic lighting and alert-state color grading.
3. Replace simple generated shapes with multi-part procedural sprites.
4. Add reliable projectile raycast/sweep collision.
5. Add enemy pathfinding and debug path overlay.
6. Add suspicion meter instead of binary detection.
7. Add captain boss presentation and unique abilities.
8. Add weapon-specific recoil, trails, muzzle flashes, and sound.
9. Add grenade landing marker and improved explosion effects.
10. Add end-of-sector ranking screen.
11. Add reward/upgrade choice screen after sector clear.
12. Add a sector select tactical map.
13. Add strong title screen animation.
14. Add screenshots and GIFs to README.
15. Add GitHub Pages live demo.
16. Add GitHub Actions build validation.
17. Add typed event bus and remove unsafe casts.
18. Add debug overlay that shows AI, vision, paths, and noise.
19. Add settings: audio, motion, contrast, shake.
20. Add `GAME_DESIGN.md`, `AI_DESIGN.md`, and `LEVEL_DESIGN.md`.

---

## SUGGESTED VERTICAL SLICE TARGET

Before expanding the whole game, make one unforgettable slice.

### Vertical Slice Goal

One polished 8–12 minute sector that demonstrates:

- stealth approach
- patrol reading
- terminal hacking
- locked door decision
- destructible cover
- explosive barrel opportunity
- enemy search behavior
- emergency full-combat alert
- captain fight
- extraction
- sector score/rank

### Vertical Slice Acceptance Criteria

- [ ] First-time player understands objective within 10 seconds.
- [ ] First enemy patrol is readable and fair.
- [ ] First terminal is easy to find.
- [ ] First combat encounter feels satisfying.
- [ ] Player sees the difference between stealth and alert states.
- [ ] At least one explosion moment feels impressive.
- [ ] Captain encounter feels like a climax.
- [ ] Extraction feels rewarding.
- [ ] Sector clear screen makes the player want to replay for a better rank.
- [ ] README GIF can be captured from this sector and look impressive.

---

## KNOWN LIMITATIONS TO TRACK HONESTLY

These are not failures. They are professional roadmap items.

- [ ] Placeholder art is not final.
- [ ] Enemy navigation is not yet robust enough for complex maze-like layouts.
- [x] Projectile hit detection now uses swept collision for high-speed shots.
- [ ] GameScene still owns too much orchestration.
- [ ] There is no real progression loop yet.
- [ ] There is no sector scoring yet.
- [ ] There is no live demo link yet.
- [ ] There are no screenshots/GIFs yet.
- [ ] Accessibility/settings are not yet complete.

---

## DOCUMENT VERSION

*Document version: 1.0 — 2026-04-25*  
*Target project: BREACH VECTOR: BLACKSITE*  
*Estimated improvement items: 250+ discrete tasks across 18 categories.*
