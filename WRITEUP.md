# Star Wars Relativity Map — Project Write-Up

**Frontiers of Science** · Alex Jerpelea

---

## What this project is

An interactive web app that uses the Star Wars galaxy as a sandbox for
teaching special relativity. You pick two planets on a 5,444-planet map,
drag a speed slider, and the app shows what the journey looks like under
three different physical regimes:

1. **Subluminal** (`v < c`) — ordinary special relativity, with time
   dilation and round-trip aging.
2. **Brane-bulk shortcut** (`v ≤ c` locally, but FTL apparent) — one of
   the more seriously-studied FTL models: the ship never locally exceeds
   c, but takes a shortcut through a hypothetical extra dimension.
3. **Tachyonic hyperspace** (`v > c`) — the Recami/Feinberg analytic
   continuation of SR past light speed. Internally consistent as
   arithmetic, physically speculative, and the option we associate with
   the fiction of Star Wars hyperspace.

The goal is to make *why Star Wars needs hyperspace* visceral: at
0.999c, a trip across the galaxy takes tens of thousands of years. The
app then offers two physics-motivated ways to get faster, honest about
which parts are textbook SR and which parts are frontier speculation.

---

## Theoretical picture

### 1. Subluminal special relativity

At speed `v < c` over a rest-frame distance `L`:

- **Lorentz factor** `γ = 1 / √(1 − v²/c²)`
- **Rest-frame (home) time** `t = L / v`
- **Traveler proper time** `τ = t / γ`

**Intuition.** As `v → c`, `γ → ∞`, `τ → 0`. The traveler's clock
slows; the home-frame clock does not. For a round trip, the traveler
comes back younger than the people who stayed — the classic twin
paradox, which the app exposes as a cumulative aging table over
repeated round trips.

At galactic scales this is brutal. Coruscant to Tatooine is roughly
50,000 light-years. At 0.999c:

- Home-frame time: ≈ 50,050 years
- Traveler proper time: ≈ 2,240 years

Even at 0.999999c the traveler ages ≈ 70 years — meaning every round
trip cashes out decades of life on both ends. Civilization-level
interstellar travel using only SR is essentially a one-way exile.

### 2. Brane-bulk shortcut (the grounded FTL option)

This comes from the **Randall-Sundrum** braneworld program and
specifically the papers of **Chung & Freese (2000)** and
**Caldwell & Langlois (2001)**: our 4D spacetime may be a
"brane" embedded in a higher-dimensional "bulk." Null geodesics that
leave the brane and re-enter it elsewhere can connect two brane points
in less coordinate time than a brane-bound light ray.

The ship never exceeds `c` *locally* — at every moment of its history
it moves at or below light speed in its immediate neighborhood. The
FTL is apparent, not local.

**Arithmetic used in the app.** Let `L` be the on-brane (great-circle)
distance between planets A and B. The app lets the user pick a
**shortcut factor** `f ≥ 1`:

- **Bulk chord length** `L_bulk = L / f`
- **Travel time** `t = L_bulk / c`
- **Apparent speed** `v_apparent = L / t = f · c`

So `f` is the "how many times faster than light it looks from the
brane" dial. The slider caps `f` so the chord never crosses the
brane's sensible embedding — the 3D view actually bends the galaxy
plane into a ridged surface, and the chord is drawn as a straight line
through the bulk.

**Why this is the comfortable FTL.** Local causality is intact. No
imaginary quantities. The math is just Euclidean geometry in one extra
dimension. The speculative parts are (a) whether an extra dimension
exists, and (b) whether anything macroscopic can leave the brane.

### 3. Tachyonic hyperspace (the speculative FTL option)

This is the Recami/Feinberg reading: just analytically continue SR past
`v = c` and see what falls out. The ship is reinterpreted as
**tachyonic matter** — hypothetical particles with imaginary rest mass
`m₀ = iμ` that were "born" above `c` and can't slow below it, exactly
mirroring how ordinary matter can't speed up to it.

**Lorentz factor.** Plugging `v > c` into `γ = 1/√(1 − v²/c²)` gives a
negative number under the square root, so

