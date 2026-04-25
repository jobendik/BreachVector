You are an elite senior TypeScript game developer, Phaser 3 expert, gameplay systems architect, technical artist, UI/UX designer, and codebase refactoring specialist.

Your task is to transform my existing single-file HTML top-down tactical shooter prototype, currently called “Breach Vector”, into a professional, modular, maintainable, impressive Phaser 3 + TypeScript game project.

This project is intended to become one of the strongest gems in my GitHub portfolio. The code should impress experienced developers who read it. The game should also be genuinely playable, visually appealing, extensible, and easy to improve with real assets later.

============================================================
HIGH-LEVEL GOAL
============================================================

Take the existing single-file Canvas/HTML/JavaScript prototype and rebuild it as a professional Phaser 3 TypeScript project.

The result should feel like a serious browser game prototype, not a toy demo.

The final project must demonstrate:

- Excellent TypeScript architecture
- Professional file/folder structure
- Clean separation of scenes, entities, systems, data, UI, and utilities
- Phaser 3 best practices
- Data-driven weapons, enemies, levels, pickups, doors, terminals, and mission objectives
- A polished top-down tactical action game loop
- Strong game feel: screen shake, hit feedback, particles, muzzle flashes, explosions, responsive movement
- Tactical stealth/combat readability
- Asset-ready design so placeholder shapes can later be replaced by sprites, sprite sheets, tilesets, sound files, and real UI assets
- A codebase that is easy for another developer to understand and extend

This should not merely “wrap the old code in modules”. Rebuild it properly around Phaser’s strengths.

============================================================
TECH STACK REQUIREMENTS
============================================================

Use:

- Vite
- TypeScript
- Phaser 3
- Modern ES modules
- Strict TypeScript where practical
- No React
- No Vue
- No Angular
- No unnecessary framework
- No backend
- No external art assets required
- No build system beyond Vite
- No fake CDN dependency inside game code
- No monolithic single-file architecture

The game should run with:

npm install
npm run dev

And build with:

npm run build

The production build should be suitable for GitHub Pages later.

============================================================
IMPORTANT STARTING POINT
============================================================

The current prototype is a single HTML file containing:

- Canvas rendering
- Player movement
- Mouse aiming
- Multiple weapons
- Projectiles
- Grenades
- Enemies
- Enemy roles
- Enemy patrol/search/attack/flank/cover behavior
- Stealth visibility
- Emergency lighting
- Terminals
- Doors
- Pickups
- Destructible props
- Explosive barrels
- Mission objectives
- Extraction
- HUD
- Minimap
- Particles
- Sound effects generated in code
- Multiple levels

Use the current prototype as the design reference, but rebuild it cleanly in Phaser.

Do not lose the gameplay identity.

The game is a top-down tactical shooter / stealth-action prototype inspired by games such as:

- Hotline Miami, for top-down lethal combat energy
- Monaco, for visibility/stealth readability
- SYNTHETIK / Nuclear Throne, for weapon feel and feedback
- Door Kickers / tactical breach fantasy, for mission language
- Hades/Balatro-level readability and polish as a visual inspiration, not gameplay cloning

Do not copy any copyrighted assets or exact protected game content. The game must remain its own original project.

============================================================
CORE GAME IDENTITY
============================================================

Working title:

BREACH VECTOR: BLACKSITE

Elevator pitch:

A neon tactical top-down shooter where the player infiltrates hostile blacksites, hacks security terminals, opens locked doors, neutralizes command units, survives enemy patrols, and extracts under escalating alert conditions.

Core fantasy:

The player is a fast, precise, tactical operator breaching high-security facilities. The game alternates between tense stealth navigation and explosive emergency combat.

Core loop:

1. Enter sector
2. Stay hidden or engage enemies
3. Hack terminals
4. Open security doors
5. Collect ammo/medkits/grenades
6. Destroy cover/barrels tactically
7. Neutralize command target
8. Extract
9. Advance to next sector

============================================================
PROJECT STRUCTURE REQUIREMENTS
============================================================

Create a professional file/folder structure similar to this, adjusting only where genuinely beneficial:

