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

**The fiction we're using.** We imagine that entering Star Wars
hyperspace converts the ship into **tachyonic matter** — hypothetical
particles with imaginary rest mass (`m₀ = i·μ`) that were "born" above
c and can't slow below it, the same way ordinary matter can't speed up
to it. This is a Feinberg-style thought experiment, not a known
physical process: no one has detected tachyonic matter, no mechanism is
known for turning ordinary matter into it, and this mode does **not**
explain *how* a ship gets fast — only what special relativity says
about things that already are.

Under that premise, the rest-frame travel time is simply `t = L/v`.
Unlike the brane-bulk mode, **there is no local-c shortcut** — this
interpretation accepts real FTL and pays for it in imaginary proper
time, frame dependence, and broken causality.

**The ship stays in real 3-space at every v.** Crossing c is a binary
threshold — the worldline goes from timelike to spacelike — not a
gradient. The 3D half-ellipse in the hyperspace view is a **chart**
whose axes are the real displacement `L` and the magnitude of the
imaginary part of the Lorentz-contracted length; the ship's worldline
never occupies it. The arc looks flat just above c because
`√(v²/c²−1)` is small there, not because the ship is "partly in real
space."

The "imaginary numbers" come from analytically continuing special
relativity past v = c:

- **Lorentz factor.** `γ = 1/√(1 − v²/c²) = −i / √(v²/c² − 1)` — γ becomes
  imaginary. We surface the magnitude `|γ| = 1/√(v²/c² − 1)`.
- **Rapidity Wick rotation.** Rapidity is `ζ = atanh(v/c)`. The principal
  branch for v > c gives `ζ = ½ ln|(v+c)/(v−c)| + i·π/2`. The `+iπ/2` is
  a **quarter-turn in the complex plane** — the mechanism by which the
  time and space axes swap roles in a superluminal boost (Recami 1986,
  §6 on imaginary-angle rotations).
- **Imaginary proper time.** `τ = t/γ = i · t · √(v²/c²−1)`. The
  magnitude `|τ| = t · √(v²/c²−1)` is what the formula returns, but it
  has no operational meaning — tachyons have no rest frame (Feinberg
  1967).
- **Imaginary contracted length.** `L · √(v²/c²−1)` — the imaginary part
  of the Lorentz-contracted length. **Not a distance the ship covers.**
  The ship covers `L` of real space at speed `v`.

The 3D view shows a **half-ellipse** with semi-major `L/2` along the
A→B line and semi-minor `L · √(v²/c²−1) / 2` along the world-up
(imaginary) axis. This is a **diagram of the rapidity Wick rotation**,
not a trajectory — Recami himself draws straight spacelike worldlines
outside the light cone. The curve flattens to the A→B line as v → c⁺
and rises sharply at high v, mirroring the continuous quarter-turn of
ζ's imaginary component as `v/c` grows.

**Caveats (surfaced in the panel):**

- *Frame dependence.* The Bilaniuk–Sudarshan reinterpretation principle
  (1962) says a tachyon of speed v in one frame appears as an
  antiparticle of speed c²/v in another, with emission and absorption
  swapped. The A→B labels are frame-dependent.
- *Causality.* Tolman's antitelephone closes — two FTL observers can
  exchange signals along a timelike loop. Recami's framework re-labels
  rather than resolves this.
- *No evidence.* OPERA's 2011 anomaly was retracted in 2012; tachyonic
  fields in QFT describe vacuum instabilities, not FTL particles.

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

### Tachyonic
- Feinberg, G. (1967). "Possibility of Faster-Than-Light Particles." *Physical Review*, 159(5), 1089-1105.
- Bilaniuk, O.M.P., Deshpande, V.K., Sudarshan, E.C.G. (1962). "'Meta' Relativity." *American Journal of Physics*, 30, 718.
- Recami, E. (1986). "Classical Tachyons and Possible Applications." *Rivista del Nuovo Cimento*, 9(6), 1-178.
- Recami, E. (2001). "Superluminal motions? A bird's-eye view of the experimental situation." *Foundations of Physics*, 31, 1119. [arXiv:physics/0101108]
- Recami, E. (2008). "Classical tachyons and applications: A review." [arXiv:0804.1502]
- Adam, T. et al. (OPERA collaboration) (2012). "Measurement of the neutrino velocity with the OPERA detector in the CNGS beam using the 2012 dedicated data." *JHEP* 10 (2012) 093. (retraction of the 2011 anomaly)
- Rauscher, E. A., Targ, R. (2001). "The Speed of Thought: Investigation of a Complex Space-Time Metric..." *Journal of Scientific Exploration*, 15, 331.

### Brane-bulk
- Randall, L., Sundrum, R. (1999). "Large Mass Hierarchy from a Small Extra Dimension." *Physical Review Letters*, 83, 3370.
- Chung, D.J.H., Freese, K. (2000). "Can geodesics in extra dimensions solve the cosmological horizon problem?" *Physical Review D*, 62, 063513.
- Caldwell, R.R., Langlois, D. (2001). "Shortcuts in the fifth dimension." *Physics Letters B*, 511, 129.

### Dataset
- Wallace, D. & Fry, J. (2009). *Star Wars: The Essential Atlas*. Del Rey.

## License

Educational project. Star Wars is a trademark of Lucasfilm Ltd. Planet data sourced from community projects. Not affiliated with Lucasfilm or Disney.
