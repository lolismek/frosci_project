import { useState, useRef } from 'react';
import { searchPlanets } from '../../utils/planets';
import { usePlanetStore } from '../../stores/usePlanetStore';
import type { Planet } from '../../types';

export function PlanetSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Planet[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { selectPlanet } = usePlanetStore();

  const handleInput = (val: string) => {
    setQuery(val);
    if (val.length >= 2) {
      setResults(searchPlanets(val, 10));
      setOpen(true);
    } else {
      setResults([]);
      setOpen(false);
    }
  };

  const handleSelect = (planet: Planet) => {
    selectPlanet(planet);
    setQuery('');
    setResults([]);
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative">
      <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">
        Search Planets
      </label>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => query.length >= 2 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Type a planet name..."
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-sw-gold/50"
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-space-800 border border-white/10 rounded shadow-lg max-h-60 overflow-y-auto z-20">
          {results.map((p) => (
            <button
              key={p.Name}
              onMouseDown={() => handleSelect(p)}
              className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white cursor-pointer flex justify-between"
            >
              <span>{p.Name}</span>
              <span className="text-white/30 text-xs">{p.Region}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
