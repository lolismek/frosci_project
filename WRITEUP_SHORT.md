# Star Wars Relativity Map — Short Write-Up

**Frontiers of Science · Alex Jerpelea**

> **For the professor:** this is a condensed summary of the project.
> The full write-up is in `WRITEUP.md`. Citations are at the bottom of
> this document and are load-bearing: every physics claim below
> traces to a specific paper in the references section. The
> speculative FTL regimes in particular are based on real
> peer-reviewed theoretical physics (Feinberg 1967, Recami 1986,
> Randall–Sundrum 1999, Chung–Freese 2000, Caldwell–Langlois 2001) —
> not on Star Wars fan lore.

---

## What we made

Space travel in Star Wars is physically impossible by way of how we currently understand the universe. We made an interactive web app that uses the Star Wars galaxy as a sandbox for computing special relativity concepts. Moreover, we also explore two speculative physics frameworks for making faster-than-light (FTL) travel work. Basically, we find some mathematically sound explanations for the so-called "hyperspace" the movies obsess over.

## How it works

Click two planets on the 5,444-planet map. Drag the speed slider. The calculator shows how long the trip takes — for both the person who stayed home and the person on the ship. Crank the slider past light speed and the map flips into a 3D "hyperspace" view, where you can pick between two physical interpretations of what FTL could actually mean.

## The three regimes

### 1. Subluminal — plain SR (v < c)

Textbook special relativity (Einstein 1905). Nothing controversial.

- **γ = 1 / √(1 − v²/c²)** — Lorentz factor
- **t = L / v** — home-frame trip time
- **τ = t / γ** — traveler's own aging

Coruscant to Tatooine is about 25,000 ly. At 0.999c the home clock waits ~25,000 years; the traveler ages ~1,100 years. Even at 0.999999c the traveler still ages decades per round trip. Under only SR, Star Wars is not geographically possible — interstellar empires aren't a thing.

### 2. Brane-bulk shortcut — the "tame" FTL

From **Randall & Sundrum (1999)** and **Chung & Freese (2000)**, with the shortcut arithmetic clarified by **Caldwell & Langlois (2001)**: maybe our 3D universe is a sheet (a "brane") floating in a higher-dimensional "bulk." A ship that leaves the brane, cuts across the bulk, and comes back out elsewhere takes a shorter path.

**The crucial point: the ship never locally exceeds c.** In its own neighborhood it's just a regular sublight ship, obeying normal SR — `v ≤ c` everywhere along its trajectory. The FTL is entirely geometric: the brane is wrinkled, so the on-brane path is long, but the straight chord through the bulk is short. It's like driving across a crumpled piece of paper vs. poking your finger through it — same two endpoints, two very different path lengths.

- **L′ = L / k** — bulk chord length (k = shortcut factor)
- **t = L′ / c** — ship moves at c locally, so wall time = chord / c
- **Apparent speed seen from the brane = k · c**

The 3D view wrinkles the galaxy into a ridged surface and draws the chord as a straight line through the bulk. Because `v ≤ c` locally, causality inside the ship's rest frame is intact — there's no Lorentz paradox, no imaginary quantities. The speculation is just whether the extra dimension exists, and whether macroscopic matter can leave the brane at all.

### 3. Tachyonic hyperspace — the "wild" FTL

From **Feinberg (1967)** and **Recami (1986, 2008)**, with frame-dependence first analyzed by **Bilaniuk, Deshpande & Sudarshan (1962)**: plug v > c into SR and see what falls out.

**The simple picture.** Ordinary matter is "stuck below" the speed of light — no matter how hard you accelerate, you asymptote toward c and never reach it. Tachyons are the mirror image: hypothetical particles that were *born* above c and are similarly stuck above it. They can't slow down to c any more than we can speed up to it. In this reading, a "hyperspace ship" is one that got converted to tachyonic matter and now lives on the other side of the light barrier.

**Why the math goes imaginary.** In the Lorentz factor `γ = 1/√(1 − v²/c²)`, setting `v > c` makes the thing under the square root negative — so you get an imaginary number out. This isn't the math "breaking"; it's the math's way of telling you you've crossed a regime boundary. If we take the imaginary γ seriously:

- **γ = −i / √(v²/c² − 1)** — imaginary Lorentz factor
- **τ = t / γ** — proper time also goes imaginary
- **Rapidity ζ = ½ ln|(v+c)/(v−c)| + i·π/2**

**The Wick quarter-turn.** Rapidity is the "natural" way physicists add velocities — a boost is just adding rapidities. In regular SR, boosting by a real rapidity is a hyperbolic rotation of the space-time plane (the thing that makes fast-moving clocks look slow). For `v > c`, the rapidity picks up an extra `+i·π/2` — an imaginary quarter-turn. Geometrically, that's equivalent to **rotating the time axis 90° into a space axis**. Space and time swap roles. That's what the 3D view visualizes: the ship's path curves off the A→B line into a perpendicular "imaginary" axis, drawn as a half-ellipse whose height scales with how far past c you are.

The ellipse isn't a literal trajectory (tachyons have no rest frame — Feinberg 1967). It's the Wick rotation drawn as geometry, so you can see what the math is doing. The app labels this honestly as sci-fi license.

## Real vs speculative

