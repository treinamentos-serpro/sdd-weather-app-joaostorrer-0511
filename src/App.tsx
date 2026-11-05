import CurrentWeather from './components/CurrentWeather';
import ForecastGrid from './components/ForecastGrid';
import WeatherHeader from './components/WeatherHeader';
import useWeather from './hooks/useWeather';

export default function App() {
  const {
    unit,
    setUnit,
    search,
    searchStatus,
    searchResults,
    searchError,
    selectedCity,
    selectCity,
    weather,
    weatherStatus,
    weatherError,
    retryWeather,
  } = useWeather();
  const selectedLocation = [selectedCity?.name, selectedCity?.region, selectedCity?.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(155deg,#0b1020_0%,#11182a_48%,#0b1020_100%)] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] [background-size:64px_64px]"
      />
      <main
        className="relative mx-auto min-h-screen w-full max-w-[1240px] px-4 pb-10 pt-5 sm:px-7 sm:pt-7 lg:px-10 lg:pt-9"
        id="inicio"
      >
        <WeatherHeader
          results={searchResults}
          selectedCity={selectedCity}
          searchStatus={searchStatus}
          searchError={searchError}
          onSearch={(query) => void search(query)}
          onCitySelect={selectCity}
          onUnitChange={setUnit}
          unit={unit}
        />

        <div className="mt-7 sm:mt-9">
          {weatherStatus === 'success' && weather ? (
            <>
              {weather.currentAvailable ? (
                <CurrentWeather city={weather} unit={unit} />
              ) : (
                <section
                  aria-live="polite"
                  className="rounded-3xl border border-amber-200/15 bg-white/[0.055] p-6 text-center shadow-glass backdrop-blur-xl"
                  role="status"
                >
                  <p className="text-sm text-slate-200">
                    Clima atual indisponível para {selectedLocation || weather.name}.
                  </p>
                  <button
                    className="mt-4 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-400"
                    onClick={retryWeather}
                    type="button"
                  >
                    Tentar novamente
                  </button>
                </section>
              )}
              {weather.forecast.length === 5 ? (
                <ForecastGrid days={weather.forecast} unit={unit} />
              ) : (
                <section
                  aria-live="polite"
                  className="mt-8 rounded-3xl border border-amber-200/15 bg-white/[0.055] p-6 text-center shadow-glass backdrop-blur-xl"
                  role="status"
                >
                  <p className="text-sm text-slate-200">
                    A previsão de cinco dias está indisponível.
                  </p>
                  <button
                    className="mt-4 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-400"
                    onClick={retryWeather}
                    type="button"
                  >
                    Tentar novamente
                  </button>
                </section>
              )}
            </>
          ) : weatherStatus === 'loading' ? (
            <section
              aria-live="polite"
              className="rounded-3xl border border-white/10 bg-white/[0.055] p-8 text-center shadow-glass backdrop-blur-xl"
              role="status"
            >
              <p className="text-sm font-medium text-slate-200">
                Carregando previsão{selectedCity ? ` para ${selectedCity.name}` : ''}...
              </p>
            </section>
          ) : weatherStatus === 'error' ? (
            <section
              className="rounded-3xl border border-rose-300/15 bg-white/[0.055] p-8 text-center shadow-glass backdrop-blur-xl"
              role="alert"
            >
              <p className="text-sm text-rose-200">{weatherError}</p>
              {selectedLocation && (
                <p className="mt-2 text-sm text-slate-200">Local selecionado: {selectedLocation}</p>
              )}
              <button
                className="mt-4 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-400"
                onClick={retryWeather}
                type="button"
              >
                Tentar novamente
              </button>
            </section>
          ) : (
            <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-8 text-center shadow-glass backdrop-blur-xl">
              <p className="text-sm text-slate-300">
                Busque uma cidade para consultar o clima atual e a previsão de cinco dias.
              </p>
            </section>
          )}
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-4 text-[11px] text-slate-400">
          <span>Dados meteorológicos: Open-Meteo</span>
          <span>© 2026 Tempo Weather</span>
        </footer>
      </main>
    </div>
  );
}
