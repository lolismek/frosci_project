import { create } from 'zustand';
import type { Planet, InterpretationMode } from '../types';

interface PlanetStore {
  selectedPlanets: [Planet | null, Planet | null];
  maxTier: 1 | 2 | 3 | 4;
  searchQuery: string;
  speedSlider: number;
  interpretationMode: InterpretationMode;

  selectPlanet: (planet: Planet) => void;
  deselectPlanet: (index: 0 | 1) => void;
  clearSelection: () => void;
  setMaxTier: (tier: 1 | 2 | 3 | 4) => void;
  setSearchQuery: (query: string) => void;
  setSpeedSlider: (value: number) => void;
  setInterpretationMode: (mode: InterpretationMode) => void;
}

export const usePlanetStore = create<PlanetStore>((set) => ({
  selectedPlanets: [null, null],
  maxTier: 2,
  searchQuery: '',
  speedSlider: 0.5,
  interpretationMode: 'brane-bulk',

  selectPlanet: (planet) =>
    set((state) => {
      // If already selected, ignore
      if (state.selectedPlanets[0]?.Name === planet.Name || state.selectedPlanets[1]?.Name === planet.Name) {
        return state;
      }
      // Fill first empty slot
      if (!state.selectedPlanets[0]) return { selectedPlanets: [planet, state.selectedPlanets[1]] };
      if (!state.selectedPlanets[1]) return { selectedPlanets: [state.selectedPlanets[0], planet] };
      // Both full — replace the second
      return { selectedPlanets: [state.selectedPlanets[0], planet] };
    }),

  deselectPlanet: (index) =>
    set((state) => {
      const next: [Planet | null, Planet | null] = [...state.selectedPlanets];
      next[index] = null;
      return { selectedPlanets: next };
    }),

  clearSelection: () => set({ selectedPlanets: [null, null] }),

  setMaxTier: (tier) => set({ maxTier: tier }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSpeedSlider: (value) => set({ speedSlider: value }),

  setInterpretationMode: (mode) => set({ interpretationMode: mode }),
}));
