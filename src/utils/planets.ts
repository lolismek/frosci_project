import type { RawPlanet, Planet } from '../types';
import rawPlanets from '../data/planets.json';
import supplementalPlanets from '../data/planets-supplemental.json';
import planetTiers from '../data/planet-tiers.json';

function processPlanet(raw: RawPlanet, tiers: Record<string, number>): Planet {
  return {
    ...raw,
    id: raw.Name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    trueX: raw.X + raw.SubGridX,
    trueY: raw.Y + raw.SubGridY,
    tier: (tiers[raw.Name] || 4) as 1 | 2 | 3 | 4,
  };
}

let _allPlanets: Planet[] | null = null;
let _planetMap: Map<string, Planet> | null = null;

export function getAllPlanets(): Planet[] {
  if (!_allPlanets) {
    const tiers = planetTiers as Record<string, number>;
    const all = [...(rawPlanets as RawPlanet[]), ...(supplementalPlanets as RawPlanet[])];
    _allPlanets = all.map((p) => processPlanet(p, tiers));
  }
  return _allPlanets;
}

export function getPlanetMap(): Map<string, Planet> {
  if (!_planetMap) {
    _planetMap = new Map();
    for (const p of getAllPlanets()) {
      _planetMap.set(p.Name, p);
    }
  }
  return _planetMap;
}

export function getPlanetByName(name: string): Planet | undefined {
  return getPlanetMap().get(name);
}

export function filterByTier(planets: Planet[], maxTier: 1 | 2 | 3 | 4): Planet[] {
  return planets.filter((p) => p.tier <= maxTier);
}

export function searchPlanets(query: string, limit = 20): Planet[] {
  const q = query.toLowerCase();
  const all = getAllPlanets();
  const exact: Planet[] = [];
  const starts: Planet[] = [];
  const contains: Planet[] = [];

  for (const p of all) {
    const name = p.Name.toLowerCase();
    if (name === q) exact.push(p);
    else if (name.startsWith(q)) starts.push(p);
    else if (name.includes(q)) contains.push(p);
  }

  // Sort each group by tier (most important first)
  const sortByTier = (a: Planet, b: Planet) => a.tier - b.tier;
  return [...exact.sort(sortByTier), ...starts.sort(sortByTier), ...contains.sort(sortByTier)].slice(0, limit);
}
