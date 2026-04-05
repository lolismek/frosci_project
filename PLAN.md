# Star Wars Special Relativity UI — Implementation Plan

## Context
We're building an interactive Star Wars galaxy map that demonstrates the absurdity of special relativity applied to Star Wars travel. Users pick two planets, adjust a speed slider, and see how time dilation makes routine inter-planetary travel a permanent goodbye under real physics. The project lives at `/Users/alexjerpelea/frosci_project` (currently empty git repo).

---

## Tech Stack
- **React 19 + TypeScript + Vite** — project scaffold
- **PixiJS 8 + @pixi/react** — WebGL-accelerated map rendering (handles 5,444 planets with glow effects)
- **Zustand** — lightweight state (selected planets, filters, active route)
- **Tailwind CSS 4** — UI panels and sidebar styling
- **Vitest** — unit tests for relativity math

Desktop only. No mobile/touch optimization.

---

## Data Strategy

### Source: `parzivail/SWGalacticMap` (5,444 planets)
- Each planet has `X`, `Y`, `SubGridX`, `SubGridY` → true position = `(X + SubGridX, Y + SubGridY)` on a ~20×21 grid
- Grid unit ≈ 5,000 light-years. Galaxy center ≈ (10, 10)
- Fields: Name, Region, Sector, Coord, Suns, Moons, Diameter, Gravity, Distance (from core in ly), LengthDay, LengthYear

### Data files under `src/data/`
| File | Purpose |
|------|---------|
| `planets.json` | Full 5,444-planet dataset from parzivail (downloaded) |
| `planets-supplemental.json` | ~30 hand-curated missing movie planets (Bespin, Endor, Naboo, Jakku, etc.) with estimated coordinates |
| `planet-tiers.json` | Maps planet names → tier (1-4) for filtering. Tier 1 = ~25 iconic planets, Tier 4 = obscure |
| `trade-routes.json` | 5 major trade routes + ~8 movie journeys, each as ordered arrays of planet names |
| `regions.json` | Region ring definitions: name, inner/outer radius from galaxy center, RGBA color |

### Planet tiers (for the "load fewer planets" filter)
- **Tier 1 (~25)**: Always visible. Coruscant, Tatooine, Hoth, Alderaan, Naboo, Endor, Dagobah, Bespin, Kashyyyk, Kamino, Geonosis, Mustafar, Corellia, Jakku, Scarif, Mandalore, Yavin, Mon Cala, Dantooine, Sullust, Jedha, Takodana, Crait, D'Qar, Exegol
- **Tier 2 (~75)**: Shows/EU named planets (Clone Wars, Rebels, Mandalorian)
- **Tier 3 (~150)**: Planets with notable lore or physical properties
- **Tier 4 (remaining ~5,200)**: Everything else

### Trade routes to include
1. **Perlemian Trade Route**: Coruscant → Ralltiir → Chandrila → Brentaal IV → Rhinnal → Columex → Rhen Var → Quermia
2. **Corellian Run**: Coruscant → Corellia → Nubia → Druckenwell → Christophsis → Rishi
3. **Corellian Trade Spine**: Corellia → Devaron → Bestine → Yag'Dhul → Sullust → Eriadu → Hoth region
4. **Rimma Trade Route**: Abregado-rae → Fondor → Thyferra → Yag'Dhul → Sullust → Eriadu
5. **Hydian Way**: Bonadan → Telos IV → Taris → Coruscant → Malastare → Eriadu

### Movie journeys to include
- Ep IV: Tatooine → Alderaan → Yavin 4 (canon: ~1 day)
- Ep V: Hoth → Dagobah; Hoth → Bespin (canon: weeks without hyperdrive)
- Ep VI: Tatooine → Sullust → Endor
- Ep I: Naboo → Tatooine → Coruscant → Naboo
- Ep II: Coruscant → Kamino → Geonosis
- Ep III: Coruscant → Utapau; Coruscant → Kashyyyk; Coruscant → Mustafar
- Ep VII: Jakku → Takodana → D'Qar → Starkiller Base

### Distance calculation
```
trueX = X + SubGridX;  trueY = Y + SubGridY
gridDist = sqrt((x2-x1)² + (y2-y1)²)
distanceLY = gridDist × 5000
```

---

## Galaxy Map Rendering (PixiJS Layers, bottom to top)

