/**
 * Global brane-wrinkle field for the brane-bulk visualization.
 *
 * Physics framing: in Randall-Sundrum / Chung-Freese brane-bulk cosmology
 * (Chung & Freese 2000; Caldwell & Langlois 2001; Ishihara 2001) the
 * brane's embedding in the bulk is a FIXED global property — it does not
 * change based on what signals travel through it, nor on any observer's
 * choice. The apparent-superluminal speed for a route from A to B is
 * fixed by the geometry:
 *
 *     v_apparent / c  ≈  L_brane_geodesic(A→B) / L_bulk_chord(A→B)
 *
 * The magnitude is bounded by the brane's extrinsic curvature along the
 * route; flat regions give no shortcut, more crumpled regions give larger
 * shortcuts. We reproduce that here:
 *
 *   - a deterministic, seeded sum of sinusoids for the background wrinkle
 *   - three "hyperspace lane" ridges (corrugated Gaussian tubes) that
 *     produce regions where the brane is more deformed. Routes aligned
 *     with or crossing these lanes enjoy a much higher geometric
 *     shortcut than routes in nearly-flat regions — the same behavior
 *     the real theory predicts, now tied to visible geometry instead of
 *     an unphysical "dial."
 *
 * Scaling — decoupling visual and computational magnitudes. A brane that
 * LOOKS believably bent (base amplitudes ≲ 0.3 grid units, lane peaks
 * ≲ 0.9) produces only modest geometric ratios. In practice the field
 * yields G ≈ 1.00 (flat corners), G ≈ 1.25–1.35 (routes brushing a
 * lane), G ≈ 1.40–1.55 (routes along a full lane). For Star Wars–canon
 * apparent speeds (tens to thousands of c) we dramatize G monotonically
 * via a scaled power law:
 *
 *     apparentMax = 1 + (DRAMATIZATION_GAIN · (G − 1)) ^ DRAMATIZATION_POWER
 *
 * with GAIN = 10, POWER = 3.5. Representative values:
 *
 *     G = 1.00 →    1.00c  (flat — literally no shortcut)
 *     G = 1.05 →    1.01c  (off-lane, numerical noise)
 *     G = 1.25 →   26c     (brushing a lane)
 *     G = 1.35 →   81c     (partial lane traverse)
 *     G = 1.45 →  194c     (full lane)
 *     G = 1.55 →  449c     (full lane, strong)
 *
 * The raw G and the dramatized apparentMax are surfaced separately in
 * the UI so users see both the honest geometric number and the
 * canon-faithful speed. Nothing in the mesh itself depends on the slider
 * or on planet selection — picking Coruscant → Tatooine cannot "fold"
 * the galaxy any differently than it already is.
 */

export const DRAMATIZATION_GAIN = 10;
export const DRAMATIZATION_POWER = 3.5;

// --- Background wrinkle: fixed phases so it's deterministic.
const BASE_COMPONENTS = [
  { kx: 0.42, kz: 0.31, px: 1.27, pz: 0.63, amp: 0.22 },
  { kx: 0.27, kz: 0.71, px: 3.44, pz: 2.11, amp: 0.18 },
  { kx: 0.83, kz: 0.41, px: 2.00, pz: 4.50, amp: 0.14 },
  { kx: 0.17, kz: 0.19, px: 5.21, pz: 1.33, amp: 0.24 },
  { kx: 0.56, kz: 0.66, px: 0.77, pz: 3.80, amp: 0.12 },
] as const;

// --- Hyperspace lanes: elongated corrugated tubes. Positions chosen so
// three distinct corridors cross the galaxy at different angles, giving
// some routes a dramatic shortcut and leaving most of the plane
// relatively flat.
const LANES = [
  {
    ax: 3.0,  az: 4.0,
    bx: 18.0, bz: 17.5,
    amp: 0.92,
    width: 1.05,
    corrFreq: 1.75,
    corrPhase: 0.4,
    fadeMargin: 1.8,
  },
  {
    ax: 4.0,  az: 17.5,
    bx: 17.5, bz: 3.5,
    amp: 0.80,
    width: 0.92,
    corrFreq: 2.05,
    corrPhase: 2.3,
    fadeMargin: 1.6,
  },
  {
    ax: 10.0, az: 2.5,
    bx: 11.5, bz: 19.0,
    amp: 0.72,
    width: 1.00,
    corrFreq: 1.55,
    corrPhase: 1.1,
    fadeMargin: 1.8,
  },
] as const;

