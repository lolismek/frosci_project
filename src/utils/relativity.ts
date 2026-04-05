import type { RelativityResult, RoundTripRow } from '../types';

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
    // Each round trip = 2 one-way trips
    rows.push({
      trip: i,
      travelerAge: startAge + i * 2 * oneWayTraveler,
      homeAge: startAge + i * 2 * oneWayHome,
    });
  }

  return rows;
}

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
  if (speedC >= 0.999999) {
    const nines = -Math.log10(1 - speedC);
    return `0.${'9'.repeat(Math.floor(nines))}c`;
  }
  if (speedC >= 0.99) return `${speedC.toFixed(4)}c`;
  return `${speedC.toFixed(2)}c`;
}

/** Convert a 0-1 slider value to a speed as a fraction of c (logarithmic mapping) */
export function sliderToSpeed(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1 - 1e-9;
  return 1 - Math.pow(10, -value * 6);
}

/** Convert speed back to slider position */
export function speedToSlider(speedC: number): number {
  if (speedC <= 0) return 0;
  if (speedC >= 1) return 1;
  return -Math.log10(1 - speedC) / 6;
}
