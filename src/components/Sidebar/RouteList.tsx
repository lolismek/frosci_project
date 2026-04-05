import { useRouteStore } from '../../stores/useRouteStore';
import tradeRoutes from '../../data/trade-routes.json';
import type { TradeRoute } from '../../types';

const routes = tradeRoutes as TradeRoute[];
const tradeRoutesOnly = routes.filter((r) => r.type === 'trade-route');
const movieJourneys = routes.filter((r) => r.type === 'movie-journey');

export function RouteList() {
  const { activeRouteId, setActiveRoute } = useRouteStore();

  const toggle = (id: string) => {
    setActiveRoute(activeRouteId === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
          Trade Routes
        </label>
        <div className="flex flex-col gap-1">
          {tradeRoutesOnly.map((r) => (
            <RouteCard
              key={r.id}
              route={r}
              active={activeRouteId === r.id}
              onClick={() => toggle(r.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
          Movie Journeys
        </label>
        <div className="flex flex-col gap-1">
          {movieJourneys.map((r) => (
            <RouteCard
              key={r.id}
              route={r}
              active={activeRouteId === r.id}
              onClick={() => toggle(r.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RouteCard({
  route,
  active,
  onClick,
}: {
  route: TradeRoute;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded text-sm cursor-pointer transition-colors flex items-center gap-2 ${
        active
          ? 'bg-white/10 text-white border border-white/20'
          : 'bg-white/[0.03] text-white/60 border border-transparent hover:bg-white/5 hover:text-white/80'
      }`}
    >
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: route.color }}
      />
      <span className="flex-1 truncate">
        {route.episode ? `${route.episode}: ` : ''}
        {route.name}
      </span>
    </button>
  );
}