src/
  main.ts
  game/
    config.ts
    constants.ts
    events.ts
    types.ts
    registry.ts
  scenes/
    BootScene.ts
    PreloadScene.ts
    MenuScene.ts
    GameScene.ts
    UIScene.ts
    PauseScene.ts
    GameOverScene.ts
    VictoryScene.ts
  data/
    weapons.ts
    enemies.ts
    levels.ts
    pickups.ts
    missionText.ts
  entities/
    Actor.ts
    Player.ts
    Enemy.ts
    Projectile.ts
    Grenade.ts
    Door.ts
    Terminal.ts
    Pickup.ts
    Prop.ts
    ExtractionZone.ts
  systems/
    InputSystem.ts
    WeaponSystem.ts
    CombatSystem.ts
    EnemyAISystem.ts
    VisionSystem.ts
    MissionSystem.ts
    AlertSystem.ts
    EffectsSystem.ts
    AudioSystem.ts
    CollisionSystem.ts
    MinimapSystem.ts
  ui/
    HUD.ts
    HealthArmorPanel.ts
    WeaponPanel.ts
    ObjectivePanel.ts
    AlertPanel.ts
    TacticalLog.ts
    Minimap.ts
  effects/
    MuzzleFlash.ts
    ExplosionEffect.ts
    HitMarker.ts
    FloatingText.ts
    ScreenEffects.ts
  utils/
    math.ts
    geometry.ts
    colors.ts
    debug.ts
  assets/
    README.md
  styles/
    global.css

Also include:

index.html
package.json
tsconfig.json
vite.config.ts
README.md
ASSETS.md
CONTROLS.md
ARCHITECTURE.md

The exact structure may vary slightly, but the final result must be professional, clear, and easy to navigate.

============================================================
PHASER ARCHITECTURE REQUIREMENTS
============================================================

Use Phaser properly.

Required scenes:

1. BootScene
   - Minimal startup.
   - Set up global configuration if needed.

2. PreloadScene
   - Load assets.
   - Since no real art assets are available yet, generate placeholder textures using Phaser Graphics where appropriate.
   - Do not depend on missing external assets.
   - Prepare simple generated textures for:
     - player
     - enemy assault
     - enemy sniper
     - enemy flanker
     - enemy heavy
     - enemy captain
     - bullets
     - grenades
     - terminals
     - doors
     - crates
     - barrels
     - pickups
     - extraction zone
     - particles / muzzle flashes if needed

3. MenuScene
   - Professional title screen.
   - Strong visual presentation.
   - Start button.
   - Controls summary.
   - Short design/mission briefing.
   - Should look like a polished game menu, not plain HTML.

4. GameScene
   - Main gameplay.
   - Owns world entities, collision, camera, input, level loading, mission state, AI, projectiles, grenades, props, doors, terminals, pickups, visibility, and effects.

5. UIScene
   - Runs alongside GameScene.
   - HUD should not be hard-coded into GameScene.
   - Displays health, armor, dash, weapon, ammo, grenades, objectives, alert state, tactical log, and minimap.

6. PauseScene
   - Pause overlay.
   - Resume/restart/menu options.

7. GameOverScene
   - Game over screen.
   - Restart sector.

8. VictoryScene
   - Campaign complete / sector complete flow.
   - Allow next sector or return to menu.

Use Phaser Scene events or a typed event bus for communication between GameScene and UIScene.

Avoid circular dependencies.

============================================================
GAMEPLAY FEATURES TO PRESERVE AND IMPROVE
============================================================

The Phaser version must preserve and improve these systems:

PLAYER

- Top-down movement with WASD
- Mouse aim
- Responsive acceleration/deceleration
- Dash with cooldown
- Slow walk / stealth movement with Shift
- Health
- Armor
- Grenades
- Weapon switching
- Reloading
- Interaction with E
- Optional melee/takedown with F
- Clear visual facing direction
- Clear weapon muzzle direction

WEAPONS

Implement at least four weapons, data-driven:

1. Silenced Pistol
   - Low noise
   - Good accuracy
   - Low fire rate
   - Good stealth weapon

2. Pulse Rifle
   - Main automatic weapon
   - Medium noise
   - Medium spread
   - Reliable combat weapon

3. Scattergun
   - Close-range burst weapon
   - Multiple pellets
   - High knockback / feedback
   - Loud

4. Rail Piercer
   - Slow, powerful, piercing shot
   - Very loud
   - Strong visual trail
   - Limited ammo

