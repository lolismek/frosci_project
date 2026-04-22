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
  gammaImaginary: number;
  realDistance: number;
  imaginaryDistance: number;
  hyperspaceFraction: number;
  arcHeight: number;
}

export type InterpretationMode = 'brane-bulk' | 'tachyonic';

export interface BraneBulkResult {
  chordLY: number;
  braneLengthLY: number;
  shortcutFactor: number;
  apparentSpeedC: number;
  travelTimeYears: number;
  bulgeHeightGrid: number;
}