| Regime | Status |
|---|---|
| Subluminal SR | Textbook. Every number is a direct consequence of SR. |
| Brane-bulk | Real peer-reviewed theory. No extra dimension has been observed (sub-mm gravity tests, LHC missing-energy searches bound it but don't confirm it). No known mechanism for macroscopic brane-leaving. |
| Tachyonic | Mathematically consistent. **OPERA 2011** (superluminal neutrinos) was retracted in 2012 — faulty GPS timing cable. Hits causality paradoxes (Tolman's antitelephone). Tachyonic fields in QFT describe vacuum instabilities (**Sen 1998**), not FTL particles. |

The tachyonic tab shows a "Limitations" box in-app surfacing Bilaniuk–Sudarshan frame-dependence, the OPERA retraction, and the half-ellipse caveat. The point is to label the speculation *as* speculation.

## The data

The map isn't a guess. It's **5,444 real Star Wars planets** with Lucasfilm-licensed coordinates, sourced from the `parzivail/SWGalacticMap` project, which in turn digitizes **Wallace & Fry (2009)**, *Star Wars: The Essential Atlas* — the reference book Lucasfilm commissioned to reconcile a cartography that had been inconsistent across films, novels, and games for decades.

Each planet record has:

- **Name** (e.g. Coruscant, Tatooine, Dagobah)
- **Region** (Deep Core, Core, Colonies, Inner Rim, Expansion Region, Mid Rim, Outer Rim, Wild Space, Hutt Space, etc.)
- **Grid coordinates** `(trueX, trueY)` on a 21×21 grid
- **Tier** (1 = prominent worlds like Coruscant; 4 = obscure background mentions), used so the user can hide clutter

One grid unit ≈ 5,000 light-years, so the distance between any two planets is `√(Δx² + Δy²) · 5000` ly. The Atlas itself has built-in uncertainty — many minor planets only have grid-cell precision — so "Coruscant to Tatooine ≈ 25,500 ly" is accurate to the nearest ~5,000 ly at best. That's fine for our purposes: we're illustrating relativity, not navigating.

## Tech

Everything runs **entirely in the browser** — no server, no backend. The dataset and physics are bundled into the JavaScript at build time; the app is static files served from anywhere.

- **React 19 + TypeScript + Vite** — the UI framework. Vite is the build tool that ships our TypeScript to the browser as optimized JavaScript.
- **Zustand** — a small state library. When the user clicks a planet or moves the slider, Zustand updates a shared store; all the visual components re-render from that store. Keeps the physics, the map, and the calculator in sync.
- **PixiJS 8 (WebGL)** — renders the 2D galaxy map. WebGL is the browser's low-level GPU access, which is why we can draw all 5,444 colored planet dots and still pan/zoom at 60 fps. Plain HTML/SVG would choke at that count.
- **Three.js** via `@react-three/fiber` — renders the 3D "hyperspace" view. Three.js is the standard library for 3D in the browser; `react-three-fiber` lets us write the scene (wrinkled brane surface, bulk chord, tachyonic half-ellipse, animated ship) as React components instead of imperative code.
- **Vitest** — test runner. We have 60 unit tests pinning the physics formulas (γ at 0.5c / 0.9c / 0.99c, the Wick-rotation decomposition at v > c, the ellipse-axis formulas, round-trip aging, the brane-chord arithmetic). The tests run on every code change, so we can't accidentally break the physics while editing the UI.

**How the modes wire up.** The speed slider lives in the Zustand store as a number from 0 to 1. `relativity.ts` holds pure functions that turn that number into `v/c`, and then into `γ`, `t`, `τ`, chord length, rapidity, etc. When the slider crosses the `v = c` barrier, the app toggles between the 2D map (subluminal) and the 3D view (FTL), and the top-bar tabs let the user pick which FTL interpretation — brane-bulk or tachyonic — to show. The calculator panel reads the same store and swaps its formulas and narration accordingly.

## The argument

Under only special relativity, Star Wars is geographically impossible. The franchise's interstellar polities only make sense if *something* beats c — and the two serious physics ideas on the market (extra-dimensional shortcuts and tachyonic analytic continuation) are (a) real parts of the theoretical-physics literature, (b) currently unverified, and (c) visually distinct in a way you can actually see by dragging a slider.

## References

### Special relativity
- **Einstein, A.** (1905). "On the Electrodynamics of Moving Bodies." *Annalen der Physik*, 17, 891.

### Tachyonic interpretation
- **Feinberg, G.** (1967). "Possibility of Faster-Than-Light Particles." *Physical Review*, 159(5), 1089.
- **Bilaniuk, O.M.P., Deshpande, V.K., Sudarshan, E.C.G.** (1962). "'Meta' Relativity." *American Journal of Physics*, 30, 718.
- **Recami, E.** (1986). "Classical Tachyons and Possible Applications." *Rivista del Nuovo Cimento*, 9(6), 1–178.
- **Recami, E.** (2001). "Superluminal motions? A bird's-eye view of the experimental situation." *Foundations of Physics*, 31, 1119. [arXiv:physics/0101108]
- **Recami, E.** (2008). "Classical tachyons and applications: A review." [arXiv:0804.1502]
- **Adam, T. et al.** (OPERA Collaboration) (2012). "Measurement of the neutrino velocity..." *JHEP* 10, 093. *(retraction of the 2011 superluminal-neutrino claim)*
- **Sen, A.** (1998). "Tachyon Condensation on the Brane Antibrane System." [hep-th/9805170]

### Brane-bulk / extra dimensions
- **Randall, L., Sundrum, R.** (1999). "Large Mass Hierarchy from a Small Extra Dimension." *Physical Review Letters*, 83, 3370.
- **Chung, D.J.H., Freese, K.** (2000). "Can geodesics in extra dimensions solve the cosmological horizon problem?" *Physical Review D*, 62, 063513.
- **Caldwell, R.R., Langlois, D.** (2001). "Shortcuts in the fifth dimension." *Physics Letters B*, 511, 129.

### Dataset
- **Wallace, D. & Fry, J.** (2009). *Star Wars: The Essential Atlas*. Del Rey.
- **parzivail.** *SWGalacticMap.* github.com/parzivail/SWGalacticMap
