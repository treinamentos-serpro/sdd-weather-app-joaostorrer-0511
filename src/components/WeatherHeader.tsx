import { type FormEvent, useState } from 'react';
import type { CitySearchResult, TemperatureUnit } from '../types/weather';
import UnitToggle from './UnitToggle';

interface WeatherHeaderProps {
  results: CitySearchResult[];
  selectedCity: CitySearchResult | null;
  unit: TemperatureUnit;
  searchStatus: 'idle' | 'loading' | 'results' | 'empty' | 'error';
  searchError: string;
  onSearch: (query: string) => void;
  onCitySelect: (city: CitySearchResult) => void;
  onUnitChange: (unit: TemperatureUnit) => void;
}

export default function WeatherHeader({
  results,
  selectedCity,
  unit,
  searchStatus,
  searchError,
  onSearch,
  onCitySelect,
  onUnitChange,
}: WeatherHeaderProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  function selectCity(city: CitySearchResult) {
    onCitySelect(city);
    setQuery('');
    setShowResults(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim() || searchStatus === 'loading') return;
    setShowResults(true);
    onSearch(query);
  }

  return (
    <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-5 sm:pb-6">
      <a aria-label="Tempo, página inicial" className="flex items-center gap-3" href="#inicio">
        <span className="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.08] text-xl text-sun shadow-glass">
          ☼
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-bold tracking-[0.12em] text-white">TEMPO</span>
          <span className="mt-1 block text-[10px] font-medium tracking-[0.2em] text-slate-400">
            WEATHER ATLAS
          </span>
        </span>
      </a>

      <div className="order-3 w-full sm:order-none sm:w-auto sm:flex-1 sm:px-5 lg:max-w-xl lg:px-8">
        <form
          aria-busy={searchStatus === 'loading'}
          className="relative"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) setShowResults(false);
          }}
          onSubmit={handleSubmit}
          role="search"
        >
          <label className="sr-only" htmlFor="city-search">
            Buscar cidade
          </label>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
          >
            <span className="block size-3.5 rounded-full border-[1.5px] border-slate-400" />
            <span className="absolute -bottom-1 -right-1 h-1.5 w-px rotate-[-45deg] bg-slate-400" />
          </span>
          <input
            aria-controls={showResults ? 'city-results' : undefined}
            autoComplete="off"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.045] pl-11 pr-24 text-sm text-white shadow-inner shadow-black/10 placeholder:text-slate-400 transition focus:border-accent-400/60 focus:bg-white/[0.07] focus:outline-none"
            id="city-search"
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            onFocus={() => query && searchStatus !== 'idle' && setShowResults(true)}
            placeholder="Buscar cidade..."
            type="search"
            value={query}
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-night-900 transition hover:bg-slate-200 disabled:cursor-wait disabled:opacity-70"
            disabled={!query.trim() || searchStatus === 'loading'}
            type="submit"
          >
            {searchStatus === 'loading' ? 'Buscando...' : 'Buscar'}
          </button>

          {showResults && query.trim() && searchStatus !== 'idle' && (
            <ul
              aria-label="Resultados da busca de cidades"
              aria-live="polite"
              aria-busy={searchStatus === 'loading'}
              className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-white/10 bg-night-800/95 p-1.5 shadow-glass backdrop-blur-xl"
              id="city-results"
            >
              {searchStatus === 'loading' ? (
                <li className="px-3 py-3 text-sm text-slate-400" role="status">
                  Buscando cidades...
                </li>
              ) : searchStatus === 'error' ? (
                <li className="px-3 py-3 text-sm text-rose-300" role="alert">
                  {searchError}
                </li>
              ) : searchStatus === 'empty' ? (
                <li className="px-3 py-3 text-sm text-slate-400" role="status">
                  Nenhuma cidade encontrada
                </li>
              ) : (
                results.map((city) => (
                  <li key={city.id}>
                    <button
                      className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.07] focus-visible:bg-white/[0.07]"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectCity(city)}
                      type="button"
                    >
                      <span className="font-medium text-slate-100">{city.name}</span>
                      <span className="text-xs text-slate-300">
                        {[city.region, city.country].filter(Boolean).join(', ')}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </form>
      </div>

      {selectedCity && (
        <p className="sr-only" aria-live="polite">
          Cidade selecionada: {selectedCity.name}
        </p>
      )}

      <UnitToggle onChange={onUnitChange} unit={unit} />
    </header>
  );
}
