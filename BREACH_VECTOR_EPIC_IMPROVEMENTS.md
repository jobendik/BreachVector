# BREACH VECTOR: BLACKSITE - Portfolio Roadmap

> Refactored roadmap, verified against the current workspace on 2026-04-26.

`Breach Vector: Blacksite` is a Phaser 3 + TypeScript top-down tactical shooter / stealth-action prototype. The project is already a strong playable technical prototype. The next goal is not to add more breadth. The next goal is to turn the existing foundation into a polished portfolio vertical slice.

This document replaces the old exhaustive 617-item epic with a smaller, decision-oriented roadmap:

- what is actually implemented
- what is still missing
- what is over-scoped for the current goal
- what should happen next

---

## Executive Summary

The project is in a good place technically.

The old checklist said **226 / 617 tasks complete, 36.6%**. That number is accurate as a count, but misleading as a measure of project health. The high-risk foundation is already done: modular architecture, typed events, systems, entities, data-driven levels, HUD, smoke tests, A* pathfinding, suspicion detection, swept projectile collision, persistent settings, persistent best-sector progress, and sector reports.

Better interpretation:

| Lens | Status |
|---|---:|
| Full old "portfolio gem" roadmap | about 37% complete |
| Playable technical prototype | about 75% complete |
| Defensible portfolio vertical slice | about 60-65% complete |
| Finished multi-sector game | much earlier, about 25-35% complete |

The biggest remaining gap is not architecture. It is **feel, content pacing, audio/FX, and portfolio presentation**.

Recommended strategy:

1. Freeze major architecture work.
2. Polish Sector 1 into the main vertical slice.
3. Add weapon/audio/FX feedback that makes the game feel finished.
4. Capture screenshots/GIFs and update the README.
5. Only then consider progression, more sectors, or a Tiled asset pipeline.

---

## Verified Current State

These commands were run successfully:

```bash
npm run check
npm run test:smoke
```

Results:

- TypeScript passes.
- ESLint passes.
- Prettier check passes.
- Production build passes.
- Playwright smoke tests pass: **16/16**.
- The only build warning is Vite's large chunk warning from bundling Phaser, which is acceptable for this prototype.

The current working tree contains uncommitted implementation work, so this document reflects the workspace as it exists now, not only the last commit.

---

## What Is Already Strong

### Architecture

Status: strong enough. Do not spend much more time here right now.

Implemented:

- Phaser + TypeScript + Vite project structure.
- Scene split: boot, preload, menu, gameplay, UI, pause, settings, game over, victory.
- Entity split: player, enemies, projectiles, grenades, doors, terminals, pickups, props, extraction.
- System split: input, weapons, collision, combat, AI, vision, mission, alert, effects, audio, minimap, debug, lighting, pathfinding.
- `LevelBuilder` and `EnvironmentRenderer` reduce `GameScene` construction responsibilities.
- Typed event bus.
- Typed gameplay data for weapons, enemy roles, pickups, levels, HUD, minimap, and sector reports.
- System cleanup and listener cleanup covered by smoke tests.

Remaining architecture work:

- Add a small predictable debug/test level for collision and interaction testing.
- Keep reducing `GameScene` only when a real feature makes it necessary.

### Core Gameplay

Status: playable prototype loop is implemented.

Implemented:

- WASD movement, mouse aiming, dash, slow walk, reload, weapon switching, grenade throw, interaction.
- Four weapons: Silenced Pistol, Pulse Rifle, Scattergun, Rail Piercer.
- Enemy roles: assault, sniper, flanker, heavy, captain.
- Terminals, locked doors, command target, extraction.
- Hidden, Searching, Detected alert states.
- Suspicion buildup instead of instant binary detection.
- Destructible props and explosive barrels.
- Grenade preview, clamped throw range, fuse ring, bounce sounds, danger markers.
- Pickups with usefulness priority and blocked feedback when already full.

### AI And Combat Reliability

