import type { RelativityResult, RoundTripRow, TachyonicResult, BraneBulkResult } from '../types';

// --- Subluminal physics ---

export function calculateGamma(speedC: number): number {
  if (speedC >= 1) return Infinity;
  if (speedC <= 0) return 1;
  return 1 / Math.sqrt(1 - speedC * speedC);
}

export function calculateTravel(distanceLY: number, speedC: number): RelativityResult {
  const gamma = calculateGamma(speedC);
  const timePlanetYears = distanceLY / speedC;
  const timeTravelerYears = timePlanetYears / gamma;

  return {
    distanceLY,
    speedC,
    gamma,
    timePlanetYears,
    timeTravelerYears,
  };
}

export function calculateRoundTrips(
  distanceLY: number,
  speedC: number,
  startAge: number,
  maxTrips: number
): RoundTripRow[] {
  const result = calculateTravel(distanceLY, speedC);
  const oneWayTraveler = result.timeTravelerYears;
  const oneWayHome = result.timePlanetYears;

  const rows: RoundTripRow[] = [{ trip: 0, travelerAge: startAge, homeAge: startAge }];

  for (let i = 1; i <= maxTrips; i++) {
    rows.push({
      trip: i,
      travelerAge: startAge + i * 2 * oneWayTraveler,
      homeAge: startAge + i * 2 * oneWayHome,
    });
  }

  return rows;
}

// --- Tachyonic / superluminal physics ---

/** For v > c, gamma becomes imaginary: γ = i / √(v²/c² - 1). Returns the magnitude. */
export function calculateTachyonicGamma(speedC: number): number {
  if (speedC <= 1) return Infinity;
  return 1 / Math.sqrt(speedC * speedC - 1);
}

/** Calculate tachyonic travel decomposition into real + imaginary distance components */
export function calculateTachyonicTravel(distanceLY: number, speedC: number): TachyonicResult {
  const gammaImag = calculateTachyonicGamma(speedC);
  const realDistance = distanceLY;
  const imaginaryDistance = distanceLY * Math.sqrt(speedC * speedC - 1);
  const totalMagnitude = Math.sqrt(realDistance ** 2 + imaginaryDistance ** 2);
  const hyperspaceFraction = totalMagnitude > 0 ? imaginaryDistance / totalMagnitude : 0;

  // Visual arc height scaled for the 3D scene (galaxy is ~20 grid units wide)
  const arcHeight = Math.min(imaginaryDistance / 5000, 15); // cap at 15 grid units tall

  return {
    distanceLY,
    speedC,
    gammaImaginary: gammaImag,
    realDistance,
    imaginaryDistance,
    hyperspaceFraction,
    arcHeight,
  };
}

export function isTachyonic(speedC: number): boolean {
  return speedC > 1;
}

// --- Formatting ---

export function formatYears(years: number): string {
  if (years < 0.01) return `${(years * 365.25).toFixed(1)} days`;
  if (years < 1) return `${(years * 12).toFixed(1)} months`;
  if (years < 100) return `${years.toFixed(1)} years`;
  if (years < 1_000) return `${years.toFixed(0)} years`;
  if (years < 1_000_000) return `${(years / 1000).toFixed(1)}k years`;
  if (years < 1_000_000_000) return `${(years / 1_000_000).toFixed(1)}M years`;
  return `${(years / 1_000_000_000).toFixed(1)}B years`;
}

export function formatSpeed(speedC: number): string {
  if (speedC > 1) {
    if (speedC >= 1000) return `${(speedC / 1000).toFixed(1)}×10³c`;
    if (speedC >= 10) return `${speedC.toFixed(1)}c`;
    return `${speedC.toFixed(3)}c`;
  }
  if (speedC >= 0.999999) {
    const nines = -Math.log10(1 - speedC);
    return `0.${'9'.repeat(Math.floor(nines))}c`;
  }
  if (speedC >= 0.99) return `${speedC.toFixed(4)}c`;
  return `${speedC.toFixed(2)}c`;
}