function smoothWindow(x: number, len: number, margin: number): number {
  if (x <= -margin) return 0;
  if (x >= len + margin) return 0;
  if (x < 0) {
    const t = (x + margin) / margin;
    return 0.5 - 0.5 * Math.cos(Math.PI * t);
  }
  if (x > len) {
    const t = (len + margin - x) / margin;
    return 0.5 - 0.5 * Math.cos(Math.PI * t);
  }
  return 1;
}

/**
 * World-Y displacement of the brane at grid position (x, z).
 * Deterministic — same input always returns the same value.
 */
export function braneHeight(x: number, z: number): number {
  let h = 0;
  for (const c of BASE_COMPONENTS) {
    h += c.amp * Math.sin(c.kx * x + c.px) * Math.cos(c.kz * z + c.pz);
  }
  for (const lane of LANES) {
    const dx = lane.bx - lane.ax;
    const dz = lane.bz - lane.az;
    const laneLen = Math.sqrt(dx * dx + dz * dz);
    const ux = dx / laneLen;
    const uz = dz / laneLen;
    const rx = x - lane.ax;
    const rz = z - lane.az;
    const along = rx * ux + rz * uz;
    const perp = rx * (-uz) + rz * ux;
    const window = smoothWindow(along, laneLen, lane.fadeMargin);
    if (window === 0) continue;
    const perpFalloff = Math.exp(-(perp * perp) / (2 * lane.width * lane.width));
    const corrugation = Math.sin(lane.corrFreq * along + lane.corrPhase);
    h += lane.amp * window * perpFalloff * corrugation;
  }
  return h;
}

/**
 * Arc length of the brane geodesic along the straight A→B projection,
 * integrated in 3D. This is "how long the signal's path is if it stays
 * on the brane" — longer than the chord whenever the brane is wrinkled
 * between A and B.
 */
export function braneArcLength(
  ax: number, az: number,
  bx: number, bz: number,
  samples = 96,
): number {
  let total = 0;
  let prevX = ax;
  let prevZ = az;
  let prevY = braneHeight(ax, az);
  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const x = ax + (bx - ax) * t;
    const z = az + (bz - az) * t;
    const y = braneHeight(x, z);
    const dx = x - prevX;
    const dz = z - prevZ;
    const dy = y - prevY;
    total += Math.sqrt(dx * dx + dy * dy + dz * dz);
    prevX = x;
    prevZ = z;
    prevY = y;
  }
  return total;
}

/**
 * Straight-line 3D distance from A's brane-surface point to B's.
 * This is the "bulk chord" — the shorter path a bulk-traveling signal
 * could take.
 */
export function bulkChordLength(
  ax: number, az: number,
  bx: number, bz: number,
): number {
  const ay = braneHeight(ax, az);
  const by = braneHeight(bx, bz);
  const dx = bx - ax;
  const dz = bz - az;
  const dy = by - ay;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * The honest geometric shortcut factor G = L_brane / L_chord from the
 * visible mesh. Clamped ≥ 1 to guard numerical noise.
 */
export function computeRouteGeometricFactor(
  ax: number, az: number,
  bx: number, bz: number,
): number {
  const chord = bulkChordLength(ax, az, bx, bz);
  if (chord < 1e-6) return 1;
  const arc = braneArcLength(ax, az, bx, bz);
  return Math.max(1, arc / chord);
}

/**
 * Dramatized apparent-speed ceiling G → apparent c-multiple. Returns 1
 * for a flat route, grows steeply as the wrinkle accumulates. See module
 * header for rationale and representative values.
 */
export function dramatizeToRouteMax(geometricFactor: number): number {
  const g = Math.max(1, geometricFactor);
  return 1 + Math.pow(DRAMATIZATION_GAIN * (g - 1), DRAMATIZATION_POWER);
}

export interface RouteLimit {
  geometricFactor: number;
  apparentMax: number;
}

export function computeRouteLimit(
  ax: number, az: number,
  bx: number, bz: number,
): RouteLimit {
  const geometricFactor = computeRouteGeometricFactor(ax, az, bx, bz);
  const apparentMax = dramatizeToRouteMax(geometricFactor);
  return { geometricFactor, apparentMax };
}