Status: much stronger than a typical small prototype.

Implemented:

- A* pathfinding over a walkability grid.
- Path recomputation and LOS path smoothing.
- Patrol, suspicious, search, attack, flank, cover, reload states.
- Captain command pulse that buffs nearby hostiles.
- Swept projectile hit detection for player and enemy bullets.
- Explosion line-of-sight validation.
- Door/path grid refresh when doors or props change.

Known gaps:

- Cover selection is still simple.
- No local avoidance.
- Actor collision can still be improved.
- Rail Piercer should eventually feel like a true immediate beam/raycast weapon.

### HUD, UI, And Progress

Status: one of the stronger areas.

Implemented:

- Segmented health, armor, dash, ammo, reload, weapon, grenade, objective, alert, tactical log, minimap panels.
- Tactical log categories, collapse counts, fading, and critical emphasis.
- Alert panel with awareness counts and last-seen timer.
- Captain health/command HUD indication.
- Minimap sector/local zoom toggle.
- Sector clear report with grade, stealth rating, kill breakdown, accuracy, advice, and best-progress persistence.
- Continue flow advances to the next unfinished sector.
- Persistent settings for quality, volume, screen shake, flash, colorblind toggle, and reduced motion.

Documentation note:

- The old document said best-rank persistence was missing. That is stale. Best-sector progress is implemented.

---

## Where The Project Is Weakest

The old checklist had these completion ratios:

| Area | Done | Remaining | Meaning |
|---|---:|---:|---|
| Architecture & code quality | 29/30 | 1 | Strong enough |
| HUD & tactical interface | 39/49 | 10 | Strong, needs polish |
| UI/UX & menus | 33/42 | 9 | Mostly good |
| Rendering & graphics | 27/39 | 12 | Good generated foundation |
| Physics, collision & navigation | 16/32 | 16 | Functional, needs edge polish |
| Stealth, vision & alert | 16/35 | 19 | Good base, needs fairness/readability polish |
| Mission design | 12/29 | 17 | Loop exists, content depth missing |
| Enemy design & AI | 12/43 | 31 | Architecture exists, tactics need depth |
| Progression/scoring | 6/22 | 16 | Scoring exists, rewards do not |
| Performance polish | 5/28 | 23 | Fine for now, profile before optimizing |
| Visual FX & juice | 5/35 | 30 | Major remaining feel gap |
| Game feel & feedback | 4/32 | 28 | Major remaining feel gap |
| Player mechanics | 5/28 | 23 | Core controls exist, advanced tools missing |
| GitHub portfolio presentation | 8/58 | 50 | Major external impression gap |
| Accessibility & settings | 4/22 | 18 | Basic settings exist, full access pass missing |
| Audio & soundscape | 1/29 | 28 | Major remaining polish gap |
| Content & level design | 0/30 | 30 | Biggest actual product gap |
| Weapon depth | 4/34 | 30 | Weapons exist, identity needs polish |

The most important conclusion: **the game needs polish passes more than it needs new systems**.

---

## Is The Plan Over-Engineered?

The codebase is not badly over-engineered. The system split is justified because this game already has enough moving parts: AI, alert state, line of sight, projectiles, missions, UI, minimap, settings, and progress.

The roadmap was over-engineered as an execution plan.

The old document mixed three different goals:

1. make a great portfolio prototype
2. make a full multi-sector game
3. build a reusable tactical shooter framework

Those are not the same project.

For the current goal, the following should be deferred:

- Six full sectors.
- Daily/weekly seeds.
- Heavy meta-progression.
- Full reward archetype ecosystem.
- Controller and touch support.
- Tiled pipeline, unless rectangle level data becomes painful.
- Object pooling before profiling proves a performance issue.
- Large accessibility matrix before the core readability pass is finished.
- Imported asset pipeline before the generated style is presentable.

Keep the future ideas, but do not let them steer the next month.

---

## Current North Star

Build **one excellent 8-12 minute sector** that proves the game.

