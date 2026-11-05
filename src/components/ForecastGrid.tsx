import type { ForecastDay, TemperatureUnit } from '../types/weather';
import { formatTemperature } from '../utils/temperature';

interface ForecastGridProps {
  days: ForecastDay[];
  unit: TemperatureUnit;
}

export default function ForecastGrid({ days, unit }: ForecastGridProps) {
  return (
    <section aria-labelledby="forecast-heading" className="mt-8 sm:mt-10">
      <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-400">
            Previsão estendida
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl" id="forecast-heading">
            Próximos dias
          </h2>
        </div>
        <p className="pb-1 text-xs text-slate-400">
          5 dias{' '}
          <span aria-hidden="true" className="px-1">
            ·
          </span>{' '}
          {unit === 'celsius' ? '°C' : '°F'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {days.map((day) => (
          <article
            aria-label={`${day.day}, ${day.date}: ${day.condition}, máxima ${formatTemperature(day.highCelsius, unit)}, mínima ${formatTemperature(day.lowCelsius, unit)}`}
            className="group min-h-[190px] rounded-[22px] border border-white/[0.08] bg-white/[0.045] p-4 shadow-glass backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-white/[0.16] hover:bg-white/[0.075] motion-reduce:transform-none sm:min-h-[214px] sm:p-5"
            key={`${day.date}-${day.day}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-100">{day.day}</p>
                <p className="mt-1 text-xs text-slate-400">{day.date}</p>
              </div>
              <span
                aria-hidden="true"
                className="text-3xl transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none sm:text-4xl"
              >
                {day.icon}
              </span>
            </div>
            <p className="mt-5 min-h-8 text-xs leading-4 text-slate-400">{day.condition}</p>
            <p className="mt-1 text-[11px] text-slate-400">
              {day.precipitationProbability === undefined
                ? '—'
                : `${day.precipitationProbability}% chance de chuva`}
            </p>
            <div className="mt-4 flex items-baseline gap-2 border-t border-white/[0.07] pt-3">
              <span className="text-lg font-semibold text-white sm:text-xl">
                {formatTemperature(day.highCelsius, unit)}
              </span>
              <span className="text-sm text-slate-400">
                {formatTemperature(day.lowCelsius, unit)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