Each weapon should have data for:

- id
- displayName
- magazineSize
- reserveAmmo
- fireRate
- reloadTime
- damage
- projectileSpeed
- spread
- projectileCount
- color
- noiseRadius
- recoil
- screenShake
- pierce
- automatic / semiAutomatic

The WeaponSystem should handle:

- Firing
- Ammo
- Reloading
- Fire cooldown
- Weapon switching
- Projectile spawning
- Muzzle flash
- Recoil feedback
- Tactical noise emission

Do not duplicate weapon logic inside Player.

ENEMIES

Implement enemy roles:

1. Assault
   - Balanced soldier
   - Patrols
   - Attacks directly

2. Sniper
   - Long view distance
   - Narrow FOV
   - Slow fire rate
   - High damage
   - Prefers distance

3. Flanker
   - Faster
   - Attempts side movement
   - Lower health
   - Shotgun/burst style weapon

4. Heavy
   - Slow
   - High health
   - Armor/shield behavior
   - Dangerous up close
   - Strong visual silhouette

5. Captain / Command Unit
   - Mission-critical target
   - Stronger than normal enemies
   - Required to kill before extraction
   - Distinct visual treatment

Enemy behavior should include:

- Patrol
- Guard
- Search
- Attack
- Flank
- Seek cover
- Reload
- Investigate noise
- React to seeing player
- Alert other enemies indirectly through global alert state
- Maintain last known player position

The enemy AI should be clear, modular, and readable.

Suggested implementation:

- Enemy class owns body/sprite/state data.
- EnemyAISystem updates enemies.
- Use an EnemyState enum:
  - Guard
  - Patrol
  - Suspicious
  - Search
  - Attack
  - Flank
  - Cover
  - Reload
  - Dead

Do not create a huge over-engineered behavior tree unless you keep it simple and readable.

VISION / STEALTH

Implement tactical visibility.

When the player is hidden:

- The world should be darker.
- The player should have a visible sight area / vision cone or radial visibility area.
- Enemies outside visible range should be dimmed or hidden unless recently detected.
- The stealth state should be readable and not frustrating.

When the player is detected:

- Emergency lighting comes on.
- The level becomes more readable.
- Alert UI turns red/orange.
- Enemies know or search for the player.
- Combat visibility improves.

Line-of-sight should account for walls/doors/solid props.

Do not let darkness make the game impossible to play. The prototype had a bug/weakness where the player sometimes could not see enough. Fix this. The game should be atmospheric but always playable.

MISSION SYSTEM

Create a MissionSystem.

Mission objectives:

- Hack required terminals
- Open locked doors
- Neutralize command target
- Reach extraction zone

The mission system should:

- Track objective completion
- Emit typed events to the HUD
- Update objective panel
- Trigger sector complete when extraction is reached and objectives are done
- Support multiple levels

LEVELS

Level data should be in src/data/levels.ts.

Do not hard-code level geometry inside GameScene.

Each level should include:

- id
- name
- dimensions
- spawn point
- extraction zone
- walls
- doors
- terminals
- props
- pickups
- enemies
- requiredTerminalIds
- requiresCaptainKill

Implement at least two levels based on the prototype.

The level format should be easy to edit by hand.

COLLISION

Use Phaser Arcade Physics where appropriate, but keep the architecture clean.

Required collision behavior:

- Player collides with walls, closed doors, solid props
- Enemies collide with walls, closed doors, solid props
- Projectiles collide with walls/doors/props
- Projectiles damage enemies/player
- Grenades bounce or stop sensibly
- Explosions damage actors within radius if line-of-sight is valid
- Pickups trigger on overlap
- Terminals trigger on interaction range
- Extraction triggers on overlap only when mission allows extraction

Do not create fragile manual collision code everywhere. Centralize important rules in CollisionSystem or equivalent.

PROPS

Implement destructible props:

- Crates
- Barrels

Crates:

- Solid cover
- Destructible
- Block line-of-sight if appropriate

Barrels:

- Explosive
- Destructible
- Explosion damages nearby actors/props
- Chain reactions should work if practical

PROJECTILES

Projectile system must support:

- Owner/team
- Damage
- Speed
- Direction
- Piercing
- Lifetime
- Impact effects
- Hit detection
- Bullet trails / tracer visuals
- Distinct visuals per weapon