Sector 1 should demonstrate:

- clear objective within 10 seconds
- readable first patrol
- safe first terminal
- stealth approach
- locked door decision
- alternate route
- one satisfying combat encounter
- one impressive explosion/barrel moment
- visible alert escalation
- captain climax
- rewarding extraction
- sector report that makes replay desirable
- GIF-worthy footage for README

If Sector 1 is excellent, the project is portfolio-ready even with only two sectors.

If Sector 1 is mediocre, five more sectors will not save it.

---

## Priority Plan

### Phase 1 - Roadmap And Presentation Cleanup

Goal: make the repository accurately communicate the current project.

- [x] Replace the old over-broad epic with this focused roadmap.
- [x] Update `README.md` so it no longer undersells implemented scoring/progress.
- [x] Add a "Current Status" section: playable tactical prototype / vertical slice in progress.
- [x] Add "Architecture Highlights" section.
- [x] Add "Systems Demonstrated" section.
- [x] Add "How To Run / How To Test" section with `npm run check` and `npm run test:smoke`.
- [ ] Add placeholders for screenshots/GIFs only if they will be filled soon.
- [ ] Add `docs/screenshots/` and `docs/gifs/` folders when captures are ready.

### Phase 2 - Sector 1 Vertical Slice

Goal: make the first playable sector feel intentional, readable, and satisfying.

- [x] Rename/reframe Sector 1 as the portfolio demo sector.
- [x] Move the first terminal closer to the player or make it more visually obvious.
- [x] Make the first patrol teach stealth without punishing the player immediately.
- [ ] Add one clearly readable alternate route around danger.
- [ ] Add one locked-door choice that matters.
- [x] Add one barrel/explosion opportunity in a natural combat space.
- [ ] Make the captain encounter feel like the climax, not just another enemy.
- [ ] Make extraction visually and emotionally satisfying.
- [ ] Tune enemy count and med/ammo/grenade placement around a first-time player.
- [ ] Add a short test/checklist for completing Sector 1 manually.

### Phase 3 - Game Feel Pass

Goal: make every player action readable and satisfying.

Highest-value tasks:

- [x] Add weapon-specific muzzle flash scale, color, and duration.
- [x] Add weapon-specific projectile trails:
  - pistol: thin suppressed streak
  - rifle: bright cyan pulse streak
  - scattergun: multiple amber pellet trails
  - rail: thick violet-white beam/afterimage
- [ ] Add distinct reload timing and audio cue per weapon class.
- [ ] Add enemy hit flash.
- [ ] Add armor hit blue-white spark feedback.
- [ ] Add player damage directional indicator.
- [ ] Add low-health red vignette/pulse.
- [ ] Add more dramatic enemy death burst.
- [ ] Add captain death signal-collapse effect.
- [x] Add improved explosion shockwave, smoke, sparks, and debris.
- [ ] Add objective completion animation.
- [ ] Add sector-complete extraction transition.

Do these before adding new weapons or new enemy roles.

### Phase 4 - Audio Identity

Goal: make the generated audio feel intentional instead of placeholder-only.

- [ ] Add unique fire sound profiles for each weapon.
- [ ] Add distinct reload sounds for light/medium/heavy weapons.
- [ ] Add door unlock/open sound.
- [ ] Add terminal hack loop/progress blips and completion chime.
- [ ] Add alert transition sounds.
- [ ] Add armor-hit vs health-hit sounds.
- [ ] Add captain command/death sounds.
- [ ] Add subtle ambient blacksite hum.
- [ ] Add siren layer during Detected.
- [ ] Use existing volume sliders consistently.

Defer adaptive music until the core SFX identity is stronger.

### Phase 5 - Portfolio Release

Goal: make the project convincing before anyone clones it.

