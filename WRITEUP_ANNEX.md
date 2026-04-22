# Theory Annex

**Star Wars Relativity Map · Frontiers of Science · Alex Jerpelea**

> This annex collects the extra theoretical detail that was cut from
> `WRITEUP_SHORT.md` for brevity. If you have read the short version
> and want to dig into the physics — the imaginary rest mass, the
> imaginary Lorentz contraction, the full Randall–Sundrum / Chung–
> Freese machinery, the list of things that could kill each model —
> this is the supplement. All citations from the short write-up still
> apply; a few new ones are added at the bottom.

---

## 1. Subluminal — extra numbers

The short version uses Coruscant → Tatooine at ~25,000 ly as the
example. At higher fractions of c the picture stays brutal:

- At **0.999c**, home time ≈ 25,000 yr, traveler ages ≈ 1,120 yr.
- At **0.999999c**, home time ≈ 25,000 yr, traveler ages ≈ 35 yr.
- At **0.99999999c** (γ ≈ 7,100), traveler ages ≈ 3.5 yr — but any
  shielded micrometeoroid is blue-shifted into a relativistic particle
  beam.

So even the "traveler barely ages" regime requires engineering that we
don't know how to build: radiation shielding against the CMB (blue-
shifted into X-rays at γ ≳ 1000), propellant for γ ≳ 10 (rocket
equation), and the social cost of coming home to a planet where 25,000
years have passed.

---

## 2. Brane-bulk — the full picture

### Null geodesics that leave the brane

The Chung–Freese / Caldwell–Langlois result is specifically about
**null geodesics** (light-speed paths) in the bulk. Two points A and B
on the brane can be connected either by:

- a brane-bound null geodesic of length `L_brane` (the light path along
  the brane), taking time `L_brane / c`, or
- a bulk null geodesic of length `L_bulk < L_brane` (a chord through
  the higher-dimensional bulk), taking time `L_bulk / c`.

Because both paths move at c locally, the *bulk* path arrives earlier
in coordinate time. An observer on the brane, who sees only the
apparent separation `L_brane` and the arrival time `L_bulk / c`, infers
an apparent speed `(L_brane / L_bulk) · c = k · c > c`.

This is why the short write-up stresses `v ≤ c` locally: the ship
really is moving at (or below) light speed at every point along its
trajectory. The FTL is a **coordinate effect**, not a physical
violation.

### Why Randall–Sundrum makes this plausible

Randall & Sundrum (1999) proposed that our 4D spacetime is a brane
embedded in a 5D bulk with a warped metric
`ds² = e^{−2k|y|} η_{μν} dx^μ dx^ν + dy²`. Gravitons (and potentially
other bulk fields) can propagate off the brane; Standard-Model fields
in the simplest version are pinned to it. Chung & Freese showed that a
graviton shortcut through the bulk can beat the brane-bound photon
path. Caldwell & Langlois turned the geometry into the compact chord
arithmetic we actually compute: `L_bulk = L_brane / k`.

### Real open problems

- **No extra dimension detected.** Sub-millimeter tests of the
  inverse-square law (Adelberger et al. 2003, Kapner et al. 2007) and
  LHC missing-energy searches bound the scale of possible extra
  dimensions but don't confirm them.
- **No mechanism for macroscopic brane-leaving.** In the original RS
  construction, Standard-Model matter is stuck on the brane by
  construction. Letting a ship (let alone its crew) off the brane
  requires either a different braneworld model or an unknown mechanism.
- **The shortcut factor `k` is a free parameter in our app.** In a
  real scenario, `k` would be fixed by the bulk warping and the ship's
  bulk trajectory — neither of which we model. We expose `k` as a
  slider constrained only by the route's `v_apparent = L_brane / L_chord`
  curvature limit.

---

## 3. Tachyonic — the full picture

### Imaginary rest mass

Tachyonic matter, in the Feinberg/Recami picture, is characterized by
an **imaginary rest mass** `m₀ = iμ` where μ is real. The physical
energy and momentum,

