// Each grid unit on the Star Wars galaxy map ≈ 5,000 light-years
export const LY_PER_GRID_UNIT = 5000;

// Approximate galaxy center in grid coordinates
export const GALAXY_CENTER_X = 10.0;
export const GALAXY_CENTER_Y = 10.5;

// Region colors matching the Essential Atlas aesthetic
export const REGION_COLORS: Record<string, string> = {
  'Deep Core': '#FFD700',
  'Core': '#FF8C42',
  'Colonies': '#D4A574',
  'Inner Rim Territories': '#7BB8D4',
  'Expansion Region': '#5BA8A0',
  'Mid Rim Territories': '#4682B4',
  'Outer Rim Territories': '#6A5ACD',
  'Wild Space': '#2E1A47',
  'Hutt Space': '#8B2252',
  'Tingel Arm': '#4B0082',
  'The Centrality': '#483D8B',
  'Extragalactic': '#1A1A2E',
  'Talcene Sector': '#4169E1',
};

// Planet dot colors by region (lighter for visibility on dark bg)
export const REGION_DOT_COLORS: Record<string, number> = {
  'Deep Core': 0xffd700,
  'Core': 0xffaa66,
  'Colonies': 0xe8c89e,
  'Inner Rim Territories': 0x88ccee,
  'Expansion Region': 0x66bbaa,
  'Mid Rim Territories': 0x6699cc,
  'Outer Rim Territories': 0x8877cc,
  'Wild Space': 0x9966bb,
  'Hutt Space': 0xcc4488,
  'Tingel Arm': 0x7766bb,
  'The Centrality': 0x6655aa,
  'Extragalactic': 0x5544aa,
  'Talcene Sector': 0x5577cc,
};