/**
 * Convert a 0-1 slider value to speed as fraction of c.
 * [0, 0.80] → subluminal [0, 0.999999c] (logarithmic)
 * [0.80, 1.0] → superluminal [1.001c, ~1001c] (logarithmic)
 * The transition is tight (0.999999c → 1.001c) so the slider never
 * "sits" at c or jumps to an unrealistic 2c as it used to.
 */
export function sliderToSpeed(value: number): number {
  if (value <= 0) return 0;

  const C_BARRIER = 0.80;

  if (value <= C_BARRIER) {
    // Subluminal: logarithmic mapping 0 → 0.999999c
    const t = value / C_BARRIER; // normalize to 0-1
    return 1 - Math.pow(10, -t * 6);
  }

  // Superluminal: logarithmic ramp from ~1.001c to ~1001c
  const t = (value - C_BARRIER) / (1 - C_BARRIER); // normalize to 0-1
  return 1 + Math.pow(10, -3 + t * 6);
}

/** Convert speed back to slider position */
export function speedToSlider(speedC: number): number {
  if (speedC <= 0) return 0;

  const C_BARRIER = 0.80;

  if (speedC <= 1) {
    const t = -Math.log10(1 - Math.min(speedC, 1 - 1e-9)) / 6;
    return t * C_BARRIER;
  }

  // Superluminal
  const t = (Math.log10(speedC - 1) + 3) / 6;
  return C_BARRIER + t * (1 - C_BARRIER);
}

// --- Brane-bulk shortcut physics (Randall-Sundrum / Chung-Freese) ---

/**
 * Convert the speed slider into a shortcut factor for the currently
 * selected route. The route has its own fixed apparent-speed ceiling
 * (`routeMax`) derived from the brane's extrinsic curvature between A
 * and B — computed in braneField.ts. The slider interpolates the
 * requested speed from 1.001c at the c-barrier up to that ceiling.
 *
 * Below the c-barrier: no shortcut (ship is subluminal, stays on
 * the brane — pure special relativity).
 *
 * Above the c-barrier: 1.001 → routeMax over the superluminal half
 * of the slider. A small easing exponent makes the low end feel
 * responsive without sacrificing a smooth approach to the ceiling.
 *
 * If the route is essentially flat (routeMax ≤ 1.001) the ship can't
 * shortcut at all — the function returns 1 regardless of slider.
 */
export function sliderToShortcutFactor(value: number, routeMax: number): number {
  const C_BARRIER = 0.80;
  if (value <= C_BARRIER) return 1;
  if (routeMax <= 1.001) return 1;
  const t = (value - C_BARRIER) / (1 - C_BARRIER); // 0-1 on the superluminal half
  const eased = Math.pow(t, 1.3);
  return 1.001 + (routeMax - 1.001) * eased;
}

/**
 * In brane-bulk cosmology (Randall-Sundrum / Chung-Freese / Caldwell-
 * Langlois), the brane is curved in the bulk, so signals on the brane
 * follow a longer arc while a chord through the bulk cuts a shorter
 * path. We take the user-selected distance as the BRANE arc length
 * and derive the bulk chord from the route's shortcut factor.
 *
 *   chord        = braneLength / shortcutFactor
 *   travel time  = chord / c                (ship moves at c locally)
 *   apparent v   = braneLength / travelTime = shortcutFactor · c
 *
 * The visible brane geometry is fixed (see braneField.ts) — this
 * function just does the arithmetic once the slider has picked a
 * shortcut factor for the chosen route.
 */
export function calculateBraneBulkTravel(distanceLY: number, shortcutFactor: number): BraneBulkResult {
  const braneLength = distanceLY;
  const factor = Math.max(1, shortcutFactor);
  const chord = braneLength / factor;
  const travelTimeYears = chord; // chord (ly) / c (ly/yr) = years
  const apparentSpeedC = factor;

  return {
    chordLY: chord,
    braneLengthLY: braneLength,
    shortcutFactor: factor,
    apparentSpeedC,
    travelTimeYears,
  };
}
