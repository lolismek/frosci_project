import { create } from 'zustand';

interface RouteStore {
  activeRouteId: string | null;
  setActiveRoute: (id: string | null) => void;
}

export const useRouteStore = create<RouteStore>((set) => ({
  activeRouteId: null,
  setActiveRoute: (id) => set({ activeRouteId: id }),
}));