```
γ = 1/√(1 − v²/c²) = −i / √(v²/c² − 1)
```

`γ` becomes imaginary. The app surfaces its magnitude,
`|γ| = 1/√(v²/c² − 1)`, which is always `< 1`.

**Rapidity and the Wick quarter-turn.** Rapidity is
`ζ = atanh(v/c)`. For `v > c` the principal branch gives

```
ζ = ½ ln|(v+c)/(v−c)| + i·π/2
```

That `+iπ/2` is the key. A boost by rapidity `ζ` mixes time and space
like a hyperbolic rotation; a boost by an imaginary rapidity is an
ordinary trigonometric rotation — in the Argand plane, a **quarter
turn**. The app draws this as a small SVG: a horizontal real axis, a
vertical imaginary axis, and a rapidity arrow pointing upward at π/2.

This quarter-turn is the geometric content of "time and space axes
swap" for superluminal boosts. Visually, the 3D hyperspace view is a
half-ellipse with:

- semi-major `L/2` along the A → B direction
- semi-minor `L · √(v²/c²−1) / 2` along a perpendicular "imaginary"
  axis

As `v → c⁺` the semi-minor collapses and the ellipse flattens onto
the brane; at high `v` the ellipse balloons into the imaginary axis.
That shape *is* the rapidity Wick rotation drawn geometrically.

**Travel time.** In the rest frame, simply `t = L / v`. There's no
local-c shortcut — the ship *does* exceed c in every frame that can
see it, and pays for it in other ways.

**Imaginary proper time.** `τ = t/γ = i · t · √(v²/c²−1)`. The app
shows `|τ|` with an explicit `·i` label and a note that this number is
formal — tachyons have no rest frame (Feinberg 1967), so no clock
actually records `τ`. We show it because it's what the formula returns.

**Imaginary contracted length.** `L · √(v²/c²−1)` is the imaginary
component of the Lorentz contraction when `γ` is imaginary. It's not
a distance the ship travels — the ship covers `L` of real space at
speed `v` — but it's the number that parameterizes the ellipse's
imaginary axis.

### A design choice: we let the ship fly the arc

A strict reading of Recami says the ship's worldline stays in real
3-space for every `v > c`; the arc is a chart, not a trajectory, and
the ship never occupies it. We considered this reading, and chose
instead to animate the ship *along* the half-ellipse. The reasoning:

- Tachyonic matter is itself an unsolved question. Nothing has ever
  been detected. Asking whether the arc is "really a path" presupposes
  an ontology we don't have.
- Star Wars hyperspace is a narrative device. Rendering the ship along
  the geometric object that encodes the Wick rotation turns the math
  into the visual — you *see* the half-ellipse inflate as you crank
  `v/c`, and you *see* it collapse back to the A-B line as `v → c⁺`.
- The app frames this honestly in the Calculator text: "we draw the
  ship along the half-ellipse because it reads the imaginary-γ
  contraction geometrically; treat it as sci-fi license, not a
  prediction."

---

## Formulas actually running in the code

From `src/utils/relativity.ts`:

| Function | Formula |
|---|---|
| `calculateGamma(v/c)` | `1 / √(1 − (v/c)²)` |
| `calculateTravel(L, v/c)` | `t = L / v`, `τ = t / γ` |
| `calculateRoundTrips(L, v/c, 30, 6)` | twin-paradox table — start age 30, up to 6 round trips (7 rows incl. start) |
| `calculateTachyonicGamma(v/c)` | `1 / √((v/c)² − 1)` (magnitude) |
| `calculateTachyonicRapidity(v/c)` | `{real: ½ ln\|(v+c)/(v−c)\|, imag: π/2}` |
| `calculateTachyonicTravel(L, v/c)` | rest-frame time, `\|τ\|`, `L·√((v/c)²−1)`, ellipse axes |
| `calculateBraneBulkTravel(L, f)` | `L_bulk = L/f`, `t = L_bulk/c`, `v_apparent = f·c` |

There is a test suite (`src/utils/relativity.test.ts`) with 60 tests
that pin these down: known γ values at 0.5c / 0.9c / 0.99c, symmetry
around c, the Wick-rotation decomposition, the rest-frame-time
identity, and the ellipse semi-minor cap.

