import type { TemperatureUnit, WeatherCity } from '../types/weather';
import { formatTemperature } from '../utils/temperature';
import WeatherMetric from './WeatherMetric';

interface CurrentWeatherProps {
  city: WeatherCity;
  unit: TemperatureUnit;
}

export default function CurrentWeather({ city, unit }: CurrentWeatherProps) {
  return (
    <section
      aria-labelledby="current-weather-title"
      className="relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-glass backdrop-blur-xl sm:p-7 lg:p-9"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(115deg,rgba(117,137,255,0.12),transparent_46%,rgba(245,185,66,0.055))]"
      />
      <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-10">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
            />
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Agora em
            </p>
            <p className="text-xs text-slate-400">{city.localDate || '—'}</p>
          </div>
          <h1
            className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            id="current-weather-title"
          >
            {city.name}
            {city.region && <span className="font-normal text-slate-300">, {city.region}</span>}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {[city.country, city.updatedAt].filter(Boolean).join(' / ') || '—'}
          </p>

          <div className="mt-7 flex items-center gap-4 sm:gap-6">
            <p className="text-[64px] font-medium leading-none tracking-[-0.04em] text-white sm:text-[82px]">
              {formatTemperature(city.temperatureCelsius, unit)}
            </p>
            <span
              aria-hidden="true"
              className="select-none text-[72px] leading-none drop-shadow-[0_12px_28px_rgba(245,185,66,0.16)] sm:text-[92px]"
            >
              {city.icon}
            </span>
          </div>
          <p className="mt-3 text-base font-medium text-slate-300 sm:text-lg">{city.condition}</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <WeatherMetric
            icon="💧"
            label="Umidade"
            value={city.humidity === undefined ? '—' : `${city.humidity}%`}
          />
          <WeatherMetric
            icon="↝"
            label="Vento"
            value={city.windKph === undefined ? '—' : `${city.windKph} km/h`}
          />
          <WeatherMetric
            icon="☂"
            label="Precipitação"
            value={city.precipitationMm === undefined ? '—' : `${city.precipitationMm} mm`}
          />
          <WeatherMetric
            icon="◉"
            label="Pressão"
            value={city.pressureHpa === undefined ? '—' : `${city.pressureHpa} hPa`}
          />
        </div>
      </div>
    </section>
  );
}
