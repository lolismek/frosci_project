import { create } from 'zustand';

interface MapStore {
  zoom: number;
  panX: number;
  panY: number;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  zoom: 1,
  panX: 0,
  panY: 0,
  setZoom: (zoom) => set({ zoom }),
  setPan: (x, y) => set({ panX: x, panY: y }),
}));