- [ ] Capture title/menu screenshot.
- [ ] Capture stealth/patrol screenshot.
- [ ] Capture combat screenshot.
- [ ] Capture grenade/barrel explosion GIF.
- [ ] Capture terminal/door interaction GIF.
- [ ] Capture sector clear screenshot.
- [ ] Add live GitHub Pages demo.
- [ ] Add README hero image or GIF near the top.
- [ ] Add short "Why this is impressive" section.
- [ ] Add honest status label: "Playable prototype / polished vertical slice in progress".
- [ ] Add topic tags on GitHub.
- [ ] Pin repository after README, demo, and screenshots are ready.

### Phase 6 - Optional Expansion

Only start this after Sector 1 and portfolio presentation are strong.

- [ ] Add reward choice screen after sector clear.
- [ ] Add a small set of data-driven upgrades.
- [ ] Add Sector 2 polish pass.
- [ ] Add one new enemy role only if it creates a new tactical problem.
- [ ] Add one new tactical tool only if it improves Sector 1 or Sector 2.
- [ ] Consider Tiled only if authoring rectangle levels becomes the bottleneck.

---

## Things To Avoid For Now

Avoid these unless there is a clear reason:

- More sectors before Sector 1 is polished.
- Refactoring systems just because they can be cleaner.
- Full meta-progression before the base loop feels good.
- A large reward system before there are enough meaningful choices.
- Imported art before the generated style is polished enough for screenshots.
- Performance pooling before profiling shows frame or garbage collection issues.
- Mobile/controller support before desktop play feels excellent.
- Calling it a finished game.

---

## Definition Of Portfolio-Ready

The project is ready to show publicly when:

- [ ] `npm run check` passes.
- [ ] `npm run test:smoke` passes.
- [ ] Sector 1 is completable by a first-time player without confusion.
- [ ] The first 60 seconds show movement, stealth, interaction, and tension.
- [ ] At least one combat/explosion moment looks good in a GIF.
- [ ] The captain encounter feels distinct.
- [ ] Extraction and sector report feel rewarding.
- [ ] README has screenshots/GIFs and a live demo link.
- [ ] README accurately explains the technical systems.
- [ ] The roadmap is honest about prototype status and future work.

---

## Immediate Next 10 Tasks

Do these in order:

1. Update `README.md` to match the current implemented state.
2. Play Sector 1 from a cold start and note every confusing moment.
3. Rework Sector 1 objective/patrol/layout pacing.
4. Add weapon-specific muzzle/tracer polish.
5. Add stronger explosion FX.
6. Add player damage and enemy hit feedback.
7. Add terminal/door/alert audio cues.
8. Make captain death and extraction feel special.
9. Capture README screenshots/GIFs.
10. Add GitHub Pages deployment.

This sequence turns the project into something people can understand quickly and remember after they close the tab.

---

## Parking Lot

These are still good ideas, but they are not current priority:

- Tiled map support.
- Six-sector campaign.
- Environmental sector themes.
- New enemy roles: drone, shield trooper, engineer/medic.
- New tactical tools: EMP, smoke, flashbang, thermite.
- Reward rarity tiers and archetypes.
- Challenge mode and seeds.
- Achievements.
- Controller support.
- Touch/mobile support.
- Adaptive music layers.
- Object pooling and allocation counters.
- High contrast mode and full remapping.

Move items out of the parking lot only when they support the vertical slice or the portfolio release.

---

## Implementation Idea Archive

This section preserves concrete implementation ideas from the older epic without treating every idea as current priority. Use it as a menu when a phase needs more detail.

### Architecture And Testing Ideas

- Add `debug/testLevel.ts` with predictable geometry for projectile, door, pickup, terminal, and collision testing.
- Keep `GameScene` focused on orchestration; move code out only when a feature naturally creates a new responsibility.
- Add targeted smoke tests for:
  - projectile edge cases
  - interaction prompts
  - terminal/door state
  - extraction gating
  - settings persistence
  - progress reset when that button exists
- Keep lifecycle ownership documented in `ARCHITECTURE.md`.

### Rendering And Environment Ideas