GRENADES

Grenades should:

- Be thrown toward cursor
- Have fuse time
- Bounce or slide
- Explode
- Damage enemies/player
- Trigger barrels
- Create strong visual/audio feedback
- Emit noise

PICKUPS

Implement pickups:

- Medkit
- Ammo
- Grenade

Data-driven where possible.

UI / HUD

The HUD should look professional and tactical.

Must include:

- Health bar
- Armor bar
- Dash/stamina cooldown
- Weapon name
- Ammo / reserve ammo
- Reload state
- Grenade count
- Objective checklist
- Alert state
- Tactical log
- Minimap
- Contextual interaction prompt

HUD should be implemented in UIScene and/or ui/ classes, not directly inside GameScene rendering logic.

The HUD should update via events, not constant DOM manipulation.

Use Phaser text/graphics UI. Do not use HTML UI unless there is a strong reason.

VISUAL STYLE

The game should look significantly more polished than the original.

Style:

- Dark tactical sci-fi
- Neon cyan, green, amber, red, violet highlights
- High contrast
- Clean readable silhouettes
- Grid/floor details
- Wall outlines
- Soft glows
- Emergency red light during detection
- Muzzle flashes
- Bullet tracers
- Explosion particles
- Floating damage numbers
- Tactical scanline/noise effects if easy
- Smooth camera follow
- Camera shake
- Hit flashes
- Low-health vignette or overlay

Use placeholder generated graphics, but make them look intentional.

The visual design should say:

“This is an abstract tactical prototype with strong art direction.”

Not:

“These are random circles and rectangles.”

AUDIO

Implement an AudioSystem.

No external audio files are required.

Generate procedural sounds using Web Audio or Phaser sound where practical:

- Weapon shots
- Enemy shots
- Reload
- Explosion
- Hit
- Dash
- Terminal hack
- Pickup
- Alert change
- Mission complete

The system should be optional/failsafe if browser audio context is blocked until user interaction.

INPUT

Controls:

- WASD: move
- Mouse: aim
- Left mouse: fire
- Right mouse: grenade
- R: reload
- Space: dash
- Shift: slow walk
- E: interact
- F: takedown/melee, if implemented
- 1-4: switch weapons
- Tab or F1: debug overlay
- Esc: pause

Input should be centralized in InputSystem or GameScene input binding.

CAMERA

Use Phaser camera properly.

Features:

- Smooth follow
- Slight aim offset toward cursor
- Screen shake
- Optional zoom
- Bounds set to level dimensions
- Clear visibility of combat area

MINIMAP

Implement a small minimap in the HUD.

It should show:

- Level bounds
- Walls
- Player
- Extraction zone
- Enemies only when detected or debug mode is active
- Optional terminals/doors

DEBUG MODE

Add a debug mode toggle.

Debug mode should optionally show:

- Enemy states
- Enemy vision cones
- Last known player position
- Noise radius
- Collision bodies
- Objective flags
- FPS / entity count

Debug code should be cleanly isolated and easy to disable.

============================================================
CODE QUALITY REQUIREMENTS
============================================================

This project is for a GitHub portfolio. Code quality matters.

Use:

- Strong TypeScript types
- Interfaces for data shapes
- Enums/unions for states
- Clear naming
- Small focused classes
- Clear system boundaries
- No giant God classes
- No duplicated logic
- No dead code
- No console spam
- No unexplained magic numbers where constants would help
- No global mutable state unless intentionally centralized
- No fake comments that merely repeat the code
- Helpful comments only for complex systems
- Clean imports
- Consistent formatting

Do not over-engineer with unnecessary abstraction. Keep the architecture professional but understandable.

The code should be readable by someone reviewing my GitHub profile.

============================================================
DOCUMENTATION REQUIREMENTS
============================================================

Create or update the following files:

README.md

Must include:

- Project title
- Screenshot placeholder section
- Short pitch
- Features
- Controls
- Tech stack
- How to run
- How to build
- Architecture overview
- Why this project exists
- Portfolio note
- Future roadmap

ASSETS.md

Must include:

- Detailed list of real assets that can replace placeholders later
- Suggested art direction
- Player sprites
- Enemy sprites
- Weapon sprites
- Projectile sprites
- Tileset
- UI assets
- Icons
- Particle textures
- Audio needs
- Music needs
- Recommended file naming conventions
- Sprite sheet / atlas recommendations

ARCHITECTURE.md

Must explain:

- Scene structure
- Entity structure
- Systems
- Data-driven level design
- Event flow between GameScene and UIScene
- How weapons work
- How AI works
- How mission objectives work
- How visibility/line-of-sight works
- How to add a new enemy
- How to add a new weapon
- How to add a new level

CONTROLS.md

Must include:

- Controls table
- Gameplay tips
- Stealth/combat explanation

============================================================
IMPLEMENTATION PLAN
============================================================

Proceed in phases.

PHASE 1 — Project Setup

- Create Vite + TypeScript + Phaser project.
- Configure package.json scripts.
- Configure tsconfig.
- Configure vite.config.ts.
- Ensure the app boots successfully.
- Set up global CSS.
- Add Phaser game config.

PHASE 2 — Scene Skeleton

- Implement BootScene.
- Implement PreloadScene.
- Implement MenuScene.
- Implement GameScene.
- Implement UIScene.
- Implement PauseScene.
- Implement GameOverScene.
- Implement VictoryScene.
- Ensure scene transitions work.

PHASE 3 — Data Model

- Create data types.
- Create weapons.ts.
- Create enemies.ts.
- Create levels.ts.
- Create missionText.ts.
- Ensure level loading is fully data-driven.

PHASE 4 — Core Entities

- Implement Actor base class.
- Implement Player.
- Implement Enemy.
- Implement Projectile.
- Implement Grenade.
- Implement Door.
- Implement Terminal.
- Implement Pickup.
- Implement Prop.
- Implement ExtractionZone.

PHASE 5 — Core Systems

- Implement InputSystem.
- Implement WeaponSystem.
- Implement CollisionSystem.
- Implement MissionSystem.
- Implement AlertSystem.
- Implement VisionSystem.
- Implement EffectsSystem.
- Implement AudioSystem.
- Implement EnemyAISystem.
- Implement MinimapSystem.

PHASE 6 — Gameplay Loop

- Player movement.
- Mouse aiming.
- Firing.
- Reloading.
- Weapon switching.
- Grenades.
- Interactions.
- Pickups.
- Doors/terminals.
- Objective completion.
- Extraction.
- Game over.
- Next level / victory.

PHASE 7 — AI

- Enemy patrol.
- Enemy guard.
- Enemy vision.
- Enemy investigation of noise.
- Enemy search.
- Enemy attack.
- Enemy flanking.
- Enemy cover seeking.
- Enemy reload behavior.
- Enemy role differentiation.

PHASE 8 — Visual Polish

- Better generated textures.
- Floor grid.
- Wall styling.
- Door visuals.
- Terminal animation.
- Enemy silhouettes.
- Muzzle flashes.
- Bullet trails.
- Explosions.
- Damage numbers.
- Smoke/debris particles.
- Emergency lighting.
- Low health overlay.
- Camera shake.
- Smooth camera follow.

PHASE 9 — HUD / UI

- Health/armor panel.
- Weapon/ammo panel.
- Objective panel.
- Alert panel.
- Tactical log.
- Minimap.
- Interaction prompt.
- Pause screen.
- Game over screen.
- Victory screen.

PHASE 10 — Documentation and Polish

- README.md.
- ASSETS.md.
- ARCHITECTURE.md.
- CONTROLS.md.
- Remove dead code.
- Ensure npm run build succeeds.
- Ensure no TypeScript errors.
- Ensure no missing imports.
- Ensure no missing assets.
- Ensure game is playable from fresh clone.

============================================================
IMPORTANT BEHAVIORAL REQUIREMENTS
============================================================

Do not ask me to manually create files unless absolutely necessary. Create the files.

Do not leave TODO stubs for core systems. Implement working versions.

Do not delete important gameplay features from the prototype just because they are inconvenient.

Do not produce a visually boring technical skeleton. This must feel exciting and portfolio-worthy.

Do not use placeholder comments like “implement later” for essential behavior.

Do not add dependencies unless clearly justified.

Do not use copyrighted assets.

Do not break the project into hundreds of tiny files. Use professional granularity.