The Calculator panel also surfaces the formulas themselves as a
**Derivation strip** below the split-frame result. For each regime
it shows the symbols, the expression, and the evaluated number
side-by-side:

- **Subluminal** — `β = v/c`, `γ = 1/√(1 − β²)`, `t = L/v`, `τ = t/γ`
- **Tachyonic** — `β = v/c`, `|γ| = 1/√(β² − 1)`, `t = L/v`
  (plus the rapidity decomposition in its own Argand box)
- **Brane-bulk** — `k` (shortcut factor), `L′ = L/k`, `t = L′/c`

So the viewer can see both the qualitative outcome (years at home vs.
aboard) and the arithmetic that produced it, in the same card.

---

## Tech stack and architecture

| Layer | Choice | Why |
|---|---|---|
| Framework | React 19 + TypeScript + Vite | modern, fast dev loop |
| 2D map | PixiJS 8 (WebGL) | can render 5,000+ planets at 60fps |
| 3D view | Three.js via `@react-three/fiber` + `drei` | declarative 3D inside React |
| State | Zustand | minimal boilerplate, good for cross-component selection state |
| Styling | Tailwind CSS 4 | fast to iterate |
| Tests | Vitest | colocated, fast |

**Data.** 5,444 planets from the `parzivail/SWGalacticMap` dataset,
which digitizes *The Essential Atlas* (Wallace & Fry, 2009). Each
planet has a grid coordinate; one grid unit ≈ 5,000 light-years, so
distance is `√((Δx)² + (Δy)²) · 5000` ly.

**UI surface.** The app is laid out on a fixed 1440 × 900 "observatory"
stage that scales-to-fit any viewport (the letterbox around it is
intentional — it keeps the typography and slider ergonomics stable
across screens). The top bar carries the three regime tabs —
**Subluminal · Tachyonic · Brane-bulk** — plus the current A → B
selection. The left sidebar has two cards (planet selection / search,
and the Atlas tier filter); the right sidebar holds canon trade routes
and movie journeys. The bottom bar is the speed slider (left) and the
Calculator split-frame (right), with the map or hyperspace view
filling the center.

**How the modes are wired.** The speed slider is logarithmic — linear
perception of `γ` matters more than linear `v/c`, and the `v = c`
barrier sits at 72 % of the track so the subluminal and superluminal
halves both have room to breathe. Below `c` the view is always
subluminal SR. Crossing `v = c` unlocks an `interpretationMode` flag
(`tachyonic` or `brane-bulk`), selected by the top-bar tabs; this
flag decides which of the two FTL readings the 3D view and Calculator
show. The 2D map and 3D view cross-fade at the c-barrier.

**How the FTL visuals are drawn.**

- Brane-bulk: the galaxy plane becomes a deterministic wrinkled surface
  (`braneHeight(x,y)` — a sum of a few sines, stable under zoom). The
  ship flies a straight line through 3D space between the two planets'
  brane-surface points, cutting through whatever ridges lie between.
- Tachyonic: `HalfEllipseCurve` is a `THREE.Curve<Vector3>` whose
  `getPoint(θ)` maps `θ ∈ [0, π]` onto a half-ellipse in the plane
  spanned by the A→B line and world-up. `ShipAnimation` drives a
  ship sprite along that curve one way, then fades out and restarts.

---

## Honest caveats

The project is explicit about what it is and isn't doing.

**The subluminal case is textbook.** No caveats. Every number in the
subluminal regime is a direct consequence of SR.

**Brane-bulk is theoretically motivated but empirically unverified.**
Randall-Sundrum and its geodesic-shortcut descendants are serious,
peer-reviewed papers. But:

- No extra dimension has been detected. Precision tests of gravity
  (sub-millimeter inverse-square law, LHC missing-energy searches) bound
  the scenarios but don't confirm them.
- No known mechanism lets a macroscopic object leave the brane.
  Standard-Model fields are, in the original RS setup, pinned to the
  brane by construction.
- The "shortcut factor" we expose as a slider is a free parameter. A
  real scenario would fix it by the warping of the bulk geometry and
  the ship's bulk trajectory. We don't model either.