```
E = m₀ c² / √(1 − v²/c²)      p = m₀ v / √(1 − v²/c²)
```

then work out to real numbers when `v > c`, because the `iμ` in the
numerator and the `√(−)` in the denominator cancel. The invariant
`E² − p²c² = m₀²c⁴ = −μ²c⁴` is negative — the defining feature of
tachyons in QFT. So "imaginary rest mass" is the technical way of
saying: tachyons carry real, positive energy and momentum, but their
dispersion relation has the opposite sign to ordinary matter. A
tachyon **speeds up** as it loses energy and would take infinite
energy to slow to c — the exact mirror of an ordinary particle.

### The Wick quarter-turn, in detail

Rapidity `ζ = atanh(v/c)` is the "natural" velocity parameter in SR
because boosts simply add rapidities. For `v < c`, ζ is real and a
boost is a *hyperbolic* rotation of the space-time plane. For `v > c`,
the principal branch of atanh gives

```
ζ = ½ ln|(v + c)/(v − c)|  +  i·π/2
```

The `+i·π/2` means a superluminal boost is an imaginary-rapidity
boost, and since `sin(iθ) = i sinh θ` and `cos(iθ) = cosh θ`, an
imaginary-rapidity boost is mathematically a **real trigonometric
rotation**. A quarter turn in the `(t, x)` plane rotates the time
axis onto the space axis. That's what "space and time swap" means
rigorously, and that's what the 3D half-ellipse in the app
visualizes: the ship curves off the A→B line and into a perpendicular
"imaginary" direction whose size is the imaginary contraction length.

### Imaginary proper time

Plugging v > c into `τ = t / γ`:

```
τ = t · √(1 − v²/c²) = i · t · √(v²/c² − 1)
```

so `|τ| = t · √(v²/c² − 1)`. The app displays `|τ|` with an explicit
`·i` label. Be careful with the interpretation: **tachyons have no
rest frame** (Feinberg 1967) — there is no inertial observer who sees
the tachyon at rest and can read a proper time off its clock. We
surface `|τ|` because it's what the formula returns, and because it
parameterizes the ellipse's imaginary axis, not because it's a time
any physical clock records.

### Imaginary contracted length

The Lorentz contraction `L_moving = L / γ` for `γ` imaginary gives

```
L_moving = L · √(v²/c² − 1) · i
```

This is not a distance the ship actually traverses — the ship covers
the real distance `L` in time `t = L/v`. It's the *imaginary component*
of the contracted length, and it's the quantity that sets the size of
the 3D ellipse's perpendicular axis. So the ellipse's geometry is:

- **semi-major** `L/2` along the A → B direction (real space)
- **semi-minor** `L · √(v²/c² − 1) / 2` along the perpendicular
  "imaginary" axis (where the time axis has Wick-rotated into)

As `v → c⁺`, the semi-minor collapses and the ellipse flattens onto
the brane — hyperspace "merges" back into real space. At high v, the
ellipse balloons into the imaginary axis. The 3D animation in the app
makes this visible: drag the slider and watch the ellipse inflate.

### A design choice: we let the ship fly the arc

A strict Recami reading says the tachyon's worldline stays in real
3-space for every `v > c`; the arc is a *chart* of the Wick rotation,
not a *trajectory*, and the particle never occupies it. We considered
this reading and chose instead to animate the ship along the half-
ellipse. The reasoning:

- **Tachyonic matter is itself an unsolved question.** Nothing has
  ever been detected. Asking whether the arc is "really a path"
  presupposes an ontology we don't have.
- **Star Wars hyperspace is a narrative device.** Rendering the ship
  along the geometric object that encodes the Wick rotation turns the
  math into the visual — you *see* the half-ellipse inflate as you
  crank `v/c`, and you *see* it collapse back to the A → B line as
  `v → c⁺`.
- **The app labels the choice.** The Calculator text explicitly says:
  "we draw the ship along the half-ellipse because it reads the
  imaginary-γ contraction geometrically; treat it as sci-fi license,
  not a prediction."

