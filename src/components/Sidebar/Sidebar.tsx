import { useState } from 'react';
import { PlanetSearch } from './PlanetSearch';
import { PlanetFilter } from './PlanetFilter';
import { RouteList } from './RouteList';

interface SidebarProps {
  /** When true, the sidebar auto-collapses (e.g. entering tachyonic mode
   *  where the 3D canvas + tachyonic panel need the horizontal real
   *  estate). The user can still re-open it manually. */
  autoCollapse?: boolean;
}

export function Sidebar({ autoCollapse = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  // React "information from previous renders" pattern (setState during render
  // is legal when guarded on a prop transition). Cheaper and simpler than
  // lifting `collapsed` up to App just to intercept the mode toggle.
  const [prevAuto, setPrevAuto] = useState(autoCollapse);
  if (prevAuto !== autoCollapse) {
    setPrevAuto(autoCollapse);
    if (autoCollapse) setCollapsed(true);
  }

  return (
    <div
      className={`absolute top-0 left-0 h-full z-10 transition-all duration-300 flex ${
        collapsed ? 'w-10' : 'w-80'
      }`}
    >
      {!collapsed && (
        <div className="flex-1 bg-space-900/90 backdrop-blur-sm border-r border-white/10 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="text-center">
            <h1 className="text-sw-gold text-lg font-bold tracking-wider uppercase">
              Star Wars
            </h1>
            <p className="text-white/50 text-xs tracking-widest uppercase">
              Relativity Map
            </p>
            <p className="text-white/30 text-[10px] mt-1 italic leading-tight">
              "What if the fastest ship was limited by the speed of light?"
            </p>
          </div>

          <PlanetSearch />
          <PlanetFilter />
          <RouteList />
        </div>
      )}

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-10 h-10 mt-2 flex items-center justify-center text-white/40 hover:text-white/80 bg-space-900/80 rounded-r border border-l-0 border-white/10 cursor-pointer"
      >
        {collapsed ? '▶' : '◀'}
      </button>
    </div>
  );
}