Do not put all logic into GameScene.

Do not put HUD logic directly into entity classes.

Do not create one massive “systems.ts” file.

Do not hard-code level data in the scene.

Do not let the game require a server beyond Vite dev server.

Do not rely on external image or audio files that do not exist.

Do not make the game dark to the point where the player cannot see what is happening.

Do not let the AI become so complex that it is impossible to understand.

============================================================
ACCEPTANCE CRITERIA
============================================================

The work is complete only when all of the following are true:

1. npm install works.
2. npm run dev works.
3. npm run build works.
4. The game opens in browser.
5. Menu screen appears.
6. Player can start the game.
7. Player can move, aim, shoot, reload, dash, switch weapons, throw grenades, and interact.
8. Enemies patrol, detect, search, attack, flank or take cover.
9. Terminals can be hacked.
10. Doors open after terminals are hacked.
11. Pickups work.
12. Props can be destroyed.
13. Barrels explode.
14. Projectiles hit enemies/player/props.
15. Grenades explode and deal damage.
16. Alert state changes properly.
17. Emergency lighting appears when detected.
18. Visibility is readable when hidden.
19. Mission objectives update in HUD.
20. Command target must be neutralized.
21. Extraction completes the sector.
22. Game over works.
23. Victory / next sector flow works.
24. HUD is clean and professional.
25. Minimap works.
26. Debug mode works.
27. No TypeScript errors.
28. No missing imports.
29. No missing assets.
30. README.md, ASSETS.md, ARCHITECTURE.md, and CONTROLS.md exist and are useful.
31. The codebase looks professional enough for a GitHub portfolio.

============================================================
VISUAL QUALITY BAR
============================================================

Even without real assets, the game should look intentionally designed.

Use generated Phaser graphics to create:

- Crisp player/enemy silhouettes
- Direction indicators
- Neon outlines
- Soft glows
- Tactical floor grid
- Wall panels
- Security doors
- Glowing terminals
- Extraction zone
- Projectile trails
- Muzzle flashes
- Explosions
- Smoke/debris
- Alert overlays
- HUD panels

The game should immediately look better than the original Canvas prototype.

============================================================
GAME FEEL QUALITY BAR
============================================================

The game should feel good to play.

Pay attention to:

- Player acceleration
- Player responsiveness
- Weapon cooldowns
- Screen shake intensity
- Bullet speed
- Enemy reaction time
- Enemy accuracy
- Dash cooldown
- Reload timing
- Grenade fuse
- Explosion radius
- Damage feedback
- Audio feedback
- Visual clarity

Do not make the game too punishing. It should be fun and readable.

============================================================
SUGGESTED BALANCE
============================================================

Initial player:

- Health: 120
- Armor: 50
- Speed: fast but controllable
- Dash cooldown: around 0.8–1.1 seconds
- Grenades: 3

Enemies:

- Assault: medium health, medium accuracy
- Sniper: low health, long range, high damage
- Flanker: low-medium health, fast movement, side attacks
- Heavy: high health, slow, dangerous close range
- Captain: high priority, strong but not unfair

Weapons should feel distinct.

============================================================
EXPECTED FINAL EXPERIENCE
============================================================

When I open the finished project, I should see a polished title screen for:

BREACH VECTOR: BLACKSITE

When I start the game:

- The camera follows the player smoothly.
- The world has a dark neon tactical look.
- The HUD feels like a real game UI.
- Enemies patrol and react.
- The player can stealth around or fight.
- Shooting feels responsive.
- Explosions feel satisfying.
- Objectives are clear.
- Hacking terminals opens doors.
- The command target matters.
- Extraction feels like a real goal.
- The codebase is clean and impressive.

============================================================
FINAL INSTRUCTION
============================================================

Start by inspecting the existing code and identifying the systems that need to be migrated.

Then implement the full Phaser + TypeScript project.

After implementation, run the available checks:

- npm install if needed
- npm run build
- TypeScript check
- Any available lint/check command

Fix all errors before finishing.

At the end, provide a concise summary of:

- What files were created
- What major systems were implemented
- How to run the project
- Any known limitations
- Suggested next improvements

The final result should be a professional Phaser 3 TypeScript top-down tactical shooter project that can become a standout GitHub portfolio repository.
```