### Causality paradoxes, in detail

Two FTL observers, each carrying a tachyonic transmitter, can in
principle exchange signals around a **closed timelike loop** —
"Tolman's antitelephone." If A sends a message to B at v > c in some
frame, then B replies at v > c in a frame boosted relative to A, the
reply can arrive at A *before* the original was sent. Recami's
Extended Relativity re-labels which event is emission and which is
absorption depending on frame (the "switching principle"), so that
from any single observer's perspective no closed loop is visible. But
most relativists read this as **relabeling the paradox, not
resolving it** — the global spacetime picture still contains the
closed loop.

### Tachyonic fields vs. tachyonic particles

When tachyons show up in real physics — the Higgs field before
symmetry breaking, Sen's (1998) open-string tachyons, certain scalar
fields in cosmology — they describe **vacuum instabilities**, not
FTL-moving particles. The imaginary mass signals that the field is
sitting at a local maximum of its potential and will roll off to a
true minimum. Nothing is actually moving faster than light. This is
why the professional consensus is that the particle-tachyon reading
(what our app visualizes) is a literary interpretation, not a likely
physical reality. We visualize it because *Star Wars is a literary
artifact* and the Recami/Feinberg math is the most internally
consistent formalism we have for it.

---

## 4. Formulas actually running in the code

From `src/utils/relativity.ts`:

| Function | Formula |
|---|---|
| `calculateGamma(v/c)` | `1 / √(1 − (v/c)²)` |
| `calculateTravel(L, v/c)` | `t = L / v`, `τ = t / γ` |
| `calculateRoundTrips(L, v/c, 30, 6)` | twin-paradox table — start age 30, up to 6 round trips (7 rows incl. start) |
| `calculateTachyonicGamma(v/c)` | `1 / √((v/c)² − 1)` (magnitude) |
| `calculateTachyonicRapidity(v/c)` | `{real: ½ ln\|(v+c)/(v−c)\|, imag: π/2}` |
| `calculateTachyonicTravel(L, v/c)` | rest-frame time, `\|τ\|`, `L·√((v/c)²−1)`, ellipse axes |
| `calculateBraneBulkTravel(L, k)` | `L_bulk = L/k`, `t = L_bulk/c`, `v_apparent = k·c` |

Each of these is covered by unit tests in `src/utils/relativity.test.ts`
(60 tests total) that pin down: known γ values at 0.5c / 0.9c / 0.99c,
symmetry of `|γ|` around `v = c`, the Wick-rotation decomposition of
tachyonic rapidity, the rest-frame-time identity `t = L/v`, and the
ellipse semi-minor cap used by the 3D camera.

---

## 5. UI implementation detail

### The Calculator's "Derivation" strip

The Calculator panel surfaces the formulas themselves as a **Derivation
strip** below the split-frame result. For each regime it shows the
symbols, the expression, and the evaluated number side-by-side:

- **Subluminal** — `β = v/c`, `γ = 1/√(1 − β²)`, `t = L/v`, `τ = t/γ`
- **Tachyonic** — `β = v/c`, `|γ| = 1/√(β² − 1)`, `t = L/v` (plus the
  rapidity decomposition in its own Argand box)
- **Brane-bulk** — `k` (shortcut factor), `L′ = L/k`, `t = L′/c`

So the viewer can see both the qualitative outcome (years at home vs.
aboard) and the arithmetic that produced it, in the same card.

### The speed slider

Logarithmic in `v/c`. Crossing `v = c` sits at 72 % of the track
(subluminal half gets 72 % of the width, superluminal half gets 28 %),
with the near-c region expanded so you can actually aim at 0.999c vs
0.9999c vs 0.99999c. The value is stored as a number in `[0, 1]`;
`sliderToSpeed` (in `relativity.ts`) maps it to the actual `v/c`.

### The three 3D visuals

- **Subluminal:** the 3D view is not used; the 2D PixiJS map is
  shown.
