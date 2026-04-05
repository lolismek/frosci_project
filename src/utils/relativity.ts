import type { RelativityResult, RoundTripRow, TachyonicResult } from '../types';

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
 * [0, 0.85] → subluminal [0, 0.999999c] (logarithmic)
 * [0.85, 1.0] → superluminal [1.001c, ~1000c] (logarithmic)
 */
export function sliderToSpeed(value: number): number {
  if (value <= 0) return 0;

  const C_BARRIER = 0.85;

  if (value <= C_BARRIER) {
    // Subluminal: logarithmic mapping 0 → 0.999999c
    const t = value / C_BARRIER; // normalize to 0-1
    return 1 - Math.pow(10, -t * 6);
  }

  // Superluminal: logarithmic ramp from ~1c to ~1000c
  const t = (value - C_BARRIER) / (1 - C_BARRIER); // normalize to 0-1
  return 1 + Math.pow(10, t * 3); // ~2c to ~1001c
}

/** Convert speed back to slider position */
export function speedToSlider(speedC: number): number {
  if (speedC <= 0) return 0;

  const C_BARRIER = 0.85;

  if (speedC <= 1) {
    const t = -Math.log10(1 - Math.min(speedC, 1 - 1e-9)) / 6;
    return t * C_BARRIER;
  }

  // Superluminal
  const t = Math.log10(speedC - 1) / 3;
  return C_BARRIER + t * (1 - C_BARRIER);
}