**Tachyonic is speculative even within physics.** Even granting the
Recami machinery:

- **No evidence.** OPERA's 2011 superluminal neutrino anomaly was
  retracted in 2012 (faulty GPS timing cable). Tachyonic fields appear
  in QFT — the Higgs before symmetry breaking, open-string tachyons in
  Sen's 1998 analysis — but they describe **vacuum instabilities**,
  not FTL particles.
- **No mechanism.** The app does not explain *how* a ship becomes
  tachyonic. The premise "entering hyperspace converts the ship to
  tachyonic matter" is fiction grafted onto the math.
- **Frame dependence (Bilaniuk–Sudarshan, 1962).** A tachyon of speed
  `v` in one frame appears in another as an antiparticle of speed `c²/v`
  with emission and absorption swapped. The A→B labels in our diagram
  are not frame-invariant.
- **Causality (Tolman's antitelephone).** Two FTL observers can
  exchange signals around a closed timelike loop. Recami's Extended
  Relativity re-labels rather than resolves this; most relativists do
  not accept the patch.
- **The half-ellipse isn't a Recami-sanctioned trajectory.** As
  discussed above, we chose visual clarity over strict orthodoxy and
  surface that choice in the Calculator text.

**The dataset has its own uncertainties.** Planet positions come from
*The Essential Atlas*, which is itself a Lucasfilm-licensed
reconciliation of a franchise that never had a consistent
cartography. Many minor planets only have grid-cell coordinates, not
precise ones. Distances are to-the-nearest-5000-ly at best.

---

## What the project argues

The honest version of Star Wars' scale-of-the-galaxy problem is:

> Under only special relativity, Star Wars is geographically
> impossible. The franchise's interstellar polities only make sense if
> *something* beats `c`, and the two serious physics ideas on the
> market — extra-dimensional shortcuts and tachyonic analytic
> continuation — are (a) real parts of the theoretical-physics
> literature, (b) currently unverified, and (c) visually distinct in a
> way you can actually see by dragging a slider.

The app is a way to make that argument concrete. The numbers are
real; the speculation is labeled as speculation; and the visual
metaphors come from the diagrams physicists actually draw.

---

## References

### Special relativity (standard)
- Einstein, A. (1905). "On the Electrodynamics of Moving Bodies." *Annalen der Physik*, 17, 891.

### Tachyonic interpretation
- Feinberg, G. (1967). "Possibility of Faster-Than-Light Particles." *Physical Review*, 159(5), 1089.
- Bilaniuk, O.M.P., Deshpande, V.K., Sudarshan, E.C.G. (1962). "'Meta' Relativity." *Am. J. Phys.*, 30, 718.
- Recami, E. (1986). "Classical Tachyons and Possible Applications." *Riv. Nuovo Cim.*, 9(6), 1-178.
- Recami, E. (2001). "Superluminal motions? A bird's-eye view of the experimental situation." *Found. Phys.*, 31, 1119. [arXiv:physics/0101108]
- Recami, E. (2008). "Classical tachyons and applications: A review." [arXiv:0804.1502]
- Adam, T. et al. (OPERA) (2012). "Measurement of the neutrino velocity..." *JHEP* 10 (2012) 093. (retraction)
- Sen, A. (1998). "Tachyon Condensation on the Brane Antibrane System." [hep-th/9805170]

### Brane-bulk / extra dimensions
- Randall, L., Sundrum, R. (1999). "Large Mass Hierarchy from a Small Extra Dimension." *Phys. Rev. Lett.*, 83, 3370.
- Chung, D.J.H., Freese, K. (2000). "Can geodesics in extra dimensions solve the cosmological horizon problem?" *Phys. Rev. D*, 62, 063513.
- Caldwell, R.R., Langlois, D. (2001). "Shortcuts in the fifth dimension." *Phys. Lett. B*, 511, 129.

### Dataset
- Wallace, D. & Fry, J. (2009). *Star Wars: The Essential Atlas*. Del Rey.
- parzivail. *SWGalacticMap*. github.com/parzivail/SWGalacticMap