- Add sector-specific themes:
  - Data Vault
  - Reactor Hall
  - Cryo Lab
  - Command Core
  - Exterior Dock
- Add ambient occlusion near walls, corners, and door frames.
- Add animated security lights along corridors.
- Add broken panels, exposed wires, smoke vents, sparks, stains, cable paths, vents, grates, and small environmental details.
- Add controlled emergency red strobe during Detected without reducing gameplay readability.
- Add low-health vignette and heartbeat pulse.
- Add quality toggle behavior for full lighting versus simplified lighting.
- Add smooth zoom for combat, Rail Piercer use, and sector completion.
- Add optional tactical zoom-out key.
- Add screen-edge indicators for off-screen enemies during alert.

### Visual FX Ideas

- Weapon projectile FX:
  - Silenced Pistol: small clean suppressed streaks.
  - Pulse Rifle: bright cyan streaks with small muzzle particles.
  - Scattergun: multiple amber pellet trails and dust impacts.
  - Rail Piercer: thick violet-white beam with afterimage and screen flash.
- Projectile impacts:
  - wall sparks
  - door sparks
  - prop sparks
  - blue-white armor ricochet sparks
- Hit feedback:
  - floating damage numbers
  - armor damage in blue/white
  - health damage in red/orange
  - enemy role-colored death bursts
  - captain command-signal collapse on death
- Explosion FX:
  - grenade multi-ring shockwave
  - hot core
  - sparks
  - smoke
  - debris
  - barrel fireball
  - delayed shockwaves for chain explosions
  - falloff shown through ring radius and particle density
  - brief desaturation or flash for large explosions
- Stealth/alert FX:
  - Hidden: cool cyan/green scanline ambience
  - Searching: amber sweep lights and suspicion indicators
  - Detected: red siren pulse and emergency lighting
  - last-known-position flicker
  - noise rings from loud actions
  - subtle normal-mode enemy vision telegraphs where fairness requires it
- UI FX:
  - objective checkmark sweep
  - low-ammo pulse
  - reload progress ring or segmented indicator
  - alert panel animated edges
  - minimap alert flicker
  - HUD shake on player damage
  - dramatic sector-complete transition

### Game Feel Ideas

- Tune acceleration and deceleration for responsive but weighty movement.
- Add dash afterimages.
- Add dash start burst and dash end skid particles.
- Add subtle footstep/dust particles.
- Add different feedback for walking versus slow-walking.
- Improve wall sliding so the player does not snag.
- Add per-weapon muzzle flash scale and duration.
- Add per-weapon reload rhythm.
- Make weapon identities stronger:
  - Pistol: precise and quiet.
  - Rifle: steady and reliable.
  - Scattergun: punchy and close-range.
  - Rail Piercer: heavy, loud, dramatic.
- Add brief hit stop for heavy kills, Rail Piercer kills, and captain death.
- Add optional slow-motion extraction moment.
- Gate time effects behind reduced motion settings.
- Add clear failed-interaction feedback: locked, too far, objective incomplete, no ammo, reloading.
- Add telegraphs for enemy special actions.

### HUD And Tactical Interface Ideas

- Armor absorption flash.
- Grenade cooldown/fuse indicator in HUD.
- Weapon switch animation.
- Objective distance markers.
- Compass arrow to nearest incomplete objective.
- Sector-specific mission briefing text.
- Alert panel improvements:
  - stronger color transitions
  - enemy awareness detail
  - last-seen memory
  - siren waveform
- Tactical log improvements:
  - stronger filters/categories if needed
  - more objective event logging
  - no spam from repeated minor events
- Minimap improvements:
  - pickup icons
  - objective markers
  - enemy visibility rules
  - zoom scale options
  - debug overlay for paths/vision/noise

### Menu And UX Ideas

- Improve title screen animation.
- Make settings panel fully connected to actual runtime behavior.
- Add reset progress button.
- Add explicit difficulty presets:
  - Recruit
  - Operator
  - Blacksite
