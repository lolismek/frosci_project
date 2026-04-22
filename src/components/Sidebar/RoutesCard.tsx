import { useRouteStore } from '../../stores/useRouteStore';
import { usePlanetStore } from '../../stores/usePlanetStore';
import { getPlanetByName } from '../../utils/planets';
import { distanceLY } from '../../utils/coordinates';
import tradeRoutes from '../../data/trade-routes.json';
import type { TradeRoute } from '../../types';

const routes = tradeRoutes as TradeRoute[];
const tradeOnly = routes.filter((r) => r.type === 'trade-route');
const movieOnly = routes.filter((r) => r.type === 'movie-journey');

export function RoutesCard() {
  const { activeRouteId, setActiveRoute } = useRouteStore();
  const { selectPlanet, clearSelection } = usePlanetStore();

  const toggle = (id: string) => {
    if (activeRouteId === id) {
      setActiveRoute(null);
      clearSelection();
      return;
    }
    setActiveRoute(id);
    const route = routes.find((r) => r.id === id);
    if (route && route.planets.length >= 2) {
      clearSelection();
      const first = getPlanetByName(route.planets[0]);
      const last = getPlanetByName(route.planets[route.planets.length - 1]);
      if (first) selectPlanet(first);
      if (last) selectPlanet(last);
    }
  };

  return (
    <div
      className="card"
      style={{
        position: 'absolute',
        right: 22,
        top: 70,
        width: 264,
        maxHeight: 480,
        overflowY: 'auto',
        pointerEvents: 'auto',
        zIndex: 10,
      }}
    >
      <div className="card-head" style={{ position: 'sticky', top: 0, background: 'var(--scrim-solid)', zIndex: 1 }}>
        <span className="tc-label">Canon routes</span>
        <span className="tc-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
          {routes.length}
        </span>
      </div>

      <Section title="Trade Routes">
        {tradeOnly.map((r) => (
          <RouteRow
            key={r.id}
            route={r}
            active={activeRouteId === r.id}
            onClick={() => toggle(r.id)}
          />
        ))}
      </Section>

      <Section title="Movie Journeys">
        {movieOnly.map((r) => (
          <RouteRow
            key={r.id}
            route={r}
            active={activeRouteId === r.id}
            onClick={() => toggle(r.id)}
          />
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <div
        className="tc-label"
        style={{
          padding: '10px 14px 4px',
          borderBottom: '1px solid var(--rule-3)',
        }}
      >
        {title}
      </div>
      <div>{children}</div>
    </>
  );
}

function RouteRow({
  route,
  active,
  onClick,
}: {
  route: TradeRoute;
  active: boolean;
  onClick: () => void;
}) {
  const first = getPlanetByName(route.planets[0]);
  const last = getPlanetByName(route.planets[route.planets.length - 1]);
  const ly = first && last ? distanceLY(first, last) : 0;

  return (
    <div
      onClick={onClick}
      style={{
        padding: '11px 14px',
        borderBottom: '1px solid var(--rule-3)',
        background: active ? 'rgba(217,100,31,0.06)' : 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        transition: 'background .12s',
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLDivElement).style.background = 'rgba(239,231,212,0.04)';
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.2,
            color: active ? 'var(--accent)' : 'var(--ink)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {route.planets[0]}{' '}
          <span style={{ opacity: 0.45 }}>→</span>{' '}
          {route.planets[route.planets.length - 1]}
        </div>
        <div
          className="tc-mono"
          style={{
            fontSize: 9,
            letterSpacing: '0.12em',
            color: 'var(--ink-3)',
            marginTop: 3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {route.episode ? `${route.episode} · ` : ''}
          {route.name}
        </div>
      </div>
      <div
        className="tc-mono"
        style={{
          fontSize: 10,
          color: 'var(--ink-2)',
          letterSpacing: '0.1em',
          whiteSpace: 'nowrap',
        }}
      >
        {ly >= 1000 ? (ly / 1000).toFixed(1) + 'k' : Math.round(ly)} ly
      </div>
    </div>
  );
}
