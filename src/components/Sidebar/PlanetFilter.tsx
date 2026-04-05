import { usePlanetStore } from '../../stores/usePlanetStore';

const TIERS = [
  { value: 1 as const, label: 'Top 25', desc: 'Iconic planets only' },
  { value: 2 as const, label: 'Top 100', desc: 'Major planets from shows' },
  { value: 3 as const, label: 'Top 250', desc: 'Notable planets' },
  { value: 4 as const, label: 'All', desc: 'All 5,400+ planets' },
];

export function PlanetFilter() {
  const { maxTier, setMaxTier } = usePlanetStore();

  return (
    <div>
      <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
        Visible Planets
      </label>
      <div className="grid grid-cols-4 gap-1">
        {TIERS.map((t) => (
          <button
            key={t.value}
            onClick={() => setMaxTier(t.value)}
            className={`px-2 py-1.5 text-xs rounded cursor-pointer transition-colors ${
              maxTier === t.value
                ? 'bg-sw-gold/20 text-sw-gold border border-sw-gold/40'
                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