1. **Background**: Static PNG galaxy spiral (4096×4096 pre-made image as a Sprite)
2. **Regions**: Concentric ring fills using `Graphics.arc()` — semi-transparent colored fills matching Essential Atlas (Deep Core yellow → Core orange → Colonies tan → Inner Rim light blue → Mid/Outer Rim blues/purples). Region name labels along arcs.
3. **Grid**: Low-opacity lines (α=0.15) with column letters (C–U) and row numbers (1–21)
4. **Routes**: Polylines via `Graphics.moveTo/lineTo` — different color per route, optional glow via `BlurFilter` on a duplicate. Only drawn when a route is selected from sidebar.
5. **Planets**: Each planet = `Graphics` circle + `Text` label. Sized by tier (Tier 1 = 6px, Tier 2 = 4px, Tier 3 = 3px, Tier 4 = 2px). Color-coded by region. Glow filter on Tier 1 planets. Labels shown based on zoom level + tier filter.
6. **Selection**: Pulsing highlight ring on selected planets. Dashed line between two selected planets with distance label at midpoint.

### Pan/Zoom
- Master `Container` wrapping all layers
- Mouse wheel to zoom (min/max bounds)
- Mouse drag to pan
- Smooth animation via PixiJS `Ticker`

### Performance strategy
- All 5,444 planet dots render always (trivial for WebGL)
- Labels use `BitmapText` and only render based on tier + zoom level
- Frustum culling: skip rendering labels/dots outside visible viewport

---

## Component Architecture

```
src/
├── main.tsx
├── App.tsx                           # Full-width layout: map + overlays
├── stores/
│   ├── useMapStore.ts                # Pan/zoom state, visible layers
│   ├── usePlanetStore.ts             # Selected planets (0-2), tier filter, search query
│   └── useRouteStore.ts              # Currently active route/journey (null or id)
├── components/
│   ├── GalaxyMap/
│   │   ├── GalaxyMap.tsx             # PixiJS Application wrapper, orchestrates layers
│   │   ├── BackgroundLayer.tsx       # Galaxy PNG sprite
│   │   ├── RegionLayer.tsx           # Concentric colored rings
│   │   ├── GridLayer.tsx             # Grid lines + labels
│   │   ├── RouteLayer.tsx            # Active route polyline
│   │   ├── PlanetLayer.tsx           # All planet dots + labels
│   │   ├── SelectionLayer.tsx        # Selection highlights + connection line
│   │   └── usePanZoom.ts             # Pan/zoom hook (wheel, drag)
│   ├── Sidebar/
│   │   ├── Sidebar.tsx               # Left sidebar container
│   │   ├── PlanetSearch.tsx          # Search/autocomplete input
│   │   ├── PlanetFilter.tsx          # Tier slider: "Top 25 / 100 / 250 / All"
│   │   ├── RouteList.tsx             # Trade routes + movie journeys list
│   │   └── RouteCard.tsx             # Single route entry (click to draw)
│   ├── Calculator/
│   │   ├── RelativityPanel.tsx       # Bottom/right panel, appears when 2 planets selected
│   │   ├── SpeedSlider.tsx           # Logarithmic slider (0.1c → 0.999999c)
│   │   ├── ResultsDisplay.tsx        # γ, planet time, traveler time, distance
│   │   ├── RoundTripTable.tsx        # Cumulative aging after N trips
│   │   └── CanonComparison.tsx       # "In the movie: X. Under real physics: Y."
│   └── UI/
│       ├── Header.tsx                # "STAR WARS RELATIVITY MAP" title
│       ├── Legend.tsx                 # Region colors + route colors
│       └── PlanetTooltip.tsx         # Hover popup with planet details
├── data/
│   ├── planets.json
│   ├── planets-supplemental.json
│   ├── planet-tiers.json
│   ├── trade-routes.json
│   └── regions.json
├── utils/
│   ├── relativity.ts                 # γ, time dilation, round trips, formatting
│   ├── coordinates.ts                # Grid ↔ pixel ↔ light-year transforms
│   ├── planets.ts                    # Merge datasets, lookup by name, search, tier filter
│   └── constants.ts                  # c, grid scale factor, region colors
├── types/
│   └── index.ts                      # Planet, Route, Region, RelativityResult, etc.
└── assets/
    └── galaxy-bg.png                 # Static 4K galaxy background
```

---

## Relativity Calculator Details

### Core formulas (`utils/relativity.ts`)
```
γ = 1 / √(1 - v²/c²)
t_planet = d / v           (years, where d in ly and v in units of c)
t_traveler = t_planet / γ   (always less than t_planet)
```

