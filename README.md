# Star Wars Relativity Map

An interactive Star Wars galaxy map that demonstrates why special relativity makes routine interstellar travel impossible — and why the Star Wars universe *needs* hyperspace.

> *"Star Wars ships use hyperspace to cross the galaxy in hours. But what if they couldn't? What if the fastest ship was limited by the speed of light?"*

## Overview

Select two planets on an interactive galaxy map, adjust a speed slider, and watch as special relativity makes the journey absurd. At 0.999c, a trip from Coruscant to Tatooine takes 42,000 years for people at home — while the traveler ages 1,900 years. Push the slider past *c* and enter **Tachyonic Hyperspace Mode**: the map tilts into 3D, revealing a perpendicular "imaginary dimension" through which faster-than-light travel occurs.

## Features

### Galaxy Map (2D — PixiJS)
- **5,444 planets** from the Essential Atlas dataset, plotted at their canonical grid coordinates
- **Pan and zoom** with mouse wheel and drag
- **Concentric region rings**: Deep Core, Core, Colonies, Inner Rim, Expansion Region, Mid Rim, Outer Rim, Wild Space
- **Grid overlay** matching the Essential Atlas (columns C-U, rows 1-21)
- **Planet tiers** — filter visible planets: Top 25 (iconic) / Top 100 / Top 250 / All 5,400+
- **Hover labels** with zoom-dependent visibility
- **Click to select** two planets — golden connection line with distance in light-years

### Relativity Calculator
- **Logarithmic speed slider** from 0.5c to 0.999999c (subluminal) and beyond c (tachyonic)
- **Lorentz factor** (gamma) display
- **Time dilation comparison**: planet-frame time vs. traveler-frame time
- **Human-readable context**: *"Everyone the traveler knew has been dead for centuries"*
- **Round trip aging table**: cumulative age divergence after N trips (the twin paradox)
- **Canon vs. Reality**: movie travel time compared to real physics

### Routes and Journeys
- **5 major trade routes**: Perlemian Trade Route, Corellian Run, Corellian Trade Spine, Rimma Trade Route, Hydian Way
- **8 movie journeys**: Episodes I-VII key routes with canonical travel times
- **Click to draw** route polylines on the map
- **Starship animation**: Uber-style ship sprite travels along the route with a glowing trail
- Selecting a route auto-picks its endpoints for relativity calculation

### Tachyonic Hyperspace Mode (3D — Three.js)
When the speed slider crosses *c*, the 2D map fades out and a 3D scene fades in:

- **Galaxy plane** rendered as a textured flat surface with region rings and planet labels
- **Selected planets** shown as glowing golden spheres with pin labels
- **Hyperspace travel arc**: a 3D bezier curve rising off the galaxy plane into a perpendicular "imaginary dimension" — height represents the imaginary component of the Lorentz-contracted distance
- **Ship animation** following the 3D arc
- **Orbitable camera** (OrbitControls) — explore the hyperspace dimension from any angle
- **Starfield** background

The calculator panel switches to tachyonic display:
- Complex gamma: e.g. *0.453i*
- Distance decomposition: real (normal space) + imaginary (hyperspace) components
- Hyperspace fraction bar: percentage of the journey through the imaginary dimension

## The Physics

### Subluminal (v < c)
Standard special relativity:
- **Lorentz factor**: `gamma = 1 / sqrt(1 - v^2/c^2)`
- **Time dilation**: `t_traveler = t_planet / gamma`
- **Key insight**: even at 0.9999c, a trip across the galaxy takes 565+ years for the traveler and 40,000+ years for everyone at home

### Tachyonic (v > c) — Speculative
When v > c, gamma becomes imaginary: `gamma = i / sqrt(v^2/c^2 - 1)`

Length contraction produces a **complex distance** with real and imaginary components:
- **Real component**: displacement through normal space (the galaxy plane)
- **Imaginary component**: `L * sqrt(v^2/c^2 - 1)` — displacement through a perpendicular "hyperspace" dimension

This interpretation follows the work of Erasmo Recami (Extended Relativity, 1970s-2000s) and Elizabeth Rauscher (Complex 8-space), who formally modeled superluminal Lorentz transformations as rotations in complex spacetime. The imaginary component of the distance maps naturally onto the science fiction concept of hyperspace — a separate dimensional realm where the speed-of-light barrier doesn't apply.

At very high speeds (Star Wars implies ~10^9 c), nearly 100% of the journey occurs through the imaginary dimension, which is exactly what hyperspace looks like in the films.

## Data Sources

- **Planet coordinates**: [parzivail/SWGalacticMap](https://github.com/parzivail/SWGalacticMap) — 5,444 planets with XY grid coordinates digitized from *The Essential Atlas* (2009, Jason Fry & Daniel Wallace)
- **Coordinate system**: ~20x20 grid, each unit ~ 5,000 light-years. True position = `(X + SubGridX, Y + SubGridY)`
- **Trade routes**: Compiled from Wookieepedia articles on major hyperspace lanes
- **Movie journeys**: Canonical routes from Episodes I-VII with approximate travel times

### Distance Calculation
```
gridDistance = sqrt((x2 - x1)^2 + (y2 - y1)^2)
distanceLY = gridDistance * 5000
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript + Vite |
| 2D Rendering | PixiJS 8 (WebGL) |
| 3D Rendering | Three.js + @react-three/fiber + drei |
| State | Zustand |
| Styling | Tailwind CSS 4 |
| Testing | Vitest |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npx vitest run

# Build for production
npm run build
```

## Project Structure

```
src/
  components/
    GalaxyMap/          # 2D PixiJS galaxy map (pan/zoom, planets, routes, selection)
    HyperspaceView/     # 3D Three.js tachyonic scene (galaxy plane, arc, ship)
    Sidebar/            # Search, filter, route/journey list
    Calculator/         # Relativity panel (subluminal + tachyonic modes)
  stores/               # Zustand stores (planets, routes, map state)
  utils/
    relativity.ts       # All SR + tachyonic formulas
    coordinates.ts      # Grid-to-pixel-to-lightyear transforms
    planets.ts          # Dataset merge, search, tier filtering
    constants.ts        # Physical constants, region colors
  data/
    planets.json        # 5,444 planets from parzivail dataset
    planets-supplemental.json  # Hand-curated missing movie planets
    planet-tiers.json   # Popularity tier assignments (1-4)
    trade-routes.json   # Trade routes + movie journeys
    regions.json        # Concentric region ring definitions
  types/
    index.ts            # TypeScript interfaces
```

## References

- Feinberg, G. (1967). "Possibility of Faster-Than-Light Particles." *Physical Review*, 159(5), 1089-1105.
- Bilaniuk, O.M.P., Deshpande, V.K., Sudarshan, E.C.G. (1962). "'Meta' Relativity." *American Journal of Physics*, 30, 718.
- Recami, E. (1986). "Classical Tachyons and Possible Applications." *Rivista del Nuovo Cimento*, 9(6), 1-178.
- Wallace, D. & Fry, J. (2009). *Star Wars: The Essential Atlas*. Del Rey.

## License

Educational project. Star Wars is a trademark of Lucasfilm Ltd. Planet data sourced from community projects. Not affiliated with Lucasfilm or Disney.
