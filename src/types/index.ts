export interface RawPlanet {
  Name: string;
  Image: string | null;
  Coord: string | null;
  X: number;
  Y: number;
  SubGridCoord: string | null;
  SubGridX: number;
  SubGridY: number;
  SunName: string | null;
  Region: string;
  Sector: string;
  Suns: number;
  Moons: number;
  Position: number;
  Distance: number;
  LengthDay: number;
  LengthYear: number;
  Diameter: number;
  Gravity: number;
}

export interface Planet extends RawPlanet {
  id: string;
  trueX: number;
  trueY: number;
  tier: 1 | 2 | 3 | 4;
}

export interface TradeRoute {
  id: string;
  name: string;
  color: string;
  planets: string[];
  type: 'trade-route' | 'movie-journey';
  episode?: string;
  canonTravelTime?: string;
}

export interface Region {
  name: string;
  innerRadius: number;
  outerRadius: number;
  color: string;
}

export interface RelativityResult {
  distanceLY: number;
  speedC: number;
  gamma: number;
  timePlanetYears: number;
  timeTravelerYears: number;
}

export interface RoundTripRow {
  trip: number;
  travelerAge: number;
  homeAge: number;
}

export interface TachyonicResult {
  distanceLY: number;
  speedC: number;
  /** |γ| = 1/√(v²/c²−1). The sign convention γ = −i·|γ| is the usual one. */
  gammaImagMagnitude: number;
  /** Rapidity ζ = atanh(v/c) analytically continued past c:
   *  for v>c, ζ = ½ ln|(v+c)/(v−c)| + i·π/2. */
  rapidityReal: number;
  rapidityImag: number;
  /** A→B displacement in real space. Unchanged by v. */
  realDistance: number;
  /** L·√(v²/c²−1). Imaginary part of the Lorentz-contracted length —
   *  a mathematical artifact of γ being imaginary, NOT a distance the
   *  ship traverses. */
  imagContractedLength: number;
  /** t = L/v. Real rest-frame travel time. A tachyon is genuinely FTL,
   *  there is no "local-c chord" as in the brane-bulk mode. */
  restFrameTimeYears: number;
  /** |τ| = t·√(v²/c²−1). Magnitude of the imaginary proper time τ = t/γ.
   *  Formal only: tachyons have no rest frame (Feinberg 1967). */
  imagProperTimeYears: number;
  /** Half-ellipse semi-axes for the 3D rapidity diagram (grid units).
   *  Visualizes the Wick quarter-turn; NOT a spatial trajectory. */
  ellipseSemiMajorGrid: number;
  ellipseSemiMinorGrid: number;
}

export type InterpretationMode = 'brane-bulk' | 'tachyonic';

export interface BraneBulkResult {
  chordLY: number;
  braneLengthLY: number;
  shortcutFactor: number;
  apparentSpeedC: number;
  travelTimeYears: number;
}