### Speed slider mapping (logarithmic)
Slider value 0–1 maps to speed via: `speed = 1 - 10^(-value × 6)`
- Slider 0.17 → 0.5c (γ = 1.15)
- Slider 0.33 → 0.9c (γ = 2.29)
- Slider 0.50 → 0.999c (γ = 22.4)
- Slider 0.67 → 0.999999c (γ = 707)
- Slider 1.00 → 0.999999999c (γ = 22,360)

### Results panel shows
- Distance (light-years)
- Speed (fraction of c, with enough decimal places)
- Gamma factor (γ)
- **Planet-frame time**: how long people at home wait
- **Traveler-frame time**: how much the traveler ages
- **Human comparison**: "Traveler ages 14 years. Everyone they knew has been dead for 1,000 years."

### Round trip table
| Trip # | Traveler Age | Home Age | Status |
|--------|-------------|----------|--------|
| Start  | 30          | 30       |        |
| 1      | 30.3        | 50       |        |
| 3      | 30.9        | 90       | Elderly |
| 4      | 31.2        | 110      | Dead   |

### Canon vs Reality (for movie journeys)
When a movie journey is selected AND two of its planets are the selected pair:
- "**In Star Wars**: This trip takes ~16 hours"
- "**At 0.999c**: Traveler ages 1,119 years. Home ages 25,025 years."
- "**The movie is** 13.7 million× faster than near-lightspeed"

---

## Build Phases

### Phase 1: Scaffold + Data
- `npm create vite@latest . -- --template react-ts`
- Install: `pixi.js@^8`, `@pixi/react`, `zustand`, `tailwindcss`, `@tailwindcss/vite`
- Create TypeScript types, constants, data files
- Download `planets.json` from parzivail repo
- Write `planets-supplemental.json`, `planet-tiers.json`, `trade-routes.json`, `regions.json`
- Build `utils/planets.ts` (merge, search, filter), `utils/coordinates.ts`, `utils/relativity.ts`
- Unit tests for relativity math

### Phase 2: Basic Map
- PixiJS Application in `GalaxyMap.tsx`
- Pan/zoom on a master Container
- Render all planets as colored dots
- Hover → show planet name tooltip
- Click → select planet (up to 2)

### Phase 3: Visual Polish
- Galaxy PNG background layer
- Region rings with semi-transparent fills + labels
- Grid overlay
- Glow effects on Tier 1 planets
- Zoom-dependent label visibility
- Region-based planet coloring

### Phase 4: Relativity Calculator
- `RelativityPanel.tsx` with all sub-components
- Logarithmic speed slider
- Results display (γ, times, human comparison)
- Round trip table
- Connection line between selected planets with distance

### Phase 5: Routes + Sidebar
- Sidebar with search, tier filter, route list
- Click route → draw polyline on map + auto-zoom to fit
- Movie journey cards with canon comparison
- Map legend

### Phase 6: Polish
- Header with Star Wars aesthetic
- Loading state
- Edge cases (same planet selected twice, unknown coordinates)
- Performance tuning if needed (BitmapText, frustum culling)

---

## Verification

### Unit tests (`vitest`)
- `relativity.test.ts`: γ(0.5c) = 1.1547, γ(0.9c) = 2.2942, γ(0.99c) = 7.0888, γ(0.999c) = 22.366, γ(0.9999c) = 70.712
- `coordinates.test.ts`: grid-to-lightyear transform, Tatooine at grid distance ~8.5 from center → ~42,500 ly ≈ 43,000 ly (matches dataset `Distance` field)

### Manual checklist
- All planets render, pan/zoom is smooth
- Selecting Coruscant + Tatooine shows ~42,000 ly distance
- Speed slider at 0.999c gives γ ≈ 22.4
- Trade routes draw correct polylines connecting the right planets
- Tier filter correctly reduces visible planet count
- Round trip table shows compounding age divergence

---

## Key Risks
1. **@pixi/react + PixiJS 8 compatibility**: Fallback to imperative PixiJS in `useEffect` with canvas ref if the React wrapper is unstable
2. **Missing planets in dataset**: ~30 movie planets need hand-curated coordinates estimated from Essential Atlas grid references
3. **Galaxy background image**: Need to source or generate a suitable 4K galaxy spiral PNG. Can use CSS gradient as temporary fallback during development
