# BREACH VECTOR: BLACKSITE Visual Style

## Palette

The game uses a compact tactical-neon palette from `src/utils/colors.ts`.

| Token | Hex | Use |
|---|---:|---|
| Blacksite navy | `#020617` | Background, fog, deep shadows |
| Panel navy | `#07111f` | HUD panels, terminal bodies, floor panels |
| Cyan systems light | `#38bdf8` | Terminals, walls, UI system information |
| Green operator light | `#34d399` | Player, completed objectives, extraction ready |
| Red alert light | `#ef4444` | Hostiles, detected state, command unit, locked danger |
| Amber hazard light | `#f59e0b` | Doors, dash, warning information |
| Orange explosive light | `#f97316` | Barrels, sniper hazard marks, explosions |
| Violet energy light | `#a855f7` | High-tech energy, flankers, rail weapon accents |
| Slate steel | `#64748b` | Inactive objects, structure, minimap framing |

## Shape Language

Important information is never color-only.

- Operator: round armored core, forward weapon mount, green/cyan facing arc.
- Assault: compact red triangular silhouette.
- Sniper: narrow body, long barrel, paired laser marks.
- Flanker: angular diamond body, side motion streaks.
- Heavy: broad rectangular armor and visible shield arc.
- Captain: command ring, crown antenna, red command wedge.
- Terminals: cyan framed consoles with green scan bars.
- Doors: segmented barrier panels, central lock block, amber warning stripes.
- Crates: rectangular cover with panel seams, corner brackets, and cracks.
- Barrels: circular explosive silhouette with hazard triangle and orange glow.
- Extraction: landing-pad rectangle with crosshair centerlines and edge chevrons.

## UI Rules

- HUD panels use dark navy surfaces with one high-contrast tactical accent.
- Minimap icons use geometry first: squares for terminals, bars for doors, triangles for enemies, ringed glyphs for pickups, and a cone for player facing.
- Alert state changes the minimap frame and sweep: cyan hidden, amber searching, red detected.
- Future colorblind support should preserve these shape differences and add optional higher-contrast outlines.