- Add a Portfolio Demo Mode if the game is being shown to recruiters.
- Add sector select only after there is enough content to select.
- Add better sector preview cards once more sectors exist.

### Player Mechanic Ideas

- Add tactical takedown if stealth play needs a stronger close-range option.
- Add emergency cloak or overdrive only as a rare reward later.
- Add interact hold/toggle option.
- Add slow-walk hold/toggle option.
- Add mouse sensitivity/aim offset settings.
- Add rebindable controls later.
- Defer controller and touch support until desktop play is excellent.

### Weapon And Combat Depth Ideas

- Add weapon upgrades later:
  - Pistol: subsonic rounds, armor-piercing rounds, execution refund, laser sight.
  - Rifle: burst mode, extended magazine, stability module, smart rounds.
  - Scattergun: incendiary shells, flechette spread, breacher rounds, recoil dampener.
  - Rail: capacitor overcharge, wall pierce, chain arc, charge shot.
- Keep upgrades data-driven.
- Add rarity tiers only when reward choices exist:
  - Common
  - Uncommon
  - Rare
  - Prototype
- Make ammo economy support distinct playstyles.
- Add clearer armor versus health damage behavior.

### Enemy And AI Ideas

- Improve cover scoring based on:
  - line-of-sight break
  - distance
  - flank exposure
  - role preference
  - health/armor state
- Make snipers prefer long-range cover.
- Make assault enemies prefer mid-range cover.
- Make wounded enemies retreat.
- Update cover points when props are destroyed.
- Add local avoidance.
- Prevent enemies from pushing the player through geometry.
- Add body-size differences that matter tactically.
- Add soft avoidance around explosive barrels.
- Improve captain presentation:
  - stronger command aura
  - unique command bark/sound
  - special death effect
  - possible reinforcement call later
- Possible future enemy roles:
  - Drone
  - Shield Trooper
  - Engineer/Medic

### Stealth, Vision, And Alert Ideas

- Make detection fair and readable before making it harsher.
- Add subtle normal-mode vision telegraphs for important patrols.
- Add last-known-position marker.
- Add better noise propagation feedback.
- Add stealth rewards or score modifiers.
- Add alternate quiet extraction if the player remains hidden.
- Add alarm panel objective if the player triggers alarm early.
- Add reinforcement wave if the player goes loud, but reward combat skill.

### Mission And Objective Ideas

- Objective types to consider later:
  - optional intel pickup
  - sabotage objective
  - rescue/data recovery objective
  - power reroute objective
  - alarm disable objective
  - timed lockdown objective
- Dynamic objective branches:
  - captain escapes to command room
  - barrel explosion damages server room
  - player remains hidden
  - player goes loud
- Keep the main loop simple for now:
  - infiltrate
  - hack terminal
  - open route
  - neutralize command
  - extract

### Content And Level Design Ideas

- Sector 1: tutorial-quality security wing / training breach.
- Sector 2: Data Vault with tighter rooms, multiple terminals, locked rooms, more snipers.
- Sector 3: Reactor Hall with hazards, barrels, heat vents, heavies.
- Sector 4: Cryo Lab with fog/visibility modifiers and dormant enemies.
- Sector 5: Command Core with captain boss and reinforcements.
- Sector 6: Exterior Extraction with final sprint and enemy waves.
- Every polished sector should have:
  - stealth path
  - combat path
  - tactical door/terminal decision
  - explosive opportunity
  - readable patrol
  - memorable set piece
  - one primary mechanic it teaches or tests
- Tiled pipeline ideas:
  - `assets/tilesets/`
  - tile collision layer
  - object layers for spawns, doors, pickups, props, patrols, extraction
  - `LEVEL_DESIGN.md`
  - keep current data-driven levels as fallback/debug levels

### Progression And Replayability Ideas

- Add reward choice after sector completion.
- Keep first reward system small:
  - three choices
  - data-driven
  - clear effect text
  - no reroll at first