- **Brane-bulk:** the galaxy plane is rendered as a deterministic
  wrinkled surface (`braneHeight(x, y)` — a sum of a few sines, stable
  under zoom). The ship flies a straight line through 3D space between
  the two planets' brane-surface points, cutting through whatever
  ridges lie between.
- **Tachyonic:** `HalfEllipseCurve` is a `THREE.Curve<Vector3>` whose
  `getPoint(θ)` maps `θ ∈ [0, π]` onto a half-ellipse in the plane
  spanned by the A → B line and world-up. The semi-minor axis is
  `L · √(v²/c² − 1) / 2` (with a cap so the camera frustum stays
  usable at extreme speeds). `ShipAnimation` drives a ship mesh along
  that curve one way, then fades out and restarts.

---

## 6. Honest caveats — full list

### Subluminal

No caveats. Every number in the subluminal regime is a direct
consequence of textbook SR (Einstein 1905). If any of those numbers
are wrong, SR is wrong — that's the bar.

### Brane-bulk

- **No extra dimension has been detected.** Precision tests of gravity
  (sub-millimeter inverse-square law: Adelberger et al. 2003, Kapner
  et al. 2007; LHC missing-energy searches) bound the scenarios but
  don't confirm them.
- **No known mechanism lets a macroscopic object leave the brane.**
  Standard-Model fields are, in the original RS setup, pinned to the
  brane by construction.
- **The shortcut factor is a free parameter in our app.** A real
  scenario would fix it by the warping of the bulk geometry and the
  ship's bulk trajectory. We don't model either; we expose `k` as a
  slider bounded by per-route curvature limits.

### Tachyonic

- **No evidence.** OPERA's 2011 superluminal neutrino anomaly was
  retracted in 2012 (faulty GPS timing cable — Adam et al. 2012).
  Tachyonic fields appear in QFT — the Higgs before symmetry
  breaking, open-string tachyons in Sen's 1998 analysis — but they
  describe **vacuum instabilities**, not FTL particles.
- **No mechanism.** The app does not explain *how* a ship becomes
  tachyonic. The premise "entering hyperspace converts the ship to
  tachyonic matter" is fiction grafted onto the math.
- **Frame dependence (Bilaniuk–Sudarshan 1962).** A tachyon of speed
  `v` in one frame appears in another as an antiparticle of speed
  `c²/v` with emission and absorption swapped. The A → B labels in
  our diagram are not frame-invariant.
- **Causality (Tolman's antitelephone).** Two FTL observers can
  exchange signals around a closed timelike loop. Recami's Extended
  Relativity re-labels rather than resolves this; most relativists do
  not accept the patch.
- **The half-ellipse isn't a Recami-sanctioned trajectory.** As
  discussed in §3 above, we chose visual clarity over strict orthodoxy
  and surface that choice in the Calculator text.

### The dataset

Planet positions come from *The Essential Atlas* (Wallace & Fry
2009), which is itself a Lucasfilm-licensed reconciliation of a
franchise that never had consistent cartography. Many minor planets
only have grid-cell coordinates, not precise ones. Distances are
to-the-nearest-5,000 ly at best. For a relativity sandbox this is
fine; for navigation you would not trust it.

---

## Additional references

These are referenced here but not in the short write-up. The short
write-up's bibliography remains the primary citation list.

- Adelberger, E.G. et al. (2003). "Tests of the gravitational inverse-square law." *Annual Review of Nuclear and Particle Science*, 53, 77.
- Kapner, D.J. et al. (2007). "Tests of the gravitational inverse-square law below the dark-energy length scale." *Physical Review Letters*, 98, 021101.
- Tolman, R.C. (1917). *The Theory of the Relativity of Motion.* University of California Press. (Source of the "antitelephone" paradox, later formalized for tachyons by Benford, Book & Newcomb 1970.)
- Benford, G.A., Book, D.L., Newcomb, W.A. (1970). "The Tachyonic Antitelephone." *Physical Review D*, 2, 263.