- Possible build archetypes:
  - Stealth: lower noise, faster hacking, better pistol/takedown.
  - Assault: more armor, rifle stability, faster reload.
  - Breacher: better grenades, scattergun, door explosives.
  - Tech: terminal hacks disable enemies, reveal map, open routes.
  - Marksman: Rail Piercer, crits, penetration, sniper counterplay.
- Possible achievement badges for screenshots:
  - Silent Breach
  - No Damage
  - Captain Down
  - Full Clear
- Challenge mode and seeds are future-only.

### Audio Ideas

- Unique fire sound for each weapon.
- Unique enemy weapon sounds by role.
- Distinct reload sounds for light/medium/heavy weapons.
- Dash whoosh plus low thump.
- Terminal hack blips and completion chime.
- Door unlock/open/close sounds.
- Armor hit versus health hit sounds.
- Enemy death sounds by role.
- Captain death command-signal collapse sound.
- Ambient layers:
  - blacksite hum
  - sector machinery
  - terminal buzz
  - alarm siren
  - low-health heartbeat
  - extraction zone engine/uplink hum
- Audio mixing:
  - master gain
  - music gain
  - SFX gain
  - UI gain
  - limiter/compressor
  - voice caps
  - stereo panning
  - mute on blur
- Adaptive music is optional later:
  - stealth layer
  - search layer
  - combat layer
  - extraction layer

### Performance Ideas

- Use Phaser containers/layers deliberately to avoid unnecessary depth sorting.
- Pool only if profiling shows a need:
  - projectiles
  - floating text
  - particle bursts
  - muzzle flashes
  - debug markers
- Avoid per-frame allocation in hot AI loops.
- Reuse vectors where practical.
- Avoid creating Phaser Text objects every frame.
- Add FPS/object count debug overlay if performance becomes a concern.
- Cache static level geometry into a render texture only if rendering cost becomes visible.

### Accessibility Ideas

- Colorblind mode should use shape/icon differences, not only palette changes.
- Add high contrast mode later.
- Add UI scale options.
- Add minimap scale options.
- Add subtitles/event captions for important audio:
  - alarm
  - sniper aiming
  - grenade
  - door unlocked
- Add visual alert cues for players who mute audio.
- Add reduced harsh-sound mode later.
- Add assist toggles:
  - slower enemy reaction
  - more health
  - more ammo
  - larger interaction range

### Portfolio Presentation Ideas

- README upgrades:
  - hero banner or GIF
  - live demo link
  - current status label
  - why the project is impressive
  - architecture highlights
  - systems demonstrated
  - short code snippets from best systems
  - honest roadmap
- Capture:
  - title screen
  - stealth moment
  - emergency combat moment
  - grenade/barrel explosion
  - terminal hacking/door opening
  - sector clear screen
  - debug overlay showing AI/vision/pathing
- Possible docs:
  - `GAME_DESIGN.md`
  - `AI_DESIGN.md`
  - `LEVEL_DESIGN.md`
  - `CHANGELOG.md`
- Public repo checklist:
  - build passes
  - README is accurate
  - screenshots/GIFs exist
  - demo link works
  - first screen looks good within 3 seconds
  - first sector shows best mechanics within 60 seconds
  - repo topics are set
  - project is pinned only when presentation is ready

---

## Current Honest Label

Use this wording publicly:

> `Breach Vector: Blacksite` is a playable Phaser 3 + TypeScript tactical shooter prototype and portfolio vertical slice. It demonstrates modular game architecture, typed events, data-driven content, enemy AI, stealth alert states, swept projectile collision, procedural visuals/audio, HUD systems, and automated browser smoke tests.

Avoid:

- "finished game"
- "commercial-ready"
- "complete campaign"
- "production asset pipeline"

---

## Document Version

Version: 2.0  
Date: 2026-04-26  
Purpose: replace the old exhaustive feature epic with a focused portfolio execution roadmap.
